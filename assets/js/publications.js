document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const page = document.getElementById("publications-page");
  const container = document.getElementById("publications-list");
  if (!page || !container) return;

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function isVisible(item) {
    return !Object.prototype.hasOwnProperty.call(item, "display_on_publications") || item.display_on_publications !== false;
  }

  function formatDate(value) {
    const text = String(value || "").trim();
    if (!text) return "";

    const date = new Date(`${text}T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    }
    return text;
  }

  fetch(page.dataset.source)
    .then(response => {
      if (!response.ok) throw new Error(`Unable to load ${page.dataset.source}`);
      return response.json();
    })
    .then(items => {
      const publications = (Array.isArray(items) ? items : [])
        .filter(isVisible)
        .sort((a, b) => Number(a.display_order || 999) - Number(b.display_order || 999));

      if (!publications.length) {
        container.innerHTML = "<p>No publications are listed yet.</p>";
        return;
      }

      container.innerHTML = publications.map(item => {
        const title = escapeHtml(item.title || "Publication");
        const publisher = escapeHtml(item.publisher || "");
        const date = escapeHtml(formatDate(item.publication_date));
        const description = escapeHtml(item.short_description || "");
        const meta = [publisher, date].filter(Boolean).join(" · ");
        const link = item.publication_url
          ? `<a href="${escapeHtml(item.publication_url)}" target="_blank" rel="noopener">Read publication</a>`
          : "";

        return `
          <article class="portfolio-card">
            <h3>${title}</h3>
            ${meta ? `<p><strong>${meta}</strong></p>` : ""}
            ${description ? `<p>${description}</p>` : ""}
            ${link}
          </article>
        `;
      }).join("");
    })
    .catch(error => {
      container.innerHTML = "<p>Publication data could not be loaded.</p>";
      console.error("Publication data error:", error);
    });
});
