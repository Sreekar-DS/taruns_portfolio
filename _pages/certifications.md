---
layout: default
title: Certifications
permalink: /certifications/
---

<div class="inner-dashboard-page certifications-dashboard-page">
  <section class="inner-dashboard-panel inner-page-hero" aria-labelledby="certifications-page-title">
    <div class="inner-page-hero-copy">
      <span class="inner-page-eyebrow">Verified learning</span>
      <h1 id="certifications-page-title">Certifications</h1>
      <p>Selected credentials related to data analytics, business analytics, programming, English proficiency, and cloud fundamentals.</p>
    </div>
    <span class="inner-page-hero-mark" aria-hidden="true">CR</span>
  </section>

  <section aria-labelledby="certifications-list-title">
    <div class="inner-page-section-heading">
      <div>
        <span class="inner-page-eyebrow">Credentials &amp; recognition</span>
        <h2 id="certifications-list-title">Certification Portfolio</h2>
      </div>
    </div>

    <div
      id="certifications"
      class="portfolio-card-grid"
      data-source="{{ '/assets/data/certifications.json' | relative_url }}?v={{ site.github.build_revision }}"
      aria-live="polite">
      <p>Loading certifications...</p>
    </div>
  </section>
</div>

<script src="{{ '/assets/js/certifications.js' | relative_url }}?v={{ site.github.build_revision }}" defer></script>
