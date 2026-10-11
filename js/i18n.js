// ═══════════════════════════════════════════════════════════════════════════════
//  NeraMap — i18n Localization System
//  Primary language: English (en) with full support for French (fr) & more
// ═══════════════════════════════════════════════════════════════════════════════

window.NeraMap = window.NeraMap || {};

(function (ns) {
  "use strict";

  const STORAGE_KEY = "neramap_lang";
  const DEFAULT_LANG = "en";
  const SUPPORTED_LANGS = ["en", "fr"];

  const translations = {
    en: {
      meta: {
        pageTitle: "African Language Map — Nerala",
        headerLogo: "NeraMap Africa",
        headerSubtitle: "Linguistic Atlas · Central & West Africa",
      },
      nav: {
        countrySelectAria: "Country Selection",
        allAfrica: "Africa",
        allAfricaTitle: "All languages of Central & West Africa",
        cameroon: "Cameroon",
        cameroonTitle: "Cameroon (253 languages)",
        nigeria: "Nigeria",
        nigeriaTitle: "Nigeria (561 languages)",
        chad: "Chad",
        chadTitle: "Chad (141 languages)",
        gabon: "Gabon",
        gabonTitle: "Gabon (48 languages)",
        modeNavAria: "Visualization modes",
        modeMap: "Map & Atlas",
        modeStudio: "Studio & Choropleth",
        modeSunburst: "Studio & Choropleth",
        viewSwitcherAria: "Map view choice",
        shownCountLabel: "Showing:",
        languagesCount: "languages",
      },
      search: {
        placeholder: "Search for a language, family, or region…",
      },
      mapViews: {
        terrain: {
          label: "Terrain",
          description: "Elevation and roads",
        },
        light: {
          label: "Light",
          description: "Classic clean map view",
        },
        dark: {
          label: "Dark",
          description: "High-contrast dark canvas",
        },
        satellite: {
          label: "Satellite",
          description: "Satellite imagery and terrain context",
        },
      },
      families: {
        "Niger-Congo": "Niger-Congo",
        "Afro-Asiatic": "Afro-Asiatic",
        "Nilo-Saharan": "Nilo-Saharan",
        Ubangian: "Ubangian",
        "Indo-European": "Indo-European",
        Creole: "Creole",
        Unclassified: "Other / Isolate",
      },
      vitality: {
        stable: "Stable / Vigorous",
        vulnerable: "Vulnerable",
        endangered: "Endangered",
        critical: "Critical",
        extinct: "Extinct",
        unknown: "Unassessed",
      },
      legend: {
        familiesTitle: "Language Families",
        vitalityTitle: "Vitality Index",
      },
      hints: {
        zoomHintClusters: "Zoom in to explore clusters",
        zoomHintMarker: "Click on a marker for details",
        backToHomeAria: "Return to home",
        closePanelAria: "Close info panel",
      },
      panel: {
        speakers: "Speakers",
        notRecorded: "Unrecorded",
        vitality: "Vitality",
        taxonomicFamily: "Taxonomic Family",
        docLevel: "Documentation Level",
        vitalityIndex: "Vitality Index",
        region: "Region",
        documentedDialects: "Documented Dialects ({count})",
        namesAndAliases: "Names & Variants ({count})",
        moreOthers: "+{count} others",
        refSource: "Ref: {source}",
        descriptionTitle: "Description",
        noDescription: "No additional description available.",
        geoCoords: "Geographic Coordinates",
        localities: "Localities: {places}",
        glottologCard: "Glottolog ({code}) ↗",
        glottologTitle: "Scientific Glottolog record",
        wikipediaFr: "Wikipedia (FR) ↗",
        wikipediaFrTitle: "Wikipedia article in French",
        wikipediaEn: "Wikipedia (EN) ↗",
        wikipediaEnTitle: "Wikipedia article in English",
        walsCard: "WALS ↗",
        walsTitle: "World Atlas of Language Structures",
      },
      countries: {
        ALL: {
          name: "Africa",
          title: "NeraMap Africa",
          subtitle: "Linguistic Atlas · Central & West Africa",
          sunburstTitle: "Languages of Africa",
          sunburstDesc: "Explore the taxonomic lineage of Central & West African languages, from major trunks to regional branches.",
        },
        CM: {
          name: "Cameroon",
          title: "NeraMap Cameroon",
          subtitle: "Linguistic Atlas · Cameroon (253 cataloged languages)",
          sunburstTitle: "Languages of Cameroon",
          sunburstDesc: "Explore the taxonomic lineage of Cameroon's 253 languages, from linguistic phyla down to local dialects.",
        },
        NG: {
          name: "Nigeria",
          title: "NeraMap Nigeria",
          subtitle: "Linguistic Atlas · Nigeria (561 cataloged languages)",
          sunburstTitle: "Languages of Nigeria",
          sunburstDesc: "Explore the taxonomic lineage of Nigeria's 561 languages, at the crossroads of immense ethnolinguistic diversity.",
        },
        TD: {
          name: "Chad",
          title: "NeraMap Chad",
          subtitle: "Linguistic Atlas · Chad (141 cataloged languages)",
          sunburstTitle: "Languages of Chad",
          sunburstDesc: "Explore the taxonomic lineage of Chad's 141 languages, a vibrant contact zone between Nilo-Saharan and Afro-Asiatic families.",
        },
        GA: {
          name: "Gabon",
          title: "NeraMap Gabon",
          subtitle: "Linguistic Atlas · Gabon (48 cataloged languages)",
          sunburstTitle: "Languages of Gabon",
          sunburstDesc: "Explore the taxonomic lineage of Gabon's 48 languages, across the equatorial Bantu basin of Central Africa.",
        },
      },
      voronoi: {
        toggleBtn: "Territories (Voronoi)",
        toggleBtnTitle: "Display territorial tessellation of linguistic areas",
        dialectsCount: "{count} dialects",
      },
      sunburst: {
        headerTitle: "Living Tree of African Languages",
        btnSunburst: "Radial Sunburst",
        btnTreemap: "Treemap Mosaic",
        breadcrumbRoot: "Root: {title} ({count} languages)",
        hoverInstruction: "Hover or click on a sector to explore its linguistic lineage.",
        familyFallback: "Family",
        regionLabel: "Region",
        dialectsLabel: "Dialects",
        aliasesLabel: "Variants / Names",
        vitalityLabel: "Vitality",
        inspectBtn: "View full profile on map",
        generalBranch: "General",
      },
      studio: {
        headerTitle: "Linguistic Studio & Regional Maps",
        btnChoropleth: "Regional Density",
        btnBubbles: "Bubble Distribution",
        btnSunburst: "Taxonomic Sunburst",
        btnTreemap: "Treemap Mosaic",
        legendDensity: "Language density by subdivision",
        legendMin: "0–5",
        legendMax: "50+",
        languagesInRegion: "Languages in {region} ({count})",
        hoverRegionInstruction: "Hover or click on any subdivision to inspect its linguistic diversity.",
        regionRank: "#{rank} in {country}",
        dominantFamily: "Dominant Phylum",
        vitalityDistribution: "Linguistic Vitality",
        locateOnMap: "Locate on Map",
        filterMapByRegion: "Filter Map to this Region",
        speakersEstimated: "Documented Speakers",
        noRegionSelected: "Select a region on the map",
        crossBorderNote: "Cross-border presence",
        subdivisionType: {
          NG: "State",
          CM: "Region",
          TD: "Province",
          GA: "Province",
          ALL: "Subdivision",
        },
      },
    },
    fr: {
      meta: {
        pageTitle: "Carte des langues de l'Afrique — Nerala",
        headerLogo: "NeraMap Afrique",
        headerSubtitle: "Atlas linguistique · Afrique Centrale & de l'Ouest",
      },
      nav: {
        countrySelectAria: "Sélection du pays",
        allAfrica: "Afrique",
        allAfricaTitle: "Toutes les langues d'Afrique Centrale & de l'Ouest",
        cameroon: "Cameroun",
        cameroonTitle: "Cameroun (253 langues)",
        nigeria: "Nigeria",
        nigeriaTitle: "Nigeria (561 langues)",
        chad: "Tchad",
        chadTitle: "Tchad (141 langues)",
        gabon: "Gabon",
        gabonTitle: "Gabon (48 langues)",
        modeNavAria: "Modes de visualisation",
        modeMap: "Carte & Atlas",
        modeStudio: "Studio & Choroplèthe",
        modeSunburst: "Studio & Choroplèthe",
        viewSwitcherAria: "Choix de vue",
        shownCountLabel: "Affichées :",
        languagesCount: "langues",
      },
      search: {
        placeholder: "Rechercher une langue, famille, région…",
      },
      mapViews: {
        terrain: {
          label: "Terrain",
          description: "Relief et routes",
        },
        light: {
          label: "Clair",
          description: "Vue cartographique classique",
        },
        dark: {
          label: "Sombre",
          description: "Fond contrasté",
        },
        satellite: {
          label: "Satellite",
          description: "Imagerie et contexte réel",
        },
      },
      families: {
        "Niger-Congo": "Niger-Congo",
        "Afro-Asiatic": "Afro-Asiatique",
        "Nilo-Saharan": "Nilo-Saharien",
        Ubangian: "Oubanguien",
        "Indo-European": "Indo-Européen",
        Creole: "Créole",
        Unclassified: "Autre / Isolat",
      },
      vitality: {
        stable: "Stable / Vigoureux",
        vulnerable: "Vulnérable",
        endangered: "En danger",
        critical: "Critique",
        extinct: "Éteinte",
        unknown: "Non évalué",
      },
      legend: {
        familiesTitle: "Familles linguistiques",
        vitalityTitle: "Vitalité",
      },
      hints: {
        zoomHintClusters: "Zoomez pour explorer les clusters",
        zoomHintMarker: "Cliquez sur un marqueur pour les détails",
        backToHomeAria: "Retour à l'accueil",
        closePanelAria: "Fermer le panneau",
      },
      panel: {
        speakers: "Locuteurs",
        notRecorded: "Non recensé",
        vitality: "Vitalité",
        taxonomicFamily: "Famille taxonomique",
        docLevel: "Niveau de documentation",
        vitalityIndex: "Indice de vitalité",
        region: "Région",
        documentedDialects: "Dialectes documentés ({count})",
        namesAndAliases: "Noms & Variantes ({count})",
        moreOthers: "(+{count} autres)",
        refSource: "Réf: {source}",
        descriptionTitle: "Description",
        noDescription: "Aucune description supplémentaire disponible.",
        geoCoords: "Coordonnées géographiques",
        localities: "Localités : {places}",
        glottologCard: "Glottolog ({code}) ↗",
        glottologTitle: "Fiche scientifique Glottolog",
        wikipediaFr: "Wikipédia (FR) ↗",
        wikipediaFrTitle: "Article Wikipédia en français",
        wikipediaEn: "Wikipédia (EN) ↗",
        wikipediaEnTitle: "Article Wikipédia en anglais",
        walsCard: "WALS ↗",
        walsTitle: "Atlas mondial des structures linguistiques",
      },
      countries: {
        ALL: {
          name: "Afrique",
          title: "NeraMap Afrique",
          subtitle: "Atlas linguistique · Afrique Centrale & de l'Ouest",
          sunburstTitle: "Langues d'Afrique",
          sunburstDesc: "Explorez la filiation taxonomique des langues d'Afrique Centrale & de l'Ouest, du grand tronc aux branches régionales.",
        },
        CM: {
          name: "Cameroun",
          title: "NeraMap Cameroun",
          subtitle: "Atlas linguistique · Cameroun (253 langues répertoriées)",
          sunburstTitle: "Langues du Cameroun",
          sunburstDesc: "Explorez la filiation taxonomique des 253 langues du Cameroun, des grands troncs linguistiques jusqu'aux dialectes locaux.",
        },
        NG: {
          name: "Nigeria",
          title: "NeraMap Nigeria",
          subtitle: "Atlas linguistique · Nigeria (561 langues répertoriées)",
          sunburstTitle: "Langues du Nigeria",
          sunburstDesc: "Explorez la filiation taxonomique des 561 langues du Nigeria, carrefour d'une immense diversité ethnolinguistique.",
        },
        TD: {
          name: "Tchad",
          title: "NeraMap Tchad",
          subtitle: "Atlas linguistique · Tchad (141 langues répertoriées)",
          sunburstTitle: "Langues du Tchad",
          sunburstDesc: "Explorez la filiation taxonomique des 141 langues du Tchad, zone de contact nilo-saharienne et afro-asiatique.",
        },
        GA: {
          name: "Gabon",
          title: "NeraMap Gabon",
          subtitle: "Atlas linguistique · Gabon (48 langues répertoriées)",
          sunburstTitle: "Langues du Gabon",
          sunburstDesc: "Explorez la filiation taxonomique des 48 langues du Gabon, bassin bantou équatorial d'Afrique centrale.",
        },
      },
      voronoi: {
        toggleBtn: "Territoires (Voronoi)",
        toggleBtnTitle: "Afficher le découpage territorial des zones linguistiques",
        dialectsCount: "{count} dialectes",
      },
      sunburst: {
        headerTitle: "L'Arbre Généalogique des Langues",
        btnSunburst: "Rayonnement (Sunburst)",
        btnTreemap: "Mosaïque (Treemap)",
        breadcrumbRoot: "Racine : {title} ({count} langues)",
        hoverInstruction: "Survolez ou cliquez sur un secteur pour explorer sa lignée linguistique.",
        familyFallback: "Famille",
        regionLabel: "Région",
        dialectsLabel: "Dialectes",
        aliasesLabel: "Variantes / Noms",
        vitalityLabel: "Vitalité",
        inspectBtn: "Voir la fiche complète sur la carte",
        generalBranch: "Général",
      },
      studio: {
        headerTitle: "Studio Linguistique & Cartes Régionales",
        btnChoropleth: "Densité Régionale",
        btnBubbles: "Distribution en Bulles",
        btnSunburst: "Rayonnement Taxonomique",
        btnTreemap: "Mosaïque Treemap",
        legendDensity: "Densité de langues par subdivision",
        legendMin: "0–5",
        legendMax: "50+",
        languagesInRegion: "Langues en {region} ({count})",
        hoverRegionInstruction: "Survolez ou cliquez sur une subdivision pour inspecter sa diversité linguistique.",
        regionRank: "n°{rank} en {country}",
        dominantFamily: "Phylum Dominant",
        vitalityDistribution: "Vitalité Linguistique",
        locateOnMap: "Localiser sur la carte",
        filterMapByRegion: "Filtrer la carte sur cette région",
        speakersEstimated: "Locuteurs Documentés",
        noRegionSelected: "Sélectionnez une région sur la carte",
        crossBorderNote: "Présence transfrontalière",
        subdivisionType: {
          NG: "État",
          CM: "Région",
          TD: "Province",
          GA: "Province",
          ALL: "Subdivision",
        },
      },
    },
  };

  let currentLang = DEFAULT_LANG;
  const subscribers = [];

  function getStoredLang() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED_LANGS.includes(stored)) {
        return stored;
      }
    } catch (e) {
      // localStorage may fail in restricted context
    }
    return DEFAULT_LANG;
  }

  function setStoredLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      // storage unavailable
    }
  }

  function getNestedValue(obj, keyPath) {
    if (!obj || !keyPath) return null;
    const parts = keyPath.split(".");
    let current = obj;
    for (let i = 0; i < parts.length; i++) {
      if (current === undefined || current === null) return null;
      current = current[parts[i]];
    }
    return current;
  }

  function t(key, params) {
    let text = getNestedValue(translations[currentLang], key);
    if (text === null || text === undefined) {
      // fallback to English
      text = getNestedValue(translations[DEFAULT_LANG], key);
    }
    if (text === null || text === undefined) {
      return key;
    }
    if (typeof text === "string" && params && typeof params === "object") {
      Object.keys(params).forEach(function (paramKey) {
        text = text.replace(new RegExp("\\{" + paramKey + "\\}", "g"), params[paramKey]);
      });
    }
    return text;
  }

  function subscribe(fn) {
    if (typeof fn === "function") {
      subscribers.push(fn);
    }
  }

  function notify() {
    subscribers.forEach(function (fn) {
      try {
        fn(currentLang);
      } catch (err) {
        console.error("i18n subscriber error:", err);
      }
    });
  }

  function applyDOMTranslations() {
    // 1. Elements with data-i18n="key"
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      const translation = t(key);
      if (translation) {
        el.textContent = translation;
      }
    });

    // 2. Elements with data-i18n-placeholder="key"
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      const key = el.getAttribute("data-i18n-placeholder");
      const translation = t(key);
      if (translation) {
        el.setAttribute("placeholder", translation);
      }
    });

    // 3. Elements with data-i18n-title="key"
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      const key = el.getAttribute("data-i18n-title");
      const translation = t(key);
      if (translation) {
        el.setAttribute("title", translation);
      }
    });

    // 4. Elements with data-i18n-aria-label="key"
    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
      const key = el.getAttribute("data-i18n-aria-label");
      const translation = t(key);
      if (translation) {
        el.setAttribute("aria-label", translation);
      }
    });

    // 5. Update HTML lang attribute
    document.documentElement.lang = currentLang;

    // 6. Update language selector active pills if present
    document.querySelectorAll(".lang-pill").forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });
  }

  function setLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) {
      lang = DEFAULT_LANG;
    }
    currentLang = lang;
    setStoredLang(lang);
    applyDOMTranslations();
    notify();
  }

  function getLanguage() {
    return currentLang;
  }

  function init() {
    currentLang = getStoredLang();
    applyDOMTranslations();

    // Wire any language selector buttons
    document.querySelectorAll(".lang-pill").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const targetLang = btn.dataset.lang;
        if (targetLang && targetLang !== currentLang) {
          setLanguage(targetLang);
        }
      });
    });
  }

  ns.I18n = {
    init: init,
    t: t,
    getLanguage: getLanguage,
    setLanguage: setLanguage,
    subscribe: subscribe,
    applyDOMTranslations: applyDOMTranslations,
    SUPPORTED_LANGS: SUPPORTED_LANGS,
  };
})(window.NeraMap);
