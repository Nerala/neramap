// ═══════════════════════════════════════════════════════════════════════════════
//  NeraMap — Tile cache: service-worker registration & custom cached tile layer
// ═══════════════════════════════════════════════════════════════════════════════

window.NeraMap = window.NeraMap || {};

(function (ns) {
  "use strict";

  // ── Register the service worker ────────────────────────────────────
  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      console.log("NeraMap: Service Workers not supported — tiles not cached.");
      return;
    }

    navigator.serviceWorker
      .register("sw.js")
      .then((reg) => {
        console.log("NeraMap: SW registered (scope:", reg.scope + ")");
      })
      .catch((err) => {
        console.warn("NeraMap: SW registration failed:", err);
      });
  }

  // ── Build a tile layer with cache-aware URL ───────────────────────
  // We use a regular L.tileLayer but the Service Worker (sw.js) handles
  // caching at the network level — no custom layer class needed.
  function createTileLayer(viewKey) {
    const cfg = ns.MAP_VIEWS[viewKey];
    if (!cfg) return null;

    return L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      subdomains: cfg.subdomains,
      maxZoom: cfg.maxZoom,
    });
  }

  // ── Public API ────────────────────────────────────────────────────
  ns.TileCache = {
    registerServiceWorker,
    createTileLayer,
  };
})(window.NeraMap);
