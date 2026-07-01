// ═══════════════════════════════════════════════════════════════════════════════
//  NeraMap — Markers: icon factory, cluster group, build/rebuild markers
// ═══════════════════════════════════════════════════════════════════════════════

window.NeraMap = window.NeraMap || {};

(function (ns) {
  "use strict";

  const FAMILY_CONFIG = ns.FAMILY_CONFIG;
  const VITALITY_CONFIG = ns.VITALITY_CONFIG;

  // ── State ──
  let clusterGroup = null;
  let allMarkers = [];
  let activeFilters = new Set(Object.keys(FAMILY_CONFIG));

  // ── Get colour for a language family ──
  function getFamilyColor(fam) {
    return (FAMILY_CONFIG[fam] || FAMILY_CONFIG["Unclassified"]).color;
  }

  // ── Create a single marker DivIcon ──
  function createMarkerIcon(lang) {
    const color = getFamilyColor(lang.family);
    const size = Math.max(
      10,
      Math.min(22, Math.log10(Math.max(lang.speakers, 1)) * 4.5),
    );
    return L.divIcon({
      className: "",
      html:
        '<div style="' +
        "width:" +
        size +
        "px;height:" +
        size +
        "px;border-radius:50%;" +
        "background:" +
        color +
        ";border:2px solid rgba(255,255,255,0.6);" +
        "box-shadow:0 0 8px " +
        color +
        "88;" +
        "cursor:pointer;transition:transform 0.15s;" +
        "display:flex;align-items:center;justify-content:center;" +
        '" title="' +
        lang.name +
        '"></div>',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }

  // ── Create / get the cluster group ──
  function getClusterGroup() {
    if (!clusterGroup) {
      clusterGroup = L.markerClusterGroup({
        maxClusterRadius: 60,
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        disableClusteringAtZoom: 10,
        iconCreateFunction: function (cluster) {
          const count = cluster.getChildCount();
          const size = count > 50 ? 48 : count > 20 ? 42 : count > 10 ? 36 : 30;
          return L.divIcon({
            html:
              '<div style="' +
              "width:" +
              size +
              "px;height:" +
              size +
              "px;border-radius:50%;" +
              "background:rgba(240,165,0,0.92);" +
              "border:3px solid rgba(255,255,255,0.35);" +
              "display:flex;align-items:center;justify-content:center;" +
              "font-family:'DM Sans',sans-serif;font-weight:700;" +
              "font-size:" +
              (size > 40 ? "0.85" : "0.75") +
              "rem;color:#0e1117;" +
              "box-shadow:0 2px 12px rgba(240,165,0,0.5);" +
              "cursor:pointer;" +
              '">' +
              count +
              "</div>",
            className: "",
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });
        },
      });
    }
    return clusterGroup;
  }

  // ── Build (or rebuild) all markers from a data array ──
  function buildMarkers(data, map) {
    const cg = getClusterGroup();
    cg.clearLayers();
    allMarkers = [];

    data.forEach(function (lang) {
      if (!activeFilters.has(lang.family)) return;

      const marker = L.marker([lang.lat, lang.lng], {
        icon: createMarkerIcon(lang),
      });

      // Tooltip
      marker.bindTooltip(
        "<div style=\"font-family:'DM Sans',sans-serif;min-width:160px\">" +
          '<div style="font-weight:700;font-size:0.9rem;margin-bottom:3px">' +
          lang.name +
          "</div>" +
          '<div style="font-size:0.72rem;color:#aaa">' +
          lang.family +
          " · " +
          lang.subfamily +
          "</div>" +
          '<div style="font-size:0.72rem;margin-top:4px">' +
          (VITALITY_CONFIG[lang.vitality]
            ? VITALITY_CONFIG[lang.vitality].icon +
              " " +
              VITALITY_CONFIG[lang.vitality].label
            : "") +
          "</div>" +
          "</div>",
        {
          direction: "top",
          offset: [0, -6],
          opacity: 0.97,
          className: "custom-tooltip",
        },
      );

      marker.on("click", function () {
        if (map) {
          map.setView([lang.lat, lang.lng], Math.max(map.getZoom(), 8), {
            animate: true,
          });
        }
        if (ns.Panel && ns.Panel.open) {
          ns.Panel.open(lang);
        }
      });

      allMarkers.push({ marker: marker, lang: lang });
      cg.addLayer(marker);
    });

    // Update counter
    const countEl = document.getElementById("shown-count");
    if (countEl) {
      countEl.textContent = data.filter(function (l) {
        return activeFilters.has(l.family);
      }).length;
    }
  }

  // ── Get currently active markers ──
  function getVisibleMarkers() {
    return allMarkers;
  }

  // ── Get lat/lng bounds of currently visible markers ──
  function getVisibleBounds() {
    const bounds = [];
    allMarkers.forEach(function (item) {
      bounds.push([item.lang.lat, item.lang.lng]);
    });
    return bounds.length > 0 ? bounds : null;
  }

  // ── Toggle a family filter and rebuild ──
  function toggleFilter(familyKey, data, map) {
    if (activeFilters.has(familyKey)) {
      if (activeFilters.size === 1) return; // keep at least one
      activeFilters.delete(familyKey);
    } else {
      activeFilters.add(familyKey);
    }
    buildMarkers(data, map);
  }

  // ── Check if a filter is active ──
  function isFilterActive(familyKey) {
    return activeFilters.has(familyKey);
  }

  // ── Get all active filters ──
  function getActiveFilters() {
    return activeFilters;
  }

  // ── Public API ──
  ns.Markers = {
    getClusterGroup: getClusterGroup,
    buildMarkers: buildMarkers,
    getVisibleMarkers: getVisibleMarkers,
    getVisibleBounds: getVisibleBounds,
    toggleFilter: toggleFilter,
    isFilterActive: isFilterActive,
    getActiveFilters: getActiveFilters,
  };
})(window.NeraMap);
