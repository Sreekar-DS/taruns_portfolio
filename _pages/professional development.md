---
layout: default
title: Professional Development
permalink: /professional development/
---

<div class="inner-dashboard-page professional-development-dashboard-page">
  <section class="inner-dashboard-panel inner-page-hero" aria-labelledby="professional-development-page-title">
    <div class="inner-page-hero-copy">
      <span class="inner-page-eyebrow">Continuous learning</span>
      <h1 id="professional-development-page-title">Professional Development</h1>
      <p>Courses and structured learning activities that support my development in analytics, business intelligence, programming, machine learning, and related tools.</p>
    </div>
    <span class="inner-page-hero-mark" aria-hidden="true">PD</span>
  </section>

  <div class="filter-box professional-type-filters" aria-label="Professional development type filters">
    <label><input type="radio" name="professional-filter" class="professional-filter" value="all" checked> All</label>
    <label><input type="radio" name="professional-filter" class="professional-filter" value="career-track-course"> Career Track Courses</label>
    <label><input type="radio" name="professional-filter" class="professional-filter" value="independent-course"> Independent Courses</label>
  </div>

  <section aria-labelledby="professional-development-list-title">
    <div class="inner-page-section-heading">
      <div>
        <span class="inner-page-eyebrow">Learning pathways</span>
        <h2 id="professional-development-list-title">Courses &amp; Career Tracks</h2>
      </div>
    </div>

    <div
      id="professional-development"
      data-source="{{ '/assets/data/professional-development.json' | relative_url }}?v={{ site.github.build_revision }}"
      aria-live="polite">
      <p>Loading professional development courses...</p>
    </div>
  </section>
</div>

<script src="{{ '/assets/js/professional-development.js' | relative_url }}?v={{ site.github.build_revision }}" defer></script>
