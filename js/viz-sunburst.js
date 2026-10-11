// ═══════════════════════════════════════════════════════════════════════════════
//  NeraMap — Linguistic Studio & Country Choropleths
//  - Selected Country -> Regional Choropleth Map (matching Paris reference style)
//  - Africa -> Pan-African Summary Nightingale Rose Chart (matching Rose reference)
// ═══════════════════════════════════════════════════════════════════════════════

window.NeraMap = window.NeraMap || {};

(function (ns) {
  "use strict";

  let containerEl = null;
  let currentCountryView = "choropleth"; // 'choropleth' | 'bubbles' for country level
  let selectedRegionFeature = null;
  let selectedRoseSector = null;

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
    if (!depth || depth <= 1) return base;
    return d3.color(base).brighter((depth - 1) * 0.35);
  }

  // ── Regional Data Preparation ──────────────────────────────────────────────
  function computeRegionalStats(countryCode) {
    const allGeo = window.NERALA_GEO_REGIONS;
    if (!allGeo) return null;
    const geo = allGeo[countryCode];
    if (!geo || !geo.features) return null;

    const allLangs = ns.Data.getAll();
    const activeLangs = allLangs.filter((l) => l.country === countryCode);

    const features = geo.features.map((f) => {
      const featName = (f.properties.shapeName || "").trim();
      const regionLangs = activeLangs.filter((l) => {
        const r = (l.region || "").trim().toLowerCase();
        return (
          r === featName.toLowerCase() ||
          r.includes(featName.toLowerCase()) ||
          featName.toLowerCase().includes(r)
        );
      });

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
          country: countryCode,
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

  // ── Pan-African Data Summary (for Nightingale Rose Chart) ───────────────────
  function computePanAfricanSummary() {
    const allLangs = ns.Data.getAll();
    const groups = {};

    allLangs.forEach((l) => {
      const c = l.country || "CM";
      const fam = l.family || "Unclassified";
      const key = `${c} · ${fam}`;
      if (!groups[key]) {
        groups[key] = {
          key: key,
          country: c,
          family: fam,
          count: 0,
          stable: 0,
          vuln: 0,
          endang: 0,
          crit: 0,
          speakers: 0,
          langs: [],
        };
      }
      groups[key].count++;
      groups[key].speakers += Number(l.speakers) || 0;
      groups[key].langs.push(l);
      const vit = (l.vitality || "").toLowerCase();
      if (vit === "stable") groups[key].stable++;
      else if (vit === "vulnerable") groups[key].vuln++;
      else if (vit === "endangered") groups[key].endang++;
      else groups[key].crit++;
    });

    // Take top 9 prominent sectors matching Rose chart reference
    const sectors = Object.values(groups)
      .sort((a, b) => b.count - a.count)
      .slice(0, 9);

    const letterLabels = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
    sectors.forEach((s, idx) => {
      s.letter = letterLabels[idx] || String(idx + 1);
    });

    return {
      totalLanguages: allLangs.length,
      sectors: sectors,
      maxCount: d3.max(sectors, (s) => s.count) || 1,
    };
  }

  // ── Color Palette (matching User's Paris Reference Image) ───────────────────
  const CHOROPLETH_PALETTE = [
    "#fca5a5", // Tier 1: Light coral/salmon
    "#ef4444", // Tier 2: Bright vibrant red
    "#dc2626", // Tier 3: Medium deep red
    "#991b1b", // Tier 4: Rich burgundy
    "#1e293b", // Tier 5: Dark slate navy (highest contrast tier)
  ];

  function getChoroplethBuckets(maxCount) {
    if (maxCount <= 10) return [0, 2, 4, 7, 10];
    if (maxCount <= 25) return [0, 5, 10, 18, 25];
    if (maxCount <= 45) return [0, 8, 18, 30, 45];
    return [0, 10, 25, 45, maxCount];
  }

  function getChoroplethColor(count, buckets) {
    if (count <= 0) return "#1e293b";
    if (count <= buckets[1]) return CHOROPLETH_PALETTE[0];
    if (count <= buckets[2]) return CHOROPLETH_PALETTE[1];
    if (count <= buckets[3]) return CHOROPLETH_PALETTE[2];
    if (count <= buckets[4]) return CHOROPLETH_PALETTE[3];
    return CHOROPLETH_PALETTE[4];
  }

  // ── Projection Parameters for Accurate Country Centering ──────────────────
  const COUNTRY_PROJ_CONFIG = {
    CM: { center: [12.35, 7.37], scale: 2800 },
    NG: { center: [8.68, 9.08], scale: 2600 },
    TD: { center: [18.74, 15.47], scale: 1900 },
    GA: { center: [11.62, -0.82], scale: 4800 },
  };

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
          name: "Africa",
          title: "NeraMap Africa",
        };

    const wrapper = document.createElement("div");
    wrapper.className = "viz-subview-wrapper";

    if (activeCountry === "ALL") {
      // ═══════════════════════════════════════════════════════════════════════
      //  AFRICA VIEW: Pan-African Nightingale Rose Summary Chart
      // ═══════════════════════════════════════════════════════════════════════
      wrapper.innerHTML = `
        <div class="viz-header-bar">
          <div class="viz-title-box">
            <h2>${t("studio.roseTitle", null, "Pan-African Ethnolinguistic Summary")}</h2>
            <p>${t("studio.roseSubtitle", null, "Comparative radial distribution of primary ethnolinguistic branches across Central & West Africa.")}</p>
          </div>
          <div class="viz-controls-box">
            <!-- Quick country jump pills -->
            <div class="viz-btn-group" id="country-jump-group">
              <button class="viz-pill-btn active" data-country="ALL">Africa</button>
              <button class="viz-pill-btn" data-country="NG">Nigeria (561)</button>
              <button class="viz-pill-btn" data-country="CM">Cameroon (253)</button>
              <button class="viz-pill-btn" data-country="TD">Chad (141)</button>
              <button class="viz-pill-btn" data-country="GA">Gabon (48)</button>
            </div>
            <div class="viz-metric-badge" id="viz-studio-breadcrumb">
              987 ${t("nav.languagesCount", null, "languages")} cataloged
            </div>
          </div>
        </div>
        <div class="viz-content-split">
          <div class="viz-chart-area" id="studio-chart-target"></div>
          <div class="viz-info-sidebar" id="studio-sidebar-target">
            <div class="viz-detail-card" id="studio-card">
              <div class="viz-card-empty">${t("studio.roseHoverPrompt", null, "Hover or click on any radial sector to inspect its volume and vitality.")}</div>
            </div>
          </div>
        </div>
      `;

      containerEl.appendChild(wrapper);

      // Wire quick jump buttons
      wrapper.querySelectorAll("#country-jump-group button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const cCode = btn.dataset.country;
          if (ns.CountryFilter) {
            ns.CountryFilter.setCountry(cCode);
            render();
          }
        });
      });

      renderRoseChart();
    } else {
      // ═══════════════════════════════════════════════════════════════════════
      //  COUNTRY VIEW: Regional Density Choropleth & Bubble Map
      // ═══════════════════════════════════════════════════════════════════════
      const regionalData = computeRegionalStats(activeCountry);
      if (regionalData && regionalData.features.length > 0) {
        selectedRegionFeature = regionalData.features[0];
      }

      wrapper.innerHTML = `
        <div class="viz-header-bar">
          <div class="viz-title-box">
            <h2>${cfg.name} · ${t("studio.btnChoropleth", null, "Regional Density Choropleth")}</h2>
            <p>${t("studio.legendDensity", null, "Linguistic density by administrative subdivision.")} — ${regionalData ? regionalData.totalLanguages : 0} ${t("nav.languagesCount", null, "languages")}</p>
          </div>
          <div class="viz-controls-box">
            <div class="viz-btn-group">
              <button class="viz-pill-btn ${currentCountryView === "choropleth" ? "active" : ""}" id="btn-toggle-choropleth">
                ${t("studio.btnChoropleth", null, "Choropleth Map")}
              </button>
              <button class="viz-pill-btn ${currentCountryView === "bubbles" ? "active" : ""}" id="btn-toggle-bubbles">
                ${t("studio.btnBubbles", null, "Bubble Map")}
              </button>
            </div>
            <div class="viz-metric-badge" id="viz-studio-breadcrumb">
              ${cfg.name} (${regionalData ? regionalData.totalLanguages : 0} ${t("nav.languagesCount", null, "languages")})
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

      wrapper
        .querySelector("#btn-toggle-choropleth")
        .addEventListener("click", () => {
          if (currentCountryView !== "choropleth") {
            currentCountryView = "choropleth";
            render();
          }
        });

      wrapper
        .querySelector("#btn-toggle-bubbles")
        .addEventListener("click", () => {
          if (currentCountryView !== "bubbles") {
            currentCountryView = "bubbles";
            render();
          }
        });

      if (currentCountryView === "choropleth") {
        renderCountryChoropleth(regionalData, activeCountry);
      } else {
        renderCountryBubbles(regionalData, activeCountry);
      }
    }
  }

  // ── 1. Pan-African Summary: Nightingale Rose / Coxcomb Chart (Image 4) ──────
  function renderRoseChart() {
    const target = document.getElementById("studio-chart-target");
    if (!target) return;

    const data = computePanAfricanSummary();
    const sectors = data.sectors;
    const numSectors = sectors.length;

    const width = target.clientWidth || 720;
    const height = Math.max(540, target.clientHeight || 600);
    const center = [width / 2, height / 2];

    const innerRadius = 32;
    const maxRadius = Math.min(width, height) / 2 - 50;

    // Radius scale proportional to sqrt(count) for correct visual area
    const rScale = d3
      .scaleSqrt()
      .domain([0, data.maxCount])
      .range([innerRadius + 20, maxRadius]);

    const svg = d3
      .select(target)
      .append("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("class", "viz-rose-svg");

    const g = svg
      .append("g")
      .attr("transform", `translate(${center[0]}, ${center[1]})`);

    // Draw background concentric guide rings
    const ringTicks = [0.25, 0.5, 0.75, 1.0];
    ringTicks.forEach((ratio) => {
      const r = innerRadius + (maxRadius - innerRadius) * ratio;
      g.append("circle")
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "rgba(255, 255, 255, 0.08)")
        .attr("stroke-dasharray", "3,4");
    });

    const angleStep = (2 * Math.PI) / numSectors;

    sectors.forEach((sec, i) => {
      const startAngle = i * angleStep - Math.PI / 2;
      const endAngle = (i + 1) * angleStep - Math.PI / 2;
      const midAngle = (startAngle + endAngle) / 2;
      const petalRadius = rScale(sec.count);

      // Stacked concentric bands (matching Image 4 colors: Dark Navy -> Deep Crimson -> Bright Red)
      const r1 = innerRadius;
      const r2 = innerRadius + (petalRadius - innerRadius) * 0.35;
      const r3 = innerRadius + (petalRadius - innerRadius) * 0.70;
      const r4 = petalRadius;

      const sectorGroup = g
        .append("g")
        .attr("class", "rose-sector-group")
        .style("cursor", "pointer");

      // Band 1: Core Hub (Dark Navy)
      const arcCore = d3
        .arc()
        .innerRadius(r1)
        .outerRadius(r2)
        .startAngle(startAngle)
        .endAngle(endAngle)
        .padAngle(0.02)
        .padRadius(innerRadius);

      // Band 2: Middle Tier (Deep Crimson)
      const arcMid = d3
        .arc()
        .innerRadius(r2)
        .outerRadius(r3)
        .startAngle(startAngle)
        .endAngle(endAngle)
        .padAngle(0.02)
        .padRadius(innerRadius);

      // Band 3: Outer Crown (Bright Red)
      const arcOuter = d3
        .arc()
        .innerRadius(r3)
        .outerRadius(r4)
        .startAngle(startAngle)
        .endAngle(endAngle)
        .padAngle(0.02)
        .padRadius(innerRadius);

      sectorGroup
        .append("path")
        .attr("d", arcCore)
        .attr("fill", "#1e293b")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1.2);

      sectorGroup
        .append("path")
        .attr("d", arcMid)
        .attr("fill", "#991b1b")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1.2);

      sectorGroup
        .append("path")
        .attr("d", arcOuter)
        .attr("fill", "#ef4444")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1.2);

      // Outer Letter/Category Label (A, B, C... matching Image 4)
      const labelRadius = petalRadius + 18;
      const lx = labelRadius * Math.cos(midAngle);
      const ly = labelRadius * Math.sin(midAngle);

      sectorGroup
        .append("text")
        .attr("x", lx)
        .attr("y", ly)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", "#94a3b8")
        .style("font-size", "0.78rem")
        .style("font-weight", "700")
        .text(sec.letter);

      // Interactive hover & click
      sectorGroup
        .on("mouseenter", function () {
          sectorGroup
            .selectAll("path")
            .attr("stroke", "#f0a500")
            .attr("stroke-width", 2.2);
          updateRoseSidebar(sec, data.totalLanguages);
        })
        .on("mouseleave", function () {
          sectorGroup
            .selectAll("path")
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 1.2);
        })
        .on("click", function () {
          selectedRoseSector = sec;
          updateRoseSidebar(sec, data.totalLanguages);
        });
    });

    // Center circular hub
    g.append("circle")
      .attr("r", innerRadius)
      .attr("fill", "#0f172a")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#ffffff")
      .style("font-size", "0.75rem")
      .style("font-weight", "700")
      .text("987");

    // Populate sidebar with top sector
    if (sectors[0]) {
      updateRoseSidebar(sectors[0], data.totalLanguages);
    }
  }

  function updateRoseSidebar(sec, totalAfricanLangs) {
    const card = document.getElementById("studio-card");
    const breadcrumb = document.getElementById("viz-studio-breadcrumb");
    if (!card) return;

    const cCfg = (ns.CountryFilter && ns.CountryFilter.getConfig(sec.country)) || { name: sec.country };
    const pctAfrica = Math.round((sec.count / (totalAfricanLangs || 1)) * 100);

    if (breadcrumb) {
      breadcrumb.textContent = `Sector ${sec.letter}: ${cCfg.name} · ${sec.family} (${sec.count} languages)`;
    }

    const pctStable = Math.round((sec.stable / sec.count) * 100);
    const pctVuln = Math.round((sec.vuln / sec.count) * 100);
    const pctEndang = Math.round((sec.endang / sec.count) * 100);
    const pctCrit = Math.round((sec.crit / sec.count) * 100);

    const langItems = sec.langs.slice(0, 30).map((l) => {
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
            <span class="region-lang-fam" style="color:${getFamilyColor(l.family, 1)}">${l.region || l.country}</span>
            <button class="region-locate-btn" data-lang-id="${l.id}" title="${t("studio.locateOnMap", null, "Locate on Map")}">→</button>
          </div>
        </div>
      `;
    }).join("");

    card.innerHTML = `
      <div class="viz-card-badge" style="background:#ef444433; color:#ef4444; border:1px solid #ef4444">
        Sector ${sec.letter} · ${cCfg.name}
      </div>
      <h3 class="viz-card-title">${sec.family}</h3>
      <div class="viz-card-subtitle">${cCfg.name} — ${sec.count} ${t("nav.languagesCount", null, "languages")} (${pctAfrica}% of Africa)</div>
      
      <div class="viz-stat-grid">
        <div class="viz-stat-item">
          <span class="viz-stat-label">${t("studio.totalLanguages", null, "Branch Total")}</span>
          <span class="viz-stat-value" style="color:#f0a500; font-size:1.15rem">${sec.count}</span>
        </div>
        <div class="viz-stat-item">
          <span class="viz-stat-label">${t("studio.speakersEstimated", null, "Speakers")}</span>
          <span class="viz-stat-value">${sec.speakers ? (sec.speakers / 1e6).toFixed(1) + "M" : "Cataloged"}</span>
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
        <span>Cataloged Tongues (${sec.count})</span>
      </div>

      <div class="region-lang-roster-list">
        ${langItems}
      </div>
    `;

    card.querySelectorAll(".region-locate-btn, .region-lang-row").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.langId;
        locateLanguageOnMap(id);
      });
    });
  }

  // ── 2. Country View: Regional Density Choropleth (Paris style / Image 5) ───
  function renderCountryChoropleth(regionalData, countryCode) {
    const target = document.getElementById("studio-chart-target");
    if (!target || !regionalData) return;

    const width = target.clientWidth || 720;
    const height = Math.max(540, target.clientHeight || 600);
    const buckets = getChoroplethBuckets(regionalData.maxCount);

    const projCfg = COUNTRY_PROJ_CONFIG[countryCode] || {
      center: [10, 10],
      scale: 2500,
    };

    const projection = d3
      .geoMercator()
      .center(projCfg.center)
      .scale(projCfg.scale * (Math.min(width, height) / 600))
      .translate([width / 2, height / 2]);

    const pathGen = d3.geoPath().projection(projection);

    const svg = d3
      .select(target)
      .append("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("class", "viz-geo-svg");

    const g = svg.append("g").attr("class", "choropleth-layer");

    const paths = g
      .selectAll("path")
      .data(regionalData.features)
      .join("path")
      .attr("d", pathGen)
      .attr("class", "choropleth-region")
      .attr("fill", (d) => getChoroplethColor(d.stats.count, buckets))
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .style("cursor", "pointer")
      .style("transition", "fill 0.2s, stroke 0.2s, stroke-width 0.2s");

    paths
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .raise()
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 3.0)
          .style("filter", "drop-shadow(0 0 10px rgba(255, 255, 255, 0.7))");
        updateCountrySidebar(d, countryCode);
      })
      .on("mouseleave", function (event, d) {
        const isSelected =
          selectedRegionFeature &&
          selectedRegionFeature.properties.shapeName === d.properties.shapeName;
        d3.select(this)
          .attr("stroke", isSelected ? "#f0a500" : "#ffffff")
          .attr("stroke-width", isSelected ? 3.0 : 1.5)
          .style(
            "filter",
            isSelected ? "drop-shadow(0 0 12px rgba(240, 165, 0, 0.6))" : "none",
          );
      })
      .on("click", function (event, d) {
        selectedRegionFeature = d;
        paths
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1.5)
          .style("filter", "none");
        d3.select(this)
          .raise()
          .attr("stroke", "#f0a500")
          .attr("stroke-width", 3.0)
          .style("filter", "drop-shadow(0 0 12px rgba(240, 165, 0, 0.6))");
        updateCountrySidebar(d, countryCode);
      });

    // Bottom-right legend bar matching Image 5
    renderChoroplethLegend(target, buckets);

    if (selectedRegionFeature) {
      updateCountrySidebar(selectedRegionFeature, countryCode);
    }
  }

  // ── 3. Country View: Proportional Bubble Map (Image 1) ──────────────────────
  function renderCountryBubbles(regionalData, countryCode) {
    const target = document.getElementById("studio-chart-target");
    if (!target || !regionalData) return;

    const width = target.clientWidth || 720;
    const height = Math.max(540, target.clientHeight || 600);

    const projCfg = COUNTRY_PROJ_CONFIG[countryCode] || {
      center: [10, 10],
      scale: 2500,
    };

    const projection = d3
      .geoMercator()
      .center(projCfg.center)
      .scale(projCfg.scale * (Math.min(width, height) / 600))
      .translate([width / 2, height / 2]);

    const pathGen = d3.geoPath().projection(projection);

    const svg = d3
      .select(target)
      .append("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("class", "viz-geo-svg");

    // 1. Sleek neutral polygon bases (Image 1 style)
    svg
      .append("g")
      .selectAll("path")
      .data(regionalData.features)
      .join("path")
      .attr("d", pathGen)
      .attr("fill", "#243042")
      .attr("stroke", "rgba(255, 255, 255, 0.45)")
      .attr("stroke-width", 1.2)
      .attr("stroke-linejoin", "round");

    // 2. Proportional circle bubbles
    const maxRadius = Math.min(width, height) / 13;
    const rScale = d3
      .scaleSqrt()
      .domain([0, regionalData.maxCount])
      .range([4, Math.max(16, maxRadius)]);

    const bubbleGroup = svg.append("g");
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
      .attr("stroke-width", 1.8)
      .style("transition", "transform 0.2s, stroke-width 0.2s");

    bubbles
      .filter((d) => rScale(d.stats.count) >= 11)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#ffffff")
      .style("font-size", (d) =>
        rScale(d.stats.count) >= 18 ? "0.75rem" : "0.62rem",
      )
      .style("font-weight", "700")
      .style("pointer-events", "none")
      .text((d) => d.stats.count);

    bubbles
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .select("circle")
          .attr("stroke", "#f0a500")
          .attr("stroke-width", 3.0)
          .style("transform", "scale(1.15)");
        updateCountrySidebar(d, countryCode);
      })
      .on("mouseleave", function () {
        d3.select(this)
          .select("circle")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1.8)
          .style("transform", "scale(1)");
      })
      .on("click", function (event, d) {
        selectedRegionFeature = d;
        updateCountrySidebar(d, countryCode);
      });

    if (selectedRegionFeature) {
      updateCountrySidebar(selectedRegionFeature, countryCode);
    }
  }

  // ── Legend Bar for Country Choropleths (Image 5 style) ──────────────────────
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

  // ── Country Sidebar Detail Card ─────────────────────────────────────────────
  function updateCountrySidebar(feature, countryCode) {
    const card = document.getElementById("studio-card");
    const breadcrumb = document.getElementById("viz-studio-breadcrumb");
    if (!card) return;

    const props = feature.properties;
    const stats = feature.stats;
    const regionName = props.shapeName;
    const cCfg = (ns.CountryFilter && ns.CountryFilter.getConfig(countryCode)) || { name: countryCode };

    if (breadcrumb) {
      breadcrumb.textContent = `${regionName} · ${cCfg.name} (${stats.count} ${t("nav.languagesCount", null, "languages")})`;
    }

    const domFamColor = getFamilyColor(stats.dominantFamily, 1);
    const totalVit = stats.count || 1;
    const pctStable = Math.round((stats.vitalityCounts.stable / totalVit) * 100);
    const pctVuln = Math.round((stats.vitalityCounts.vulnerable / totalVit) * 100);
    const pctEndang = Math.round((stats.vitalityCounts.endangered / totalVit) * 100);
    const pctCrit = Math.round((stats.vitalityCounts.critical / totalVit) * 100);

    const isEnglish = ns.I18n ? ns.I18n.getLanguage() === "en" : true;
    const rankLabel = isEnglish
      ? `Ranked #${stats.rank} in ${cCfg.name}`
      : `Classé n°${stats.rank} en ${cCfg.name}`;

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
      <div class="viz-card-subtitle">${cCfg.name} · ${stats.count} ${t("nav.languagesCount", null, "languages")}</div>
      
      <div class="viz-stat-grid">
        <div class="viz-stat-item">
          <span class="viz-stat-label">${t("studio.totalLanguages", null, "Languages Spoken")}</span>
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
        <span>${t("studio.languagesInRegion", { region: regionName, count: stats.count }, `Languages in ${regionName} (${stats.count})`)}</span>
      </div>

      <div class="region-lang-roster-list">
        ${langItems || `<div style="padding:12px; color:#9ca3af; font-size:0.75rem">${t("studio.noRegionSelected", null, "No languages registered")}</div>`}
      </div>
    `;

    card.querySelectorAll(".region-locate-btn, .region-lang-row").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.langId;
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

  ns.VizSunburst = {
    init: init,
    render: render,
    locateLanguageOnMap: locateLanguageOnMap,
  };
})(window.NeraMap);
