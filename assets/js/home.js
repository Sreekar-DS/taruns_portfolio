document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const dashboard = document.getElementById("portfolio-dashboard");
  if (!dashboard) return;

  const dataApi = window.PortfolioData;
  const warning = document.getElementById("dashboard-error");

  if (!dataApi || typeof dataApi.load !== "function") {
    if (warning) {
      warning.hidden = false;
      warning.textContent = "The dashboard data loader could not start. Refresh the page to try again.";
    }
    return;
  }

  const sources = {
    projects: dashboard.dataset.projectsSource,
    currentWork: dashboard.dataset.currentWorkSource,
    skills: dashboard.dataset.skillsSource,
    certifications: dashboard.dataset.certificationsSource,
    learning: dashboard.dataset.learningSource,
    awards: dashboard.dataset.awardsSource
  };

  const priorityRank = { high: 1, medium: 2, low: 3 };

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function normalizeSkills(skills) {
    if (Array.isArray(skills)) return skills.filter(Boolean).map(skill => String(skill).trim());
    if (typeof skills === "string") {
      return skills
        .split(/[,;|]/)
        .map(skill => skill.trim())
        .filter(Boolean);
    }
    return [];
  }

  function isVisible(item, key) {
    return !Object.prototype.hasOwnProperty.call(item, key) || item[key] !== false;
  }

  function formatDate(value) {
    if (!value) return "Date not set";

    const text = String(value).trim();
    const isoDate = /^\d{4}-\d{2}-\d{2}$/.test(text)
      ? new Date(`${text}T00:00:00`)
      : new Date(text);

    if (!Number.isNaN(isoDate.getTime())) {
      return isoDate.toLocaleDateString("en-GB", {
        day: /^\d{4}-\d{2}-\d{2}$/.test(text) ? "2-digit" : undefined,
        month: "short",
        year: "numeric"
      });
    }

    return escapeHtml(text);
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function showWarning(message) {
    if (!warning) return;
    warning.hidden = false;
    warning.textContent = message;
  }

  function setUnavailable(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = `<p class="dashboard-loading">${escapeHtml(message)}</p>`;
  }

  function startGreetingAnimation() {
    const greeting = document.getElementById("rotating-greeting");
    if (!greeting) return;

    const messages = [
      "Hi, this is Tarun.",
      "Welcome to my portfolio.",
      "I turn data into practical insights."
    ];

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      greeting.textContent = messages[0];
      return;
    }

    let messageIndex = 0;
    let characterIndex = messages[0].length;
    let deleting = false;

    window.setTimeout(function typeLoop() {
      const message = messages[messageIndex];
      characterIndex += deleting ? -1 : 1;
      greeting.textContent = message.slice(0, Math.max(0, characterIndex));

      let delay = deleting ? 38 : 68;
      if (!deleting && characterIndex >= message.length) {
        deleting = true;
        delay = 1500;
      } else if (deleting && characterIndex <= 0) {
        deleting = false;
        messageIndex = (messageIndex + 1) % messages.length;
        delay = 320;
      }

      window.setTimeout(typeLoop, delay);
    }, 1400);
  }

  function renderSkillsByCategory(skills) {
    const container = document.getElementById("skills-category-chart");
    if (!container) return;

    const categoryCounts = skills.reduce((counts, item) => {
      const category = String(item.category || "Other").trim() || "Other";
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {});

    const rows = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    if (!rows.length) {
      container.innerHTML = '<p class="dashboard-loading">No skill categories are available.</p>';
      return;
    }

    const maximum = Math.max(...rows.map(([, count]) => count));
    container.innerHTML = rows.map(([category, count], index) => {
      const width = Math.max(10, Math.round((count / maximum) * 100));
      return `
        <div class="horizontal-bar-row" style="--bar-delay: ${index * 70}ms;">
          <div class="horizontal-bar-label">
            <span>${escapeHtml(category)}</span>
            <strong>${count}</strong>
          </div>
          <div class="horizontal-bar-track" aria-label="${escapeHtml(category)}: ${count} skills">
            <span style="--bar-width: ${width}%;"></span>
          </div>
        </div>
      `;
    }).join("");
  }

  function createProjectLinks(item) {
    const links = [];
    if (item.github_link) {
      links.push(`<a href="${escapeHtml(item.github_link)}" target="_blank" rel="noopener">GitHub</a>`);
    }
    if (item.demo_link) {
      links.push(`<a href="${escapeHtml(item.demo_link)}" target="_blank" rel="noopener">Demo</a>`);
    }
    return links.length ? `<div class="dashboard-project-links">${links.join("")}</div>` : "";
  }

  function createProjectCard(item) {
    const progress = Math.max(0, Math.min(100, Number(item.progress || 0)));
    const skills = normalizeSkills(item.skills).slice(0, 6);
    const priorityText = String(item.priority || "Not set");
    const priorityClass = priorityText.toLowerCase().replace(/[^a-z0-9-]+/g, "-");

    return `
      <article class="dashboard-project-card">
        <div class="dashboard-project-card-top">
          <span class="dashboard-project-type">${escapeHtml(item.type || "Project")}</span>
          <span class="dashboard-project-status">${escapeHtml(item.status || "In Progress")}</span>
        </div>

        <h3>${escapeHtml(item.title || "Untitled project")}</h3>
        <p>${escapeHtml(item.short_description || "")}</p>

        <div class="dashboard-project-progress-copy">
          <span>Progress</span>
          <strong>${progress}%</strong>
        </div>
        <div class="dashboard-project-progress" aria-label="Project progress ${progress}%">
          <span style="--progress: ${progress}%;"></span>
        </div>

        <div class="dashboard-project-skills">
          ${skills.map(skill => `<span>${escapeHtml(skill)}</span>`).join("")}
        </div>

        <div class="dashboard-project-meta">
          <span>Finish <strong>${formatDate(item.expected_finish_date)}</strong></span>
          <span>Priority <strong class="priority-${escapeHtml(priorityClass)}">${escapeHtml(priorityText)}</strong></span>
        </div>

        ${createProjectLinks(item)}
      </article>
    `;
  }

  function renderCurrentProjects(items) {
    const container = document.getElementById("dashboard-current-projects");
    if (!container) return;

    const visibleItems = items.slice().sort((a, b) => {
      const rankA = priorityRank[String(a.priority || "").toLowerCase()] || 99;
      const rankB = priorityRank[String(b.priority || "").toLowerCase()] || 99;
      if (rankA !== rankB) return rankA - rankB;
      return String(a.title || "").localeCompare(String(b.title || ""));
    });

    container.innerHTML = visibleItems.length
      ? visibleItems.map(createProjectCard).join("")
      : '<p class="dashboard-loading">No active projects are listed.</p>';
  }

  function renderTechStack(skills, currentWork, learningItems) {
    const container = document.getElementById("dashboard-tech-stack");
    if (!container) return;

    const availableSkills = new Set(
      skills.map(item => String(item.skill || "").trim()).filter(Boolean)
    );

    currentWork.forEach(item => normalizeSkills(item.skills).forEach(skill => availableSkills.add(skill)));
    learningItems.forEach(item => normalizeSkills(item.skills).forEach(skill => availableSkills.add(skill)));

    const preferredTools = [
      "Python", "SQL", "Tableau", "Power BI", "Microsoft Excel", "PostgreSQL",
      "MySQL", "Google BigQuery", "Pandas", "Scikit-learn", "Jupyter Notebook",
      "Git/GitHub", "Flask", "AWS", "GCP"
    ];

    const selected = preferredTools.filter(tool => availableSkills.has(tool)).slice(0, 12);
    const initials = tool => tool
      .split(/[\s/+-]+/)
      .filter(Boolean)
      .map(part => part[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();

    container.innerHTML = selected.length
      ? selected.map(tool => `
          <span class="dashboard-tech-item">
            <strong aria-hidden="true">${escapeHtml(initials(tool))}</strong>
            <span>${escapeHtml(tool)}</span>
          </span>
        `).join("")
      : '<p class="dashboard-loading">No tools are listed.</p>';
  }

  function renderCertifications(items) {
    const container = document.getElementById("dashboard-certifications");
    if (!container) return;

    const visibleItems = items.slice(0, 5);
    container.innerHTML = visibleItems.length
      ? visibleItems.map((item, index) => {
          const title = escapeHtml(item.title || "Certification");
          const issuer = escapeHtml(item.issuer || item.organization || "");
          const issueDate = escapeHtml(item.issue_date || "");
          const titleMarkup = item.credential_url
            ? `<a href="${escapeHtml(item.credential_url)}" target="_blank" rel="noopener">${title}</a>`
            : `<span>${title}</span>`;

          return `
            <div class="dashboard-certification-item">
              <span class="certification-dot certification-dot-${(index % 5) + 1}" aria-hidden="true"></span>
              <div>
                <strong>${titleMarkup}</strong>
                <small>${issuer}</small>
              </div>
              <time>${issueDate}</time>
            </div>
          `;
        }).join("")
      : '<p class="dashboard-loading">No certifications are listed.</p>';
  }

  function renderAwards(items) {
    const target = document.getElementById("kpi-awards");
    const note = document.getElementById("kpi-awards-note");
    if (!target) return;

    const visibleAwards = items.filter(item => isVisible(item, "display_on_home"));
    target.textContent = String(visibleAwards.length);
    if (note) {
      note.textContent = visibleAwards.length === 1
        ? "Star Performer recognition"
        : "Star Performer recognitions";
    }
  }

  function renderLoadedData(results, requests) {
    const values = {};
    const failed = [];

    results.forEach((result, index) => {
      const name = requests[index][0];
      if (result.status === "fulfilled") {
        values[name] = asArray(result.value);
      } else {
        values[name] = [];
        failed.push(name);
        console.error(`Portfolio ${name} data error:`, result.reason);
      }
    });

    const projects = values.projects;
    const currentWork = values.currentWork;
    const skills = values.skills;
    const certifications = values.certifications;
    const learning = values.learning;
    const awards = values.awards;

    const completedProjects = projects.filter(item =>
      isVisible(item, "display_on_projects") && String(item.status || "").toLowerCase() === "completed"
    );
    const activeProjects = currentWork.filter(item => isVisible(item, "display_on_home"));
    const visibleSkills = skills.filter(item => isVisible(item, "display_on_skills"));
    const visibleCertifications = certifications.filter(item => isVisible(item, "display_on_certifications"));
    const completedLearning = learning.filter(item =>
      isVisible(item, "display_on_professional_development") &&
      String(item.status || "").toLowerCase() === "completed"
    );

    if (!failed.includes("projects") && !failed.includes("currentWork")) {
      setText("kpi-projects", completedProjects.length + activeProjects.length);
      setText("kpi-projects-note", `${completedProjects.length} completed · ${activeProjects.length} active`);
    } else {
      setText("kpi-projects", "—");
      setText("kpi-projects-note", "Project data unavailable");
    }

    setText("kpi-courses", failed.includes("learning") ? "—" : completedLearning.length);
    setText("kpi-certifications", failed.includes("certifications") ? "—" : visibleCertifications.length);
    setText("kpi-skills", failed.includes("skills") ? "—" : visibleSkills.length);
    setText("kpi-current-work", failed.includes("currentWork") ? "—" : activeProjects.length);

    if (failed.includes("skills")) {
      setUnavailable("skills-category-chart", "Skill categories are temporarily unavailable.");
    } else {
      renderSkillsByCategory(visibleSkills);
    }

    if (failed.includes("currentWork")) {
      setUnavailable("dashboard-current-projects", "Current project data is temporarily unavailable.");
    } else {
      renderCurrentProjects(activeProjects);
    }

    if (failed.includes("certifications")) {
      setUnavailable("dashboard-certifications", "Certification data is temporarily unavailable.");
    } else {
      renderCertifications(visibleCertifications);
    }

    if (failed.includes("awards")) {
      setText("kpi-awards", "—");
      setText("kpi-awards-note", "Awards data unavailable");
    } else {
      renderAwards(awards);
    }

    if (failed.includes("skills") && failed.includes("currentWork") && failed.includes("learning")) {
      setUnavailable("dashboard-tech-stack", "Tech stack data is temporarily unavailable.");
    } else {
      renderTechStack(visibleSkills, activeProjects, completedLearning);
    }

    if (failed.length) {
      showWarning("Some dashboard data could not be loaded. The available sections are still shown.");
    }
  }

  startGreetingAnimation();

  const requests = [
    ["projects", sources.projects],
    ["currentWork", sources.currentWork],
    ["skills", sources.skills],
    ["certifications", sources.certifications],
    ["learning", sources.learning],
    ["awards", sources.awards]
  ];

  Promise.allSettled(requests.map(([, url]) => dataApi.load(url)))
    .then(results => renderLoadedData(results, requests))
    .catch(error => {
      showWarning("The dashboard could not finish loading. Refresh the page to try again.");
      console.error("Portfolio dashboard rendering error:", error);
    });
});
