---
layout: default
title: Education
permalink: /education/
---

<div class="inner-dashboard-page education-dashboard-page">
  <section class="inner-dashboard-panel inner-page-hero" aria-labelledby="education-page-title">
    <div class="inner-page-hero-copy">
      <span class="inner-page-eyebrow">Academic foundation</span>
      <h1 id="education-page-title">Education</h1>
      <p>Academic background spanning data analytics, artificial intelligence, machine learning, and electronics and communication engineering.</p>
    </div>
    <span class="inner-page-hero-mark" aria-hidden="true">ED</span>
  </section>

  <section aria-labelledby="education-list-title">
    <div class="inner-page-section-heading">
      <div>
        <span class="inner-page-eyebrow">Degrees &amp; study</span>
        <h2 id="education-list-title">Academic Journey</h2>
      </div>
    </div>

    <div
      id="education"
      class="portfolio-card-list-layout"
      data-source="{{ '/assets/data/education.json' | relative_url }}?v={{ site.github.build_revision }}"
      aria-live="polite">
      <p>Loading education...</p>
    </div>
  </section>
</div>

<script src="{{ '/assets/js/education.js' | relative_url }}?v={{ site.github.build_revision }}" defer></script>
