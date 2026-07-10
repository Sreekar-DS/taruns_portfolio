document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("skills");
  if (!container) return;

  const dataUrl = container.dataset.source;

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function groupByCategory(items) {
    return items.reduce((groups, item) => {
      const category = item.category || "Other Skills";
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
      return groups;
    }, {});
  }

  function createSkillCard(category, skills) {
    const sortedSkills = skills
      .slice()
      .sort((a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999));

    return `
      <article class="skill-category-card">
        <h3>${escapeHtml(category)}</h3>
        <div class="skill-tag-list">
          ${sortedSkills.map(item => `<span class="skill-tag">${escapeHtml(item.skill)}</span>`).join("\n")}
        </div>
      </article>
    `;
  }

  function render(items) {
    const visibleItems = items
      .filter(item => item.display_on_skills !== false)
      .sort((a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999));

    if (!visibleItems.length) {
      container.innerHTML = "<p>No skills are listed yet.</p>";
      return;
    }

    const grouped = groupByCategory(visibleItems);
    container.innerHTML = Object.entries(grouped)
      .map(([category, skills]) => createSkillCard(category, skills))
      .join("\n");
  }

  fetch(dataUrl)
    .then(response => {
      if (!response.ok) throw new Error("Could not load skills data");
      return response.json();
    })
    .then(render)
    .catch(error => {
      container.innerHTML = "<p>Unable to load skills right now.</p>";
      console.error(error);
    });
});
