// ═══════════════════════════════════════════════════════════════════════════════
//  NeraMap — Info Panel: open, close, render language details
// ═══════════════════════════════════════════════════════════════════════════════

window.NeraMap = window.NeraMap || {};

(function (ns) {
  "use strict";

  const FAMILY_CONFIG = ns.FAMILY_CONFIG;
  const VITALITY_CONFIG = ns.VITALITY_CONFIG;

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

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ── Open the info panel with language details ──
  function openPanel(lang, localized) {
    const fam = FAMILY_CONFIG[lang.family] || FAMILY_CONFIG["Unclassified"];
    const vit = VITALITY_CONFIG[lang.vitality] || VITALITY_CONFIG.stable;
    const spk = formatSpeakers(lang.speakers);
    const text = localized || {};
    const familyLabel = text.family || fam.label;
    const vitalityLabel = text.vitality || vit.label;
    const subfamily = text.subfamily || lang.subfamily;
    const region = text.region || lang.region;
    const description = text.description || lang.description;

    const contentEl = document.getElementById("panel-content");
    const panelEl = document.getElementById("info-panel");

    if (!contentEl || !panelEl) return;

    contentEl.innerHTML =
      '<span class="lang-family-badge" style="background:' +
      fam.color +
      "22;color:" +
      fam.color +
      ";border:1px solid " +
      fam.color +
      '55">' +
      escapeHtml(familyLabel) +
      "</span>" +
      "<h2>" +
      escapeHtml(lang.name) +
      "</h2>" +
      '<div class="lang-iso">ISO 639-3: <strong>' +
      escapeHtml(lang.iso) +
      "</strong> &nbsp;·&nbsp; " +
      escapeHtml(subfamily) +
      "</div>" +
      '<div class="info-grid">' +
      '<div class="info-card"><div class="label">Locuteurs</div><div class="value">' +
      spk +
      "</div></div>" +
      '<div class="info-card"><div class="label">Vitalité</div><div class="value">' +
      vit.icon +
      " " +
      escapeHtml(vitalityLabel) +
      "</div></div>" +
      '<div class="info-card full"><div class="label">Famille</div><div class="value">' +
      escapeHtml(familyLabel) +
      " › " +
      escapeHtml(subfamily) +
      "</div></div>" +
      '<div class="info-card full vitality-bar-wrap"><div class="label">Indice de vitalité</div>' +
      '<div class="vitality-bar"><div class="vitality-fill" style="width:' +
      vit.pct +
      "%;background:" +
      vit.color +
      '"></div></div></div>' +
      "</div>" +
      '<div class="info-section-title">Région principale</div>' +
      '<div class="region-tags" style="margin-bottom:16px">' +
      escapeHtml(region)
        .split("/")
        .map(function (r) {
          return '<span class="region-tag">' + r.trim() + "</span>";
        })
        .join("") +
      "</div>" +
      '<div class="info-section-title">Description</div>' +
      '<p style="font-size:0.82rem;line-height:1.65;color:#c0c8d8">' +
      escapeHtml(description) +
      "</p>" +
      '<div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">' +
      '<div style="font-size:0.68rem;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">Coordonnées</div>' +
      '<div style="font-size:0.75rem;color:var(--muted)">' +
      lang.lat.toFixed(4) +
      "°N, " +
      lang.lng.toFixed(4) +
      "°E</div>" +
      "</div>";

    panelEl.classList.add("open");
  }

  async function openTranslatedPanel(lang) {
    if (!ns.Translation || !ns.Translation.isTranslated()) {
      openPanel(lang);
      return;
    }
    const fam = FAMILY_CONFIG[lang.family] || FAMILY_CONFIG["Unclassified"];
    const vit = VITALITY_CONFIG[lang.vitality] || VITALITY_CONFIG.stable;
    const texts = [
      lang.description,
      lang.subfamily,
      lang.region,
      fam.label,
      vit.label,
      "Locuteurs",
      "Vitalité",
      "Famille",
      "Indice de vitalité",
      "Région principale",
      "Description",
      "Coordonnées",
    ];
    try {
      const labels = await ns.Translation.translateAll(texts);
      openPanel(lang, {
        description: labels[lang.description],
        subfamily: labels[lang.subfamily],
        region: labels[lang.region],
        family: labels[fam.label],
        vitality: labels[vit.label],
        speakersLabel: labels.Locuteurs,
      });
      const content = document.getElementById("panel-content");
      if (content) {
        content.querySelectorAll(".label")[0].textContent = labels.Locuteurs;
        content.querySelectorAll(".label")[1].textContent = labels.Vitalité;
        content.querySelectorAll(".label")[2].textContent = labels.Famille;
        content.querySelectorAll(".label")[3].textContent = labels["Indice de vitalité"];
        content.querySelectorAll(".info-section-title")[0].textContent =
          labels["Région principale"];
        content.querySelectorAll(".info-section-title")[1].textContent =
          labels.Description;
        content.lastElementChild.firstElementChild.textContent = labels.Coordonnées;
      }
    } catch (error) {
      console.warn("NeraMap description translation unavailable:", error.message);
      openPanel(lang);
    }
  }

  // ── Close the info panel ──
  function closePanel() {
    const panelEl = document.getElementById("info-panel");
    if (panelEl) {
      panelEl.classList.remove("open");
    }
  }

  // ── Wire the close button ──
  function init() {
    const closeBtn = document.getElementById("close-panel");
    if (closeBtn) {
      closeBtn.addEventListener("click", closePanel);
    }
  }

  // ── Public API ──
  ns.Panel = {
    open: openTranslatedPanel,
    close: closePanel,
    init: init,
  };
})(window.NeraMap);
