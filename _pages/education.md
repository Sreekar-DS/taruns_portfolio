---
layout: default
title: Education
permalink: /education/
---

<h2>Education</h2>

<p class="page-intro">
  Academic background in data analytics, artificial intelligence, machine learning, and electronics and communication engineering.
</p>

<div
  id="education"
  class="portfolio-card-list-layout"
  data-source="{{ '/assets/data/education.json' | relative_url }}?v={{ site.github.build_revision }}"
  aria-live="polite">
  <p>Loading education...</p>
</div>

<script src="{{ '/assets/js/education.js' | relative_url }}?v={{ site.github.build_revision }}" defer></script>
