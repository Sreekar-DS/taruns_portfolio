document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("experience");
  if (!container) return;

  const dataUrl = container.dataset.source;

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeList(value) {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    return String(value || "")
      .split(/[|;]/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  function normalizeTags(value) {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    return String(value || "")
      .split(/[,;|]/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  function createTags(items) {
    const tags = normalizeTags(items);
    if (!tags.length) return "";

    return `
      <div class="project-skills">
        ${tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join("\n")}
      </div>
    `;
  }

  function createHighlights(item) {
    const highlights = normalizeList(item.highlights);
    if (!highlights.length) return "";

    return `
      <ul class="portfolio-card-list">
        ${highlights.map(highlight => `<li>${escapeHtml(highlight)}</li>`).join("\n")}
      </ul>
    `;
  }

  function createProjectLink(item) {
    if (!item.project_link) return "";

    return `
      <p class="portfolio-card-link">
        <a href="${escapeHtml(item.project_link)}" target="_blank" rel="noopener">View project →</a>
      </p>
    `;
  }

  function createCard(item) {
    const period = [item.start_date, item.end_date].filter(Boolean).join(" – ");
    const organization = [item.company, item.experience_type || item.status]
      .filter(Boolean)
      .join(" · ");

    return `
      <article class="portfolio-card experience-card resume-entry-card">
        <div class="portfolio-card-body resume-entry-body">
          <div class="resume-entry-line resume-entry-primary-line">
            <h3>${escapeHtml(item.role || "Experience")}</h3>
            <span class="resume-entry-location">${escapeHtml(item.location || "")}</span>
          </div>
          <div class="resume-entry-line resume-entry-secondary-line">
            <span class="resume-entry-organization">${escapeHtml(organization)}</span>
            <span class="resume-entry-period">${escapeHtml(period || "")}</span>
          </div>
          ${item.summary ? `<p class="resume-entry-summary">${escapeHtml(item.summary)}</p>` : ""}
          ${createHighlights(item)}
          ${createTags(item.tools)}
          ${createProjectLink(item)}
        </div>
      </article>
    `;
  }

  function render(items) {
    const visibleItems = items
      .filter(item => item.display_on_experience !== false)
      .sort((a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999));

    if (!visibleItems.length) {
      container.innerHTML = "<p>No experience entries are listed yet.</p>";
      return;
    }

    container.innerHTML = visibleItems.map(createCard).join("\n");
  }

  fetch(dataUrl)
    .then(response => {
      if (!response.ok) throw new Error("Could not load experience data");
      return response.json();
    })
    .then(render)
    .catch(error => {
      container.innerHTML = "<p>Unable to load experience right now.</p>";
      console.error(error);
    });
});
