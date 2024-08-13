---
layout: default
title: Professional Development
permalink: /professionaldevelopment/
---
<h2>Professional Development Courses</h2>

<!-- Filter Section -->
<div class="filter-box">
  <div>
    <label><strong>Filter by Course Type:</strong></label>
    <select id="course-type-filter">
      <option value="all">All</option>
      <option value="career-track">Career Track</option>
      <option value="independent-course">Independent Course</option>
    </select>
  </div>
</div>

<!-- Career Tracks Container (will be shown/hidden based on selection) -->
<div id="career-tracks" class="hidden">
  <!-- Career Tracks will be dynamically inserted here by JavaScript -->
</div>

<!-- Independent Courses Container -->
<div id="certifications">
  <!-- Independent courses will be dynamically inserted here by JavaScript -->
</div>

<script>
  fetch('assets/courses.json')
    .then(response => response.json())
    .then(data => {
      const certificationsContainer = document.getElementById('certifications');
      const careerTracksContainer = document.getElementById('career-tracks');
      const courseTypeFilter = document.getElementById('course-type-filter');

      function renderCourses() {
        certificationsContainer.innerHTML = ''; // Clear independent courses
        careerTracksContainer.innerHTML = ''; // Clear career tracks

        const selectedCourseType = courseTypeFilter.value;

        if (selectedCourseType === 'career-track') {
          const careerTracks = [...new Set(data.courses.map(course => course.career_track_name))].filter(Boolean);

          careerTracks.forEach(track => {
            const trackDiv = document.createElement('div');
            trackDiv.classList.add('career-track');
            trackDiv.innerHTML = `
              <h3>${track} <span class="toggle-arrow">&#9660;</span></h3>
              <div class="track-courses hidden"></div>
            `;
            const trackCoursesDiv = trackDiv.querySelector('.track-courses');

            data.courses.forEach(course => {
              if (course.career_track_name === track) {
                const courseDiv = document.createElement('div');
                courseDiv.classList.add('certification-box');
                courseDiv.innerHTML = `
                  <h4>${course.title}</h4>
                  <div class="course-org-date">
                    <p><strong>Issued by:</strong> ${course.organization}</p>
                    <p><strong>Issued date:</strong> ${course.issue_date}</p>
                  </div>
                  <div class="certification-org-cred">
                    <p><strong>Credential ID:</strong> <a href="${course.credential_url}" target="_blank">${course.credential_id}</a></p>
                  </div>
                `;
                trackCoursesDiv.appendChild(courseDiv);
              }
            });

            // Add toggle functionality for showing/hiding track courses
            trackDiv.querySelector('.toggle-arrow').addEventListener('click', () => {
              trackCoursesDiv.classList.toggle('hidden');
              const arrow = trackDiv.querySelector('.toggle-arrow');
              arrow.textContent = trackCoursesDiv.classList.contains('hidden') ? '▼' : '▲';
            });

            careerTracksContainer.appendChild(trackDiv);
          });

          // Show career tracks container and hide independent courses
          careerTracksContainer.classList.remove('hidden');
          certificationsContainer.classList.add('hidden');

        } else if (selectedCourseType === 'independent-course') {
          data.courses.forEach(course => {
            if (course.course_type.toLowerCase().replace(/\s+/g, '-') === 'independent-course') {
              const certBox = document.createElement('div');
              certBox.classList.add('certification-box');
              certBox.innerHTML = `
                <h4>${course.title}</h4>
                <div class="course-org-date">
                  <p><strong>Issued by:</strong> ${course.organization}</p>
                  <p><strong>Issued date:</strong> ${course.issue_date}</p>
                </div>
                <div class="certification-org-cred">
                  <p><strong>Credential ID:</strong> <a href="${course.credential_url}" target="_blank">${course.credential_id}</a></p>
                </div>
              `;
              certificationsContainer.appendChild(certBox);
            }
          });

          // Show independent courses container and hide career tracks
          certificationsContainer.classList.remove('hidden');
          careerTracksContainer.classList.add('hidden');

        } else {
          // If "All" is selected, show both independent courses and career tracks
          renderCoursesForAll();
        }
      }

      function renderCoursesForAll() {
        renderCourses(); // Reset rendering based on the currently selected filter
      }

      // Initial rendering of courses
      renderCoursesForAll();

      // Add event listeners for filters
      courseTypeFilter.addEventListener('change', renderCourses);
    })
    .catch(error => console.error('Error fetching the JSON data:', error));
</script>
