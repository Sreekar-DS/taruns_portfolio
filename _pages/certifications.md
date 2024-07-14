---
layout: default
title: Certifications
permalink: /certifications/
---
<div class="filter-box">
  <label><input type="checkbox" class="filter" value="python"> Python</label>
  <label><input type="checkbox" class="filter" value="sql"> SQL</label>
  <label><input type="checkbox" class="filter" value="excel"> Excel</label>
  <label><input type="checkbox" class="filter" value="tableau"> Tableau</label>
  <label><input type="checkbox" class="filter" value="powerbi"> Power BI</label>
  <label><input type="checkbox" class="filter" value="Data Analysis"> Data Analysis</label>
  <label><input type="checkbox" class="filter" value="Business Analysis"> Business Analysis</label>
</div>

<div class="certifications">
  <div class="certification-box" data-skills="sql">
    <h3>SQL Associate</h3>
    <div class="certification-dates">
      <p><strong>Issued date:</strong> Jan 2024</p>
      <p><strong>Expiration date:</strong> Jan 2026</p>
    </div>
    <div class="certification-org-cred">
      <p><strong>Issued by:</strong> Datacamp</p>
      <p><strong>Credential ID:</strong> SQA0013570873781</p>
    </div>
  </div>

  <div class="certification-box" data-skills="dataanalysis">
    <h3>Certificate of achievement - Data Analyst</h3>
    <div class="certification-dates">
      <p><strong>Issued date:</strong> Nov 2023</p>
      <p><strong>Expiration date:</strong> No expiry</p>
    </div>
    <div class="certification-org-cred">
      <p><strong>Issued by:</strong> 365 Data Science</p>
      <p><strong>Credential ID:</strong> DD-3DF0FA5ED4</p>
    </div>
  </div>
  
  <div class="certification-box" data-skills="businessanalysis">
    <h3>Certificate of achievement - Business Analyst</h3>
    <div class="certification-dates">
      <p><strong>Issued date:</strong> Nov 2023</p>
      <p><strong>Expiration date:</strong> No expiry</p>
    </div>
    <div class="certification-org-cred">
      <p><strong>Issued by:</strong> 365 Data Science</p>
      <p><strong>Credential ID:</strong> DD-43238FF645</p>
    </div>
  </div>
  
  <div class="certification-box" data-skills="dataanalysis">
    <h3>EF SET English Certification</h3>
    <div class="certification-dates">
      <p><strong>Issued date:</strong> Jan 2023</p>
      <p><strong>Expiration date:</strong> No expiry</p>
    </div>
    <div class="certification-org-cred">
      <p><strong>Issued by:</strong> EF Education First</p>
      <p><strong>Credential ID:</strong> ZEKp5E</p>
    </div>
  </div>
  
  <div class="certification-box" data-skills="python">
    <h3>Introduction to AWS</h3>
    <div class="certification-dates">
      <p><strong>Issued date:</strong> Jun 2024</p>
      <p><strong>Expiration date:</strong> No expiry</p>
    </div>
    <div class="certification-org-cred">
      <p><strong>Issued by:</strong> Datacamp</p>
      <p><strong>Credential ID:</strong> d0d755bdaa5</p>
    </div>
  </div>
  
  <div class="certification-box" data-skills="python">
    <h3>PCAP: Programming Essentials in Python</h3>
    <div class="certification-dates">
      <p><strong>Issued date:</strong> Jun 2023</p>
      <p><strong>Expiration date:</strong> No expiry</p>
    </div>
    <div class="certification-org-cred">
      <p><strong>Issued by:</strong> Cisco Networking Academy</p>
      <p><strong>Credential ID:</strong> 985eec45a</p>
    </div>
  </div>
</div>


<script>
  document.querySelectorAll('.filter').forEach(filter => {  
    filter.addEventListener('change', () => {
      const selectedFilters = Array.from(document.querySelectorAll('.filter:checked')).map(cb => cb.value);
      document.querySelectorAll('.certification-box').forEach(box => {
          const boxSkills = box.getAttribute('data-skills').split(' ');
          const isVisible = selectedFilters.length === 0 || selectedFilters.some(filter => boxSkills.includes(filter));
          box.style.display = isVisible ? 'block' : 'none';
        });
    });
  });
</script>
