---
layout: default
title: Publication
permalink: /publication/
---

<div class="inner-dashboard-page publication-dashboard-page">
  <section class="inner-dashboard-panel inner-page-hero" aria-labelledby="publication-page-title">
    <div class="inner-page-hero-copy">
      <span class="inner-page-eyebrow">Research &amp; writing</span>
      <h1 id="publication-page-title">Publication</h1>
      <p>Research work and technical writing that reflect my earlier work in artificial intelligence, intelligent systems, and applied technology.</p>
    </div>
    <span class="inner-page-hero-mark" aria-hidden="true">PB</span>
  </section>

  <section
    id="publications-page"
    class="data-page publications-data-page"
    data-source="{{ '/assets/data/publications.json' | relative_url }}?v={{ site.github.build_revision }}"
    aria-labelledby="publications-list-title">
    <div class="inner-page-section-heading">
      <div>
        <span class="inner-page-eyebrow">Published work</span>
        <h2 id="publications-list-title">Research Portfolio</h2>
      </div>
    </div>

    <div id="publications-list" class="portfolio-card-grid" aria-live="polite">
      <p>Loading publications…</p>
    </div>
  </section>
</div>

<script src="{{ '/assets/js/publications.js' | relative_url }}?v={{ site.github.build_revision }}" defer></script>
