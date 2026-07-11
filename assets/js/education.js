document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("education");
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

  function createCard(item) {
    const period = [item.start_date, item.end_date].filter(Boolean).join(" – ");
    const degreeTitle = [item.degree, item.field_of_study ? `in ${item.field_of_study}` : ""]
      .filter(Boolean)
      .join(" ");

    return `
      <article class="portfolio-card education-card resume-entry-card">
        <div class="portfolio-card-body resume-entry-body">
          <div class="resume-entry-line resume-entry-primary-line">
            <h3>${escapeHtml(degreeTitle || "Education")}</h3>
            <span class="resume-entry-location">${escapeHtml(item.location || "")}</span>
          </div>
          <div class="resume-entry-line resume-entry-secondary-line">
            <span class="resume-entry-organization">${escapeHtml(item.institution || "")}</span>
            <span class="resume-entry-period">${escapeHtml(period || "")}</span>
          </div>
          ${item.details ? `<p class="resume-entry-summary">${escapeHtml(item.details)}</p>` : ""}
        </div>
      </article>
    `;
  }

  function render(items) {
    const visibleItems = items
      .filter(item => item.display_on_education !== false)
      .sort((a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999));

    if (!visibleItems.length) {
      container.innerHTML = "<p>No education entries are listed yet.</p>";
      return;
    }

    container.innerHTML = visibleItems.map(createCard).join("\n");
  }

  fetch(dataUrl)
    .then(response => {
      if (!response.ok) throw new Error("Could not load education data");
      return response.json();
    })
    .then(render)
    .catch(error => {
      container.innerHTML = "<p>Unable to load education right now.</p>";
      console.error(error);
    });
});
