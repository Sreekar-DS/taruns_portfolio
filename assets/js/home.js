document.addEventListener("DOMContentLoaded", () => {
  const dashboard = document.getElementById("portfolio-dashboard");
  if (!dashboard) return;

  const sources = {
    projects: dashboard.dataset.projectsSource,
    currentWork: dashboard.dataset.currentWorkSource,
    skills: dashboard.dataset.skillsSource,
    certifications: dashboard.dataset.certificationsSource,
    learning: dashboard.dataset.learningSource
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
    const isoDate = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(isoDate.getTime())) {
      return isoDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    }
    return escapeHtml(value);
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  async function loadJson(url) {
    if (!url) throw new Error("A dashboard data source is missing.");
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Unable to load ${url}`);
    return response.json();
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

      if (deleting) {
        characterIndex -= 1;
      } else {
        characterIndex += 1;
      }

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

  function renderProjectStatus(completedCount, activeCount) {
    const total = completedCount + activeCount;
    const completedPercentage = total ? (completedCount / total) * 100 : 0;
    const donut = document.getElementById("project-status-donut");

    if (donut) {
      donut.style.background = `conic-gradient(#20d3ee 0 ${completedPercentage}%, #f044a4 ${completedPercentage}% 100%)`;
      donut.setAttribute(
        "aria-label",
        `${completedCount} completed projects and ${activeCount} projects in progress`
      );
    }

    setText("project-status-total", total);
    setText("project-completed-count", completedCount);
    setText("project-active-count", activeCount);
  }

  function renderSkillsByCategory(skills) {
    const container = document.getElementById("skills-category-chart");
    if (!container) return;

    const categoryCounts = skills
      .filter(item => isVisible(item, "display_on_skills"))
      .reduce((counts, item) => {
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
    container.innerHTML = rows
      .map(([category, count], index) => {
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
      })
      .join("");
  }

  function renderLearningFocus(learningItems) {
    const container = document.getElementById("learning-focus-chart");
    if (!container) return;

    const focusCounts = learningItems
      .filter(item => isVisible(item, "display_on_professional_development"))
      .reduce((counts, item) => {
        normalizeSkills(item.skills).forEach(skill => {
          const normalized = skill === "Microsoft Excel" ? "Excel" : skill;
          counts[normalized] = (counts[normalized] || 0) + 1;
        });
        return counts;
      }, {});

    const focus = Object.entries(focusCounts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 7);

    if (!focus.length) {
      container.innerHTML = '<p class="dashboard-loading">No course topics are available.</p>';
      return;
    }

    const maximum = Math.max(...focus.map(([, count]) => count));
    container.innerHTML = focus
      .map(([name, count], index) => {
        const height = Math.max(22, Math.round((count / maximum) * 100));
        return `
          <div class="learning-focus-column">
            <div class="learning-focus-value">${count}</div>
            <div class="learning-focus-track" aria-label="${escapeHtml(name)} appears in ${count} completed courses">
              <span style="--column-height: ${height}%; --column-delay: ${index * 90}ms;"></span>
            </div>
            <span class="learning-focus-label">${escapeHtml(name)}</span>
          </div>
        `;
      })
      .join("");
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
    const priorityClass = String(item.priority || "medium").toLowerCase();

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
          <span>Priority <strong class="priority-${escapeHtml(priorityClass)}">${escapeHtml(item.priority || "Not set")}</strong></span>
        </div>

        ${createProjectLinks(item)}
      </article>
    `;
  }

  function renderCurrentProjects(items) {
    const container = document.getElementById("dashboard-current-projects");
    if (!container) return;

    const visibleItems = items
      .filter(item => isVisible(item, "display_on_home"))
      .sort((a, b) => {
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
      skills
        .filter(item => isVisible(item, "display_on_skills"))
        .map(item => String(item.skill || "").trim())
        .filter(Boolean)
    );

    currentWork.forEach(item => normalizeSkills(item.skills).forEach(skill => availableSkills.add(skill)));
    learningItems.forEach(item => normalizeSkills(item.skills).forEach(skill => availableSkills.add(skill)));

    const preferredTools = [
      "Python",
      "SQL",
      "Tableau",
      "Power BI",
      "Microsoft Excel",
      "PostgreSQL",
      "MySQL",
      "Google BigQuery",
      "Pandas",
      "Scikit-learn",
      "Jupyter Notebook",
      "Git/GitHub",
      "Flask",
      "AWS",
      "GCP"
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

    const visibleItems = items
      .filter(item => isVisible(item, "display_on_certifications"))
      .slice(0, 5);

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

  function renderDashboard(data) {
    const completedProjects = data.projects.filter(item =>
      isVisible(item, "display_on_projects") && String(item.status || "").toLowerCase() === "completed"
    );
    const activeProjects = data.currentWork.filter(item => isVisible(item, "display_on_home"));
    const visibleSkills = data.skills.filter(item => isVisible(item, "display_on_skills"));
    const visibleCertifications = data.certifications.filter(item => isVisible(item, "display_on_certifications"));
    const completedLearning = data.learning.filter(item =>
      isVisible(item, "display_on_professional_development") &&
      String(item.status || "").toLowerCase() === "completed"
    );

    const totalProjects = completedProjects.length + activeProjects.length;

    setText("kpi-projects", totalProjects);
    setText("kpi-projects-note", `${completedProjects.length} completed · ${activeProjects.length} active`);
    setText("kpi-courses", completedLearning.length);
    setText("kpi-certifications", visibleCertifications.length);
    setText("kpi-skills", visibleSkills.length);
    setText("kpi-current-work", activeProjects.length);

    renderProjectStatus(completedProjects.length, activeProjects.length);
    renderSkillsByCategory(visibleSkills);
    renderLearningFocus(completedLearning);
    renderCurrentProjects(activeProjects);
    renderTechStack(visibleSkills, activeProjects, completedLearning);
    renderCertifications(visibleCertifications);
  }

  startGreetingAnimation();

  Promise.all([
    loadJson(sources.projects),
    loadJson(sources.currentWork),
    loadJson(sources.skills),
    loadJson(sources.certifications),
    loadJson(sources.learning)
  ])
    .then(([projects, currentWork, skills, certifications, learning]) => {
      renderDashboard({ projects, currentWork, skills, certifications, learning });
    })
    .catch(error => {
      const errorMessage = document.getElementById("dashboard-error");
      if (errorMessage) errorMessage.hidden = false;
      console.error("Portfolio dashboard error:", error);
    });
});
