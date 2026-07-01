// ═══════════════════════════════════════════════════════════════════════════════
//  NeraMap — Map initialisation & view switching
// ═══════════════════════════════════════════════════════════════════════════════

window.NeraMap = window.NeraMap || {};

(function (ns) {
  "use strict";

  const FAMILY_CONFIG = ns.FAMILY_CONFIG;
  const MAP_VIEWS = ns.MAP_VIEWS;
  const DEFAULT_CENTER = ns.DEFAULT_CENTER;
  const DEFAULT_ZOOM = ns.DEFAULT_ZOOM;
  const TileCache = ns.TileCache;

  // ── Store key for localStorage ──
  const VIEW_STORAGE_KEY = "nerala-map-view";

  // ── State ──
  let activeViewKey = "terrain";
  let activeBaseLayer = null;

  // ── Read persisted view ──
  function readStoredView() {
    try {
      return localStorage.getItem(VIEW_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  // ── Persist view ──
  function persistView(viewKey) {
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, viewKey);
    } catch {
      // storage may be unavailable
    }
  }

  // ── Create the Leaflet map ──
  function createMap() {
    const map = L.map("map", {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: true,
    });

    return map;
  }

  // ── Switch base map layer ──
  function setMapView(viewKey, map) {
    const nextView = MAP_VIEWS[viewKey] ? viewKey : "terrain";

    if (activeBaseLayer) {
      map.removeLayer(activeBaseLayer);
    }

    activeBaseLayer = TileCache.createTileLayer(nextView);
    activeBaseLayer.addTo(map);
    activeViewKey = nextView;
    persistView(nextView);

    // Toggle active class on view buttons
    document.querySelectorAll(".view-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.view === nextView);
    });
  }

  // ── Mobile detection ──
  function isMobileScreen() {
    return window.innerWidth <= 768;
  }

  function getMobileAvailableViews() {
    return ["terrain", "dark"];
  }

  // ── Build view-switcher buttons ──
  function buildViewSwitcher(map) {
    const container = document.getElementById("view-switcher");
    if (!container) return;

    const viewsToDisplay = isMobileScreen()
      ? getMobileAvailableViews()
      : Object.keys(MAP_VIEWS);

    viewsToDisplay.forEach(function (key) {
      const cfg = MAP_VIEWS[key];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "view-btn";
      button.dataset.view = key;
      button.textContent = cfg.label;
      button.title = cfg.description;
      button.addEventListener("click", function () {
        setMapView(key, map);
      });
      container.appendChild(button);
    });
  }

  // ── Reset map to default view ──
  function resetView(map) {
    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: true, duration: 0.8 });
  }

  // ── Initialise everything ──
  function init() {
    const savedView = readStoredView() || "terrain";
    activeViewKey = MAP_VIEWS[savedView] ? savedView : "terrain";

    const map = createMap();
    buildViewSwitcher(map);
    setMapView(activeViewKey, map);

    // Expose for other modules
    ns.map = map;
    ns.MapView = {
      setView: function (key) {
        setMapView(key, map);
      },
      getView: function () {
        return activeViewKey;
      },
      resetView: function () {
        resetView(map);
      },
    };

    return map;
  }

  ns.MapInit = { init };
})(window.NeraMap);
