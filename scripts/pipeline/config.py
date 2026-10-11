"""Central configuration for the NeraMap data pipeline.

Everything country-specific lives in COUNTRIES so adding a new country is a
config change, not a code change.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"
CACHE = DATA / "sources"          # raw downloads (git-ignored, re-fetchable)
OVERRIDES = DATA / "overrides"    # human-curated corrections (committed)
REPORTS = ROOT / "reports"        # validation reports (committed)

USER_AGENT = "NeraMap-DataPipeline/1.0 (https://nerala.app; language atlas validation)"
CACHE_TTL_DAYS = 30

SOURCES = {
    "glottolog_languages": "https://raw.githubusercontent.com/glottolog/glottolog-cldf/master/cldf/languages.csv",
    "glottolog_values": "https://raw.githubusercontent.com/glottolog/glottolog-cldf/master/cldf/values.csv",
    "wals_languages": "https://raw.githubusercontent.com/cldf-datasets/wals/master/cldf/languages.csv",
    "wikidata_sparql": "https://query.wikidata.org/sparql",
    "geoboundaries_api": "https://www.geoboundaries.org/api/current/gbOpen/{iso3}/ADM1/",
}

COUNTRIES = {
    "CM": {
        "iso3": "CMR",
        "name": "Cameroun",
        "input": DATA / "custom-languages-app-ready.js",
        "input_global": "NERALA_LANGUAGE_DATA",
        # Display names (FR) for geoBoundaries ADM1 shapeNames
        "region_labels": {
            "Adamawa": "Adamaoua", "Centre": "Centre", "East": "Est",
            "Far North": "Extrême-Nord", "Littoral": "Littoral", "North": "Nord",
            "North-West": "Nord-Ouest", "Northwest": "Nord-Ouest", "South": "Sud",
            "South-West": "Sud-Ouest", "Southwest": "Sud-Ouest", "West": "Ouest",
        },
    },
    "GA": {
        "iso3": "GAB",
        "name": "Gabon",
        "input": None,
    },
    "TD": {
        "iso3": "TCD",
        "name": "Tchad",
        "input": None,
    },
    "NG": {
        "iso3": "NGA",
        "name": "Nigeria",
        "input": None,
    },
}

# Glottolog top-level family glottocode -> traditional family label used by the app.
# Glottolog is deliberately conservative (e.g. no "Niger-Congo", no "Nilo-Saharan"),
# so we keep the raw Glottolog family too and map for display consistency.
FAMILY_MAP = {
    "atla1278": "Niger-Congo",     # Atlantic-Congo
    "mand1469": "Niger-Congo",     # Mande
    "dogo1299": "Niger-Congo",     # Dogon
    "ijoi1239": "Niger-Congo",     # Ijoid
    "kord1245": "Niger-Congo",     # Kordofanian (subset)
    "afro1255": "Afro-Asiatic",
    "saha1256": "Nilo-Saharan",    # Saharan (Kanuri…)
    "cent2225": "Nilo-Saharan",    # Central Sudanic
    "east2525": "Nilo-Saharan",    # Eastern Sudanic
    "song1307": "Nilo-Saharan",    # Songhay
    "maba1274": "Nilo-Saharan",    # Maban
    "furr1244": "Nilo-Saharan",    # Fur
    "fura1235": "Nilo-Saharan",    # Furan
    "tama1329": "Nilo-Saharan",    # Tamaic
    "daju1249": "Nilo-Saharan",    # Dajuic
    "nilo1247": "Nilo-Saharan",    # Nilotic
    "nubi1251": "Nilo-Saharan",
    "indo1319": "Indo-European",
    "pidg1258": "Creole",          # Pidgin pseudo-family
    "mixe1287": "Creole",          # Mixed language
}

# Glottolog AES (aggregated UNESCO / ElCat / Ethnologue EGIDS) -> app vitality tier
AES_TO_VITALITY = {
    "aes-not_endangered": "stable",
    "aes-threatened": "vulnerable",
    "aes-shifting": "endangered",
    "aes-moribund": "critical",
    "aes-nearly_extinct": "critical",
    "aes-extinct": "extinct",
}

MED_LABELS = {
    "med-long_grammar": "Grammaire complète (>300 p.)",
    "med-grammar": "Grammaire",
    "med-grammar_sketch": "Esquisse grammaticale",
    "med-phonology_or_text": "Phonologie / textes / dictionnaire",
    "med-wordlist_or_less": "Liste de mots ou moins",
}

# Validation thresholds
COORD_WARN_KM = 75
COORD_ERROR_KM = 200
FUZZY_MIN_RATIO = 0.86
FUZZY_MAX_KM = 150
