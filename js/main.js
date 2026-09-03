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
  let zoomHintLabels = {
    zoomed: "📍 Cliquez sur un marqueur pour les détails",
    clusters: "🔍 Zoomez pour explorer les clusters",
  };

  function initZoomHint(map) {
    const zoomHint = document.getElementById("zoom-hint");
    if (!zoomHint) return;

    map.on("zoomend", function () {
      zoomHint.textContent =
        map.getZoom() >= 9
          ? zoomHintLabels.zoomed
          : zoomHintLabels.clusters;
    });
  }

  async function translateInterface(map) {
    if (!ns.Translation || !ns.Translation.isTranslated()) return;
    const texts = [
      "Carte des langues de l'Afrique — Nerala",
      "NeraMap Afrique",
      "Distribution des langues locales · 250+ langues",
      "Affichées :",
      "langues",
      "Rechercher une langue…",
      "Choix de vue",
      "Familles linguistiques",
      "Autre / Isolat",
      "Stable / Vigoureux",
      "Vulnérable",
      "En danger",
      "Critique / Éteint",
      "Retour à l'accueil",
      "Zoomez pour explorer les clusters",
      "Cliquez sur un marqueur pour les détails",
    ]
      .concat(Object.keys(ns.MAP_VIEWS).map(function (key) {
        return [ns.MAP_VIEWS[key].label, ns.MAP_VIEWS[key].description];
      }).flat())
      .concat(Object.keys(ns.FAMILY_CONFIG).map(function (key) {
        return ns.FAMILY_CONFIG[key].label;
      }));

    const labels = await ns.Translation.translateAll(texts);
    document.documentElement.lang = ns.Translation.getLocale();
    document.title = labels["Carte des langues de l'Afrique — Nerala"];
    document.querySelector(".logo").textContent = labels["NeraMap Afrique"];
    document.querySelector(".subtitle").textContent =
      labels["Distribution des langues locales · 250+ langues"];
    document.querySelector(".counter").childNodes[0].textContent =
      labels["Affichées :"] + " ";
    document.querySelector(".counter").childNodes[2].textContent =
      " " + labels.langues;
    document.getElementById("search-input").placeholder =
      labels["Rechercher une langue…"];
    document.getElementById("legend").querySelector("h4").textContent =
      labels["Familles linguistiques"];
    document.querySelectorAll("#legend .legend-row").forEach(function (row, index) {
      const family = Object.keys(ns.FAMILY_CONFIG)[index];
      row.lastChild.textContent = " " + labels[ns.FAMILY_CONFIG[family].label];
    });
    document.getElementById("brand-mark").setAttribute(
      "aria-label",
      labels["Retour à l'accueil"],
    );
    document.querySelector(".vit-row:nth-child(1)").lastChild.textContent =
      " " + labels["Stable / Vigoureux"];
    document.querySelector(".vit-row:nth-child(2)").lastChild.textContent =
      " " + labels.Vulnérable;
    document.querySelector(".vit-row:nth-child(3)").lastChild.textContent =
      " " + labels["En danger"];
    document.querySelector(".vit-row:nth-child(4)").lastChild.textContent =
      " " + labels["Critique / Éteint"];
    ns.MapView.refreshLabels(labels);
    ns.SearchFilters.refreshLabels(labels);
    zoomHintLabels = {
      zoomed: "📍 " + labels["Cliquez sur un marqueur pour les détails"],
      clusters: "🔍 " + labels["Zoomez pour explorer les clusters"],
    };
    const zoomHint = document.getElementById("zoom-hint");
    if (zoomHint) {
      zoomHint.textContent =
        map.getZoom() >= 9 ? zoomHintLabels.zoomed : zoomHintLabels.clusters;
    }
  }

  // ── Boot ──
  async function boot() {
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
    await translateInterface(map);

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
