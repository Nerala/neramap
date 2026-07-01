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

  // ── Open the info panel with language details ──
  function openPanel(lang) {
    const fam = FAMILY_CONFIG[lang.family] || FAMILY_CONFIG["Unclassified"];
    const vit = VITALITY_CONFIG[lang.vitality] || VITALITY_CONFIG.stable;
    const spk = formatSpeakers(lang.speakers);

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
      fam.label +
      "</span>" +
      "<h2>" +
      lang.name +
      "</h2>" +
      '<div class="lang-iso">ISO 639-3: <strong>' +
      lang.iso +
      "</strong> &nbsp;·&nbsp; " +
      lang.subfamily +
      "</div>" +
      '<div class="info-grid">' +
      '<div class="info-card"><div class="label">Locuteurs</div><div class="value">' +
      spk +
      "</div></div>" +
      '<div class="info-card"><div class="label">Vitalité</div><div class="value">' +
      vit.icon +
      " " +
      vit.label +
      "</div></div>" +
      '<div class="info-card full"><div class="label">Famille</div><div class="value">' +
      lang.family +
      " › " +
      lang.subfamily +
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
      lang.region
        .split("/")
        .map(function (r) {
          return '<span class="region-tag">' + r.trim() + "</span>";
        })
        .join("") +
      "</div>" +
      '<div class="info-section-title">Description</div>' +
      '<p style="font-size:0.82rem;line-height:1.65;color:#c0c8d8">' +
      lang.description +
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
    open: openPanel,
    close: closePanel,
    init: init,
  };
})(window.NeraMap);
