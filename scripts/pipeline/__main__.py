"""NeraMap data pipeline.

Usage (from repo root):
    .venv\\Scripts\\python -m scripts.pipeline --country CM
    .venv\\Scripts\\python -m scripts.pipeline --country CM --refresh   # re-download sources
"""
import argparse
import collections
import csv
import datetime
import json
import sys

from . import config
from .enrich import coverage_gaps, enrich, summarize
from .ingest import clean_record, load_js_array
from .match import Matcher
from .sources import wikidata
from .sources.geoboundaries import AdminRegions
from .sources.glottolog import Glottolog
from .sources.wals import WALS


def run(cc, refresh=False):
    cfg = config.COUNTRIES[cc]
    print(f"▶ NeraMap pipeline — {cfg['name']} ({cc})")

    overrides_path = config.OVERRIDES / f"{cc}.json"
    overrides = json.loads(overrides_path.read_text(encoding="utf-8")) if overrides_path.exists() else {}

    print("• loading sources")
    glotto = Glottolog(refresh)
    wals = WALS(refresh)
    try:
        regions = AdminRegions(cfg["iso3"], cfg.get("region_labels"), refresh)
    except Exception as e:
        print(f"  ! geoBoundaries unavailable ({e}); region derivation skipped")
        regions = None

    if cfg.get("input") and cfg["input"].exists():
        print("• ingesting + cleaning curated input")
        raw = load_js_array(cfg["input"], cfg["input_global"])
        excluded = set(overrides.get("exclude", []))
        issues = {}
        cleaned = []
        for r in raw:
            if r["name"] in excluded:
                continue
            rec, fixes = clean_record(r)
            rec["id"] = f"{cc}-{int(r['id']):04d}"
            rec["country"] = cc
            issues[rec["id"]] = [("info", k, d) for k, d in fixes]
            cleaned.append(rec)

        print("• matching to Glottolog")
        matcher = Matcher(glotto, cc)
        manual = overrides.get("matches", {})
        matches = {rec["id"]: matcher.match(rec, manual.get(rec["name"])) for rec in cleaned}
    else:
        print(f"• generating languages directly from Glottolog for {cfg['name']}")
        gl_langs = glotto.languages_in(cc)
        excluded = set(overrides.get("exclude", []))
        issues = {}
        cleaned = []
        matches = {}
        idx = 0
        for l in gl_langs:
            gc = l["ID"]
            name = l["Name"]
            if name in excluded:
                continue
            cat = glotto.category(gc)
            if cat in ("Sign_Language", "Bookkeeping", "Artificial_Language", "Speech_Register"):
                continue
            lat_val = float(l["Latitude"]) if l["Latitude"] else None
            lng_val = float(l["Longitude"]) if l["Longitude"] else None
            if lat_val is None or lng_val is None:
                continue
            idx += 1
            rec_id = f"{cc}-{idx:04d}"
            p = glotto.profile(gc)
            reg = regions.locate(lat_val, lng_val) if regions else cfg["name"]
            rec = {
                "id": rec_id,
                "name": name,
                "iso": l["ISO639P3code"] or "",
                "lat": lat_val,
                "lng": lng_val,
                "family": p["family"],
                "subfamily": " > ".join(p["classification"][1:4]) if len(p["classification"]) > 1 else p["family"],
                "region": reg or cfg["name"],
                "description": ", ".join(p["classification"]) if p["classification"] else p["family"],
                "places": [],
                "aliases": [],
                "dialects": p["dialects_glottolog"],
                "points": [{"lat": lat_val, "lng": lng_val}],
                "glottocode": gc,
                "country": cc,
            }
            cleaned.append(rec)
            issues[rec_id] = []
            matches[rec_id] = (gc, "glottolog_native", 1.0)
        print(f"  → Prepared {len(cleaned)} spoken languages with coordinates")

    print("• querying Wikidata")
    gcs = {m[0] for m in matches.values() if m[0]} | {l["ID"] for l in glotto.languages_in(cc)}
    wiki = wikidata.fetch_by_glottocode(gcs, cc, refresh)

    print("• enriching + validating")
    # Load fallback speakers from data/embedded_languages.json if available
    fallback_speakers = {}
    emb_path = config.DATA / "embedded_languages.json"
    if emb_path.exists():
        emb_list = json.loads(emb_path.read_text(encoding="utf-8"))
        for el in emb_list:
            if el.get("speakers"):
                if el.get("iso"):
                    fallback_speakers[el["iso"].lower().strip()] = el
                name_k = el["name"].lower().replace(" ", "").replace("-", "")
                fallback_speakers[name_k] = el

    out = []
    for rec in cleaned:
        gc, method, conf = matches[rec["id"]]
        e, iss = enrich(rec, gc, method, conf, glotto, wiki, wals, regions, overrides, fallback_speakers)
        issues[rec["id"]] += iss
        out.append(e)

    dup = collections.defaultdict(list)
    for r in out:
        if r.get("glottocode"):
            dup[r["glottocode"]].append(r)
    for gc, rs in dup.items():
        if len(rs) > 1:
            names = ", ".join(r["name"] for r in rs)
            for r in rs:
                issues[r["id"]].append(("warn", "duplicate_glottocode", f"{gc} shared by: {names}"))

    gaps = coverage_gaps(glotto, wiki, set(dup), cc)
    summary = summarize(out, issues)
    summary["coverage_gaps"] = len(gaps)
    summary["generated"] = datetime.datetime.now().isoformat(timespec="seconds")
    write_outputs(cc, cfg, out, issues, gaps, summary)
    return summary


