"""geoBoundaries adapter: admin-1 polygons used to *derive* each language's
region from its coordinates (instead of trusting hand-typed region strings)."""
import json

from .. import config
from ..fetch import fetch


def _point_in_ring(x, y, ring):
    inside = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi + 1e-15) + xi:
            inside = not inside
        j = i
    return inside


def _in_polygon(x, y, poly):
    return _point_in_ring(x, y, poly[0]) and not any(_point_in_ring(x, y, h) for h in poly[1:])


class AdminRegions:
    def __init__(self, iso3, labels=None, refresh=False):
        meta_path = fetch(config.SOURCES["geoboundaries_api"].format(iso3=iso3), f"geoboundaries_{iso3}_meta.json", refresh=refresh)
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        url = meta.get("simplifiedGeometryGeoJSON") or meta["gjDownloadURL"]
        geo = json.loads(fetch(url, f"geoboundaries_{iso3}_ADM1.geojson", refresh=refresh).read_text(encoding="utf-8"))
        labels = labels or {}
        self.regions = []
        for feat in geo["features"]:
            name = feat["properties"].get("shapeName")
            g = feat["geometry"]
            polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
            bbox = [min(p[0] for poly in polys for p in poly[0]), min(p[1] for poly in polys for p in poly[0]),
                    max(p[0] for poly in polys for p in poly[0]), max(p[1] for poly in polys for p in poly[0])]
            self.regions.append((labels.get(name, name), polys, bbox))

    def locate(self, lat, lng):
        for label, polys, (x0, y0, x1, y1) in self.regions:
            if x0 <= lng <= x1 and y0 <= lat <= y1 and any(_in_polygon(lng, lat, p) for p in polys):
                return label
        return None
