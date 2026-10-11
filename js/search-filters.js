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

  // ── Filter data by active country and search query (family filters
  //    are applied later in Markers.buildMarkers) ──
  function currentData() {
    const q = document
      .getElementById("search-input")
      .value.trim()
      .toLowerCase();
    const allData = Data.getAll();
    const activeCountry = ns.CountryFilter
      ? ns.CountryFilter.getActiveCountry()
      : "ALL";

    let filtered = allData;
    if (activeCountry && activeCountry !== "ALL") {
      filtered = filtered.filter(function (l) {
        return l.country === activeCountry;
      });
    }

    if (!q) return filtered;
    return filtered.filter(function (l) {
      return (
        l.name.toLowerCase().includes(q) ||
        l.iso.toLowerCase().includes(q) ||
        (l.region && l.region.toLowerCase().includes(q)) ||
        (l.family && l.family.toLowerCase().includes(q)) ||
        (l.subfamily && l.subfamily.toLowerCase().includes(q))
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
    filtersEl.innerHTML = "";

    Object.keys(FAMILY_CONFIG).forEach(function (key) {
      const cfg = FAMILY_CONFIG[key];
      const btn = document.createElement("button");
      btn.className = "filter-btn" + (Markers.isFilterActive ? (Markers.isFilterActive(key) ? " active" : "") : " active");
      btn.dataset.family = key;
      btn.innerHTML =
        '<span class="dot" style="background:' +
        cfg.color +
        '"></span><span class="family-label">' +
        cfg.label +
        '</span>';

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
      if (input.value.trim()) {
        fitMapToResults(results, map);
      } else {
        const activeCountry = ns.CountryFilter
          ? ns.CountryFilter.getActiveCountry()
          : "ALL";
        const cfg = ns.CountryFilter
          ? ns.CountryFilter.getConfig(activeCountry)
          : null;
        if (cfg) {
          if (activeCountry === "ALL") {
            map.flyTo(cfg.center, cfg.zoom, { duration: 0.8 });
          } else if (cfg.bounds) {
            map.flyToBounds(cfg.bounds, {
              padding: [50, 50],
              maxZoom: 9,
              duration: 0.8,
            });
          }
        }
      }
    });
  }

  // ── Initialise everything ──
  function init(map) {
    buildFilters(map);
    initSearch(map);

    if (ns.I18n && typeof ns.I18n.subscribe === "function") {
      ns.I18n.subscribe(function () {
        buildFilters(map);
      });
    }
  }

  // ── Public API ──
  ns.SearchFilters = {
    init: init,
    currentData: currentData,
  };
})(window.NeraMap);
