"""Load the curated input dataset and repair structural/encoding defects."""
import re

import ftfy
import json5


def load_js_array(path, global_name):
    text = path.read_text(encoding="utf-8")
    start = text.index("[", text.index(global_name))
    end = text.rindex("]") + 1
    return json5.loads(text[start:end])


def fix_text(s):
    if not isinstance(s, str):
        return s
    s = ftfy.fix_text(s)
    return re.sub(r"\s+", " ", s).strip()


def rejoin_fragments(items):
    """['Mbutu (Alamatu', 'Bambutu', 'Mbotu)'] -> ['Mbutu (Alamatu, Bambutu, Mbotu)']"""
    out, buf, depth = [], [], 0
    for raw in items:
        part = fix_text(raw)
        if not part:
            continue
        buf.append(part)
        depth += part.count("(") - part.count(")")
        if depth <= 0:
            out.append(", ".join(buf))
            buf, depth = [], 0
    if buf:
        out.append(", ".join(buf) + (")" if depth > 0 else ""))
    seen, uniq = set(), []
    for d in out:
        if d.lower() not in seen:
            seen.add(d.lower())
            uniq.append(d)
    return uniq


def clean_record(rec):
    issues = []
    out = dict(rec)
    for key in ("name", "region", "description", "subfamily", "family"):
        if key in out:
            fixed = fix_text(out[key])
            if fixed != rec[key]:
                issues.append(("encoding_or_whitespace_fixed", key))
            out[key] = fixed
    for key in ("aliases", "places"):
        before = rec.get(key) or []
        after = rejoin_fragments(before)
        if after != [fix_text(x) for x in before]:
            issues.append(("list_repaired", key))
        out[key] = after
    before = rec.get("dialects") or []
    after = rejoin_fragments(before)
    if len(after) != len(before):
        issues.append(("dialects_rejoined", f"{len(before)} → {len(after)}"))
    out["dialects"] = after
    out["family"] = (out.get("family") or "Unclassified").rstrip(".") or "Unclassified"
    return out, issues
