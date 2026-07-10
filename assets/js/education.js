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
        <img class="portfolio-card-image" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.institution)} education image" loading="lazy" onerror="this.closest('.portfolio-card-image-wrap').style.display='none';">
      </div>
    `;
  }

  function createCard(item) {
    const period = [item.start_date, item.end_date].filter(Boolean).join(" – ");

    return `
      <article class="portfolio-card education-card">
        ${createImage(item)}
        <div class="portfolio-card-body">
          <h3>${escapeHtml(item.degree)}</h3>
          <div class="portfolio-card-meta">
            <p><strong>Field:</strong> ${escapeHtml(item.field_of_study || "")}</p>
            <p><strong>Institution:</strong> ${escapeHtml(item.institution || "")}</p>
            <p><strong>Location:</strong> ${escapeHtml(item.location || "")}</p>
            <p><strong>Period:</strong> ${escapeHtml(period || "Not set")}</p>
            <p><strong>Status:</strong> ${escapeHtml(item.status || "")}</p>
          </div>
          ${item.details ? `<p>${escapeHtml(item.details)}</p>` : ""}
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
