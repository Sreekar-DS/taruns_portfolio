(() => {
  "use strict";

  const requestCache = new Map();
  const REQUEST_TIMEOUT_MS = 8000;
  const MAX_ATTEMPTS = 2;
  const RETRY_DELAY_MS = 300;

  function canonicalUrl(url) {
    return new URL(String(url || ""), document.baseURI).href;
  }

  function wait(milliseconds) {
    return new Promise(resolve => window.setTimeout(resolve, milliseconds));
  }

  async function fetchJson(url, cacheMode) {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = controller
      ? window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      : null;

    try {
      const response = await window.fetch(url, {
        cache: cacheMode,
        headers: { Accept: "application/json" },
        ...(controller ? { signal: controller.signal } : {})
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} while loading ${url}`);
      }

      return await response.json();
    } finally {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    }
  }

  async function loadWithRetry(url) {
    let lastError = null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      try {
        return await fetchJson(url, attempt === 0 ? "default" : "reload");
      } catch (error) {
        lastError = error;
        if (attempt < MAX_ATTEMPTS - 1) await wait(RETRY_DELAY_MS);
      }
    }

    throw lastError || new Error(`Unable to load ${url}`);
  }

  function load(url) {
    if (!url) return Promise.reject(new Error("Portfolio data source URL is missing."));

    const key = canonicalUrl(url);
    if (!requestCache.has(key)) {
      const request = loadWithRetry(key).catch(error => {
        requestCache.delete(key);
        throw error;
      });
      requestCache.set(key, request);
    }

    return requestCache.get(key);
  }

  function clear() {
    requestCache.clear();
  }

  window.PortfolioData = Object.freeze({ load, clear });
})();
