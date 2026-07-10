document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("professional-development");
  if (!container) return;

  const dataUrl = container.dataset.source;
  const typeFilters = Array.from(document.querySelectorAll(".professional-filter"));

  const canonicalCareerTracks = [
    "Data Analyst Career Track",
    "Business Analyst Career Track"
  ];

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

    const text = String(value).trim().replace(/^[-/\s]+/, "");
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

  function createSkillTags(skills) {
    const skillList = normalizeSkills(skills);
    if (!skillList.length) return "";

    return `
      <div class="project-skills">
        ${skillList.map(skill => `<span>${escapeHtml(skill)}</span>`).join("\n")}
      </div>
    `;
  }

  function createImage(item) {
    if (!item.image_url) return "";

    return `
      <div class="portfolio-card-image-wrap">
        <img class="portfolio-card-image" src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.title)} course image">
      </div>
    `;
  }

  function createCertificateLink(item) {
    if (!item.certificate_link) return "";

    return `
      <p class="portfolio-card-link">
        <a href="${escapeHtml(item.certificate_link)}" target="_blank" rel="noopener">
          View certificate →
        </a>
      </p>
    `;
  }

  function createCard(item) {
    return `
      <article class="certification-box portfolio-card ${escapeHtml(slug(item.type))}">
        ${createImage(item)}

        <div class="portfolio-card-body">
          <h3>${escapeHtml(item.title)}</h3>

          <div class="course-org-date portfolio-card-meta">
            <p><strong>Provider:</strong> ${escapeHtml(item.provider || "")}</p>
            <p><strong>Type:</strong> ${escapeHtml(item.type || "")}</p>
            <p><strong>Status:</strong> ${escapeHtml(item.status || "")}</p>
            <p><strong>Completed:</strong> ${escapeHtml(item.completion_date || "Not set")}</p>
          </div>

          ${item.short_description ? `<p>${escapeHtml(item.short_description)}</p>` : ""}
          ${createSkillTags(item.skills)}
          ${createCertificateLink(item)}
        </div>
      </article>
    `;
  }

  function sortByDateDesc(items) {
    return items.slice().sort((a, b) => parseDateValue(b.completion_date || b.start_date) - parseDateValue(a.completion_date || a.start_date));
  }

  function selectedTypeFilter() {
    const checked = typeFilters.find(filter => filter.checked);
    return checked ? checked.value : "all";
  }

  function getCareerTrackNames(item) {
    const trackText = String(item.career_track_name || item.short_description || "").toLowerCase();
    const matchedTracks = [];

    if (trackText.includes("data analyst")) matchedTracks.push("Data Analyst Career Track");
    if (trackText.includes("business analyst")) matchedTracks.push("Business Analyst Career Track");

    if (matchedTracks.length) return matchedTracks;

    return ["Other Career Track Courses"];
  }

  function groupCareerTrackCourses(items) {
    return items.reduce((groups, item) => {
      getCareerTrackNames(item).forEach(trackName => {
        if (!groups[trackName]) groups[trackName] = [];

        const alreadyAdded = groups[trackName].some(course => course.title === item.title && course.provider === item.provider);
        if (!alreadyAdded) groups[trackName].push(item);
      });

      return groups;
    }, {});
  }

  function orderedCareerTrackEntries(groups) {
    const ordered = [];

    canonicalCareerTracks.forEach(trackName => {
      if (groups[trackName] && groups[trackName].length) ordered.push([trackName, groups[trackName]]);
    });

    Object.entries(groups)
      .filter(([trackName]) => !canonicalCareerTracks.includes(trackName))
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(entry => ordered.push(entry));

    return ordered;
  }

  function createDetailsGroup(title, items, options = {}) {
    if (!items.length) return "";

    const sortedItems = sortByDateDesc(items);
    const open = options.open ? "open" : "";

    return `
      <details class="career-track-group" ${open}>
        <summary>
          <span>${escapeHtml(title)}</span>
          <small>${sortedItems.length} course${sortedItems.length === 1 ? "" : "s"}</small>
        </summary>
        <div class="portfolio-card-grid professional-course-grid">
          ${sortedItems.map(createCard).join("\n")}
        </div>
      </details>
    `;
  }

  function createCareerTrackGroups(items) {
    if (!items.length) return "";

    const groups = groupCareerTrackCourses(sortByDateDesc(items));
    const entries = orderedCareerTrackEntries(groups);

    return `
      <div class="career-track-groups">
        ${entries.map(([trackName, courses], index) => createDetailsGroup(trackName, courses, { open: index === 0 })).join("\n")}
      </div>
    `;
  }

  function render(items) {
    const selectedType = selectedTypeFilter();
    const visibleItems = items.filter(item => item.display_on_professional_development !== false);

    const careerTrackCourses = visibleItems.filter(item => slug(item.type) === "career-track-course");
    const independentCourses = visibleItems.filter(item => slug(item.type) === "independent-course");

    let html = "";

    if (selectedType === "all" || selectedType === "career-track-course") {
      html += createCareerTrackGroups(careerTrackCourses);
    }

    if (selectedType === "all" || selectedType === "independent-course") {
      html += `
        <div class="career-track-groups">
          ${createDetailsGroup("Independent Courses", independentCourses, { open: selectedType === "independent-course" })}
        </div>
      `;
    }

    if (!html.trim()) {
      container.innerHTML = "<p>No professional development courses match the selected filter.</p>";
      return;
    }

    container.innerHTML = html;
  }

  fetch(dataUrl)
    .then(response => {
      if (!response.ok) throw new Error("Could not load professional development data");
      return response.json();
    })
    .then(items => {
      typeFilters.forEach(filter => filter.addEventListener("change", () => render(items)));
      render(items);
    })
    .catch(error => {
      container.innerHTML = "<p>Unable to load professional development courses right now.</p>";
      console.error(error);
    });
});
