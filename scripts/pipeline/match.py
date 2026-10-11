"""Match curated records to Glottolog languoids, with an explicit method and
confidence for every match so humans can audit the weak ones."""
import difflib
import math
import re
import unicodedata

from . import config


def norm(s):
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode().lower()
    s = re.sub(r"\(.*?\)", "", s)
    return re.sub(r"[^a-z]", "", s)


def name_variants(name):
    """'Fulfulde, Adamawa' -> also 'Adamawa Fulfulde'; 'Mambila, Cameroon' -> 'Cameroon Mambila', 'Mambila'."""
    v = {name}
    if "," in name:
        head, tail = [p.strip() for p in name.split(",", 1)]
        v |= {f"{tail} {head}", head}
    v.add(re.sub(r"\(.*?\)", "", name).strip())
    return {norm(x) for x in v if x}


def km(lat1, lng1, lat2, lng2):
    if None in (lat1, lng1, lat2, lng2):
        return None
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(a))


class Matcher:
    def __init__(self, glottolog, country):
        self.g = glottolog
        self.local = glottolog.languages_in(country)
        self.local_idx, self.global_idx = {}, {}
        for l in self.local:
            self.local_idx.setdefault(norm(l["Name"]), []).append(l)
        for l in glottolog.languoids.values():
            if l["Level"] == "language":
                self.global_idx.setdefault(norm(l["Name"]), []).append(l)
        self.by_iso = {l["ISO639P3code"]: l for l in glottolog.languoids.values()
                       if l["ISO639P3code"] and l["Level"] == "language"}

    def _closest(self, rec, cands):
        def d(c):
            return km(rec["lat"], rec["lng"], float(c["Latitude"] or 0), float(c["Longitude"] or 0)) or 1e9
        return min(cands, key=d)

    def match(self, rec, override=None):
        """Return (glottocode|None, method, confidence)."""
        if override:
            return override, "manual_override", 1.0
        iso = (rec.get("iso") or "").strip().lower()
        if iso and iso != "und" and iso in self.by_iso:
            return self.by_iso[iso]["ID"], "iso639-3", 1.0

        for variants, method, conf in (
            (name_variants(rec["name"]), "name_exact", 0.95),
            (set().union(*[name_variants(a) for a in rec.get("aliases", [])] or [set()]), "alias_exact", 0.85),
        ):
            cands = [c for v in variants for c in self.local_idx.get(v, [])]
            if cands:
                return self._closest(rec, cands)["ID"], method, conf

        # Fuzzy on local names, constrained by distance
        best, best_ratio = None, 0
        names = [rec["name"]] + rec.get("aliases", [])
        for l in self.local:
            for n in names:
                r = difflib.SequenceMatcher(None, norm(n), norm(l["Name"])).ratio()
                if r > best_ratio:
                    best, best_ratio = l, r
        if best and best_ratio >= config.FUZZY_MIN_RATIO:
            dist = km(rec["lat"], rec["lng"], float(best["Latitude"] or 0), float(best["Longitude"] or 0))
            if dist is not None and dist <= config.FUZZY_MAX_KM:
                return best["ID"], f"fuzzy({best_ratio:.2f},{dist:.0f}km)", round(best_ratio * 0.8, 2)

        # Languages not tagged with this country in Glottolog (e.g. French, Coptic)
        cands = [c for v in name_variants(rec["name"]) for c in self.global_idx.get(v, [])]
        if cands:
            return self._closest(rec, cands)["ID"], "name_exact_global", 0.75
        return None, "unmatched", 0.0
