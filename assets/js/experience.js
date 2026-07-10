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

  function normalizeImageUrl(value) {
    const url = String(value || "").trim();
    if (!url) return "";

    const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
    if (driveFileMatch) return `https://drive.google.com/thumbnail?id=${driveFileMatch[1]}&sz=w1000`;

    const driveOpenMatch = url.match(/drive\.google\.com\/open\?id=([^&#]+)/);
    if (driveOpenMatch) return `https://drive.google.com/thumbnail?id=${driveOpenMatch[1]}&sz=w1000`;

    const driveUcMatch = url.match(/drive\.google\.com\/uc\?(?:export=view&)?id=([^&#]+)/);
    if (driveUcMatch) return `https://drive.google.com/thumbnail?id=${driveUcMatch[1]}&sz=w1000`;

    return url;
  }

  function createImage(item) {
    const imageUrl = normalizeImageUrl(item.image_url);
    if (!imageUrl) return "";

    return `
      <div class="portfolio-card-image-wrap">
        <img class="portfolio-card-image" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.company)} experience image" loading="lazy" onerror="this.closest('.portfolio-card-image-wrap').style.display='none';">
      </div>
    `;
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

    return `
      <article class="portfolio-card experience-card">
        ${createImage(item)}
        <div class="portfolio-card-body">
          <h3>${escapeHtml(item.role)}</h3>
          <div class="portfolio-card-meta">
            <p><strong>Company:</strong> ${escapeHtml(item.company)}</p>
            <p><strong>Type:</strong> ${escapeHtml(item.experience_type || item.status || "")}</p>
            <p><strong>Location:</strong> ${escapeHtml(item.location || "")}</p>
            <p><strong>Period:</strong> ${escapeHtml(period || "Not set")}</p>
          </div>
          ${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ""}
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
