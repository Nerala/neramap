"""Glottolog (CLDF) adapter: languoids, classification, endangerment (AES),
documentation status (MED) and dialects."""
import collections
import csv

from .. import config
from ..fetch import fetch

csv.field_size_limit(10**8)


class Glottolog:
    def __init__(self, refresh=False):
        lang_path = fetch(config.SOURCES["glottolog_languages"], "glottolog_languages.csv", refresh=refresh)
        val_path = fetch(config.SOURCES["glottolog_values"], "glottolog_values.csv", refresh=refresh)

        self.languoids = {}
        self.dialects_of = collections.defaultdict(list)
        with open(lang_path, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                self.languoids[row["ID"]] = row
                if row["Level"] == "dialect" and row["Language_ID"]:
                    self.dialects_of[row["Language_ID"]].append(row["Name"])

        self.values = collections.defaultdict(dict)
        wanted = {"classification", "aes", "med", "category"}
        with open(val_path, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                if row["Parameter_ID"] in wanted:
                    self.values[row["Language_ID"]][row["Parameter_ID"]] = row

    # ── lookups ─────────────────────────────────────────────
    def languages_in(self, country_code):
        return [
            l for l in self.languoids.values()
            if l["Level"] == "language" and country_code in l["Countries"].split(";")
        ]

    def name(self, gc):
        return self.languoids.get(gc, {}).get("Name", gc)

    def classification(self, gc):
        v = self.values.get(gc, {}).get("classification")
        return v["Value"].split("/") if v and v["Value"] else []

    def family_id(self, gc):
        return self.languoids.get(gc, {}).get("Family_ID") or None

    def endangerment(self, gc):
        v = self.values.get(gc, {}).get("aes")
        if not v:
            return None
        return {
            "code": v["Code_ID"],
            "vitality": config.AES_TO_VITALITY.get(v["Code_ID"]),
            "note": (v.get("Comment") or "").strip() or None,
        }

    def documentation(self, gc):
        v = self.values.get(gc, {}).get("med")
        return config.MED_LABELS.get(v["Code_ID"]) if v else None

    def category(self, gc):
        v = self.values.get(gc, {}).get("category")
        return v["Value"] if v else None

    def profile(self, gc):
        """Everything we know about a glottocode, in app-friendly form."""
        l = self.languoids[gc]
        path = self.classification(gc)
        fam = self.family_id(gc)
        return {
            "glottocode": gc,
            "name": l["Name"],
            "iso": l["ISO639P3code"] or None,
            "lat": float(l["Latitude"]) if l["Latitude"] else None,
            "lng": float(l["Longitude"]) if l["Longitude"] else None,
            "countries": [c for c in l["Countries"].split(";") if c],
            "family_glottolog": self.name(fam) if fam else ("Isolate" if l["Is_Isolate"] == "true" else None),
            "family_id": fam,
            "family": config.FAMILY_MAP.get(fam, self.name(fam) if fam else "Unclassified"),
            "classification": [self.name(c) for c in path],
            "classification_ids": path,
            "category": self.category(gc),
            "endangerment": self.endangerment(gc),
            "documentation": self.documentation(gc),
            "dialects_glottolog": sorted(self.dialects_of.get(gc, [])),
            "url": f"https://glottolog.org/resource/languoid/id/{gc}",
        }
