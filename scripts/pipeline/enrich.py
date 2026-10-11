"""Enrich curated records and validate them against reference sources.

MERGE POLICY (which source is authoritative for which field)
─────────────────────────────────────────────────────────────
 field            authoritative source        curated value kept?
 name             curated (display name)      yes — Glottolog name stored as name_glottolog
 iso              Glottolog                   only if Glottolog has none
 family           Glottolog (mapped)          stored as family_curated when different
 subfamily        Glottolog classification    replaced (curated was truncated)
 vitality         Glottolog AES               replaced (curated was a default placeholder)
 speakers         Wikidata P1098              curated only if > 0 and Wikidata has none
 lat/lng/points   curated (village-level)     yes — drift vs Glottolog is *reported*
 region           derived from coords (ADM1)  curated stored as region_curated when different
 aliases/dialects curated (repaired)          yes — Glottolog dialects added separately
 Overrides in data/overrides/<CC>.json always win.
"""
import collections

from . import config
from .match import km


def _region_key(s):
    return (s or "").lower().replace(" ", "").replace("-", "").replace("é", "e").replace("ê", "e")


def enrich(rec, gc, method, conf, glotto, wiki, wals, regions, overrides, fallback_speakers=None):
    issues = []
    out = dict(rec)
    out["match"] = {"method": method, "confidence": conf}

    # Field-level overrides (applied first so coordinate fixes take effect)
    field_overrides = (overrides.get("fields", {}).get(rec["name"]) or {})
    for k, v in field_overrides.items():
        out[k] = v
        issues.append(("info", "override_applied", f"{k}: {v}"))

    prof = glotto.profile(gc) if gc else None
    wd = wiki.get(gc) if gc else None

    if prof:
        out.update({
            "glottocode": gc,
            "name_glottolog": prof["name"],
            "classification": prof["classification"],
            "family_glottolog": prof["family_glottolog"],
            "documentation": prof["documentation"],
            "category": prof["category"],
            "dialects_glottolog": prof["dialects_glottolog"],
            "glottolog_url": prof["url"],
        })
        out["iso"] = prof["iso"] or out.get("iso") or ""
        if prof["family"] and prof["family"] != out.get("family"):
            out["family_curated"] = out.get("family")
            if out.get("family") not in (None, "", "Unclassified"):
                issues.append(("warn", "family_mismatch", f"curated '{out.get('family')}' vs Glottolog '{prof['family']}'"))
        out["family"] = prof["family"] or out.get("family")
        if len(prof["classification"]) > 1:
            out["subfamily"] = " > ".join(prof["classification"][1:4])

        e = prof["endangerment"]
        if e:
            out["vitality"] = e["vitality"]
            out["endangerment_note"] = e["note"]
        else:
            out["vitality"] = "unknown"
            issues.append(("info", "vitality_unknown", "no AES rating in Glottolog"))

        d = km(out["lat"], out["lng"], prof["lat"], prof["lng"])
        out["glottolog_distance_km"] = round(d, 1) if d is not None else None
        if d is not None and d > config.COORD_ERROR_KM:
            issues.append(("error", "coord_far", f"{d:.0f} km from Glottolog point ({prof['lat']}, {prof['lng']})"))
        elif d is not None and d > config.COORD_WARN_KM:
            issues.append(("warn", "coord_drift", f"{d:.0f} km from Glottolog point"))

        if conf < 0.8:
            issues.append(("warn", "low_confidence_match", f"{method} → {prof['name']} ({gc})"))
    else:
        out["vitality"] = "unknown"
        issues.append(("error", "unmatched", "no Glottolog languoid found — add an override"))

    # Speakers
    out["speakers"] = 0
    out["speakers_meta"] = None
    if wd:
        out.update({
            "wikidata": wd.get("qid"),
            "wikipedia_fr": wd.get("wikipedia_fr"),
            "wikipedia_en": wd.get("wikipedia_en"),
            "scripts": wd.get("scripts") or [],
        })
        if wd.get("speakers"):
            s = wd["speakers"]
            out["speakers"] = s["value"]
            out["speakers_meta"] = {"source": "Wikidata", "reference": s["reference"], "year": s["year"],
                                    "applies_to": s["applies_to"], "claims": len(wd["speaker_claims"])}
            if s["year"] and s["year"] < 2000:
                issues.append(("info", "speakers_outdated", f"latest figure is from {s['year']}"))

    # Secondary fallback for speakers from ALCAM / SIL Reference Atlas
    if not out["speakers"] and fallback_speakers:
        iso_k = (out.get("iso") or "").lower().strip()
        name_k = out.get("name", "").lower().replace(" ", "").replace("-", "")
        cand_spk = fallback_speakers.get(iso_k) or fallback_speakers.get(name_k)
        if cand_spk and cand_spk.get("speakers"):
            out["speakers"] = cand_spk["speakers"]
            out["speakers_meta"] = {
                "source": "ALCAM / SIL Reference Atlas",
                "reference": "Atlas Linguistique du Cameroun",
                "year": 2010
            }

    if not out["speakers"] and (rec.get("speakers") or 0) > 0:
        out["speakers"] = rec["speakers"]
        out["speakers_meta"] = {"source": "curated"}
    if not out["speakers"]:
        issues.append(("warn", "speakers_missing", "no speaker count in Wikidata or reference atlas"))

    # Region from coordinates
    derived = regions.locate(out["lat"], out["lng"]) if regions else None
    if derived:
        if _region_key(derived) not in _region_key(out.get("region")):
            out["region_curated"] = out.get("region")
            issues.append(("info", "region_corrected", f"'{out.get('region')}' → '{derived}' (from coordinates)"))
        out["region"] = derived
    elif regions:
        # Check if intentionally non-local (e.g. Coptic in Egypt)
        if out.get("name") not in ("Coptic",):
            issues.append(("warn", "outside_country", f"coordinates ({out['lat']}, {out['lng']}) not inside any ADM1 region"))

    # WALS
    w = wals.get(gc) if gc else None
    if w:
        out["wals"] = w

    out["sources"] = sorted({"curated"} | ({"glottolog"} if prof else set()) | ({"wikidata"} if wd else set())
                            | ({"wals"} if w else set()) | ({"geoboundaries"} if derived else set()))
    return out, issues


