(() => {
  "use strict";

  const originalFetch = window.fetch.bind(window);
  const inFlight = new Map();
  const diagnostics = [];
  const DATA_PATH_PATTERN = /\/assets\/data\/[^?#]+\.json(?:[?#]|$)/i;
  const REQUEST_TIMEOUT_MS = 5000;
  const RETRY_DELAY_MS = 350;
  const MAX_ATTEMPTS = 2;

  function isPortfolioDataRequest(input) {
    const value = typeof input === "string" ? input : input && input.url;
    return Boolean(value && DATA_PATH_PATTERN.test(String(value)));
  }

  function canonicalUrl(input) {
    const value = typeof input === "string" ? input : input.url;
    return new URL(value, document.baseURI).href;
  }

  function storageKey(url) {
    const parsed = new URL(url, document.baseURI);
    return `portfolio-data-cache:${parsed.pathname}`;
  }

  function readCachedJson(url) {
    try {
      const value = window.localStorage.getItem(storageKey(url));
      if (!value) return null;
      JSON.parse(value);
      return value;
    } catch (error) {
      console.warn("Portfolio data cache read failed:", error);
      return null;
    }
  }

  function writeCachedJson(url, text) {
    try {
      JSON.parse(text);
      window.localStorage.setItem(storageKey(url), text);
    } catch (error) {
      console.warn("Portfolio data cache write skipped:", error);
    }
  }

  function wait(milliseconds) {
    return new Promise(resolve => window.setTimeout(resolve, milliseconds));
  }

  async function fetchWithTimeout(input, init, timeoutMs) {
    if (typeof AbortController === "undefined") {
      return originalFetch(input, init);
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await originalFetch(input, { ...init, signal: controller.signal });
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  function emitDiagnostic(level, url, message, usedCache) {
    const detail = { level, url, message, usedCache: Boolean(usedCache), timestamp: Date.now() };
    diagnostics.push(detail);
    window.dispatchEvent(new CustomEvent("portfolio-data-diagnostic", { detail }));

    const warning = document.getElementById("dashboard-error");
    if (warning) {
      warning.hidden = false;
      warning.textContent = usedCache
        ? "Some portfolio data could not be refreshed. Showing the most recent saved data for the affected section."
        : "Some portfolio data could not be loaded. The available sections are still shown below.";
    }
  }

  async function loadPortfolioResponse(input, init = {}) {
    const url = canonicalUrl(input);
    let lastError = null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      try {
        const response = await fetchWithTimeout(
          input,
          { ...init, cache: attempt === 0 ? "default" : "reload" },
          REQUEST_TIMEOUT_MS
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} while loading ${url}`);
        }

        const text = await response.clone().text();
        JSON.parse(text);
        writeCachedJson(url, text);
        return response;
      } catch (error) {
        lastError = error;
        if (attempt < MAX_ATTEMPTS - 1) await wait(RETRY_DELAY_MS);
      }
    }

    const cached = readCachedJson(url);
    if (cached !== null) {
      emitDiagnostic("warning", url, String(lastError || "Network request failed"), true);
      return new Response(cached, {
        status: 200,
        headers: { "Content-Type": "application/json", "X-Portfolio-Data-Source": "cache" }
      });
    }

    emitDiagnostic("error", url, String(lastError || "Network request failed"), false);
    return new Response("[]", {
      status: 200,
      headers: { "Content-Type": "application/json", "X-Portfolio-Data-Source": "empty-fallback" }
    });
  }

  window.fetch = function portfolioAwareFetch(input, init = {}) {
    if (!isPortfolioDataRequest(input)) return originalFetch(input, init);

    const key = canonicalUrl(input);
    if (!inFlight.has(key)) {
      inFlight.set(key, loadPortfolioResponse(input, init));
    }

    return inFlight.get(key).then(response => response.clone());
  };

  window.PortfolioDataDiagnostics = {
    getEntries: () => diagnostics.slice(),
    clear: () => { diagnostics.length = 0; }
  };

  document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(() => {
      document.querySelectorAll(".dashboard-loading").forEach(element => {
        if (/^loading\b/i.test(element.textContent.trim())) {
          element.textContent = "Data temporarily unavailable. Refresh to try again.";
        }
      });
    }, 12000);
  }, { once: true });
})();
