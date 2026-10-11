import json
import re
import numpy as np
from scipy.spatial import Voronoi

def clean_region(r):
    if not r:
        return "Cameroun"
    r = r.strip()
    r_lower = r.lower()
    if "nord-ouest" in r_lower:
        return "Nord-Ouest"
    if "extreme-nord" in r_lower or "extrême-nord" in r_lower:
        return "Extrême-Nord"
    if "sud-ouest" in r_lower:
        return "Sud-Ouest"
    if "adamaoua" in r_lower or "ngaoundere" in r_lower:
        return "Adamaoua"
    if "centre" in r_lower:
        return "Centre"
    if "littoral" in r_lower:
        return "Littoral"
    if "ouest" in r_lower or "west region" in r_lower:
        return "Ouest"
    if "est" in r_lower:
        return "Est"
    if "nord" in r_lower and "nord-ouest" not in r_lower and "extreme" not in r_lower and "extrême" not in r_lower:
        return "Nord"
    if "sud" in r_lower and "sud-ouest" not in r_lower:
        return "Sud"
    if "égypte" in r_lower or "egypte" in r_lower:
        return "Égypte"
    return "Cameroun"

def clean_family(f):
    if not f:
        return "Unclassified"
    f = f.strip().rstrip('.')
    if f.lower() == "unclassified":
        return "Unclassified"
    return f

