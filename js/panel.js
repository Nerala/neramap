// ═══════════════════════════════════════════════════════════════════════════════
//  NeraMap — Info Panel: open, close, render language details
// ═══════════════════════════════════════════════════════════════════════════════

window.NeraMap = window.NeraMap || {};

(function (ns) {
  "use strict";

  const FAMILY_CONFIG = ns.FAMILY_CONFIG;
  const VITALITY_CONFIG = ns.VITALITY_CONFIG;

  // ── Format speaker count ──
  let currentLangData = null;

  function t(key, params, fallback) {
    if (ns.I18n && typeof ns.I18n.t === "function") {
      const val = ns.I18n.t(key, params);
      if (val && val !== key) return val;
    }
    return fallback || key;
  }

  // ── Format speaker count ──
  function formatSpeakers(count) {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    }
    if (count >= 1000) {
      return Math.round(count / 1000) + "K";
    }
    return count;
  }

  // ── Open the info panel with language details ──
  function openPanel(lang) {
    currentLangData = lang;
    const fam = FAMILY_CONFIG[lang.family] || FAMILY_CONFIG["Unclassified"];
    const vit = VITALITY_CONFIG[lang.vitality] || VITALITY_CONFIG.stable;
    const spk = lang.speakers ? formatSpeakers(lang.speakers) : t("panel.notRecorded", null, "Unrecorded");

    const contentEl = document.getElementById("panel-content");
    const panelEl = document.getElementById("info-panel");

    if (!contentEl || !panelEl) return;

    let linksHtml = '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 16px;">';
    if (lang.glottolog_url || lang.glottocode) {
      const gUrl = lang.glottolog_url || ('https://glottolog.org/resource/languoid/id/' + lang.glottocode);
      linksHtml += '<a href="' + gUrl + '" target="_blank" rel="noopener" class="region-tag" style="background:#2563eb33;color:#60a5fa;border:1px solid #3b82f644" title="' + t("panel.glottologTitle", null, "Scientific Glottolog record") + '">' + t("panel.glottologCard", { code: lang.glottocode || "" }, "Glottolog (" + (lang.glottocode || '') + ") ↗") + '</a>';
    }
    if (lang.wikipedia_en) {
      linksHtml += '<a href="' + lang.wikipedia_en + '" target="_blank" rel="noopener" class="region-tag" style="background:#374151;color:#f3f4f6" title="' + t("panel.wikipediaEnTitle", null, "Wikipedia article in English") + '">' + t("panel.wikipediaEn", null, "Wikipedia (EN) ↗") + '</a>';
    }
    if (lang.wikipedia_fr) {
      linksHtml += '<a href="' + lang.wikipedia_fr + '" target="_blank" rel="noopener" class="region-tag" style="background:#374151;color:#f3f4f6" title="' + t("panel.wikipediaFrTitle", null, "Wikipedia article in French") + '">' + t("panel.wikipediaFr", null, "Wikipédia (FR) ↗") + '</a>';
    }
    if (lang.wals && lang.wals.url) {
      linksHtml += '<a href="' + lang.wals.url + '" target="_blank" rel="noopener" class="region-tag" style="background:#05966933;color:#34d399;border:1px solid #10b98144" title="' + t("panel.walsTitle", null, "World Atlas of Language Structures") + '">' + t("panel.walsCard", null, "WALS ↗") + '</a>';
    }
    linksHtml += '</div>';

    let dialectsHtml = '';
    const allDialects = lang.dialects && lang.dialects.length ? lang.dialects : (lang.dialects_glottolog || []);
    if (allDialects && allDialects.length) {
      dialectsHtml = '<div class="info-section-title" style="margin-top:16px;">' + t("panel.documentedDialects", { count: allDialects.length }, "Documented Dialects (" + allDialects.length + ")") + '</div>' +
        '<div class="viz-tree-preview" style="max-height:120px;margin-bottom:12px;">' +
        allDialects.map(function(d) {
          return '<span class="viz-tag" style="border-left:2px solid #f0a500">' + d + '</span>';
        }).join('') +
        '</div>';
    }

    let aliasesHtml = '';
    if (lang.aliases && lang.aliases.length) {
      aliasesHtml = '<div class="info-section-title" style="margin-top:14px;">' + t("panel.namesAndAliases", { count: lang.aliases.length }, "Names & Variants (" + lang.aliases.length + ")") + '</div>' +
        '<div style="font-size:0.75rem;color:#9ca3af;line-height:1.45;margin-bottom:14px;">' +
        lang.aliases.slice(0, 12).join(', ') +
        (lang.aliases.length > 12 ? ' ' + t("panel.moreOthers", { count: lang.aliases.length - 12 }, "(+" + (lang.aliases.length - 12) + " others)") : '') +
        '</div>';
    }

    let spkMetaHtml = '';
    if (lang.speakers_meta && lang.speakers_meta.source) {
      spkMetaHtml = '<div style="font-size:0.68rem;color:#9ca3af;margin-top:4px;">' + t("panel.refSource", { source: lang.speakers_meta.source + (lang.speakers_meta.year ? ' (' + lang.speakers_meta.year + ')' : '') }, "Ref: " + lang.speakers_meta.source) + '</div>';
    }

    let docHtml = '';
    if (lang.documentation) {
      docHtml = '<div class="info-card full" style="margin-top:6px;"><div class="label">' + t("panel.docLevel", null, "Documentation Level") + '</div><div class="value" style="font-size:0.8rem;color:#e5e7eb;">' +
        lang.documentation + '</div></div>';
    }

    contentEl.innerHTML =
      '<span class="lang-family-badge" style="background:' +
      fam.color +
      "22;color:" +
      fam.color +
      ";border:1px solid " +
      fam.color +
      '55">' +
      fam.label +
      "</span>" +
      '<h2 style="margin-top:6px;">' +
      lang.name +
      "</h2>" +
      '<div class="lang-iso">ISO 639-3: <strong>' +
      (lang.iso || "—") +
      "</strong> &nbsp;·&nbsp; " +
      (lang.subfamily || lang.family) +
      "</div>" +
      linksHtml +
      '<div class="info-grid">' +
      '<div class="info-card"><div class="label">' + t("panel.speakers", null, "Speakers") + '</div><div class="value">' +
      spk +
      "</div>" + spkMetaHtml + "</div>" +
      '<div class="info-card"><div class="label">' + t("panel.vitality", null, "Vitality") + '</div><div class="value" style="display:flex;align-items:center;gap:6px;"><span class="vit-dot" style="background:' +
      vit.color +
      ';display:inline-block;width:9px;height:9px;border-radius:50%;"></span> ' +
      vit.label +
      "</div></div>" +
      '<div class="info-card full"><div class="label">' + t("panel.taxonomicFamily", null, "Taxonomic Family") + '</div><div class="value">' +
      lang.family +
      (lang.subfamily ? " › " + lang.subfamily : "") +
      "</div></div>" +
      docHtml +
      '<div class="info-card full vitality-bar-wrap"><div class="label">' + t("panel.vitalityIndex", null, "Vitality Index") + '</div>' +
      '<div class="vitality-bar"><div class="vitality-fill" style="width:' +
      vit.pct +
      "%;background:" +
      vit.color +
      '"></div></div></div>' +
      "</div>" +
      '<div class="info-section-title">' + t("panel.region", null, "Region") + '</div>' +
      '<div class="region-tags" style="margin-bottom:12px">' +
      (lang.region || "Central & West Africa")
        .split("/")
        .map(function (r) {
          return '<span class="region-tag">' + r.trim() + "</span>";
        })
        .join("") +
      "</div>" +
      dialectsHtml +
      aliasesHtml +
      '<div class="info-section-title">' + t("panel.descriptionTitle", null, "Description") + '</div>' +
      '<p style="font-size:0.8rem;line-height:1.6;color:#c0c8d8">' +
      (lang.description || t("panel.noDescription", null, "No additional description available.")) +
      "</p>" +
      '<div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">' +
      '<div style="font-size:0.68rem;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">' + t("panel.geoCoords", null, "Geographic Coordinates") + '</div>' +
      '<div style="font-size:0.75rem;color:var(--muted)">' +
      Number(lang.lat).toFixed(4) +
      "°N, " +
      Number(lang.lng).toFixed(4) +
      "°E" +
      (lang.places && lang.places.length ? " &nbsp;·&nbsp; " + t("panel.localities", { places: lang.places.join(', ') }, "Localities: " + lang.places.join(', ')) : "") +
      "</div>" +
      "</div>";

    panelEl.classList.add("open");
  }

  // ── Close the info panel ──
  function closePanel() {
    currentLangData = null;
    const panelEl = document.getElementById("info-panel");
    if (panelEl) {
      panelEl.classList.remove("open");
    }
  }

  // ── Wire the close button & i18n changes ──
  function init() {
    const closeBtn = document.getElementById("close-panel");
    if (closeBtn) {
      closeBtn.addEventListener("click", closePanel);
    }
    if (ns.I18n && typeof ns.I18n.subscribe === "function") {
      ns.I18n.subscribe(function () {
        const panelEl = document.getElementById("info-panel");
        if (panelEl && panelEl.classList.contains("open") && currentLangData) {
          openPanel(currentLangData);
        }
      });
    }
  }

  // ── Public API ──
  ns.Panel = {
    open: openPanel,
    close: closePanel,
    init: init,
    getCurrentLanguage: function() {
      return currentLangData;
    },
  };
})(window.NeraMap);
