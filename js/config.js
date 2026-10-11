// ═══════════════════════════════════════════════════════════════════════════════
//  NeraMap — Config: family colours, vitality tiers, map-view definitions
// ═══════════════════════════════════════════════════════════════════════════════

window.NeraMap = window.NeraMap || {};

(function (ns) {
  // ── Helper to resolve localized string or default ──
  function t(key, fallback) {
    if (ns.I18n && typeof ns.I18n.t === "function") {
      const val = ns.I18n.t(key);
      if (val && val !== key) return val;
    }
    return fallback;
  }

  // ── Language-family colour scheme ─────────────────
  ns.FAMILY_CONFIG = {
    "Niger-Congo": { color: "#e05a2b", get label() { return t("families.Niger-Congo", "Niger-Congo"); } },
    "Afro-Asiatic": { color: "#3b9ede", get label() { return t("families.Afro-Asiatic", "Afro-Asiatic"); } },
    "Nilo-Saharan": { color: "#7dc87d", get label() { return t("families.Nilo-Saharan", "Nilo-Saharan"); } },
    Ubangian: { color: "#b07fd4", get label() { return t("families.Ubangian", "Ubangian"); } },
    Unclassified: { color: "#a0a0a0", get label() { return t("families.Unclassified", "Other / Isolate"); } },
  };

  // ── Vitality tiers ────────────────────────────────
  ns.VITALITY_CONFIG = {
    stable: { icon: "", get label() { return t("vitality.stable", "Stable"); }, color: "#4caf50", pct: 90 },
    vulnerable: {
      icon: "",
      get label() { return t("vitality.vulnerable", "Vulnerable"); },
      color: "#ffc107",
      pct: 55,
    },
    endangered: {
      icon: "",
      get label() { return t("vitality.endangered", "Endangered"); },
      color: "#f44336",
      pct: 25,
    },
    critical: {
      icon: "",
      get label() { return t("vitality.critical", "Critical"); },
      color: "#9c27b0",
      pct: 5,
    },
    extinct: {
      icon: "",
      get label() { return t("vitality.extinct", "Extinct"); },
      color: "#6b7280",
      pct: 0,
    },
    unknown: {
      icon: "",
      get label() { return t("vitality.unknown", "Unassessed"); },
      color: "#9ca3af",
      pct: 50,
    },
  };

  // ── CARTO Basemaps API key (removes 'API key required' watermark) ──
  ns.CARTO_API_KEY = "cb1_4g5e_1_c0fef7a8a3778dfeb913366a";

  // ── Available map views ───────────────────────────
  ns.MAP_VIEWS = {
    terrain: {
      get label() { return t("mapViews.terrain.label", "Terrain"); },
      get description() { return t("mapViews.terrain.description", "Elevation and roads"); },
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
      subdomains: "abc",
      maxZoom: 17,
    },
    light: {
      get label() { return t("mapViews.light.label", "Light"); },
      get description() { return t("mapViews.light.description", "Classic map view"); },
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: "abc",
      maxZoom: 19,
    },
    dark: {
      get label() { return t("mapViews.dark.label", "Dark"); },
      get description() { return t("mapViews.dark.description", "High-contrast dark canvas"); },
      url: `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${ns.CARTO_API_KEY}`,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    },
    satellite: {
      get label() { return t("mapViews.satellite.label", "Satellite"); },
      get description() { return t("mapViews.satellite.description", "Satellite imagery & context"); },
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles &copy; Esri",
      subdomains: "abc",
      maxZoom: 19,
    },
  };

  // ── Default map centre & zoom (Central & West Africa) ──
  ns.DEFAULT_CENTER = [7.5, 12.0];
  ns.DEFAULT_ZOOM = 5;
})(window.NeraMap);
