document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const dashboard = document.getElementById("portfolio-dashboard");
  if (!dashboard) return;

  const sources = {
    profile: dashboard.dataset.profileSource,
    links: dashboard.dataset.linksSource,
    publications: dashboard.dataset.publicationsSource,
    experience: dashboard.dataset.experienceSource
  };

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function isVisible(item, key) {
    return !Object.prototype.hasOwnProperty.call(item, key) || item[key] !== false;
  }

  function toList(value) {
    if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
    return String(value || "")
      .split(/[,;|]/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  async function loadJson(url) {
    if (!url) return [];
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Unable to load ${url}`);
    return response.json();
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element && value != null && String(value).trim() !== "") {
      element.textContent = String(value).trim();
    }
  }

  function renderProfile(items) {
    const profile = (Array.isArray(items) ? items : []).find(item => isVisible(item, "display_on_home"));
    if (!profile) return;

    setText("dashboard-name", profile.name);
    setText("dashboard-primary-role", profile.primary_role);
    setText("dashboard-secondary-role", profile.secondary_role);
    setText("dashboard-profile-summary", profile.profile_summary);
    setText("dashboard-opportunity-label", profile.opportunity_label);

    const opportunityRoles = toList(profile.opportunity_roles);
    if (opportunityRoles.length) {
      setText("dashboard-opportunity-roles", opportunityRoles.join(" · "));
    }

    const secondaryRole = document.getElementById("dashboard-secondary-role");
    const separator = document.querySelector(".dashboard-role-separator");
    if (secondaryRole && !String(profile.secondary_role || "").trim()) {
      secondaryRole.hidden = true;
      if (separator) separator.hidden = true;
    }
  }

  function renderLinks(items) {
    const container = document.getElementById("dashboard-actions");
    if (!container) return;

    const links = (Array.isArray(items) ? items : [])
      .filter(item => isVisible(item, "display_on_home") && item.url)
      .sort((a, b) => Number(a.display_order || 999) - Number(b.display_order || 999));

    if (!links.length) return;

    container.innerHTML = links.map(item => {
      const label = escapeHtml(item.label || item.platform || "Link");
      const url = escapeHtml(item.url);
      const external = item.external === true || /^https?:\/\//i.test(String(item.url || ""));
      const target = external ? ' target="_blank" rel="noopener"' : "";
      return `<a href="${url}"${target}>${label}</a>`;
    }).join("");
  }

  function renderExperience(items) {
    const container = document.getElementById("dashboard-experience-list");
    if (!container) return;

    const experiences = (Array.isArray(items) ? items : [])
      .filter(item => isVisible(item, "display_on_experience"))
      .sort((a, b) => Number(a.display_order || 999) - Number(b.display_order || 999))
      .slice(0, 4);

    if (!experiences.length) {
      container.innerHTML = '<p class="dashboard-loading">No experience items are listed.</p>';
      return;
    }

    container.innerHTML = experiences.map((item, index) => {
      const role = escapeHtml(item.role || "Experience");
      const company = escapeHtml(item.company || "");
      const type = escapeHtml(item.experience_type || "");
      const start = escapeHtml(item.start_date || "");
      const end = escapeHtml(item.end_date || item.status || "Present");
      const meta = [company, type].filter(Boolean).join(" · ");
      const dates = [start, end].filter(Boolean).join(" – ");

      return `
        <div class="dashboard-experience-item" style="--experience-index: ${index};">
          <span class="dashboard-experience-dot" aria-hidden="true"></span>
          <div class="dashboard-experience-copy">
            <strong>${role}</strong>
            <span>${meta}</span>
          </div>
          <time>${dates}</time>
        </div>
      `;
    }).join("");
  }

  function formatPublicationDate(value) {
    const text = String(value || "").trim();
    if (!text) return "";

    const iso = new Date(`${text}T00:00:00`);
    if (!Number.isNaN(iso.getTime())) {
      return iso.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
    }
    return text;
  }

  function renderPublications(items) {
    const container = document.getElementById("dashboard-publications");
    if (!container) return;

    const publications = (Array.isArray(items) ? items : [])
      .filter(item => isVisible(item, "display_on_home"))
      .sort((a, b) => Number(a.display_order || 999) - Number(b.display_order || 999));

    if (!publications.length) {
      container.innerHTML = '<p class="dashboard-loading">No publications are listed.</p>';
      return;
    }

    container.innerHTML = publications.map((publication, index) => {
      const title = escapeHtml(publication.title || "Publication");
      const meta = [
        publication.short_description,
        publication.publisher,
        formatPublicationDate(publication.publication_date)
      ].filter(Boolean).map(escapeHtml).join(" · ");
      const url = escapeHtml(publication.publication_url || "");
      const external = /^https?:\/\//i.test(String(publication.publication_url || ""));
      const target = external ? ' target="_blank" rel="noopener"' : "";
      const link = url ? `<a href="${url}"${target}>Read publication</a>` : "";

      return `
        <article class="dashboard-publication-card" style="--publication-index: ${index};">
          <span class="publication-icon" aria-hidden="true">R</span>
          <div class="dashboard-publication-copy">
            <h3>${title}</h3>
            <p>${meta}</p>
            ${link}
          </div>
        </article>
      `;
    }).join("");
  }

  const requests = [
    ["profile", sources.profile],
    ["links", sources.links],
    ["publications", sources.publications],
    ["experience", sources.experience]
  ];

  Promise.allSettled(requests.map(([, url]) => loadJson(url)))
    .then(results => {
      results.forEach((result, index) => {
        const [name] = requests[index];

        if (result.status === "fulfilled") {
          if (name === "profile") renderProfile(result.value);
          if (name === "links") renderLinks(result.value);
          if (name === "publications") renderPublications(result.value);
          if (name === "experience") renderExperience(result.value);
          return;
        }

        console.error(`Portfolio ${name} data error:`, result.reason);

        if (name === "publications") {
          const container = document.getElementById("dashboard-publications");
          if (container) container.innerHTML = '<p class="dashboard-loading">Publications are temporarily unavailable.</p>';
        }

        if (name === "experience") {
          const container = document.getElementById("dashboard-experience-list");
          if (container) container.innerHTML = '<p class="dashboard-loading">Experience data is temporarily unavailable.</p>';
        }
      });
    })
    .catch(error => {
      console.error("Portfolio content rendering error:", error);
    });
});
