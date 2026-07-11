---
layout: default
title: Publication
permalink: /publication/
---

<div
  id="publications-page"
  class="data-page publications-data-page"
  data-source="{{ '/assets/data/publications.json' | relative_url }}?v={{ site.github.build_revision }}">
  <h2>Publications</h2>
  <div id="publications-list" class="portfolio-card-grid" aria-live="polite">
    <p>Loading publications…</p>
  </div>
</div>

<script src="{{ '/assets/js/publications.js' | relative_url }}?v={{ site.github.build_revision }}" defer></script>
