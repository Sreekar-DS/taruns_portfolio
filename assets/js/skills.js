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

  function orderValue(value) {
    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? 999 : numberValue;
  }

  function groupByCategory(items) {
    return items.reduce((groups, item) => {
      const category = item.category || "Other Skills";
      if (!groups[category]) {
        groups[category] = {
          category,
          categoryOrder: orderValue(item.display_order),
          skills: []
        };
      }

      groups[category].categoryOrder = Math.min(groups[category].categoryOrder, orderValue(item.display_order));
      groups[category].skills.push(item);
      return groups;
    }, {});
  }

  function createSkillCard(group) {
    const sortedSkills = group.skills
      .slice()
      .sort((a, b) => orderValue(a.display_order) - orderValue(b.display_order));

    return `
      <article class="skill-category-card">
        <h3>${escapeHtml(group.category)}</h3>
        <div class="skill-tag-list">
          ${sortedSkills.map(item => `<span class="skill-tag">${escapeHtml(item.skill)}</span>`).join("\n")}
        </div>
      </article>
    `;
  }

  function render(items) {
    const visibleItems = items.filter(item => item.display_on_skills !== false);

    if (!visibleItems.length) {
      container.innerHTML = "<p>No skills are listed yet.</p>";
      return;
    }

    const groups = Object.values(groupByCategory(visibleItems))
      .sort((a, b) => a.categoryOrder - b.categoryOrder || a.category.localeCompare(b.category));

    container.innerHTML = groups.map(createSkillCard).join("\n");
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
