## Welcome

Welcome to my data analytics portfolio. I am **Tarun Sreekar Parasa**, a data analyst and machine learning enthusiast focused on turning raw data into clear business insights using Python, SQL, Tableau, Excel, and machine learning.

This portfolio brings together my academic projects, analytics case studies, certifications, and professional development work as I build toward data analyst, business analyst, and analytics-focused roles.

## Connect with Me

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat-square)](https://www.linkedin.com/in/sreekar-ai)
[![Projects Portfolio](https://img.shields.io/badge/Projects-Portfolio-brightgreen?style=flat-square)](https://www.datascienceportfol.io/taruns_portfolio)
[![GitHub](https://img.shields.io/badge/GitHub-Profile-black?style=flat-square)](https://github.com/Sreekar-DS)

## Currently Working On

These are the projects and learning items I am actively working on. The cards below are loaded from portfolio data, so I can update them from the Excel workbook instead of manually editing this page.

<div id="currently-working-on" class="work-grid">
  <p>Loading current work...</p>
</div>

<script>
(function () {
  const container = document.getElementById("currently-working-on");
  const dataUrl = "{{ '/assets/data/currently-working-on.json' | relative_url }}";

  function formatDate(value) {
    if (!value) return "Not set";
    const date = new Date(value + "T00:00:00");
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  function createSkillTags(skills) {
    if (!Array.isArray(skills)) return "";
    return skills.map(skill => `<span>${skill}</span>`).join("");
  }

  function createProjectLinks(item) {
    const links = [];
    if (item.github_link) {
      links.push(`<a href="${item.github_link}" target="_blank" rel="noopener">GitHub</a>`);
    }
    if (item.demo_link) {
      links.push(`<a href="${item.demo_link}" target="_blank" rel="noopener">Demo</a>`);
    }
    return links.length ? `<div class="work-links">${links.join("")}</div>` : "";
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
        container.innerHTML = "<p>No current work items are listed yet.</p>";
        return;
      }

      container.innerHTML = visibleItems.map(item => `
        <article class="work-card">
          <div class="work-card-header">
            <span class="work-type">${item.type || "Project"}</span>
            <span class="work-status">${item.status || "In Progress"}</span>
          </div>
          <h3>${item.title}</h3>
          <p class="work-description">${item.short_description || ""}</p>
          <div class="work-meta">
            <strong>Expected finish:</strong> ${formatDate(item.expected_finish_date)}
          </div>
          <div class="work-progress-label">
            <span>Progress</span>
            <span>${item.progress || 0}%</span>
          </div>
          <div class="work-progress-bar">
            <div style="width: ${Math.max(0, Math.min(100, item.progress || 0))}%"></div>
          </div>
          <div class="work-skills">${createSkillTags(item.skills)}</div>
          ${createProjectLinks(item)}
        </article>
      `).join("");
    })
    .catch(error => {
      container.innerHTML = `<p>Unable to load current work right now.</p>`;
      console.error(error);
    });
})();
</script>
