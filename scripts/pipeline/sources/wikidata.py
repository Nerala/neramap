"""Wikidata adapter: speaker counts (with year + reference), Wikidata QID,
French/English labels, Wikipedia articles and writing systems — keyed by glottocode."""
import collections

from ..fetch import sparql

BATCH = 120


def _query(codes):
    values = " ".join(f'"{c}"' for c in codes)
    return f"""
SELECT ?glotto ?item ?labelFr ?labelEn ?speakers ?time ?refLabel ?appliesLabel ?scriptLabel ?wpFr ?wpEn WHERE {{
  VALUES ?glotto {{ {values} }}
  ?item wdt:P1394 ?glotto .
  OPTIONAL {{ ?item rdfs:label ?labelFr FILTER(lang(?labelFr) = "fr") }}
  OPTIONAL {{ ?item rdfs:label ?labelEn FILTER(lang(?labelEn) = "en") }}
  OPTIONAL {{
    ?item p:P1098 ?st . ?st ps:P1098 ?speakers .
    OPTIONAL {{ ?st pq:P585 ?time }}
    OPTIONAL {{ ?st pq:P518 ?applies }}
    OPTIONAL {{ ?st prov:wasDerivedFrom/pr:P248 ?ref }}
  }}
  OPTIONAL {{ ?item wdt:P282 ?script }}
  OPTIONAL {{ ?wpFr schema:about ?item ; schema:isPartOf <https://fr.wikipedia.org/> }}
  OPTIONAL {{ ?wpEn schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> }}
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "fr,en". }}
}}"""


def fetch_by_glottocode(glottocodes, tag, refresh=False):
    """Return {glottocode: record}."""
    codes = sorted(set(glottocodes))
    rows = []
    for i in range(0, len(codes), BATCH):
        rows += sparql(_query(codes[i:i + BATCH]), f"wikidata_{tag}_{i // BATCH}.json", refresh=refresh)

    out = collections.defaultdict(lambda: {"speaker_claims": {}, "scripts": set()})
    for r in rows:
        rec = out[r["glotto"]]
        rec["qid"] = r["item"].rsplit("/", 1)[-1]
        rec["label_fr"] = r.get("labelFr")
        rec["label_en"] = r.get("labelEn")
        rec["wikipedia_fr"] = r.get("wpFr")
        rec["wikipedia_en"] = r.get("wpEn")
        if r.get("scriptLabel") and not r["scriptLabel"].startswith("Q"):
            rec["scripts"].add(r["scriptLabel"])
        if r.get("speakers") and not r["speakers"].startswith("http"):
            key = (r["speakers"], r.get("time"), r.get("appliesLabel"))
            rec["speaker_claims"][key] = {
                "value": int(float(r["speakers"])),
                "year": int(r["time"][:4]) if r.get("time") else None,
                "applies_to": r.get("appliesLabel"),
                "reference": r.get("refLabel"),
            }

    result = {}
    for gc, rec in out.items():
        claims = list(rec.pop("speaker_claims").values())
        rec["scripts"] = sorted(rec["scripts"])
        rec["speakers"] = pick_speakers(claims)
        rec["speaker_claims"] = claims
        result[gc] = rec
    return result


def pick_speakers(claims):
    """Choose the most defensible single figure: prefer total/L1 counts that are
    the most recent; ignore claims scoped to a sub-population (e.g. 'second language')."""
    if not claims:
        return None
    scoped = {"second language", "langue seconde", "L2", "L2 speaker"}
    primary = [c for c in claims if not c["applies_to"] or c["applies_to"] not in scoped] or claims
    primary.sort(key=lambda c: (c["year"] or 0, c["value"]), reverse=True)
    best = primary[0]
    return {
        "value": best["value"],
        "year": best["year"],
        "reference": best["reference"],
        "applies_to": best["applies_to"],
    }
