document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const dashboard = document.getElementById("portfolio-dashboard");
  if (!dashboard) return;

  const sources = {
    projects: dashboard.dataset.projectsSource,
    currentWork: dashboard.dataset.currentWorkSource,
    certifications: dashboard.dataset.certificationsSource,
    learning: dashboard.dataset.learningSource
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthLookup = monthNames.reduce((lookup, month, index) => {
    lookup[month.toLowerCase()] = index;
    return lookup;
  }, {});

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function isVisible(item, key) {
    return !Object.prototype.hasOwnProperty.call(item, key) || item[key] !== false;
  }

  function normalizeSkills(skills) {
    if (Array.isArray(skills)) return skills.filter(Boolean).map(skill => String(skill).trim());
    if (typeof skills === "string") {
      return skills
        .split(/[,;|]/)
        .map(skill => skill.trim())
        .filter(Boolean);
    }
    return [];
  }

  function normalizeLearningTopic(topic) {
    const value = String(topic || "").trim();
    const aliases = {
      "Microsoft Excel": "Excel",
      "Google Spreadsheets": "Spreadsheets",
      "Data Visualization & Dashboarding": "Data Visualization",
      "Exploratory Data Analysis (EDA)": "EDA",
      "ML Model Building and Evaluation": "Machine Learning"
    };
    return aliases[value] || value;
  }

  async function loadJson(url) {
    if (!url) throw new Error("A learning chart data source is missing.");
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Unable to load ${url}`);
    return response.json();
  }

  function polarPoint(centerX, centerY, radius, angleDegrees) {
    const radians = (angleDegrees * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians)
    };
  }

  function pointsAttribute(points) {
    return points.map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  }

  function radarLabelMarkup(label, count, x, y, anchor) {
    const safeLabel = escapeHtml(label);
    const safeCount = Number(count) || 0;
    return `
      <text class="learning-radar-label" x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}">
        <tspan x="${x.toFixed(1)}" dy="0">${safeLabel}</tspan>
        <tspan class="learning-radar-value" x="${x.toFixed(1)}" dy="16">${safeCount} ${safeCount === 1 ? "course" : "courses"}</tspan>
      </text>
    `;
  }

  function renderLearningSummary(learningItems) {
    const container = document.getElementById("learning-summary-chart");
    if (!container) return;

    const topicCounts = learningItems.reduce((counts, item) => {
      normalizeSkills(item.skills).forEach(skill => {
        const topic = normalizeLearningTopic(skill);
        if (!topic) return;
        counts[topic] = (counts[topic] || 0) + 1;
      });
      return counts;
    }, {});

    const topics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 6);

    if (topics.length < 3) {
      container.innerHTML = '<p class="dashboard-loading">Not enough learning topics are available for the summary.</p>';
      return;
    }

    const width = 440;
    const height = 360;
    const centerX = 220;
    const centerY = 168;
    const radius = 105;
    const labelRadius = 143;
    const maximum = Math.max(...topics.map(([, count]) => count), 1);
    const angleStep = 360 / topics.length;
    const angles = topics.map((_, index) => -90 + index * angleStep);

    const gridPolygons = Array.from({ length: 5 }, (_, index) => {
      const gridRadius = radius * ((index + 1) / 5);
      const gridPoints = angles.map(angle => polarPoint(centerX, centerY, gridRadius, angle));
      return `<polygon class="learning-radar-grid" points="${pointsAttribute(gridPoints)}"></polygon>`;
    }).join("");

    const axes = angles.map(angle => {
      const point = polarPoint(centerX, centerY, radius, angle);
      return `<line class="learning-radar-axis" x1="${centerX}" y1="${centerY}" x2="${point.x.toFixed(1)}" y2="${point.y.toFixed(1)}"></line>`;
    }).join("");

    const dataPoints = topics.map(([, count], index) => {
      const normalizedRadius = radius * (count / maximum);
      return polarPoint(centerX, centerY, normalizedRadius, angles[index]);
    });

    const labels = topics.map(([label, count], index) => {
      const point = polarPoint(centerX, centerY, labelRadius, angles[index]);
      const cosine = Math.cos((angles[index] * Math.PI) / 180);
      const anchor = cosine > 0.25 ? "start" : cosine < -0.25 ? "end" : "middle";
      const yOffset = angles[index] > 20 && angles[index] < 160 ? 3 : angles[index] < -20 && angles[index] > -160 ? -4 : 0;
      return radarLabelMarkup(label, count, point.x, point.y + yOffset, anchor);
    }).join("");

    const pointMarkers = dataPoints.map((point, index) => `
      <circle class="learning-radar-point learning-radar-point-${(index % 3) + 1}" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4.5"></circle>
    `).join("");

    const ariaSummary = topics.map(([label, count]) => `${label}: ${count} courses`).join(", ");

    container.innerHTML = `
      <svg class="learning-radar-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Learning summary by completed course topic. ${escapeHtml(ariaSummary)}">
        <defs>
          <linearGradient id="learningRadarFill" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#20d3ee" stop-opacity="0.38"></stop>
            <stop offset="100%" stop-color="#1675d1" stop-opacity="0.2"></stop>
          </linearGradient>
          <filter id="learningRadarGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur"></feGaussianBlur>
            <feMerge><feMergeNode in="blur"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>
          </filter>
        </defs>
        <g aria-hidden="true">
          ${gridPolygons}
          ${axes}
          <polygon class="learning-radar-shape" points="${pointsAttribute(dataPoints)}"></polygon>
          ${pointMarkers}
        </g>
        ${labels}
      </svg>
      <p class="learning-radar-note">Course counts by topic, not a proficiency score.</p>
    `;
  }

  function parseMonthKey(value) {
    const text = String(value || "").trim();
    if (!text) return null;

    const isoMatch = text.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
    if (isoMatch) {
      const year = Number(isoMatch[1]);
      const month = Number(isoMatch[2]);
      if (month >= 1 && month <= 12) return `${year}-${String(month).padStart(2, "0")}`;
    }

    const monthYearMatch = text.match(/^([A-Za-z]{3,9})\s+(\d{4})$/);
    if (monthYearMatch) {
      const month = monthLookup[monthYearMatch[1].slice(0, 3).toLowerCase()];
      if (month != null) return `${monthYearMatch[2]}-${String(month + 1).padStart(2, "0")}`;
    }

    const parsed = new Date(text);
    if (!Number.isNaN(parsed.getTime())) {
      return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
    }

    return null;
  }

  function formatMonthLabel(key) {
    const [year, month] = key.split("-").map(Number);
    return `${monthNames[month - 1]} '${String(year).slice(-2)}`;
  }

  function selectTimelineKeys(keys, maximumPoints = 10) {
    if (keys.length <= maximumPoints) return keys;

    const indexes = new Set([0, keys.length - 1]);
    for (let index = 1; index < maximumPoints - 1; index += 1) {
      indexes.add(Math.round((index * (keys.length - 1)) / (maximumPoints - 1)));
    }

    return [...indexes]
      .sort((a, b) => a - b)
      .map(index => keys[index]);
  }

  function cumulativeValues(events, keys) {
    const sortedEvents = events.slice().sort();
    let eventIndex = 0;
    let cumulative = 0;

    return keys.map(key => {
      while (eventIndex < sortedEvents.length && sortedEvents[eventIndex] <= key) {
        cumulative += 1;
        eventIndex += 1;
      }
      return cumulative;
    });
  }

  function niceAxisMaximum(value) {
    if (value <= 5) return Math.max(5, value);
    const magnitude = 10 ** Math.floor(Math.log10(value));
    const normalized = value / magnitude;
    const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return niceNormalized * magnitude;
  }

  function linePath(points) {
    return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  }

  function renderLearningProgress({ learning, certifications, projects, currentWork }) {
    const container = document.getElementById("learning-progress-chart");
    if (!container) return;

    const courseEvents = learning
      .map(item => parseMonthKey(item.completion_date))
      .filter(Boolean);

    const certificationEvents = certifications
      .map(item => parseMonthKey(item.issue_date))
      .filter(Boolean);

    const projectEvents = [...projects, ...currentWork]
      .map(item => parseMonthKey(item.start_date || item.completion_date))
      .filter(Boolean);

    const allKeys = [...new Set([...courseEvents, ...certificationEvents, ...projectEvents])].sort();
    const keys = selectTimelineKeys(allKeys, 10);

    if (keys.length < 2) {
      container.innerHTML = '<p class="dashboard-loading">Add more completion, issue, or start dates to build the progress timeline.</p>';
      return;
    }

    const series = [
      { key: "courses", label: "Courses completed", values: cumulativeValues(courseEvents, keys), color: "#20d3ee" },
      { key: "certifications", label: "Certifications earned", values: cumulativeValues(certificationEvents, keys), color: "#f044a4" },
      { key: "projects", label: "Projects started", values: cumulativeValues(projectEvents, keys), color: "#f5c84c" }
    ];

    const width = 920;
    const height = 320;
    const margin = { top: 24, right: 46, bottom: 52, left: 52 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const maximumValue = Math.max(...series.flatMap(item => item.values), 1);
    const axisMaximum = niceAxisMaximum(maximumValue);
    const yTickCount = 5;

    const xForIndex = index => margin.left + (index * plotWidth) / (keys.length - 1);
    const yForValue = value => margin.top + plotHeight - (value / axisMaximum) * plotHeight;

    const horizontalGrid = Array.from({ length: yTickCount + 1 }, (_, index) => {
      const value = Math.round((axisMaximum * index) / yTickCount);
      const y = yForValue(value);
      return `
        <line class="learning-progress-grid-line" x1="${margin.left}" y1="${y.toFixed(1)}" x2="${width - margin.right}" y2="${y.toFixed(1)}"></line>
        <text class="learning-progress-axis-label learning-progress-y-label" x="${margin.left - 13}" y="${(y + 4).toFixed(1)}" text-anchor="end">${value}</text>
      `;
    }).join("");

    const verticalGrid = keys.map((key, index) => {
      const x = xForIndex(index);
      return `
        <line class="learning-progress-vertical-line" x1="${x.toFixed(1)}" y1="${margin.top}" x2="${x.toFixed(1)}" y2="${margin.top + plotHeight}"></line>
        <text class="learning-progress-axis-label learning-progress-x-label" x="${x.toFixed(1)}" y="${height - 18}" text-anchor="middle">${formatMonthLabel(key)}</text>
      `;
    }).join("");

    const seriesMarkup = series.map((item, seriesIndex) => {
      const points = item.values.map((value, index) => ({ x: xForIndex(index), y: yForValue(value), value }));
      const lastPoint = points[points.length - 1];
      const labelOffset = seriesIndex === 0 ? -10 : seriesIndex === 1 ? 2 : 15;
      const markers = points.map(point => `
        <circle class="learning-progress-point" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4" style="--series-color:${item.color}"></circle>
      `).join("");

      return `
        <path class="learning-progress-line" d="${linePath(points)}" style="--series-color:${item.color}"></path>
        ${markers}
        <text class="learning-progress-end-label" x="${(lastPoint.x + 10).toFixed(1)}" y="${(lastPoint.y + labelOffset).toFixed(1)}" style="--series-color:${item.color}">${lastPoint.value}</text>
      `;
    }).join("");

    const legend = series.map(item => `
      <span><i style="--series-color:${item.color}"></i>${escapeHtml(item.label)}</span>
    `).join("");

    const ariaSummary = series.map(item => `${item.label}: ${item.values[item.values.length - 1]}`).join(", ");

    container.innerHTML = `
      <div class="learning-progress-legend" aria-hidden="true">${legend}</div>
      <svg class="learning-progress-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Learning progress over time. ${escapeHtml(ariaSummary)}">
        <g aria-hidden="true">
          ${horizontalGrid}
          ${verticalGrid}
          ${seriesMarkup}
        </g>
      </svg>
      <p class="learning-progress-note">Cumulative milestones use the available course completion, certification issue, and project start dates.</p>
    `;
  }

  Promise.all([
    loadJson(sources.projects),
    loadJson(sources.currentWork),
    loadJson(sources.certifications),
    loadJson(sources.learning)
  ])
    .then(([projects, currentWork, certifications, learning]) => {
      const completedLearning = learning.filter(item =>
        isVisible(item, "display_on_professional_development") &&
        String(item.status || "").toLowerCase() === "completed"
      );
      const visibleCertifications = certifications.filter(item => isVisible(item, "display_on_certifications"));
      const visibleProjects = projects.filter(item => isVisible(item, "display_on_projects"));
      const visibleCurrentWork = currentWork.filter(item => isVisible(item, "display_on_home"));

      renderLearningSummary(completedLearning);
      renderLearningProgress({
        learning: completedLearning,
        certifications: visibleCertifications,
        projects: visibleProjects,
        currentWork: visibleCurrentWork
      });
    })
    .catch(error => {
      const summary = document.getElementById("learning-summary-chart");
      const progress = document.getElementById("learning-progress-chart");
      if (summary) summary.innerHTML = '<p class="dashboard-loading">Unable to load the learning summary.</p>';
      if (progress) progress.innerHTML = '<p class="dashboard-loading">Unable to load the progress timeline.</p>';
      console.error("Learning dashboard charts error:", error);
    });
});
