document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("projects");
  const filterBox = document.getElementById("project-skill-filters");
  if (!container) return;

  const dataUrl = container.dataset.source;
  let filters = [];

  const curatedSkillFilters = [
    { key: "sql", label: "SQL", aliases: ["sql"] },
    { key: "python", label: "Python", aliases: ["python"] },
    { key: "excel", label: "Excel", aliases: ["excel", "microsoft-excel"] },
    { key: "tableau", label: "Tableau", aliases: ["tableau"] },
    { key: "power-bi", label: "Power BI", aliases: ["power-bi", "powerbi"] },
    { key: "looker-studio", label: "Looker Studio", aliases: ["looker-studio", "google-looker-studio"] },
    { key: "google-sheets", label: "Google Sheets", aliases: ["google-sheets", "google-spreadsheets"] },
    { key: "bigquery", label: "BigQuery", aliases: ["bigquery", "google-bigquery"] },
    { key: "postgresql", label: "PostgreSQL", aliases: ["postgresql"] },
    { key: "mysql", label: "MySQL", aliases: ["mysql"] }
  ];

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

  function slug(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
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

  function normalizedSkillSlugs(item) {
    return new Set(normalizeTags(item.skills).map(slug).filter(Boolean));
  }

  function projectFilterKeys(item) {
    const skillSlugs = normalizedSkillSlugs(item);

    return curatedSkillFilters
      .filter(filter => filter.aliases.some(alias => skillSlugs.has(alias)))
      .map(filter => filter.key);
  }

  function buildSkillFilterOptions(items) {
    const availableKeys = new Set();

    items.forEach(item => {
      projectFilterKeys(item).forEach(key => availableKeys.add(key));
    });

    return curatedSkillFilters.filter(filter => availableKeys.has(filter.key));
  }

  function renderSkillFilters(items) {
    if (!filterBox) return;

    const skillFilters = buildSkillFilterOptions(items);
    if (!skillFilters.length) {
      filterBox.hidden = true;
      filters = [];
      return;
    }

    filterBox.hidden = false;
    filterBox.innerHTML = skillFilters.map(filter => `
      <label>
        <input type="checkbox" class="filter project-filter" value="${escapeHtml(filter.key)}">
        ${escapeHtml(filter.label)}
      </label>
    `).join("\n");

    filters = Array.from(filterBox.querySelectorAll(".project-filter"));
    filters.forEach(filter => filter.addEventListener("change", applyFilters));
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
    const filterKeys = projectFilterKeys(item);
    const description = item.long_description || item.short_description || "";

    return `
      <article class="project-box dynamic-project-box" data-filter-keys="${escapeHtml(filterKeys.join("|"))}">
        <div class="project-content">
          ${createImage(item)}
          <div class="project-details">
            <h3>${escapeHtml(item.title)}</h3>
            <div class="project-card-meta">
              ${item.type ? `<span>${escapeHtml(item.type)}</span>` : ""}
              ${item.status ? `<span>${escapeHtml(item.status)}</span>` : ""}
            </div>
            <p class="project-description">${escapeHtml(description)}</p>
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
      const filterKeys = String(card.dataset.filterKeys || "")
        .split("|")
        .filter(Boolean);

      const matchesAllSelectedSkills = activeFilters.length === 0
        || activeFilters.every(filter => filterKeys.includes(filter));

      card.hidden = !matchesAllSelectedSkills;
    });
  }

  function render(items) {
    const visibleItems = items
      .filter(item => item.display_on_projects !== false)
      .sort((a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999));

    if (!visibleItems.length) {
      if (filterBox) filterBox.hidden = true;
      container.innerHTML = "<p>No projects are listed yet.</p>";
      return;
    }

    renderSkillFilters(visibleItems);
    container.innerHTML = visibleItems.map(createCard).join("\n");
    applyFilters();
  }

  fetch(dataUrl)
    .then(response => {
      if (!response.ok) throw new Error("Could not load projects data");
      return response.json();
    })
    .then(render)
    .catch(error => {
      if (filterBox) filterBox.hidden = true;
      container.innerHTML = "<p>Unable to load projects right now.</p>";
      console.error(error);
    });
});