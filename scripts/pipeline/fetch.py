"""Cached HTTP fetching. Raw downloads live in data/sources/ (git-ignored)."""
import hashlib
import json
import time
import urllib.parse
import urllib.request

from . import config


def _fresh(path, ttl_days):
    return path.exists() and (time.time() - path.stat().st_mtime) < ttl_days * 86400


def fetch(url, name=None, ttl_days=config.CACHE_TTL_DAYS, refresh=False):
    """Download url to the cache (if stale) and return the local Path."""
    config.CACHE.mkdir(parents=True, exist_ok=True)
    name = name or hashlib.sha1(url.encode()).hexdigest()[:16]
    path = config.CACHE / name
    if not refresh and _fresh(path, ttl_days):
        return path
    print(f"  ↓ downloading {name} …")
    req = urllib.request.Request(url, headers={"User-Agent": config.USER_AGENT})
    with urllib.request.urlopen(req, timeout=180) as r:
        path.write_bytes(r.read())
    return path


def sparql(query, name, refresh=False):
    """Run a Wikidata SPARQL query with caching; returns list of flat dict rows."""
    url = config.SOURCES["wikidata_sparql"] + "?format=json&query=" + urllib.parse.quote(query)
    for attempt in range(4):
        try:
            path = fetch(url, name=name, refresh=refresh)
            data = json.loads(path.read_text(encoding="utf-8"))
            return [{k: v["value"] for k, v in b.items()} for b in data["results"]["bindings"]]
        except Exception as e:  # rate limits / timeouts: back off and retry
            wait = 5 * (attempt + 1)
            print(f"  ! SPARQL {name} failed ({e}); retry in {wait}s")
            time.sleep(wait)
            refresh = True
    raise RuntimeError(f"SPARQL query {name} failed after retries")
