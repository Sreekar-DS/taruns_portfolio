---
layout: default
title: Certifications
permalink: /certifications/
---

<h2>Certifications</h2>

<p class="page-intro">
  Selected certifications and credentials related to data analytics, business analytics, programming, and cloud fundamentals.
</p>

<div class="filter-box" id="certification-filter-box">
  <label><input type="checkbox" class="certification-filter" value="python"> Python</label>
  <label><input type="checkbox" class="certification-filter" value="sql"> SQL</label>
  <label><input type="checkbox" class="certification-filter" value="excel"> Excel</label>
  <label><input type="checkbox" class="certification-filter" value="tableau"> Tableau</label>
  <label><input type="checkbox" class="certification-filter" value="power bi"> Power BI</label>
  <label><input type="checkbox" class="certification-filter" value="data analytics"> Data Analytics</label>
  <label><input type="checkbox" class="certification-filter" value="data analysis"> Data Analysis</label>
  <label><input type="checkbox" class="certification-filter" value="business analysis"> Business Analysis</label>
  <label><input type="checkbox" class="certification-filter" value="aws"> AWS</label>
</div>

<div
  id="certifications"
  data-source="{{ '/assets/data/certifications.json' | relative_url }}"
  aria-live="polite">
  <p>Loading certifications...</p>
</div>

<script src="{{ '/assets/js/certifications.js' | relative_url }}" defer></script>
