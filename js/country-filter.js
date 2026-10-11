// ═══════════════════════════════════════════════════════════════════════════════
//  NeraMap — Country Filter: multi-country switching & contextual scope
// ═══════════════════════════════════════════════════════════════════════════════

window.NeraMap = window.NeraMap || {};

(function (ns) {
  "use strict";

  function tCountry(code, field, fallback) {
    if (ns.I18n && typeof ns.I18n.t === "function") {
      const val = ns.I18n.t(`countries.${code}.${field}`);
      if (val && val !== `countries.${code}.${field}`) return val;
    }
    return fallback;
  }

  const COUNTRY_CONFIG = {
    ALL: {
      code: "ALL",
      get name() { return tCountry("ALL", "name", "Africa"); },
      flag: "🌍",
      get title() { return tCountry("ALL", "title", "NeraMap Africa"); },
      get subtitle() { return tCountry("ALL", "subtitle", "Linguistic Atlas · Central & West Africa"); },
      get sunburstTitle() { return tCountry("ALL", "sunburstTitle", "Languages of Africa"); },
      get sunburstDesc() {
        return tCountry("ALL", "sunburstDesc", "Explore the taxonomic lineage of Central & West African languages, from major trunks to regional branches.");
      },
      center: [7.5, 12.0],
      zoom: 5,
      bounds: [
        [-5.0, 1.0],
        [24.0, 25.0],
      ],
    },
    CM: {
      code: "CM",
      get name() { return tCountry("CM", "name", "Cameroon"); },
      flag: "🇨🇲",
      get title() { return tCountry("CM", "title", "NeraMap Cameroon"); },
      get subtitle() { return tCountry("CM", "subtitle", "Linguistic Atlas · Cameroon (253 cataloged languages)"); },
      get sunburstTitle() { return tCountry("CM", "sunburstTitle", "Languages of Cameroon"); },
      get sunburstDesc() {
        return tCountry("CM", "sunburstDesc", "Explore the taxonomic lineage of Cameroon's 253 languages, from linguistic phyla down to local dialects.");
      },
      center: [5.6, 12.5],
      zoom: 6.5,
      bounds: [
        [1.6, 8.4],
        [13.1, 16.2],
      ],
    },
    NG: {
      code: "NG",
      get name() { return tCountry("NG", "name", "Nigeria"); },
      flag: "🇳🇬",
      get title() { return tCountry("NG", "title", "NeraMap Nigeria"); },
      get subtitle() { return tCountry("NG", "subtitle", "Linguistic Atlas · Nigeria (561 cataloged languages)"); },
      get sunburstTitle() { return tCountry("NG", "sunburstTitle", "Languages of Nigeria"); },
      get sunburstDesc() {
        return tCountry("NG", "sunburstDesc", "Explore the taxonomic lineage of Nigeria's 561 languages, at the crossroads of immense ethnolinguistic diversity.");
      },
      center: [9.08, 8.67],
      zoom: 6.5,
      bounds: [
        [4.2, 2.6],
        [13.9, 14.7],
      ],
    },
    TD: {
      code: "TD",
      get name() { return tCountry("TD", "name", "Chad"); },
      flag: "🇹🇩",
      get title() { return tCountry("TD", "title", "NeraMap Chad"); },
      get subtitle() { return tCountry("TD", "subtitle", "Linguistic Atlas · Chad (141 cataloged languages)"); },
      get sunburstTitle() { return tCountry("TD", "sunburstTitle", "Languages of Chad"); },
      get sunburstDesc() {
        return tCountry("TD", "sunburstDesc", "Explore the taxonomic lineage of Chad's 141 languages, a vibrant contact zone between Nilo-Saharan and Afro-Asiatic families.");
      },
      center: [15.45, 18.73],
      zoom: 6,
      bounds: [
        [7.4, 13.4],
        [23.5, 24.0],
      ],
    },
    GA: {
      code: "GA",
      get name() { return tCountry("GA", "name", "Gabon"); },
      flag: "🇬🇦",
      get title() { return tCountry("GA", "title", "NeraMap Gabon"); },
      get subtitle() { return tCountry("GA", "subtitle", "Linguistic Atlas · Gabon (48 cataloged languages)"); },
      get sunburstTitle() { return tCountry("GA", "sunburstTitle", "Languages of Gabon"); },
      get sunburstDesc() {
        return tCountry("GA", "sunburstDesc", "Explore the taxonomic lineage of Gabon's 48 languages, across the equatorial Bantu basin of Central Africa.");
      },
      center: [-0.8, 11.6],
      zoom: 7,
      bounds: [
        [-4.0, 8.6],
        [2.4, 14.6],
      ],
    },
  };

  let activeCountry = "ALL";

  function getActiveCountry() {
    return activeCountry;
  }

  function getConfig(code) {
    return COUNTRY_CONFIG[code] || COUNTRY_CONFIG.ALL;
  }

  function updateContextUI(cfg) {
    // 1. Update logo & subtitle
    const logoEl = document.getElementById("header-logo");
    const subEl = document.getElementById("header-subtitle");
    if (logoEl) logoEl.textContent = cfg.title;
    if (subEl) subEl.textContent = cfg.subtitle;

    // 2. Update page title
    document.title = `${cfg.title} — Nerala`;

    // 3. Update dropdown value & option labels
    const selectEl = document.getElementById("country-select");
    if (selectEl) {
      selectEl.value = activeCountry;
      Array.from(selectEl.options).forEach((opt) => {
        const cCode = opt.value;
        const cCfg = COUNTRY_CONFIG[cCode];
        if (cCfg) {
          const counts = {
            ALL: "",
            CM: " (253)",
            NG: " (561)",
            TD: " (141)",
            GA: " (48)",
          };
          opt.textContent = `${cCfg.name}${counts[cCode] || ""}`;
        }
      });
    }

    // 4. Update legacy pills if any exist
    document.querySelectorAll(".country-pill").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.country === activeCountry);
    });
  }

  function setCountry(code, map) {
    if (!COUNTRY_CONFIG[code]) code = "ALL";
    activeCountry = code;
    const cfg = COUNTRY_CONFIG[code];

    updateContextUI(cfg);

    // 1. Close panel if open
    if (ns.Panel) {
      ns.Panel.close();
    }

    // 2. Re-fit map view
    const theMap = map || ns.map;
    if (theMap) {
      if (code === "ALL") {
        theMap.flyTo(cfg.center, cfg.zoom, { duration: 1.0 });
      } else if (cfg.bounds) {
        theMap.flyToBounds(cfg.bounds, {
          padding: [50, 50],
          maxZoom: 9,
          duration: 1.0,
        });
      }
    }

    // 3. Refresh markers
    if (ns.Markers && ns.SearchFilters) {
      const results = ns.SearchFilters.currentData();
      ns.Markers.buildMarkers(results, theMap);
    }

    // 4. Refresh Voronoi layer if present
    if (ns.VizVoronoi && ns.VizVoronoi.filterByCountry) {
      ns.VizVoronoi.filterByCountry(activeCountry);
    }

    // 5. Refresh Sunburst / Treemap if Studio is open
    if (ns.VizSunburst && ns.VizStudio && ns.VizStudio.getMode() === "sunburst") {
      ns.VizSunburst.render();
    }
  }

  function init(map) {
    const selectEl = document.getElementById("country-select");
    if (selectEl) {
      selectEl.addEventListener("change", (e) => {
        setCountry(e.target.value, map);
      });
    }

    const buttons = document.querySelectorAll(".country-pill");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const countryCode = btn.dataset.country;
        setCountry(countryCode, map);
      });
    });

    updateContextUI(COUNTRY_CONFIG[activeCountry]);

    if (ns.I18n && typeof ns.I18n.subscribe === "function") {
      ns.I18n.subscribe(function () {
        updateContextUI(COUNTRY_CONFIG[activeCountry]);
      });
    }
  }

  ns.CountryFilter = {
    init: init,
    getActiveCountry: getActiveCountry,
    getConfig: getConfig,
    setCountry: setCountry,
    updateContextUI: function() {
      updateContextUI(COUNTRY_CONFIG[activeCountry]);
    },
    COUNTRY_CONFIG: COUNTRY_CONFIG,
  };
})(window.NeraMap);
