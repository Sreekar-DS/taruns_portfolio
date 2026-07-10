document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("certifications");
  if (!container) return;

  const dataUrl = container.dataset.source;
  const filters = Array.from(document.querySelectorAll(".certification-filter"));

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

  function createCredentialLink(item) {
    if (!item.credential_url) return "";
    return `
      <p>
        <a href="${escapeHtml(item.credential_url)}" target="_blank" rel="noopener">
          View credential →
        </a>
      </p>
    `;
  }

  function createCard(item) {
    return `
      <article class="certification-box" data-skills="${normalizeSkills(item.skills).map(skill => escapeHtml(skill.toLowerCase())).join(" ")}">
        <h3>${escapeHtml(item.title)}</h3>

        <div class="certification-dates">
          <p><strong>Issued date:</strong> ${escapeHtml(item.issue_date || "Not set")}</p>
          <p><strong>Expiration date:</strong> ${escapeHtml(item.expiry_date || "No expiry")}</p>
        </div>

        <div class="certification-org-cred">
          <p><strong>Issued by:</strong> ${escapeHtml(item.issuer || "")}</p>
          <p><strong>Credential ID:</strong> ${escapeHtml(item.credential_id || "Not provided")}</p>
        </div>

        ${createSkillTags(item.skills)}
        ${createCredentialLink(item)}
      </article>
    `;
  }

  function selectedFilterValues() {
    return filters
      .filter(filter => filter.checked)
      .map(filter => filter.value.toLowerCase());
  }

  function render(items) {
    const selected = selectedFilterValues();

    const visibleItems = items
      .filter(item => item.display_on_certifications !== false)
      .filter(item => {
        if (!selected.length) return true;
        const skills = normalizeSkills(item.skills).map(skill => skill.toLowerCase());
        return selected.some(filterValue => skills.some(skill => skill.includes(filterValue) || filterValue.includes(skill)));
      })
      .sort((a, b) => parseDateValue(b.issue_date) - parseDateValue(a.issue_date));

    if (!visibleItems.length) {
      container.innerHTML = "<p>No certifications match the selected filters.</p>";
      return;
    }

    container.innerHTML = visibleItems.map(createCard).join("\n");
  }

  fetch(dataUrl)
    .then(response => {
      if (!response.ok) throw new Error("Could not load certifications data");
      return response.json();
    })
    .then(items => {
      filters.forEach(filter => filter.addEventListener("change", () => render(items)));
      render(items);
    })
    .catch(error => {
      container.innerHTML = "<p>Unable to load certifications right now.</p>";
      console.error(error);
    });
});
