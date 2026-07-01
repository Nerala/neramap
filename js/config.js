// ═══════════════════════════════════════════════════════════════════════════════
//  NeraMap — Config: family colours, vitality tiers, map-view definitions
// ═══════════════════════════════════════════════════════════════════════════════

window.NeraMap = window.NeraMap || {};

(function (ns) {
  // ── Language-family colour scheme ─────────────────
  ns.FAMILY_CONFIG = {
    "Niger-Congo": { color: "#e05a2b", label: "Niger-Congo" },
    "Afro-Asiatic": { color: "#3b9ede", label: "Afro-Asiatique" },
    "Nilo-Saharan": { color: "#7dc87d", label: "Nilo-Saharien" },
    Ubangian: { color: "#b07fd4", label: "Oubanguien" },
    Unclassified: { color: "#a0a0a0", label: "Autre / Isolat" },
  };

  // ── Vitality tiers ────────────────────────────────
  ns.VITALITY_CONFIG = {
    stable: { icon: "🟢", label: "Stable", color: "#4caf50", pct: 90 },
    vulnerable: {
      icon: "🟡",
      label: "Vulnérable",
      color: "#ffc107",
      pct: 55,
    },
    endangered: {
      icon: "🔴",
      label: "En danger",
      color: "#f44336",
      pct: 25,
    },
    critical: {
      icon: "💀",
      label: "Critique",
      color: "#9c27b0",
      pct: 5,
    },
  };

  // ── Available map views ───────────────────────────
  ns.MAP_VIEWS = {
    terrain: {
      label: "Terrain",
      description: "Relief et routes",
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
      subdomains: "abc",
      maxZoom: 17,
    },
    light: {
      label: "Clair",
      description: "Vue cartographique classique",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: "abc",
      maxZoom: 19,
    },
    dark: {
      label: "Sombre",
      description: "Fond contrasté",
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    },
    satellite: {
      label: "Satellite",
      description: "Imagerie et contexte réel",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles &copy; Esri",
      maxZoom: 19,
    },
  };

  // ── Default map centre & zoom ─────────────────────
  ns.DEFAULT_CENTER = [5.5, 12.5];
  ns.DEFAULT_ZOOM = 6;
})(window.NeraMap);
