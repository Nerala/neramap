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

    function updateHint() {
      if (ns.I18n && typeof ns.I18n.t === "function") {
        zoomHint.textContent =
          map.getZoom() >= 9
            ? ns.I18n.t("hints.zoomHintMarker")
            : ns.I18n.t("hints.zoomHintClusters");
      } else {
        zoomHint.textContent =
          map.getZoom() >= 9
            ? "Click on a marker for details"
            : "Zoom in to explore clusters";
      }
    }

    map.on("zoomend", updateHint);
    updateHint();

    if (ns.I18n && typeof ns.I18n.subscribe === "function") {
      ns.I18n.subscribe(updateHint);
    }
  }

  // ── Boot ──
  function boot() {
    // 0. Initialize i18n system first
    if (ns.I18n) {
      ns.I18n.init();
    }

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

    // 4.5 Initialize Country Filter
    if (ns.CountryFilter) {
      ns.CountryFilter.init(map);
    }

    // 5. Build filters & wire search
    if (ns.SearchFilters) {
      ns.SearchFilters.init(map);
    }

    // 6. Build initial markers with active scope data
    const initialData = ns.SearchFilters
      ? ns.SearchFilters.currentData()
      : ns.Data.getAll();
    ns.Markers.buildMarkers(initialData, map);

    // 7. Add cluster group to map
    map.addLayer(ns.Markers.getClusterGroup());

    // 8. Close panel on map click
    map.on("click", function () {
      if (ns.Panel) ns.Panel.close();
    });

    // 8.5 Initialize Voronoi spatial layer
    if (ns.VizVoronoi) {
      ns.VizVoronoi.init(map);
    }

    // 8.6 Initialize Viz Studio orchestrator
    if (ns.VizStudio) {
      ns.VizStudio.init();
    }

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
