document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const message = document.getElementById("dashboard-profile-message");
  if (!message) return;

  const messages = [
    "Turning data into practical insights, business decisions, and analytics-focused solutions.",
    "Turning data into insights, building solutions, and supporting better business decisions.",
    "Connecting analytics, business understanding, and applied AI."
  ];

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    message.textContent = messages[0];
    return;
  }

  let messageIndex = 0;
  let characterIndex = messages[0].length;
  let deleting = false;

  window.setTimeout(function typeLoop() {
    const currentMessage = messages[messageIndex];
    characterIndex += deleting ? -1 : 1;
    message.textContent = currentMessage.slice(0, Math.max(0, characterIndex));

    let delay = deleting ? 24 : 42;
    if (!deleting && characterIndex >= currentMessage.length) {
      deleting = true;
      delay = 1800;
    } else if (deleting && characterIndex <= 0) {
      deleting = false;
      messageIndex = (messageIndex + 1) % messages.length;
      delay = 260;
    }

    window.setTimeout(typeLoop, delay);
  }, 1600);
});