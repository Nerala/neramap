// ═══════════════════════════════════════════════════════════════════════════════
//  NeraMap — Viz: Voronoi Linguistic Territories Layer (Spatial Tessellation)
//  Inspired by Data to Viz (Spatial Voronoi) & Data Viz Project
// ═══════════════════════════════════════════════════════════════════════════════

window.NeraMap = window.NeraMap || {};

(function (ns) {
  "use strict";

  let voronoiLayerGroup = null;
  let isVoronoiVisible = false;
  let layerControlBtn = null;
  let allVoronoiPolygons = [];

  function initVoronoi(map) {
    if (!window.NERALA_VIZ_DATA || !window.NERALA_VIZ_DATA.voronoi_cells) {
      console.warn("Voronoi data not available.");
      return;
    }

    const cells = window.NERALA_VIZ_DATA.voronoi_cells;
    const languages = ns.Data.getAll();
    const langMap = new Map();
    languages.forEach((l) => langMap.set(l.id, l));

    voronoiLayerGroup = L.layerGroup();
    allVoronoiPolygons = [];

    cells.forEach((cell) => {
      const lang = langMap.get(cell.lang_id);
      if (!lang || !cell.polygon || cell.polygon.length < 3) return;

      // Leaflet requires [lat, lng], cell.polygon has [lng, lat]
      const latlngs = cell.polygon.map((pt) => [pt[1], pt[0]]);

      const famColor = (
        ns.FAMILY_CONFIG[lang.family] || ns.FAMILY_CONFIG["Unclassified"]
      ).color;

      const polygon = L.polygon(latlngs, {
        color: famColor,
        weight: 1.2,
        opacity: 0.7,
        fillColor: famColor,
        fillOpacity: 0.18,
        smoothFactor: 1,
      });

      // Hover and click behaviors
      polygon.on("mouseover", function () {
        polygon.setStyle({
          weight: 2.5,
          opacity: 1,
          fillOpacity: 0.45,
        });
      });

      polygon.on("mouseout", function () {
        polygon.setStyle({
          weight: 1.2,
          opacity: 0.7,
          fillOpacity: 0.18,
        });
      });

      polygon.on("click", function (e) {
        L.DomEvent.stopPropagation(e);
        if (ns.Panel) {
          ns.Panel.open(lang);
        }
        map.panTo([lang.lat, lang.lng], { animate: true, duration: 0.8 });
      });

      // Rich tooltip
      const tooltipContent = `
        <div style="font-family:'DM Sans',sans-serif; min-width: 140px;">
          <div style="font-weight:700; font-size:0.95rem; color:#fff; margin-bottom:2px;">${lang.name}</div>
          <div style="font-size:0.75rem; color:${famColor}; font-weight:600; text-transform:uppercase;">${lang.family}</div>
          <div style="font-size:0.72rem; color:#9ca3af; margin-top:3px;">${lang.region || ""}</div>
          ${lang.dialects && lang.dialects.length ? `<div style="font-size:0.7rem; color:#f0a500; margin-top:2px;">${lang.dialects.length} dialects</div>` : ""}
        </div>
      `;

      polygon.bindTooltip(tooltipContent, {
        sticky: true,
        className: "custom-tooltip",
      });

      allVoronoiPolygons.push({ polygon, lang });
    });

    // Populate initial active country layers
    const activeCountry = ns.CountryFilter
      ? ns.CountryFilter.getActiveCountry()
      : "ALL";
    filterByCountry(activeCountry);

    createToggleControl(map);
  }

  function filterByCountry(countryCode) {
    if (!voronoiLayerGroup) return;
    voronoiLayerGroup.clearLayers();
    allVoronoiPolygons.forEach(({ polygon, lang }) => {
      if (countryCode === "ALL" || lang.country === countryCode) {
        voronoiLayerGroup.addLayer(polygon);
      }
    });
  }

  function t(key, params, fallback) {
    if (ns.I18n && typeof ns.I18n.t === "function") {
      const val = ns.I18n.t(key, params);
      if (val && val !== key) return val;
    }
    return fallback || key;
  }

  function updateToggleButtonTexts() {
    if (layerControlBtn) {
      layerControlBtn.innerHTML = t("voronoi.toggleBtn", null, "Territories (Voronoi)");
      layerControlBtn.title = t("voronoi.toggleBtnTitle", null, "Display territorial tessellation of linguistic areas");
    }
  }

  function createToggleControl(map) {
    // Inject layer toggle pill on the map
    const searchWrap = document.getElementById("search-wrap");
    if (!searchWrap) return;

    if (!layerControlBtn) {
      layerControlBtn = document.createElement("button");
      layerControlBtn.type = "button";
      layerControlBtn.id = "voronoi-toggle-btn";
      layerControlBtn.className = "view-btn";

      layerControlBtn.addEventListener("click", function () {
        toggleVoronoi(map);
      });

      if (ns.I18n && typeof ns.I18n.subscribe === "function") {
        ns.I18n.subscribe(function () {
          updateToggleButtonTexts();
        });
      }
    }

    updateToggleButtonTexts();

    // Append to search wrap or view switcher
    const viewSwitcher = document.getElementById("view-switcher");
    if (viewSwitcher) {
      viewSwitcher.appendChild(layerControlBtn);
    } else {
      searchWrap.appendChild(layerControlBtn);
    }
  }

  function toggleVoronoi(map) {
    if (!voronoiLayerGroup) return;

    if (isVoronoiVisible) {
      map.removeLayer(voronoiLayerGroup);
      isVoronoiVisible = false;
      if (layerControlBtn) layerControlBtn.classList.remove("active");
    } else {
      map.addLayer(voronoiLayerGroup);
      isVoronoiVisible = true;
      if (layerControlBtn) layerControlBtn.classList.add("active");
    }
  }

  ns.VizVoronoi = {
    init: initVoronoi,
    toggle: toggleVoronoi,
    filterByCountry: filterByCountry,
    isVisible: function () {
      return isVoronoiVisible;
    },
  };
})(window.NeraMap);
