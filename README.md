## Welcome

Welcome to my data analytics portfolio. I am **Tarun Sreekar Parasa**, a data analyst and machine learning enthusiast focused on turning raw data into clear business insights using Python, SQL, Tableau, Excel, and machine learning.

This portfolio brings together my academic projects, analytics case studies, certifications, and professional development work as I build toward data analyst, business analyst, and analytics-focused roles.

## Connect with Me

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat-square)](https://www.linkedin.com/in/sreekar-ai)
[![Projects Portfolio](https://img.shields.io/badge/Projects-Portfolio-brightgreen?style=flat-square)](https://www.datascienceportfol.io/taruns_portfolio)
[![GitHub](https://img.shields.io/badge/GitHub-Profile-black?style=flat-square)](https://github.com/Sreekar-DS)

## Currently Working On

These are the projects and learning items I am actively working on. The cards below are loaded from portfolio data, so I can update them from the Excel workbook instead of manually editing this page.

<style>
  .home-work-scroll {
    max-height: 520px;
    overflow-y: auto;
    padding: 12px 12px 12px 4px;
    margin-top: 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fafafa;
  }

  .home-work-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 18px;
  }

  .home-work-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 16px;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .home-work-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  }

  .home-work-card h3 {
    margin: 8px 0 12px;
    font-size: 20px;
    line-height: 1.25;
  }

  .home-work-card p {
    margin: 8px 0 12px;
    font-size: 15px;
    line-height: 1.5;
  }

  .home-work-card-header {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .home-work-type,
  .home-work-status {
    display: inline-block;
    border-radius: 999px;
    padding: 4px 9px;
    font-size: 12px;
    line-height: 1.2;
    font-weight: 600;
  }

  .home-work-type {
    background: #eef6ff;
    color: #24527a;
  }

  .home-work-status {
    background: #ecfdf3;
    color: #166534;
  }

  .home-work-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin: 12px 0;
    font-size: 14px;
  }

  .home-work-meta span {
    display: block;
    color: #666;
    margin-bottom: 2px;
  }

  .home-work-progress-label {
    display: flex;
    justify-content: space-between;
    margin: 10px 0 6px;
    font-size: 14px;
  }

  .home-work-progress-bar {
    height: 8px;
    background: #eeeeee;
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 12px;
  }

  .home-work-progress-bar div {
    height: 100%;
    background: #2f80ed;
    border-radius: 999px;
  }

  .home-work-skills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }

  .home-work-skills span {
    background: #f2f2f2;
    border: 1px solid #e0e0e0;
    border-radius: 999px;
    padding: 4px 8px;
    font-size: 12px;
  }

  .home-work-links {
    display: flex;
    gap: 10px;
    margin-top: 14px;
  }

  .home-work-links a {
    font-weight: 600;
  }

  @media screen and (max-width: 640px) {
    .home-work-scroll {
      max-height: 620px;
    }

    .home-work-grid {
      grid-template-columns: 1fr;
    }

    .home-work-meta {
      grid-template-columns: 1fr;
    }
  }
</style>

<div class="home-work-scroll" aria-label="Scrollable current work section">
  <div id="currently-working-on" class="home-work-grid" aria-live="polite">
    <p>Loading current work...</p>
  </div>
</div>

<script>
(function () {
  const container = document.getElementById("currently-working-on");
  const dataUrl = "{{ '/assets/data/currently-working-on.json' | relative_url }}";

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
    const date = new Date(value + "T00:00:00");
    if (Number.isNaN(date.getTime())) return escapeHtml(value);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  function createSkillTags(skills) {
    if (!Array.isArray(skills) || !skills.length) return "";
    return skills.map(skill => `<span>${escapeHtml(skill)}</span>`).join("\n");
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

      container.innerHTML = visibleItems.map(item => {
        const progress = Math.max(0, Math.min(100, Number(item.progress) || 0));
        return `
          <article class="home-work-card">
            <div class="home-work-card-header">
              <span class="home-work-type">${escapeHtml(item.type || "Project")}</span>
              <span class="home-work-status">${escapeHtml(item.status || "In Progress")}</span>
            </div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.short_description || "")}</p>
            <div class="home-work-meta">
              <div><span>Expected finish</span><strong>${formatDate(item.expected_finish_date)}</strong></div>
              <div><span>Priority</span><strong>${escapeHtml(item.priority || "Not set")}</strong></div>
            </div>
            <div class="home-work-progress-label">
              <span>Progress</span>
              <strong>${progress}%</strong>
            </div>
            <div class="home-work-progress-bar" aria-label="Progress ${progress}%">
              <div style="width: ${progress}%"></div>
            </div>
            <div class="home-work-skills">${createSkillTags(item.skills)}</div>
            ${createProjectLinks(item)}
          </article>
        `;
      }).join("");
    })
    .catch(error => {
      container.innerHTML = "<p>Unable to load current work right now.</p>";
      console.error(error);
    });
})();
</script>
