document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const buttons = [...document.querySelectorAll(".dashboard-scroll-button[data-scroll-target]")];
  if (!buttons.length) return;

  const updateButtons = targetId => {
    const viewport = document.getElementById(targetId);
    if (!viewport) return;

    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    document.querySelectorAll(`.dashboard-scroll-button[data-scroll-target="${targetId}"]`).forEach(button => {
      const direction = Number(button.dataset.scrollDirection || 1);
      const atStart = viewport.scrollLeft <= 2;
      const atEnd = viewport.scrollLeft >= maxScroll - 2;
      button.disabled = maxScroll <= 2 || (direction < 0 ? atStart : atEnd);
    });
  };

  const scrollViewport = button => {
    const targetId = button.dataset.scrollTarget;
    const viewport = document.getElementById(targetId);
    if (!viewport) return;

    const direction = Number(button.dataset.scrollDirection || 1);
    const firstItem = viewport.querySelector(":scope > * > *");
    const itemWidth = firstItem ? firstItem.getBoundingClientRect().width : viewport.clientWidth * 0.75;
    const distance = Math.max(itemWidth + 16, viewport.clientWidth * 0.55);

    viewport.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  buttons.forEach(button => {
    button.addEventListener("click", () => scrollViewport(button));
  });

  const targetIds = [...new Set(buttons.map(button => button.dataset.scrollTarget).filter(Boolean))];
  targetIds.forEach(targetId => {
    const viewport = document.getElementById(targetId);
    if (!viewport) return;

    viewport.addEventListener("scroll", () => updateButtons(targetId), { passive: true });
    new ResizeObserver(() => updateButtons(targetId)).observe(viewport);

    const track = viewport.firstElementChild;
    if (track) {
      new MutationObserver(() => window.requestAnimationFrame(() => updateButtons(targetId)))
        .observe(track, { childList: true, subtree: true });
    }

    window.requestAnimationFrame(() => updateButtons(targetId));
  });
});
