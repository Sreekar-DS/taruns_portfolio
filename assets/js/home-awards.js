(() => {
  "use strict";

  function isVisibleOnHome(item) {
    return !Object.prototype.hasOwnProperty.call(item, "display_on_home") || item.display_on_home !== false;
  }

  async function loadAwards() {
    const dashboard = document.getElementById("portfolio-dashboard");
    const target = document.getElementById("kpi-awards");
    const note = document.getElementById("kpi-awards-note");
    if (!dashboard || !target) return;

    const source = dashboard.dataset.awardsSource;
    if (!source) {
      target.textContent = "0";
      if (note) note.textContent = "No awards listed";
      return;
    }

    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error(`Unable to load ${source}`);

      const awards = await response.json();
      const visibleAwards = Array.isArray(awards) ? awards.filter(isVisibleOnHome) : [];
      target.textContent = String(visibleAwards.length);

      if (note) {
        note.textContent = visibleAwards.length === 1
          ? "Star Performer recognition"
          : "Star Performer recognitions";
      }
    } catch (error) {
      target.textContent = "—";
      if (note) note.textContent = "Awards data unavailable";
      console.error("Portfolio awards data error:", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadAwards, { once: true });
  } else {
    loadAwards();
  }
})();
