document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("projects");
  if (!container) return;

  const dataUrl = container.dataset.source;
  const filters = Array.from(document.querySelectorAll(".project-filter"));

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeTags(value) {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    return String(value || "")
      .split(/[,;|]/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  function assetBase() {
    const urlWithoutQuery = String(dataUrl || "").split("?")[0];
    const assetIndex = urlWithoutQuery.indexOf("/assets/");
    if (assetIndex === -1) return "";
    return urlWithoutQuery.slice(0, assetIndex + "/assets/".length);
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

    if (url.startsWith("/assets/")) {
      const base = assetBase();
      return base ? base + url.replace(/^\/assets\//, "") : url;
    }

    return url;
  }

  function createImage(item) {
    const imageUrl = normalizeImageUrl(item.image_url);
    if (!imageUrl) return "";

    return `
      <div class="project-image-wrap">
        <img class="project-image" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.title)} project image" loading="lazy" onerror="this.closest('.project-image-wrap').style.display='none';">
      </div>
    `;
  }

  function createSkillTags(skills) {
    const tags = normalizeTags(skills);
    if (!tags.length) return "";

    return `
      <div class="project-skills">
        ${tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join("\n")}
      </div>
    `;
  }

  function projectFilterClasses(item) {
    const searchText = [
      item.title,
      item.type,
      item.status,
      normalizeTags(item.skills).join(" "),
      item.short_description,
      item.long_description
    ].join(" ").toLowerCase();

    const classes = [];
    if (searchText.includes("python")) classes.push("python");
    if (searchText.includes("sql") || searchText.includes("mysql") || searchText.includes("postgresql")) classes.push("sql");
    if (searchText.includes("excel") || searchText.includes("spreadsheet")) classes.push("excel");
    if (searchText.includes("tableau")) classes.push("tableau");
    if (searchText.includes("power bi") || searchText.includes("powerbi")) classes.push("powerbi");
    return classes;
  }

  function createProjectLink(item) {
    const link = item.demo_link || item.github_link;
    if (!link) return "";

    return `
      <p class="portfolio-card-link">
        <a href="${escapeHtml(link)}" target="_blank" rel="noopener">Read more →</a>
      </p>
    `;
  }

  function createCard(item) {
    const filterClasses = projectFilterClasses(item).join(" ");

    return `
      <article class="project-box dynamic-project-box ${escapeHtml(filterClasses)}">
        <div class="project-content">
          ${createImage(item)}
          <div class="project-details">
            <h3>${escapeHtml(item.title)}</h3>
            <div class="project-card-meta">
              ${item.type ? `<span>${escapeHtml(item.type)}</span>` : ""}
              ${item.status ? `<span>${escapeHtml(item.status)}</span>` : ""}
            </div>
            <p class="project-description">${escapeHtml(item.short_description || item.long_description || "")}</p>
            ${createSkillTags(item.skills)}
            ${createProjectLink(item)}
          </div>
        </div>
      </article>
    `;
  }

  function applyFilters() {
    const activeFilters = filters
      .filter(filter => filter.checked)
      .map(filter => filter.value);
    const cards = Array.from(container.querySelectorAll(".dynamic-project-box"));

    filters.forEach(filter => {
      const label = filter.closest("label");
      if (label) label.classList.toggle("filter-active", filter.checked);
    });

    cards.forEach(card => {
      const matches = activeFilters.length === 0 || activeFilters.some(filter => card.classList.contains(filter));
      card.hidden = !matches;
    });
  }

  function render(items) {
    const visibleItems = items
      .filter(item => item.display_on_projects !== false)
      .sort((a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999));

    if (!visibleItems.length) {
      container.innerHTML = "<p>No projects are listed yet.</p>";
      return;
    }

    container.innerHTML = visibleItems.map(createCard).join("\n");
    applyFilters();
  }

  filters.forEach(filter => filter.addEventListener("change", applyFilters));

  fetch(dataUrl)
    .then(response => {
      if (!response.ok) throw new Error("Could not load projects data");
      return response.json();
    })
    .then(render)
    .catch(error => {
      container.innerHTML = "<p>Unable to load projects right now.</p>";
      console.error(error);
    });
});