def write_outputs(cc, cfg, records, issues, gaps, summary):
    # 1. App dataset (concatenates so multiple countries can be loaded side by side)
    lang_dir = config.DATA / "languages"
    lang_dir.mkdir(parents=True, exist_ok=True)
    js = lang_dir / f"{cc}.js"
    js.write_text(
        f"// Generated by scripts/pipeline — do not edit by hand. Edit data/overrides/{cc}.json instead.\n"
        f"// {summary['generated']}\n"
        f"window.NERALA_LANGUAGE_DATA = (window.NERALA_LANGUAGE_DATA || []).concat(\n"
        + json.dumps(records, ensure_ascii=False, indent=1) + "\n);\n",
        encoding="utf-8",
    )

    # 2. Reports
    rep = config.REPORTS / cc
    rep.mkdir(parents=True, exist_ok=True)
    (rep / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    with open(rep / "issues.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["id", "name", "glottocode", "severity", "type", "detail"])
        by_id = {r["id"]: r for r in records}
        for rid, iss in issues.items():
            r = by_id.get(rid, {})
            for sev, kind, detail in iss:
                w.writerow([rid, r.get("name"), r.get("glottocode"), sev, kind, detail])
    with open(rep / "coverage_gaps.csv", "w", newline="", encoding="utf-8") as f:
        if gaps:
            w = csv.DictWriter(f, fieldnames=list(gaps[0].keys()))
            w.writeheader()
            w.writerows(gaps)
    (rep / "README.md").write_text(render_markdown(cc, cfg, records, issues, gaps, summary), encoding="utf-8")
    print(f"✔ wrote {js.relative_to(config.ROOT)} and reports/{cc}/")


def render_markdown(cc, cfg, records, issues, gaps, s):
    by_id = {r["id"]: r for r in records}
    lines = [
        f"# Validation report — {cfg['name']} ({cc})",
        f"_Generated {s['generated']} by `scripts/pipeline`._",
        "",
        "## Coverage",
        "| Metric | Value |", "|---|---|",
    ]
    for k in ("records", "matched", "with_iso", "with_speakers", "with_vitality", "with_wikipedia", "with_wals", "coverage_gaps"):
        lines.append(f"| {k} | {s[k]} |")
    lines += ["", "## Vitality (Glottolog AES)", "| Tier | Count |", "|---|---|"]
    lines += [f"| {k} | {v} |" for k, v in sorted(s["vitality"].items(), key=lambda x: -x[1])]
    lines += ["", "## Issues by type", "| Type | Count |", "|---|---|"]
    lines += [f"| {k} | {v} |" for k, v in s["issue_types"].items()]
    for sev in ("error", "warn"):
        rows = [(rid, k, d) for rid, iss in issues.items() for sv, k, d in iss if sv == sev and k != "speakers_missing"]
        if rows:
            lines += ["", f"## {sev.upper()}S (need human review)", "| Language | Type | Detail |", "|---|---|---|"]
            lines += [f"| {by_id[rid]['name']} | {k} | {d} |" for rid, k, d in rows]
    lines += ["", f"## Coverage gaps — {len(gaps)} Glottolog languages for {cc} not in our dataset",
              "See `coverage_gaps.csv`. Top by speakers:", "", "| Name | Glottocode | Family | Speakers |", "|---|---|---|---|"]
    for g in sorted(gaps, key=lambda g: -(g["speakers"] or 0))[:25]:
        lines.append(f"| {g['name']} | {g['glottocode']} | {g['family']} | {g['speakers'] or '—'} |")
    return "\n".join(lines) + "\n"


def main():
    ap = argparse.ArgumentParser(description="NeraMap data pipeline")
    ap.add_argument("--country", default="CM", choices=sorted(config.COUNTRIES))
    ap.add_argument("--refresh", action="store_true", help="re-download all sources")
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")
    s = run(a.country, a.refresh)
    print(json.dumps({k: v for k, v in s.items() if k not in ("issue_types",)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
