window.NeraMap = window.NeraMap || {};

(function (ns) {
  "use strict";

  const SOURCE_LOCALE = "fr";
  const ENDPOINT = window.NERALA_TRANSLATION_ENDPOINT || null;
  const CACHE_KEY = "nerala-translations";
  const cache = readCache();
  let locale = detectLocale();

  function detectLocale() {
    const languages = navigator.languages || [navigator.language || SOURCE_LOCALE];
    const preferred = languages.find(Boolean) || SOURCE_LOCALE;
    return preferred.toLowerCase().split("-")[0] || SOURCE_LOCALE;
  }

  function readCache() {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    } catch (error) {
      return {};
    }
  }

  function saveCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      // Caching is optional; translation failures are handled by the caller.
    }
  }

  function cacheKey(text) {
    return locale + ":" + text;
  }

  async function translate(text) {
    if (!text || locale === SOURCE_LOCALE) return text;
    const key = cacheKey(text);
    if (cache[key]) return cache[key];

    const response = ENDPOINT
      ? await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: text,
            source: SOURCE_LOCALE,
            target: locale,
            format: "text",
          }),
        })
      : await fetch(
          "https://api.mymemory.translated.net/get?q=" +
            encodeURIComponent(text) +
            "&langpair=" +
            SOURCE_LOCALE +
            "%7C" +
            encodeURIComponent(locale),
        );

    if (!response.ok) {
      throw new Error("Translation service returned " + response.status);
    }
    const result = await response.json();
    const translatedText = ENDPOINT
      ? result.translatedText
      : result.responseData && result.responseData.translatedText;
    if (!translatedText) {
      throw new Error("Translation service returned no translated text");
    }

    cache[key] = translatedText;
    saveCache();
    return translatedText;
  }

  async function translateAll(texts) {
    const unique = Array.from(new Set(texts.filter(Boolean)));
    const results = await Promise.all(
      unique.map(async function (text) {
        try {
          return [text, await translate(text)];
        } catch (error) {
          console.warn("NeraMap translation unavailable:", error.message);
          return [text, text];
        }
      }),
    );
    return Object.fromEntries(results);
  }

  function getLocale() {
    return locale;
  }

  ns.Translation = {
    getLocale: getLocale,
    translate: translate,
    translateAll: translateAll,
    isTranslated: function () {
      return locale !== SOURCE_LOCALE;
    },
  };
})(window.NeraMap);
