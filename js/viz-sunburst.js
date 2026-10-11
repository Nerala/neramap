// ═══════════════════════════════════════════════════════════════════════════════
//  NeraMap — Linguistic Studio & Regional Choropleths
//  Interactive regional choropleth, proportional bubble density, sunburst & treemap
//  Inspired by Data Viz Catalogue & Information is Beautiful
// ═══════════════════════════════════════════════════════════════════════════════

window.NeraMap = window.NeraMap || {};

(function (ns) {
  "use strict";

  let containerEl = null;
  let currentLayout = "choropleth"; // 'choropleth' | 'bubbles' | 'sunburst' | 'treemap'
  let rawHierarchy = null;
  let selectedRegionFeature = null;

  function t(key, params, fallback) {
    if (ns.I18n && typeof ns.I18n.t === "function") {
      const val = ns.I18n.t(key, params);
      if (val && val !== key) return val;
    }
    return fallback || key;
  }

  function getFamilyColor(name, depth) {
    const baseColors = {
      "Niger-Congo": "#e05a2b",
      "Afro-Asiatic": "#3b9ede",
      "Nilo-Saharan": "#7dc87d",
      Ubangian: "#b07fd4",
      "Indo-European": "#eab308",
      Creole: "#06b6d4",
      Unclassified: "#a0a0a0",
    };

    let fam = "Unclassified";
    for (const k of Object.keys(baseColors)) {
      if (name && name.includes(k)) {
        fam = k;
        break;
      }
    }

    const base = baseColors[fam] || "#a0a0a0";
    if (depth <= 1) return base;
    return d3.color(base).brighter((depth - 1) * 0.35);
  }

  // ── Build Taxonomic Hierarchy for Sunburst & Treemap ────────────────────────
  function buildHierarchy(languages, rootTitle) {
    const root = {
      name: rootTitle,
      children: {},
    };

    languages.forEach((lang) => {
      const fam = lang.family || "Unclassified";
      if (!root.children[fam]) {
        root.children[fam] = {
          name: fam,
          children: {},
        };
      }

      const sub = (lang.subfamily || "").trim();
      let branch = t("sunburst.generalBranch", null, "General");
      if (sub) {
        const parts = sub.split(">").map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          branch = parts[0] + " > " + parts[1];
        } else if (parts.length === 1) {
          branch = parts[0];
        }
      }

      if (!root.children[fam].children[branch]) {
        root.children[fam].children[branch] = {
          name: branch,
          children: [],
        };
      }

      root.children[fam].children[branch].children.push({
        name: lang.name,
        id: lang.id,
        region: lang.region,
        country: lang.country,
        lat: lang.lat,
        lng: lang.lng,
        vitality: lang.vitality || "vulnerable",
        dialect_count:
          (lang.dialects && lang.dialects.length) || lang.dialect_count || 0,
        alias_count:
          (lang.aliases && lang.aliases.length) || lang.alias_count || 0,
        value: Math.max(
          1,
          ((lang.dialects && lang.dialects.length) || lang.dialect_count || 0) + 1,
        ),
      });
    });

    function toD3Tree(node) {
      if (node.children) {
        if (Array.isArray(node.children)) {
          return {
            name: node.name,
            children: node.children.map(toD3Tree),
          };
        }
        return {
          name: node.name,
          children: Object.values(node.children).map(toD3Tree),
        };
      }
      return node;
    }

    return toD3Tree(root);
  }

  // ── Regional Data Preparation (GeoJSON + Language Aggregation) ─────────────
  function getGeoDataForCountry(countryCode) {
    const allGeo = window.NERALA_GEO_REGIONS;
    if (!allGeo) return null;
    return allGeo[countryCode] || allGeo.ALL || null;
  }

  function computeRegionalStats(countryCode) {
    const geo = getGeoDataForCountry(countryCode);
    if (!geo || !geo.features) return null;

    const allLangs = ns.Data.getAll();
    const activeLangs =
      countryCode === "ALL"
        ? allLangs
        : allLangs.filter((l) => l.country === countryCode);

    // Deep copy features to avoid mutation
    const features = geo.features.map((f) => {
      const featName = (f.properties.shapeName || "").trim();
      const featIso = f.properties.shapeISO || "";
      const country = f.properties.country || countryCode;

      // Match languages belonging to this region
      const regionLangs = activeLangs.filter((l) => {
        const r = (l.region || "").trim().toLowerCase();
        return (
          r === featName.toLowerCase() ||
          r.includes(featName.toLowerCase()) ||
          featName.toLowerCase().includes(r)
        );
      });

      // Tally families
      const familyCounts = {};
      let totalSpeakers = 0;
      const vitalityCounts = {
        stable: 0,
        vulnerable: 0,
        endangered: 0,
        critical: 0,
        other: 0,
      };

      regionLangs.forEach((l) => {
        const fam = l.family || "Unclassified";
        familyCounts[fam] = (familyCounts[fam] || 0) + 1;
        totalSpeakers += Number(l.speakers) || 0;
        const vit = (l.vitality || "").toLowerCase();
        if (vitalityCounts[vit] !== undefined) {
          vitalityCounts[vit]++;
        } else {
          vitalityCounts.other++;
        }
      });

      // Find dominant family
      let dominantFamily = "Niger-Congo";
      let maxFamCount = -1;
      for (const [fam, count] of Object.entries(familyCounts)) {
        if (count > maxFamCount) {
          maxFamCount = count;
          dominantFamily = fam;
        }
      }

      return {
        ...f,
        properties: {
          ...f.properties,
          shapeName: featName,
          country: country,
        },
        stats: {
          count: regionLangs.length,
          langs: regionLangs,
          familyCounts: familyCounts,
          dominantFamily: dominantFamily,
          dominantFamilyCount: maxFamCount,
          vitalityCounts: vitalityCounts,
          speakers: totalSpeakers,
        },
      };
    });

    // Rank features by count
    features.sort((a, b) => b.stats.count - a.stats.count);
    features.forEach((f, idx) => {
      f.stats.rank = idx + 1;
    });

    return {
      type: "FeatureCollection",
      features: features,
      maxCount: d3.max(features, (f) => f.stats.count) || 1,
      minCount: d3.min(features, (f) => f.stats.count) || 0,
      totalLanguages: activeLangs.length,
    };
  }

  // ── Palette Configuration (matching user reference images) ────────────────
  // User Image 2 Palette: Light Coral -> Vivid Red -> Crimson -> Burgundy -> Deep Slate Navy
  const CHOROPLETH_PALETTE = [
    "#fca5a5", // Tier 1: Light coral/salmon
    "#ef4444", // Tier 2: Bright vibrant red
    "#dc2626", // Tier 3: Medium deep red
    "#991b1b", // Tier 4: Rich burgundy
    "#1e293b", // Tier 5: Dark slate navy (highest contrast tier)
  ];

  function getChoroplethBuckets(maxCount) {
    if (maxCount <= 10) {
      return [0, 2, 4, 7, 10];
    } else if (maxCount <= 25) {
      return [0, 5, 10, 18, 25];
    } else if (maxCount <= 45) {
      return [0, 8, 18, 30, 45];
    } else {
      return [0, 10, 25, 45, maxCount];
    }
  }

  function getChoroplethColor(count, buckets) {
    if (count <= 0) return "#1e293b"; // minimal or unrepresented
    if (count <= buckets[1]) return CHOROPLETH_PALETTE[0];
    if (count <= buckets[2]) return CHOROPLETH_PALETTE[1];
    if (count <= buckets[3]) return CHOROPLETH_PALETTE[2];
    if (count <= buckets[4]) return CHOROPLETH_PALETTE[3];
    return CHOROPLETH_PALETTE[4];
  }

  // ── Main Controller ────────────────────────────────────────────────────────
  function init(container) {
    containerEl = container;
    render();

    if (ns.I18n && typeof ns.I18n.subscribe === "function") {
      ns.I18n.subscribe(function () {
        if (ns.VizStudio && ns.VizStudio.getMode() === "sunburst" && containerEl) {
          render();
        }
      });
    }
  }

  function render() {
    if (!containerEl) return;
    containerEl.innerHTML = "";

    const activeCountry = ns.CountryFilter
      ? ns.CountryFilter.getActiveCountry()
      : "ALL";
    const cfg = ns.CountryFilter
      ? ns.CountryFilter.getConfig(activeCountry)
      : {
          sunburstTitle: t("countries.ALL.sunburstTitle", null, "Languages of Africa"),
          sunburstDesc: t("countries.ALL.sunburstDesc", null, "Explore the taxonomic lineage of Central & West African languages."),
        };

    const allLangs = ns.Data.getAll();
    const activeLangs =
      activeCountry === "ALL"
        ? allLangs
        : allLangs.filter((l) => l.country === activeCountry);

    rawHierarchy = buildHierarchy(activeLangs, cfg.sunburstTitle);

    // Compute regional datasets for choropleth and bubbles
    const regionalData = computeRegionalStats(activeCountry);

    // Select default region if available
    if (regionalData && regionalData.features.length > 0) {
      selectedRegionFeature = regionalData.features[0];
    } else {
      selectedRegionFeature = null;
    }

    // Header descriptions
    let viewDesc = cfg.sunburstDesc;
    if (currentLayout === "choropleth") {
      viewDesc = t(
        "studio.legendDensity",
        null,
        "Regional linguistic density across administrative subdivisions.",
      );
    } else if (currentLayout === "bubbles") {
      viewDesc = t(
        "studio.btnBubbles",
        null,
        "Proportional distribution of languages across subdivisions.",
      );
    }

    // Create wrapper layout
    const wrapper = document.createElement("div");
    wrapper.className = "viz-subview-wrapper";
    wrapper.innerHTML = `
      <div class="viz-header-bar">
        <div class="viz-title-box">
          <h2>${cfg.sunburstTitle}</h2>
          <p>${viewDesc}</p>
        </div>
        <div class="viz-controls-box">
          <div class="viz-btn-group">
            <button class="viz-pill-btn ${currentLayout === "choropleth" ? "active" : ""}" id="btn-layout-choropleth">
              ${t("studio.btnChoropleth", null, "Regional Density")}
            </button>
            <button class="viz-pill-btn ${currentLayout === "bubbles" ? "active" : ""}" id="btn-layout-bubbles">
              ${t("studio.btnBubbles", null, "Bubble Distribution")}
            </button>
            <button class="viz-pill-btn ${currentLayout === "sunburst" ? "active" : ""}" id="btn-layout-sunburst">
              ${t("studio.btnSunburst", null, "Taxonomic Sunburst")}
            </button>
            <button class="viz-pill-btn ${currentLayout === "treemap" ? "active" : ""}" id="btn-layout-treemap">
              ${t("studio.btnTreemap", null, "Treemap Mosaic")}
            </button>
          </div>
          <div class="viz-metric-badge" id="viz-studio-breadcrumb">
            ${cfg.name} · ${activeLangs.length} ${t("nav.languagesCount", null, "languages")}
          </div>
        </div>
      </div>
      <div class="viz-content-split">
        <div class="viz-chart-area" id="studio-chart-target"></div>
        <div class="viz-info-sidebar" id="studio-sidebar-target">
          <div class="viz-detail-card" id="studio-card">
            <div class="viz-card-empty">${t("studio.hoverRegionInstruction", null, "Hover or click on any subdivision to inspect its linguistic diversity.")}</div>
          </div>
        </div>
      </div>
    `;

    containerEl.appendChild(wrapper);

    // Event listeners for layout toggle pills
    const bindBtn = (id, layout) => {
      const btn = wrapper.querySelector(id);
      if (btn) {
        btn.addEventListener("click", () => {
          if (currentLayout !== layout) {
            currentLayout = layout;
            render();
          }
        });
      }
    };

    bindBtn("#btn-layout-choropleth", "choropleth");
    bindBtn("#btn-layout-bubbles", "bubbles");
    bindBtn("#btn-layout-sunburst", "sunburst");
    bindBtn("#btn-layout-treemap", "treemap");

    // Render corresponding view
    if (currentLayout === "choropleth") {
      renderChoropleth(regionalData, activeCountry);
    } else if (currentLayout === "bubbles") {
      renderBubbles(regionalData, activeCountry);
    } else if (currentLayout === "sunburst") {
      renderSunburst();
    } else {
      renderTreemap();
    }
  }

  // ── Render Regional Choropleth Map (matching user Image 2) ──────────────────
  function renderChoropleth(regionalData, activeCountry) {
    const target = document.getElementById("studio-chart-target");
    if (!target || !regionalData) return;

    const width = target.clientWidth || 720;
    const height = Math.max(540, target.clientHeight || 620);
    const buckets = getChoroplethBuckets(regionalData.maxCount);

    const svg = d3
      .select(target)
      .append("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("class", "viz-geo-svg");

    // Setup Mercator projection fitted to the country's GeoJSON bounds
    const projection = d3
      .geoMercator()
      .fitExtent([[32, 32], [width - 32, height - 32]], regionalData);

    const pathGen = d3.geoPath().projection(projection);

    const g = svg.append("g").attr("class", "choropleth-layer");

    // Render regional paths
    const paths = g
      .selectAll("path")
      .data(regionalData.features)
      .join("path")
      .attr("d", pathGen)
      .attr("class", "choropleth-region")
      .attr("fill", (d) => getChoroplethColor(d.stats.count, buckets))
      .attr("stroke", "rgba(255, 255, 255, 0.5)")
      .attr("stroke-width", 1.2)
      .attr("stroke-linejoin", "round")
      .style("cursor", "pointer")
      .style("transition", "fill 0.2s, stroke 0.2s, stroke-width 0.2s");

    paths
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .raise()
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 2.6)
          .style("filter", "drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))");
        updateRegionSidebar(d, activeCountry);
      })
      .on("mouseleave", function (event, d) {
        const isSelected = selectedRegionFeature && selectedRegionFeature.properties.shapeName === d.properties.shapeName;
        d3.select(this)
          .attr("stroke", isSelected ? "#f0a500" : "rgba(255, 255, 255, 0.5)")
          .attr("stroke-width", isSelected ? 2.8 : 1.2)
          .style("filter", isSelected ? "drop-shadow(0 0 10px rgba(240, 165, 0, 0.5))" : "none");
      })
      .on("click", function (event, d) {
        selectedRegionFeature = d;
        paths
          .attr("stroke", "rgba(255, 255, 255, 0.5)")
          .attr("stroke-width", 1.2)
          .style("filter", "none");
        d3.select(this)
          .raise()
          .attr("stroke", "#f0a500")
          .attr("stroke-width", 2.8)
          .style("filter", "drop-shadow(0 0 10px rgba(240, 165, 0, 0.5))");
        updateRegionSidebar(d, activeCountry);
      });

    // Add Classified Legend Bar in bottom-right (matching Image 2)
    renderChoroplethLegend(target, buckets);

    // Initial sidebar populate with top region
    if (selectedRegionFeature) {
      updateRegionSidebar(selectedRegionFeature, activeCountry);
    }
  }

  // ── Render Proportional Bubble Density Map (matching user Image 1) ──────────
  function renderBubbles(regionalData, activeCountry) {
    const target = document.getElementById("studio-chart-target");
    if (!target || !regionalData) return;

    const width = target.clientWidth || 720;
    const height = Math.max(540, target.clientHeight || 620);

    const svg = d3
      .select(target)
      .append("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("class", "viz-geo-svg");

    const projection = d3
      .geoMercator()
      .fitExtent([[32, 32], [width - 32, height - 32]], regionalData);

    const pathGen = d3.geoPath().projection(projection);

    // 1. Draw base regional polygons in sleek cool slate (matching Image 1)
    svg
      .append("g")
      .attr("class", "bubble-base-layer")
      .selectAll("path")
      .data(regionalData.features)
      .join("path")
      .attr("d", pathGen)
      .attr("fill", "#243042")
      .attr("stroke", "rgba(255, 255, 255, 0.4)")
      .attr("stroke-width", 1.0)
      .attr("stroke-linejoin", "round");

    // 2. Proportional circle radius scale
    const maxRadius = Math.min(width, height) / 14;
    const rScale = d3
      .scaleSqrt()
      .domain([0, regionalData.maxCount])
      .range([4, Math.max(16, maxRadius)]);

    const bubbleGroup = svg.append("g").attr("class", "bubble-circles-layer");

    const bubbleFeatures = regionalData.features.filter(
      (f) => f.stats.count > 0 && f.properties.centroid,
    );

    const bubbles = bubbleGroup
      .selectAll("g")
      .data(bubbleFeatures)
      .join("g")
      .attr("transform", (d) => {
        const pt = projection(d.properties.centroid);
        return `translate(${pt[0]}, ${pt[1]})`;
      })
      .style("cursor", "pointer");

    bubbles
      .append("circle")
      .attr("r", (d) => rScale(d.stats.count))
      .attr("fill", (d) =>
        d.stats.count >= regionalData.maxCount * 0.4 ? "#ef4444" : "#0f172a",
      )
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1.5)
      .style("transition", "transform 0.2s, stroke-width 0.2s");

    // Add count label inside circles if sufficiently large
    bubbles
      .filter((d) => rScale(d.stats.count) >= 11)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#ffffff")
      .style("font-size", (d) => (rScale(d.stats.count) >= 18 ? "0.75rem" : "0.62rem"))
      .style("font-weight", "700")
      .style("pointer-events", "none")
      .text((d) => d.stats.count);

    bubbles
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .select("circle")
          .attr("stroke", "#f0a500")
          .attr("stroke-width", 3)
          .style("transform", "scale(1.15)");
        updateRegionSidebar(d, activeCountry);
      })
      .on("mouseleave", function (event, d) {
        d3.select(this)
          .select("circle")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1.5)
          .style("transform", "scale(1)");
      })
      .on("click", function (event, d) {
        selectedRegionFeature = d;
        updateRegionSidebar(d, activeCountry);
      });

    if (selectedRegionFeature) {
      updateRegionSidebar(selectedRegionFeature, activeCountry);
    }
  }

  // ── Bottom-Right Horizontal Classified Legend Bar (matching Image 2) ────────
  function renderChoroplethLegend(container, buckets) {
    const existing = container.querySelector(".choropleth-legend-container");
    if (existing) existing.remove();

    const legendDiv = document.createElement("div");
    legendDiv.className = "choropleth-legend-container";

    const labels = [
      `1–${buckets[1]}`,
      `${buckets[1] + 1}–${buckets[2]}`,
      `${buckets[2] + 1}–${buckets[3]}`,
      `${buckets[3] + 1}–${buckets[4]}`,
      `${buckets[4]}+`,
    ];

    let itemsHtml = "";
    CHOROPLETH_PALETTE.forEach((color, i) => {
      itemsHtml += `
        <div class="legend-swatch-col">
          <div class="legend-swatch-box" style="background:${color}"></div>
          <span class="legend-swatch-text">${labels[i]}</span>
        </div>
      `;
    });

    legendDiv.innerHTML = `
      <div class="legend-label-title">${t("studio.legendDensity", null, "Language Density")}</div>
      <div class="legend-swatches-row">
        ${itemsHtml}
      </div>
    `;

    container.appendChild(legendDiv);
  }

  // ── Interactive Region Sidebar Card ─────────────────────────────────────────
  function updateRegionSidebar(feature, activeCountry) {
    const card = document.getElementById("studio-card");
    const breadcrumb = document.getElementById("viz-studio-breadcrumb");
    if (!card) return;

    const props = feature.properties;
    const stats = feature.stats;
    const regionName = props.shapeName;
    const countryName = (ns.CountryFilter && ns.CountryFilter.getConfig(props.country || activeCountry).name) || props.country;

    if (breadcrumb) {
      breadcrumb.textContent = `${regionName} · ${countryName} (${stats.count} ${t("nav.languagesCount", null, "languages")})`;
    }

    const domFamColor = getFamilyColor(stats.dominantFamily, 1);
    const totalVit = stats.count || 1;
    const pctStable = Math.round((stats.vitalityCounts.stable / totalVit) * 100);
    const pctVuln = Math.round((stats.vitalityCounts.vulnerable / totalVit) * 100);
    const pctEndang = Math.round((stats.vitalityCounts.endangered / totalVit) * 100);
    const pctCrit = Math.round((stats.vitalityCounts.critical / totalVit) * 100);

    const isEnglish = ns.I18n ? ns.I18n.getLanguage() === "en" : true;
    const rankLabel = isEnglish
      ? `Ranked #${stats.rank} in ${countryName}`
      : `Classé n°${stats.rank} en ${countryName}`;

    // Language roster preview (up to 40 languages)
    const langItems = stats.langs
      .slice(0, 40)
      .map((l) => {
        const vitColor =
          l.vitality === "stable"
            ? "#4caf50"
            : l.vitality === "vulnerable"
              ? "#ffc107"
              : l.vitality === "endangered"
                ? "#f44336"
                : "#9c27b0";
        return `
          <div class="region-lang-row" data-lang-id="${l.id}">
            <div class="region-lang-left">
              <span class="vit-dot" style="background:${vitColor}"></span>
              <span class="region-lang-name">${l.name}</span>
              <span class="region-lang-iso">${l.iso}</span>
            </div>
            <div class="region-lang-right">
              <span class="region-lang-fam" style="color:${getFamilyColor(l.family, 1)}">${l.family}</span>
              <button class="region-locate-btn" data-lang-id="${l.id}" title="${t("studio.locateOnMap", null, "Locate on Map")}">→</button>
            </div>
          </div>
        `;
      })
      .join("");

    card.innerHTML = `
      <div class="viz-card-badge" style="background:${domFamColor}33; color:${domFamColor}; border:1px solid ${domFamColor}">
        ${rankLabel}
      </div>
      <h3 class="viz-card-title">${regionName}</h3>
      <div class="viz-card-subtitle">${countryName} · ${stats.count} ${t("nav.languagesCount", null, "languages")}</div>
      
      <div class="viz-stat-grid">
        <div class="viz-stat-item">
          <span class="viz-stat-label">${t("studio.totalLanguages", null, "Cataloged Languages")}</span>
          <span class="viz-stat-value" style="color:#f0a500; font-size:1.15rem">${stats.count}</span>
        </div>
        <div class="viz-stat-item">
          <span class="viz-stat-label">${t("studio.dominantFamily", null, "Dominant Phylum")}</span>
          <span class="viz-stat-value" style="color:${domFamColor}">${stats.dominantFamily}</span>
        </div>
      </div>

      <div class="region-vitality-block">
        <div class="region-block-title">${t("studio.vitalityDistribution", null, "Linguistic Vitality")}</div>
        <div class="region-vitality-bar">
          <div class="vit-segment" style="width:${pctStable}%; background:#4caf50;" title="Stable: ${pctStable}%"></div>
          <div class="vit-segment" style="width:${pctVuln}%; background:#ffc107;" title="Vulnerable: ${pctVuln}%"></div>
          <div class="vit-segment" style="width:${pctEndang}%; background:#f44336;" title="Endangered: ${pctEndang}%"></div>
          <div class="vit-segment" style="width:${pctCrit}%; background:#9c27b0;" title="Critical: ${pctCrit}%"></div>
        </div>
        <div class="region-vitality-legend">
          <span style="color:#4caf50">${pctStable}% Stable</span>
          <span style="color:#ffc107">${pctVuln}% Vuln.</span>
          <span style="color:#f44336">${pctEndang}% Endang.</span>
          <span style="color:#9c27b0">${pctCrit}% Crit.</span>
        </div>
      </div>

      <div class="region-lang-roster-header">
        <span>${t("studio.languagesInRegion", { region: regionName, count: stats.count }, `Languages (${stats.count})`)}</span>
      </div>

      <div class="region-lang-roster-list">
        ${langItems || `<div style="padding:12px; color:#9ca3af; font-size:0.75rem">${t("studio.noRegionSelected", null, "No languages registered")}</div>`}
      </div>
    `;

    // Wire "Locate on Map" buttons
    card.querySelectorAll(".region-locate-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.langId;
        locateLanguageOnMap(id);
      });
    });

    card.querySelectorAll(".region-lang-row").forEach((row) => {
      row.addEventListener("click", () => {
        const id = row.dataset.langId;
        locateLanguageOnMap(id);
      });
    });
  }

  function locateLanguageOnMap(langId) {
    const all = ns.Data.getAll();
    const target = all.find((l) => l.id === langId || String(l.id) === String(langId));
    if (target) {
      if (ns.VizStudio) ns.VizStudio.switchMode("map");
      if (ns.Panel) ns.Panel.open(target);
      if (ns.map) ns.map.flyTo([target.lat, target.lng], 9, { duration: 1.2 });
    }
  }

  // ── Render Radial Sunburst (Taxonomic Tree) ─────────────────────────────────
  function renderSunburst() {
    const target = document.getElementById("studio-chart-target");
    if (!target) return;

    const width = target.clientWidth || 680;
    const height = Math.max(520, target.clientHeight || 600);
    const radius = Math.min(width, height) / 2 - 14;

    const hierarchy = d3
      .hierarchy(rawHierarchy)
      .sum((d) => d.value || (d.children ? 0 : 1))
      .sort((a, b) => b.value - a.value);

    const partition = d3.partition().size([2 * Math.PI, radius]);
    const root = partition(hierarchy);
    root.each((d) => (d.current = d));

    const svg = d3
      .select(target)
      .append("svg")
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("width", "100%")
      .attr("height", "100%")
      .style("font-family", "DM Sans, sans-serif");

    const arc = d3
      .arc()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius / 2)
      .innerRadius((d) => d.y0)
      .outerRadius((d) => Math.max(d.y0, d.y1 - 1));

    const path = svg
      .append("g")
      .selectAll("path")
      .data(root.descendants().slice(1))
      .join("path")
      .attr("fill", (d) => {
        const topFamily =
          d
            .ancestors()
            .map((a) => a.data.name)
            .reverse()[1] || d.data.name;
        return getFamilyColor(topFamily, d.depth);
      })
      .attr("fill-opacity", (d) => (d.children ? 0.75 : 0.9))
      .attr("stroke", "#111827")
      .attr("stroke-width", "0.75px")
      .attr("d", (d) => arc(d.current))
      .style("cursor", "pointer");

    path
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill-opacity", 1).attr("stroke", "#ffffff");
        updateTaxonomicSidebar(d);
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .attr("fill-opacity", d.children ? 0.75 : 0.9)
          .attr("stroke", "#111827");
      })
      .on("click", clicked);

    const parentCircle = svg
      .append("circle")
      .datum(root)
      .attr("r", radius / 4)
      .attr("fill", "#1c2333")
      .attr("stroke", "#374151")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("click", clicked);

    const centerText = svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#e5e7eb")
      .style("font-size", "0.78rem")
      .style("font-weight", "600")
      .style("pointer-events", "none")
      .text(root.leaves().length + " Tongues");

    function clicked(event, p) {
      parentCircle.datum(p.parent || root);
      centerText.text(p.data.name.length > 16 ? p.data.name.slice(0, 14) + "…" : p.data.name);

      root.each(
        (d) =>
          (d.target = {
            x0:
              Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) *
              2 *
              Math.PI,
            x1:
              Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) *
              2 *
              Math.PI,
            y0: Math.max(0, d.y0 - p.depth * (radius / 4)),
            y1: Math.max(0, d.y1 - p.depth * (radius / 4)),
          }),
      );

      const tAnim = svg.transition().duration(750);

      path
        .transition(tAnim)
        .tween("data", (d) => {
          const i = d3.interpolate(d.current, d.target);
          return (time) => (d.current = i(time));
        })
        .filter(function (d) {
          return +this.getAttribute("fill-opacity") || (d.target.y1 <= radius && d.target.y0 >= 0 && d.target.x1 > d.target.x0);
        })
        .attr("fill-opacity", (d) => (d.target.y1 <= radius && d.target.y0 >= 0 && d.target.x1 > d.target.x0 ? (d.children ? 0.75 : 0.9) : 0))
        .attrTween("d", (d) => () => arc(d.current));
    }

    updateTaxonomicSidebar(root);
  }

  // ── Render Treemap Mosaic ───────────────────────────────────────────────────
  function renderTreemap() {
    const target = document.getElementById("studio-chart-target");
    if (!target) return;

    const width = target.clientWidth || 680;
    const height = Math.max(520, target.clientHeight || 600);

    const hierarchy = d3
      .hierarchy(rawHierarchy)
      .sum((d) => d.value || (d.children ? 0 : 1))
      .sort((a, b) => b.value - a.value);

    d3.treemap().size([width, height]).padding(2).round(true)(hierarchy);

    const svg = d3
      .select(target)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("font-family", "DM Sans, sans-serif");

    const leaves = hierarchy.leaves();

    const cell = svg
      .selectAll("g")
      .data(leaves)
      .join("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    cell
      .append("rect")
      .attr("width", (d) => Math.max(0, d.x1 - d.x0))
      .attr("height", (d) => Math.max(0, d.y1 - d.y0))
      .attr("fill", (d) => {
        const topFamily =
          d
            .ancestors()
            .map((a) => a.data.name)
            .reverse()[1] || d.data.name;
        return getFamilyColor(topFamily, d.depth);
      })
      .attr("fill-opacity", 0.8)
      .attr("stroke", "#111827")
      .attr("stroke-width", 0.5)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill-opacity", 1).attr("stroke", "#fff");
        updateTaxonomicSidebar(d);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("fill-opacity", 0.8).attr("stroke", "#111827");
      })
      .on("click", (event, d) => locateLanguageOnMap(d.data.id));

    cell
      .filter((d) => d.x1 - d.x0 > 36 && d.y1 - d.y0 > 18)
      .append("text")
      .attr("x", 4)
      .attr("y", 13)
      .attr("fill", "#fff")
      .style("font-size", "0.65rem")
      .style("font-weight", "500")
      .style("pointer-events", "none")
      .text((d) => {
        const maxChars = Math.floor((d.x1 - d.x0) / 7);
        return d.data.name.length > maxChars ? d.data.name.slice(0, maxChars - 1) + "…" : d.data.name;
      });

    if (leaves[0]) updateTaxonomicSidebar(leaves[0]);
  }

  function updateTaxonomicSidebar(d) {
    const card = document.getElementById("studio-card");
    const breadcrumb = document.getElementById("viz-studio-breadcrumb");
    if (!card) return;

    const data = d.data;
    const lineage = d
      .ancestors()
      .map((a) => a.data.name)
      .reverse();

    if (breadcrumb) {
      breadcrumb.textContent = lineage.join(" → ");
    }

    if (!d.children) {
      const famColor = getFamilyColor(lineage[1] || "", 1);
      const famLabel =
        ns.FAMILY_CONFIG && ns.FAMILY_CONFIG[lineage[1]]
          ? ns.FAMILY_CONFIG[lineage[1]].label
          : lineage[1] || t("sunburst.familyFallback", null, "Family");
      const vitLabel =
        ns.VITALITY_CONFIG && ns.VITALITY_CONFIG[data.vitality]
          ? ns.VITALITY_CONFIG[data.vitality].label
          : data.vitality || "vulnerable";

      card.innerHTML = `
        <div class="viz-card-badge" style="background:${famColor}33; color:${famColor}; border:1px solid ${famColor}">
          ${famLabel}
        </div>
        <h3 class="viz-card-title">${data.name}</h3>
        <div class="viz-card-subtitle">${lineage.slice(1, -1).join(" › ")}</div>
        
        <div class="viz-stat-grid">
          <div class="viz-stat-item">
            <span class="viz-stat-label">${t("sunburst.regionLabel", null, "Region")}</span>
            <span class="viz-stat-value">${data.region || data.country || ""}</span>
          </div>
          <div class="viz-stat-item">
            <span class="viz-stat-label">${t("sunburst.vitalityLabel", null, "Vitality")}</span>
            <span class="viz-stat-value">${vitLabel}</span>
          </div>
        </div>

        <button class="viz-action-btn" id="btn-inspect-lang" style="background:${famColor}">
          ${t("sunburst.inspectBtn", null, "View full profile on map")}
        </button>
      `;

      const btn = card.querySelector("#btn-inspect-lang");
      if (btn) {
        btn.addEventListener("click", () => locateLanguageOnMap(data.id));
      }
    } else {
      const count = d.leaves().length;
      const famColor = getFamilyColor(lineage[1] || data.name, d.depth);
      const isEnglish = ns.I18n ? ns.I18n.getLanguage() === "en" : true;

      card.innerHTML = `
        <div class="viz-card-badge" style="background:${famColor}33; color:${famColor}; border:1px solid ${famColor}">
          ${isEnglish ? `Level: Depth ${d.depth}` : `Niveau : Profondeur ${d.depth}`}
        </div>
        <h3 class="viz-card-title">${data.name}</h3>
        <p class="viz-card-desc">${isEnglish ? `This branch groups <strong>${count} languages</strong> cataloged.` : `Cette branche regroupe <strong>${count} langues</strong> répertoriées.`}</p>
        <div class="viz-tree-preview">
          ${d.children
            .slice(0, 12)
            .map(
              (c) =>
                `<span class="viz-tag" style="border-left: 3px solid ${famColor}">${c.data.name}</span>`,
            )
            .join("")}
          ${d.children.length > 12 ? `<span class="viz-tag-more">+${d.children.length - 12} others...</span>` : ""}
        </div>
      `;
    }
  }

  ns.VizSunburst = {
    init: init,
    render: render,
    setLayout: function (layout) {
      currentLayout = layout;
      render();
    },
    getLayout: function () {
      return currentLayout;
    },
  };
})(window.NeraMap);
