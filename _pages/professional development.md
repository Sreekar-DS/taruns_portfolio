---
layout: default
title: Professional Development
permalink: /professional development/
---
<h2>Professional Development Courses</h2>

<!-- Filter Section -->
<div class="filter-box">
  <label><input type="radio" name="filter" class="filter" value="all" checked> All</label>
  <label><input type="radio" name="filter" class="filter" value="career-track"> Career Track</label>
  <label><input type="radio" name="filter" class="filter" value="independent-course"> Independent Course</label>
</div>

<!-- Containers for Courses -->
<div id="certifications">
  <!-- Courses will be dynamically inserted here -->
</div>

<div id="career-tracks" class="hidden">
  <!-- Career Tracks and their courses will be dynamically inserted here by JavaScript -->
</div>

<script>
document.addEventListener("DOMContentLoaded", function() {
  const certificationsContainer = document.getElementById("certifications");
  const careerTracksContainer = document.getElementById("career-tracks");

  fetch('path/to/courses.json')
    .then(response => response.json())
    .then(certifications => {

      function renderCertifications(filter) {
        certificationsContainer.innerHTML = "";
        careerTracksContainer.innerHTML = "";
        
        if (filter === "career-track") {
          const tracks = {};

          certifications.forEach(cert => {
            if (cert["Course Type"] === "Career Track Course") {
              const trackNames = cert["Career Track Name"].split(", ");
              trackNames.forEach(track => {
                if (!tracks[track]) {
                  tracks[track] = [];
                }
                tracks[track].push(cert);
              });
            }
          });

          for (const [trackName, courses] of Object.entries(tracks)) {
            const trackContainer = document.createElement("div");
            trackContainer.classList.add("track-container");

            const trackTitle = document.createElement("h3");
            trackTitle.innerHTML = `${trackName} <span class="toggle-arrow">&#x25BC;</span>`;
            trackContainer.appendChild(trackTitle);

            const courseList = document.createElement("div");
            courseList.classList.add("course-list", "hidden");

            courses.forEach(cert => {
              const courseBox = document.createElement("div");
              courseBox.classList.add("certification-box");

              courseBox.innerHTML = `
                <h3>${cert["Course Name"]}</h3>
                <div class="course-org-date">
                  <p><strong>Issued by:</strong> ${cert["Organisation"]}</p>
                  <p><strong>Issued date:</strong> ${cert["Issued Date"]}</p>
                </div>
                <div class="certification-org-cred">
                  <p><strong>Credential ID:</strong> <a href="${cert["Credential URL"]}">${cert["Credential ID"]}</a></p>
                </div>
              `;

              courseList.appendChild(courseBox);
            });

            trackContainer.appendChild(courseList);
            careerTracksContainer.appendChild(trackContainer);

            trackTitle.addEventListener("click", () => {
              courseList.classList.toggle("hidden");
            });
          }

          certificationsContainer.classList.add("hidden");
          careerTracksContainer.classList.remove("hidden");

        } else {
          certifications.forEach(cert => {
            const courseTypeClass = cert["Course Type"].toLowerCase().replace(" ", "-");

            if (filter === "all" || courseTypeClass === filter) {
              const certificationBox = document.createElement("div");
              certificationBox.classList.add("certification-box");
              certificationBox.classList.add(courseTypeClass);

              certificationBox.innerHTML = `
                <h3>${cert["Course Name"]}</h3>
                <div class="course-org-date">
                  <p><strong>Issued by:</strong> ${cert["Organisation"]}</p>
                  <p><strong>Issued date:</strong> ${cert["Issued Date"]}</p>
                </div>
                <div class="certification-org-cred">
                  <p><strong>Credential ID:</strong> <a href="${cert["Credential URL"]}">${cert["Credential ID"]}</a></p>
                </div>
              `;

              certificationsContainer.appendChild(certificationBox);
            }
          });

          certificationsContainer.classList.remove("hidden");
          careerTracksContainer.classList.add("hidden");
        }
      }

      document.querySelectorAll(".filter").forEach(filter => {
        filter.addEventListener("change", () => {
          const selectedFilter = document.querySelector(".filter:checked").value;
          renderCertifications(selectedFilter);
        });
      });

      renderCertifications("all"); // Initial render
    })
    .catch(error => console.error('Error loading JSON:', error));
});
</script>