def main():
    from pathlib import Path
    raw_data = []
    lang_dir = Path('data/languages')
    if lang_dir.exists() and list(lang_dir.glob('*.js')):
        for path in sorted(lang_dir.glob('*.js')):
            text = path.read_text(encoding='utf-8')
            start = text.index('[', text.index('concat('))
            end = text.rindex(']') + 1
            items = json.loads(text[start:end])
            raw_data.extend(items)
            print(f"Loaded {len(items)} validated languages from {path.name}")
    else:
        with open('data/raw-languages.json', 'r', encoding='utf-8') as f:
            raw_data = json.load(f)
        print(f"Loaded {len(raw_data)} raw languages.")

    print(f"Total languages to process: {len(raw_data)}")

    cleaned_data = []
    points_list = []
    points_to_lang = []

    for d in raw_data:
        lang = dict(d)
        lang['family'] = clean_family(lang.get('family', ''))
        lang['region'] = clean_region(lang.get('region', ''))
        lang['dialect_count'] = len(lang.get('dialects', []))
        lang['alias_count'] = len(lang.get('aliases', []))
        lang['places_count'] = len(lang.get('places', []))
        
        pts = lang.get('points', [])
        lang['points_count'] = len(pts)
        
        # Ensure lat and lng are floats
        try:
            lang['lat'] = float(lang['lat'])
            lang['lng'] = float(lang['lng'])
        except (ValueError, TypeError):
            continue

        cleaned_data.append(lang)

        # Collect points for Voronoi (West & Central Africa bounding box)
        if -5.0 <= lang['lat'] <= 25.0 and 1.0 <= lang['lng'] <= 26.0:
            points_list.append([lang['lng'], lang['lat']])
            points_to_lang.append(lang['id'])

    print(f"Points within West & Central Africa for Voronoi: {len(points_list)}")

    # 1. Linguistic Hierarchy Tree (Sunburst / Dendrogram / Circle Packing)
    hierarchy = {
        "name": "Langues d'Afrique (Cameroun, Nigeria, Tchad, Gabon)",
        "children": {}
    }

    for lang in cleaned_data:
        fam = lang['family']
        if fam not in hierarchy['children']:
            hierarchy['children'][fam] = {
                "name": fam,
                "children": {}
            }
        
        # Subfamily or branch
        sub = lang.get('subfamily', '').strip()
        branch = "Général"
        if sub:
            parts = [p.strip() for p in sub.split('>') if p.strip()]
            if len(parts) >= 2:
                branch = f"{parts[0]} > {parts[1]}"
            elif len(parts) == 1:
                branch = parts[0]
        
        if branch not in hierarchy['children'][fam]['children']:
            hierarchy['children'][fam]['children'][branch] = {
                "name": branch,
                "children": []
            }
        
        hierarchy['children'][fam]['children'][branch]['children'].append({
            "name": lang['name'],
            "id": lang['id'],
            "region": lang['region'],
            "vitality": lang.get('vitality', 'vulnerable'),
            "dialect_count": lang['dialect_count'],
            "alias_count": lang['alias_count'],
            "value": max(1, lang['dialect_count'] + 1)
        })

    # Convert hierarchy dict to standard D3 format with list children
    def dict_to_list_tree(node):
        if "children" in node:
            if isinstance(node["children"], dict):
                node["children"] = [dict_to_list_tree(v) for v in node["children"].values()]
            elif isinstance(node["children"], list):
                node["children"] = [dict_to_list_tree(v) for v in node["children"]]
        return node

    d3_hierarchy = dict_to_list_tree(hierarchy)

    # 2. Regional Statistics & Diversity Index
    regions_summary = {}
    for lang in cleaned_data:
        reg = lang['region']
        if reg not in regions_summary:
            regions_summary[reg] = {
                "region": reg,
                "language_count": 0,
                "total_dialects": 0,
                "families": {},
                "languages": []
            }
        regions_summary[reg]["language_count"] += 1
        regions_summary[reg]["total_dialects"] += lang['dialect_count']
        fam = lang['family']
        regions_summary[reg]["families"][fam] = regions_summary[reg]["families"].get(fam, 0) + 1
        regions_summary[reg]["languages"].append({
            "id": lang['id'],
            "name": lang['name'],
            "family": fam,
            "dialect_count": lang['dialect_count']
        })

    # 3. Top dialect networks (for Network / Constellation Viz)
    top_dialect_langs = sorted(
        [l for l in cleaned_data if l['dialect_count'] > 0],
        key=lambda x: x['dialect_count'],
        reverse=True
    )

    # 4. Voronoi calculation
    voronoi_cells = []
    if len(points_list) > 10:
        pts = np.array(points_list)
        # Bounding box anchor points covering Nigeria, Chad, Cameroon, Gabon
        bbox_anchors = np.array([
            [0.0, -6.0], [27.0, -6.0], [0.0, 26.0], [27.0, 26.0],
            [0.0, 10.0], [27.0, 10.0], [13.5, -6.0], [13.5, 26.0]
        ])
        all_pts = np.vstack([pts, bbox_anchors])
        vor = Voronoi(all_pts)

        for i, lang_id in enumerate(points_to_lang):
            region_idx = vor.point_region[i]
            region_vertices_idx = vor.regions[region_idx]
            if not region_vertices_idx or -1 in region_vertices_idx:
                continue
            poly = [vor.vertices[v_idx].tolist() for v_idx in region_vertices_idx]
            # Verify coordinates are reasonable
            if all(-3 <= p[0] <= 30 and -8 <= p[1] <= 28 for p in poly):
                # lat, lng format for Leaflet/geojson
                voronoi_cells.append({
                    "lang_id": lang_id,
                    "polygon": poly # [[lng, lat], ...]
                })

    print(f"Computed {len(voronoi_cells)} bounded Voronoi cells.")

    # 5. Output unified viz data bundle
    bundle = {
        "cleaned_languages": cleaned_data,
        "hierarchy": d3_hierarchy,
        "regions_summary": list(regions_summary.values()),
        "top_dialect_languages": [
            {
                "id": l['id'],
                "name": l['name'],
                "family": l['family'],
                "region": l['region'],
                "dialects": l.get('dialects', []),
                "aliases": l.get('aliases', []),
                "dialect_count": l['dialect_count'],
                "alias_count": l['alias_count']
            }
            for l in top_dialect_langs[:50]
        ],
        "voronoi_cells": voronoi_cells
    }

    # Write as JS window global for instant offline loading and as JSON
    with open('data/viz-data.json', 'w', encoding='utf-8') as f:
        json.dump(bundle, f, ensure_ascii=False, indent=2)

    with open('data/viz-data.js', 'w', encoding='utf-8') as f:
        f.write("window.NERALA_VIZ_DATA = " + json.dumps(bundle, ensure_ascii=False, indent=2) + ";\n")

    print("Successfully generated data/viz-data.json and data/viz-data.js!")

if __name__ == '__main__':
    main()
