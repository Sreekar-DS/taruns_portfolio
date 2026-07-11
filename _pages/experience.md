---
layout: default
title: Experience
permalink: /experience/
---

<div class="inner-dashboard-page experience-dashboard-page">
  <section class="inner-dashboard-panel inner-page-hero" aria-labelledby="experience-page-title">
    <div class="inner-page-hero-copy">
      <span class="inner-page-eyebrow">Career experience</span>
      <h1 id="experience-page-title">Experience &amp; Internships</h1>
      <p>Professional and project-based internship experience across analytics, visualization, digital marketing analysis, business reporting, and project management.</p>
    </div>
    <span class="inner-page-hero-mark" aria-hidden="true">EX</span>
  </section>

  <section aria-labelledby="experience-list-title">
    <div class="inner-page-section-heading">
      <div>
        <span class="inner-page-eyebrow">Career timeline</span>
        <h2 id="experience-list-title">Roles &amp; Practical Experience</h2>
      </div>
    </div>

    <div
      id="experience"
      class="portfolio-card-list-layout"
      data-source="{{ '/assets/data/experience.json' | relative_url }}?v={{ site.github.build_revision }}"
      aria-live="polite">
      <p>Loading experience...</p>
    </div>
  </section>
</div>

<script src="{{ '/assets/js/experience.js' | relative_url }}?v={{ site.github.build_revision }}" defer></script>
