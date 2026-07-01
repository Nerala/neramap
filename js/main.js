// ═══════════════════════════════════════════════════════════════════════════════
//  NeraMap — Main entry point: boots the map, wires modules, sets global API
// ═══════════════════════════════════════════════════════════════════════════════

window.NeraMap = window.NeraMap || {};

(function (ns) {
  "use strict";

  // ── Inline tooltip style (injected once) ──
  function injectTooltipStyle() {
    const style = document.createElement("style");
    style.textContent =
      ".custom-tooltip{background:#1c2333!important;border:1px solid #2a3450!important;border-radius:8px!important;padding:8px 12px!important;color:#e8eaf0!important;box-shadow:0 4px 20px rgba(0,0,0,0.5)!important}" +
      ".custom-tooltip::before{border-top-color:#2a3450!important}" +
      ".leaflet-tooltip-top::before{border-top-color:#2a3450!important}";
    document.head.appendChild(style);
  }

  // ── Initialise zoom-hint text ──
  function initZoomHint(map) {
    const zoomHint = document.getElementById("zoom-hint");
    if (!zoomHint) return;

    map.on("zoomend", function () {
      zoomHint.textContent =
        map.getZoom() >= 9
          ? "📍 Cliquez sur un marqueur pour les détails"
          : "🔍 Zoomez pour explorer les clusters";
    });
  }

  // ── Boot ──
  function boot() {
    // 1. Register service worker (async, fire-and-forget)
    if (ns.TileCache) {
      ns.TileCache.registerServiceWorker();
    }

    // 2. Inject tooltip CSS
    injectTooltipStyle();

    // 3. Initialise the map
    const map = ns.MapInit.init();

    // 4. Wire the panel close button
    if (ns.Panel) {
      ns.Panel.init();
    }

    // 5. Build filters & wire search
    if (ns.SearchFilters) {
      ns.SearchFilters.init(map);
    }

    // 6. Build initial markers with all data
    const allData = ns.Data.getAll();
    ns.Markers.buildMarkers(allData, map);

    // 7. Add cluster group to map
    map.addLayer(ns.Markers.getClusterGroup());

    // 8. Close panel on map click
    map.on("click", function () {
      if (ns.Panel) ns.Panel.close();
    });

    // 9. Zoom hint
    initZoomHint(map);

    // 10. Expose public API
    window.NeralaLanguageMap = {
      getLanguages: function () {
        return ns.Data.getAll();
      },
      setLanguages: function (nextData) {
        ns.Data.setAll(nextData);
        const results = ns.SearchFilters.currentData();
        ns.Markers.buildMarkers(results, map);
      },
      setView: function (key) {
        if (ns.MapView) ns.MapView.setView(key);
      },
      getView: function () {
        return ns.MapView ? ns.MapView.getView() : "terrain";
      },
    };
  }

  // ── Run when DOM is ready ──
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.NeraMap);
