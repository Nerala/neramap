// ═══════════════════════════════════════════════════════════════════════════════
//  NeraMap — Search & Filters: query, family toggles, map-fit on results
// ═══════════════════════════════════════════════════════════════════════════════

window.NeraMap = window.NeraMap || {};

(function (ns) {
  "use strict";

  const FAMILY_CONFIG = ns.FAMILY_CONFIG;
  const DEFAULT_CENTER = ns.DEFAULT_CENTER;
  const DEFAULT_ZOOM = ns.DEFAULT_ZOOM;
  const Markers = ns.Markers;
  const Panel = ns.Panel;
  const Data = ns.Data;

  // ── Filter data by search query (ignores family filters — those
  //    are applied later in Markers.buildMarkers) ──
  function currentData() {
    const q = document
      .getElementById("search-input")
      .value.trim()
      .toLowerCase();
    const allData = Data.getAll();
    if (!q) return allData;
    return allData.filter(function (l) {
      return (
        l.name.toLowerCase().includes(q) ||
        l.iso.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q) ||
        l.family.toLowerCase().includes(q) ||
        l.subfamily.toLowerCase().includes(q)
      );
    });
  }

  // ── Fit the map to show all markers from the given results ──
  function fitMapToResults(results, map) {
    if (results.length === 0) {
      // No results — keep current view, just show nothing
      return;
    }

    if (results.length === 1) {
      // Single result: fly to that language
      const l = results[0];
      map.flyTo([l.lat, l.lng], 9, { duration: 1.2 });
      Panel.open(l);
      return;
    }

    // Multiple results: fit the map to their collective bounds
    const lats = results.map(function (l) {
      return l.lat;
    });
    const lngs = results.map(function (l) {
      return l.lng;
    });
    const minLat = Math.min.apply(null, lats);
    const maxLat = Math.max.apply(null, lats);
    const minLng = Math.min.apply(null, lngs);
    const maxLng = Math.max.apply(null, lngs);

    map.fitBounds(
      [
        [minLat, minLng],
        [maxLat, maxLng],
      ],
      { padding: [40, 40], maxZoom: 10, duration: 1.0 },
    );
  }

  // ── Build filter buttons ──
  function buildFilters(map) {
    const filtersEl = document.getElementById("filters");
    if (!filtersEl) return;

    Object.keys(FAMILY_CONFIG).forEach(function (key) {
      const cfg = FAMILY_CONFIG[key];
      const btn = document.createElement("button");
      btn.className = "filter-btn active";
      btn.dataset.family = key;
      btn.innerHTML =
        '<span class="dot" style="background:' +
        cfg.color +
        '"></span>' +
        cfg.label;

      btn.addEventListener("click", function () {
        Markers.toggleFilter(key, currentData(), map);
        // Update active class
        btn.classList.toggle("active", Markers.isFilterActive(key));
      });

      filtersEl.appendChild(btn);
    });
  }

  // ── Wire search input ──
  function initSearch(map) {
    const input = document.getElementById("search-input");
    if (!input) return;

    input.addEventListener("input", function () {
      const results = currentData();
      Markers.buildMarkers(results, map);
      fitMapToResults(results, map);
    });
  }

  // ── Initialise everything ──
  function init(map) {
    buildFilters(map);
    initSearch(map);
  }

  // ── Public API ──
  ns.SearchFilters = {
    init: init,
    currentData: currentData,
  };
})(window.NeraMap);
