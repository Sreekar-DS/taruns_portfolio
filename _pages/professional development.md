---
layout: default
title: Professional Development
permalink: /professional development/
---

<h2>Professional Development Courses</h2>

<p class="page-intro">
  Courses and learning activities that support my development in analytics, business intelligence, programming, and related tools.
</p>

<div class="filter-box">
  <label><input type="radio" name="professional-filter" class="professional-filter" value="all" checked> All</label>
  <label><input type="radio" name="professional-filter" class="professional-filter" value="career-track"> Career Track</label>
  <label><input type="radio" name="professional-filter" class="professional-filter" value="career-track-course"> Career Track Course</label>
  <label><input type="radio" name="professional-filter" class="professional-filter" value="independent-course"> Independent Course</label>
</div>

<div id="skills-filter-box" class="filter-box hidden" aria-label="Skill filters">
  <!-- Skill checkboxes are loaded from JSON. -->
</div>

<div
  id="professional-development"
  data-source="{{ '/assets/data/professional-development.json' | relative_url }}"
  aria-live="polite">
  <p>Loading professional development courses...</p>
</div>

<script src="{{ '/assets/js/professional-development.js' | relative_url }}" defer></script>
