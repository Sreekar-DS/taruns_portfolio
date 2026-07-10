document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("currently-working-on");
  if (!container) return;

  const dataUrl = container.dataset.source;
  if (!dataUrl) {
    container.innerHTML = '<p class="home-loading-message">Current work data source is missing.</p>';
    return;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(value) {
    if (!value) return "Not set";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return escapeHtml(value);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function normalizeSkills(skills) {
    if (Array.isArray(skills)) return skills.filter(Boolean);
    if (typeof skills === "string") {
      return skills
        .split(/[,;|]/)
        .map(skill => skill.trim())
        .filter(Boolean);
    }
    return [];
  }

  function createSkillTags(skills) {
    const skillList = normalizeSkills(skills);
    if (!skillList.length) return "";

    return `
      <div class="home-work-skills" aria-label="Skills used">
        ${skillList.map(skill => `<span>${escapeHtml(skill)}</span>`).join("\n")}
      </div>
    `;
  }

  function createProjectLinks(item) {
    const links = [];

    if (item.github_link) {
      links.push(`<a href="${escapeHtml(item.github_link)}" target="_blank" rel="noopener">GitHub</a>`);
    }

    if (item.demo_link) {
      links.push(`<a href="${escapeHtml(item.demo_link)}" target="_blank" rel="noopener">Demo</a>`);
    }

    return links.length ? `<div class="home-work-links">${links.join("\n")}</div>` : "";
  }

  function createCard(item) {
    const progress = Math.max(0, Math.min(100, Number(item.progress || 0)));

    return `
      <article class="home-work-card">
        <div class="home-work-card-header">
          <span class="home-work-type">${escapeHtml(item.type || "Project")}</span>
          <span class="home-work-status">${escapeHtml(item.status || "In Progress")}</span>
        </div>

        <h3>${escapeHtml(item.title)}</h3>
        <p class="home-work-description">${escapeHtml(item.short_description || "")}</p>

        <div class="home-work-meta">
          <p><strong>Expected finish:</strong> ${formatDate(item.expected_finish_date)}</p>
          <p><strong>Priority:</strong> ${escapeHtml(item.priority || "Not set")}</p>
        </div>

        <div class="home-work-progress-label">
          <span>Progress</span>
          <span>${progress}%</span>
        </div>
        <div class="home-work-progress-bar" aria-label="Progress ${progress}%">
          <div style="width: ${progress}%"></div>
        </div>

        ${createSkillTags(item.skills)}
        ${createProjectLinks(item)}
      </article>
    `;
  }

  fetch(dataUrl)
    .then(response => {
      if (!response.ok) throw new Error("Could not load current work data");
      return response.json();
    })
    .then(items => {
      const visibleItems = items
        .filter(item => item.display_on_home !== false)
        .sort((a, b) => (a.display_order || 999) - (b.display_order || 999));

      if (!visibleItems.length) {
        container.innerHTML = '<p class="home-loading-message">No current work items are listed yet.</p>';
        return;
      }

      container.innerHTML = visibleItems.map(createCard).join("\n");
    })
    .catch(error => {
      container.innerHTML = '<p class="home-loading-message">Unable to load current work right now.</p>';
      console.error(error);
    });
});
