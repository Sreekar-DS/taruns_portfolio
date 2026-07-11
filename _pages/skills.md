---
layout: default
title: Skills
permalink: /skills/
---

<div class="inner-dashboard-page skills-dashboard-page">
  <section class="inner-dashboard-panel inner-page-hero" aria-labelledby="skills-page-title">
    <div class="inner-page-hero-copy">
      <span class="inner-page-eyebrow">Technical toolkit</span>
      <h1 id="skills-page-title">Skills</h1>
      <p>A structured view of the technical, analytical, business, and communication skills I use across data analytics, business intelligence, SQL, Python, machine learning, and applied AI projects.</p>
    </div>
    <span class="inner-page-hero-mark" aria-hidden="true">SK</span>
  </section>

  <section aria-labelledby="skills-list-title">
    <div class="inner-page-section-heading">
      <div>
        <span class="inner-page-eyebrow">Count, not proficiency</span>
        <h2 id="skills-list-title">Skills by Category</h2>
      </div>
    </div>

    <div
      id="skills"
      class="skills-category-grid"
      data-source="{{ '/assets/data/skills.json' | relative_url }}?v={{ site.github.build_revision }}"
      aria-live="polite">
      <p>Loading skills...</p>
    </div>
  </section>
</div>

<script src="{{ '/assets/js/skills.js' | relative_url }}?v={{ site.github.build_revision }}" defer></script>
