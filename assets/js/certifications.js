document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("certifications");
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

  function parseDateValue(value) {
    if (!value) return 0;

    const text = String(value).trim();
    const iso = text.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/);
    if (iso) {
      return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3] || 1)).getTime();
    }

    const monthYearNumeric = text.match(/^(\d{1,2})[-/](\d{4})$/);
    if (monthYearNumeric) {
      return new Date(Number(monthYearNumeric[2]), Number(monthYearNumeric[1]) - 1, 1).getTime();
    }

    const monthYearText = text.match(/^([A-Za-z]{3,})\s+(\d{4})$/);
    if (monthYearText) {
      const parsed = new Date(`${monthYearText[1]} 1, ${monthYearText[2]}`);
      return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
    }

    const dayMonthYear = text.match(/^(\d{1,2})[-\s]([A-Za-z]{3,})[-\s](\d{2,4})$/);
    if (dayMonthYear) {
      const year = Number(dayMonthYear[3].length === 2 ? `20${dayMonthYear[3]}` : dayMonthYear[3]);
      const parsed = new Date(`${dayMonthYear[2]} ${dayMonthYear[1]}, ${year}`);
      return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
    }

    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  }

  function createImage(item) {
    if (!item.image_url) return "";

    return `
      <div class="portfolio-card-image-wrap">
        <img class="portfolio-card-image" src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.title)} certificate image">
      </div>
    `;
  }

  function createCredentialLink(item) {
    if (!item.credential_url) return "";

    return `
      <p class="portfolio-card-link">
        <a href="${escapeHtml(item.credential_url)}" target="_blank" rel="noopener">
          View credential →
        </a>
      </p>
    `;
  }

  function createCard(item) {
    return `
      <article class="certification-box portfolio-card">
        ${createImage(item)}

        <div class="portfolio-card-body">
          <h3>${escapeHtml(item.title)}</h3>

          <div class="certification-dates portfolio-card-meta">
            <p><strong>Issued:</strong> ${escapeHtml(item.issue_date || "Not set")}</p>
            <p><strong>Expiry:</strong> ${escapeHtml(item.expiry_date || "No expiry")}</p>
          </div>

          <div class="certification-org-cred portfolio-card-meta">
            <p><strong>Issued by:</strong> ${escapeHtml(item.issuer || "")}</p>
            <p><strong>Credential ID:</strong> ${escapeHtml(item.credential_id || "Not provided")}</p>
          </div>

          ${createCredentialLink(item)}
        </div>
      </article>
    `;
  }

  function render(items) {
    const visibleItems = items
      .filter(item => item.display_on_certifications !== false)
      .sort((a, b) => parseDateValue(b.issue_date) - parseDateValue(a.issue_date));

    if (!visibleItems.length) {
      container.innerHTML = "<p>No certifications are listed yet.</p>";
      return;
    }

    container.innerHTML = visibleItems.map(createCard).join("\n");
  }

  fetch(dataUrl)
    .then(response => {
      if (!response.ok) throw new Error("Could not load certifications data");
      return response.json();
    })
    .then(render)
    .catch(error => {
      container.innerHTML = "<p>Unable to load certifications right now.</p>";
      console.error(error);
    });
});
