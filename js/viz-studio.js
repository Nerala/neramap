// ═══════════════════════════════════════════════════════════════════════════════
//  NeraMap — Viz: Studio Orchestrator & Mode Controller
// ═══════════════════════════════════════════════════════════════════════════════

window.NeraMap = window.NeraMap || {};

(function (ns) {
  "use strict";

  let currentMode = "map";
  let studioContainer = null;
  let mapElements = [];

  function init() {
    studioContainer = document.getElementById("viz-studio-container");

    // Elements that belong exclusively to the Map mode
    mapElements = [
      document.getElementById("map"),
      document.getElementById("search-wrap"),
      document.getElementById("view-switcher"),
      document.getElementById("filters"),
      document.getElementById("legend"),
      document.getElementById("zoom-hint"),
    ].filter(Boolean);

    initNavButtons();

    // Default to map mode
    switchMode("map");
  }

  function initNavButtons() {
    const navButtons = document.querySelectorAll(".mode-btn");
    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.mode;
        switchMode(mode);
      });
    });
  }

  function switchMode(mode) {
    currentMode = mode;

    // 1. Update navigation button styles
    document.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === mode);
    });

    // 2. Close side panel if open
    if (ns.Panel) {
      ns.Panel.close();
    }

    // 3. Toggle Map View vs Studio Views
    if (mode === "map") {
      mapElements.forEach((el) => {
        el.style.display = "";
      });
      if (studioContainer) {
        studioContainer.style.display = "none";
        studioContainer.innerHTML = "";
      }
      if (ns.map) {
        setTimeout(() => ns.map.invalidateSize(), 150);
      }
    } else {
      // Hide map overlays
      mapElements.forEach((el) => {
        el.style.display = "none";
      });

      if (studioContainer) {
        studioContainer.style.display = "block";
        studioContainer.innerHTML = "";

        if (mode === "sunburst" && ns.VizSunburst) {
          ns.VizSunburst.init(studioContainer);
        }
      }
    }
  }

  ns.VizStudio = {
    init: init,
    switchMode: switchMode,
    getMode: function () {
      return currentMode;
    },
  };
})(window.NeraMap);
