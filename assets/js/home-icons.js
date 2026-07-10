(() => {
  "use strict";

  const svg = paths => `
    <svg class="dashboard-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      ${paths}
    </svg>`;

  const line = (d, extra = "") => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}></path>`;
  const circle = (cx, cy, r, extra = "") => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="1.8" ${extra}></circle>`;
  const rect = (x, y, width, height, rx = 1.5, extra = "") => `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="none" stroke="currentColor" stroke-width="1.8" ${extra}></rect>`;

  const icons = {
    folder: svg(`${line("M3.5 7.5h6l2-2h9v13h-17z")}${line("M3.5 9.5h17")}`),
    book: svg(`${line("M4 5.5c3.2-.8 5.5-.2 8 1.6v12c-2.5-1.8-4.8-2.4-8-1.6z")}${line("M20 5.5c-3.2-.8-5.5-.2-8 1.6v12c2.5-1.8 4.8-2.4 8-1.6z")}`),
    award: svg(`${circle(12, 9, 4.5)}${line("M9.5 13l-1.2 6 3.7-2 3.7 2-1.2-6")}`),
    layers: svg(`${line("M12 3.5l8 4.5-8 4.5L4 8z")}${line("M4 12l8 4.5 8-4.5")}${line("M4 16l8 4.5 8-4.5")}`),
    activity: svg(`${line("M3 12h4l2-5 4 10 2-5h6")}`),
    code: svg(`${line("M8.5 7L4 12l4.5 5")}${line("M15.5 7L20 12l-4.5 5")}${line("M13.5 4.5l-3 15")}`),
    database: svg(`${line("M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3z")}${line("M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6")}${line("M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6")}`),
    tableau: svg(`${line("M12 3v5M9.5 5.5h5M12 16v5M9.5 18.5h5M3 12h5M5.5 9.5v5M16 12h5M18.5 9.5v5")}${line("M8.3 8.3l2.2 2.2M13.5 13.5l2.2 2.2M15.7 8.3l-2.2 2.2M10.5 13.5l-2.2 2.2")}`),
    bars: svg(`${rect(4, 13, 3, 7, 0.8)}${rect(10.5, 8, 3, 12, 0.8)}${rect(17, 4, 3, 16, 0.8)}`),
    sheet: svg(`${rect(4, 3, 16, 18, 2)}${line("M9 3v18M4 9h16M4 15h16")}`),
    searchData: svg(`${circle(9.5, 10, 5.5)}${line("M13.5 14l5 5")}${line("M7 10h5M9.5 7.5v5")}`),
    columns: svg(`${rect(4, 6, 3.2, 12, 1)}${rect(10.4, 3.5, 3.2, 14.5, 1)}${rect(16.8, 8.5, 3.2, 9.5, 1)}`),
    nodes: svg(`${circle(6, 7, 2)}${circle(18, 6, 2)}${circle(12, 18, 2)}${line("M7.8 7.6l8.2-1M7 8.7l4 7.3M17 7.8l-4 8.2")}`),
    orbit: svg(`${circle(12, 12, 2.2)}${line("M4 12c0-3 3.6-5.5 8-5.5s8 2.5 8 5.5-3.6 5.5-8 5.5S4 15 4 12z")}${line("M7.5 5.5c2.6-1.5 6.5.8 8.7 4.6s1.9 8-.7 9.4-6.5-.8-8.7-4.6-1.9-8 .7-9.4z")}`),
    git: svg(`${circle(6, 5, 2)}${circle(6, 19, 2)}${circle(18, 12, 2)}${line("M6 7v10M8 8c4 0 4 4 8 4")}`),
    flask: svg(`${line("M9 3h6M10 3v6l-5 9c-.7 1.3.1 3 1.7 3h10.6c1.6 0 2.4-1.7 1.7-3l-5-9V3")}${line("M7.5 15h9")}`),
    cloud: svg(`${line("M7.5 18h10a4 4 0 000-8 6 6 0 00-11.4-1.7A4.8 4.8 0 007.5 18z")}`),
    target: svg(`${circle(12, 12, 8)}${circle(12, 12, 4)}${circle(12, 12, 1.3)}${line("M14.8 9.2L20 4M16.5 4H20v3.5")}`),
    puzzle: svg(`${line("M8.5 4H4v5.2a2.4 2.4 0 110 4.6V20h6a2.4 2.4 0 104.6 0H20v-5.5a2.4 2.4 0 100-4.6V4h-5.5a2.4 2.4 0 11-4.6 0z")}`),
    briefcase: svg(`${rect(3.5, 7, 17, 12, 2)}${line("M9 7V5h6v2M3.5 12h17M10 12v2h4v-2")}`),
    bulb: svg(`${circle(12, 9.5, 5.5)}${line("M9.5 14.5V17h5v-2.5M10 20h4")}`),
    rocket: svg(`${line("M14 4c3-1 5-1 6-1-0 1 0 3-1 6l-6 6-5-1-1-5z")}${line("M9 15l-3 3M7 13l-3 1 1-3M11 17l-1 3 3-1")}`),
    publication: svg(`${rect(5, 3, 14, 18, 2)}${line("M9 7h6M9 11h6M9 15h4")}`)
  };

  const toolIcon = toolName => {
    const name = String(toolName || "").toLowerCase();
    if (name.includes("python")) return icons.code;
    if (name === "sql" || name.includes("postgres") || name.includes("mysql")) return icons.database;
    if (name.includes("tableau")) return icons.tableau;
    if (name.includes("power bi")) return icons.bars;
    if (name.includes("excel")) return icons.sheet;
    if (name.includes("bigquery")) return icons.searchData;
    if (name.includes("pandas")) return icons.columns;
    if (name.includes("scikit")) return icons.nodes;
    if (name.includes("jupyter")) return icons.orbit;
    if (name.includes("git")) return icons.git;
    if (name.includes("flask")) return icons.flask;
    if (name.includes("aws") || name.includes("gcp") || name.includes("azure")) return icons.cloud;
    return icons.code;
  };

  function replaceContent(selector, iconName) {
    const element = document.querySelector(selector);
    if (element && icons[iconName]) element.innerHTML = icons[iconName];
  }

  function enhanceStaticIcons() {
    const kpiIcons = ["folder", "book", "award", "layers", "activity"];
    document.querySelectorAll(".kpi-icon").forEach((element, index) => {
      element.innerHTML = icons[kpiIcons[index] || "activity"];
    });

    replaceContent(".dashboard-target", "target");
    replaceContent(".publication-icon", "publication");

    const traitIcons = ["puzzle", "briefcase", "bulb", "rocket"];
    document.querySelectorAll(".dashboard-traits > span").forEach((trait, index) => {
      if (trait.querySelector(".dashboard-trait-icon")) return;
      const icon = document.createElement("span");
      icon.className = "dashboard-trait-icon";
      icon.innerHTML = icons[traitIcons[index] || "activity"];
      trait.prepend(icon);
    });
  }

  function enhanceTechStack() {
    const container = document.getElementById("dashboard-tech-stack");
    if (!container) return;

    container.querySelectorAll(".dashboard-tech-item").forEach(item => {
      const label = item.querySelector(":scope > span:last-child");
      const iconHolder = item.querySelector(":scope > strong");
      if (!label || !iconHolder || iconHolder.dataset.iconReady === "true") return;

      iconHolder.innerHTML = toolIcon(label.textContent);
      iconHolder.dataset.iconReady = "true";
      item.dataset.tool = label.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    });
  }

  function init() {
    enhanceStaticIcons();
    enhanceTechStack();

    const techStack = document.getElementById("dashboard-tech-stack");
    if (techStack) {
      const observer = new MutationObserver(enhanceTechStack);
      observer.observe(techStack, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