def coverage_gaps(glotto, wiki, matched_gcs, country):
    gaps = []
    for l in glotto.languages_in(country):
        if l["ID"] in matched_gcs:
            continue
        p = glotto.profile(l["ID"])
        if p["category"] in ("Sign_Language", "Unattested", "Speech_Register"):
            continue
        wd = wiki.get(l["ID"]) or {}
        gaps.append({
            "glottocode": l["ID"], "name": p["name"], "iso": p["iso"], "family": p["family"],
            "lat": p["lat"], "lng": p["lng"],
            "vitality": (p["endangerment"] or {}).get("vitality"),
            "speakers": (wd.get("speakers") or {}).get("value"),
            "countries": ";".join(p["countries"]),
        })
    return sorted(gaps, key=lambda g: g["name"])


def summarize(records, all_issues):
    sev = collections.Counter(s for iss in all_issues.values() for s, _, _ in iss)
    kinds = collections.Counter(k for iss in all_issues.values() for _, k, _ in iss)
    n = len(records)
    def pct(x):
        return f"{x}/{n} ({100 * x / n:.0f}%)"
    return {
        "records": n,
        "matched": pct(sum(1 for r in records if r.get("glottocode"))),
        "with_iso": pct(sum(1 for r in records if r.get("iso"))),
        "with_speakers": pct(sum(1 for r in records if r.get("speakers"))),
        "with_vitality": pct(sum(1 for r in records if r.get("vitality") not in (None, "unknown"))),
        "with_wikipedia": pct(sum(1 for r in records if r.get("wikipedia_fr") or r.get("wikipedia_en"))),
        "with_wals": pct(sum(1 for r in records if r.get("wals"))),
        "vitality": dict(collections.Counter(r.get("vitality") for r in records)),
        "families": dict(collections.Counter(r.get("family") for r in records)),
        "severity": dict(sev),
        "issue_types": dict(kinds.most_common()),
    }
