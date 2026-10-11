"""WALS adapter: maps glottocodes to WALS language entries (genus, WALS code).
Typological feature values can be layered on later via cldf/values.csv."""
import csv

from .. import config
from ..fetch import fetch


class WALS:
    def __init__(self, refresh=False):
        path = fetch(config.SOURCES["wals_languages"], "wals_languages.csv", refresh=refresh)
        self.by_glottocode = {}
        with open(path, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                if row["Glottocode"]:
                    self.by_glottocode.setdefault(row["Glottocode"], row)

    def get(self, gc):
        r = self.by_glottocode.get(gc)
        if not r:
            return None
        return {
            "code": r["ID"],
            "genus": r["Genus"] or None,
            "url": f"https://wals.info/languoid/lect/wals_code_{r['ID']}",
        }
