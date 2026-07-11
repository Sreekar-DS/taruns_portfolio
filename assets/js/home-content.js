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

  function renderPublication(items) {
    const publication = (Array.isArray(items) ? items : [])
      .filter(item => isVisible(item, "display_on_home"))
      .sort((a, b) => Number(a.display_order || 999) - Number(b.display_order || 999))[0];

    if (!publication) return;

    setText("dashboard-publication-title", publication.title);

    const meta = [
      publication.short_description,
      publication.publisher,
      formatPublicationDate(publication.publication_date)
    ].filter(Boolean).join(" · ");
    setText("dashboard-publication-meta", meta);

    const link = document.getElementById("dashboard-publication-link");
    if (link && publication.publication_url) {
      link.href = publication.publication_url;
      if (/^https?:\/\//i.test(String(publication.publication_url))) {
        link.target = "_blank";
        link.rel = "noopener";
      } else {
        link.removeAttribute("target");
        link.removeAttribute("rel");
      }
    }
  }

  Promise.all([
    loadJson(sources.profile),
    loadJson(sources.links),
    loadJson(sources.publications),
    loadJson(sources.experience)
  ])
    .then(([profile, links, publications, experience]) => {
      renderProfile(profile);
      renderLinks(links);
      renderPublication(publications);
      renderExperience(experience);
    })
    .catch(error => {
      console.error("Portfolio content data error:", error);
    });
});
