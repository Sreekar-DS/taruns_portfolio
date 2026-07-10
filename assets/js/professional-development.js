document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("professional-development");
  const skillsFilterBox = document.getElementById("skills-filter-box");
  if (!container) return;

  const dataUrl = container.dataset.source;
  const typeFilters = Array.from(document.querySelectorAll(".professional-filter"));

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeSkills(skills) {
    if (Array.isArray(skills)) return skills.filter(Boolean).map(String);
    return String(skills || "")
      .split(/[,;|]/)
      .map(skill => skill.trim())
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

    const dayMonthYear = text.match(/^(\d{1,2})[-\s]([A-Za-z]{3,})[-\s](\d{2,4})$/);
    if (dayMonthYear) {
      const year = Number(dayMonthYear[3].length === 2 ? `20${dayMonthYear[3]}` : dayMonthYear[3]);
      return new Date(`${dayMonthYear[2]} ${dayMonthYear[1]}, ${year}`).getTime() || 0;
    }

    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  }

  function createSkillTags(skills) {
    const skillList = normalizeSkills(skills);
    if (!skillList.length) return "";

    return `
      <div class="project-skills">
        ${skillList.map(skill => `<span>${escapeHtml(skill)}</span>`).join("\n")}
      </div>
    `;
  }

  function createCertificateLink(item) {
    if (!item.certificate_link) return "";

    return `
      <p>
        <a href="${escapeHtml(item.certificate_link)}" target="_blank" rel="noopener">
          View certificate →
        </a>
      </p>
    `;
  }

  function createCard(item) {
    return `
      <article class="certification-box ${escapeHtml(slug(item.type))}">
        <h3>${escapeHtml(item.title)}</h3>

        <div class="course-org-date">
          <p><strong>Provider:</strong> ${escapeHtml(item.provider || "")}</p>
          <p><strong>Type:</strong> ${escapeHtml(item.type || "")}</p>
          <p><strong>Status:</strong> ${escapeHtml(item.status || "")}</p>
          <p><strong>Completed:</strong> ${escapeHtml(item.completion_date || "Not set")}</p>
        </div>

        ${item.short_description ? `<p>${escapeHtml(item.short_description)}</p>` : ""}
        ${createSkillTags(item.skills)}
        ${createCertificateLink(item)}
      </article>
    `;
  }

  function buildSkillFilters(items) {
    const skills = new Set();

    items.forEach(item => {
      normalizeSkills(item.skills).forEach(skill => skills.add(skill));
    });

    if (!skills.size || !skillsFilterBox) return;

    skillsFilterBox.innerHTML = Array.from(skills)
      .sort((a, b) => a.localeCompare(b))
      .map(skill => `
        <label>
          <input type="checkbox" name="skill-filter" class="skill-filter" value="${escapeHtml(skill.toLowerCase())}">
          ${escapeHtml(skill)}
        </label>
      `)
      .join("\n");
  }

  function selectedTypeFilter() {
    const checked = typeFilters.find(filter => filter.checked);
    return checked ? checked.value : "all";
  }

  function selectedSkillFilters() {
    return Array.from(document.querySelectorAll(".skill-filter:checked"))
      .map(input => input.value.toLowerCase());
  }

  function render(items) {
    const selectedType = selectedTypeFilter();
    const selectedSkills = selectedSkillFilters();

    const visibleItems = items
      .filter(item => item.display_on_professional_development !== false)
      .filter(item => selectedType === "all" || slug(item.type) === selectedType)
      .filter(item => {
        if (!selectedSkills.length) return true;
        const skills = normalizeSkills(item.skills).map(skill => skill.toLowerCase());
        return selectedSkills.every(filterValue => skills.some(skill => skill.includes(filterValue) || filterValue.includes(skill)));
      })
      .sort((a, b) => parseDateValue(b.completion_date || b.start_date) - parseDateValue(a.completion_date || a.start_date));

    if (!visibleItems.length) {
      container.innerHTML = "<p>No professional development courses match the selected filters.</p>";
      return;
    }

    container.innerHTML = visibleItems.map(createCard).join("\n");
  }

  fetch(dataUrl)
    .then(response => {
      if (!response.ok) throw new Error("Could not load professional development data");
      return response.json();
    })
    .then(items => {
      buildSkillFilters(items);

      typeFilters.forEach(filter => filter.addEventListener("change", () => render(items)));
      document.querySelectorAll(".skill-filter").forEach(filter => filter.addEventListener("change", () => render(items)));

      render(items);
    })
    .catch(error => {
      container.innerHTML = "<p>Unable to load professional development courses right now.</p>";
      console.error(error);
    });
});
