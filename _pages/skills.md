---
layout: default
title: Skills
permalink: /skills/
---

<h2>Skills</h2>

<p class="page-intro">
  A structured view of the technical, analytical, business, and communication skills I use across data analytics, business intelligence, SQL, Python, and applied AI projects.
</p>

<div
  id="skills"
  class="skills-category-grid"
  data-source="{{ '/assets/data/skills.json' | relative_url }}?v={{ site.github.build_revision }}"
  aria-live="polite">
  <p>Loading skills...</p>
</div>

<script src="{{ '/assets/js/skills.js' | relative_url }}?v={{ site.github.build_revision }}" defer></script>
