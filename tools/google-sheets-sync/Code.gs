/*
 * Portfolio Google Sheets -> GitHub JSON sync
 *
 * Copy this file into Google Sheets: Extensions -> Apps Script.
 * Then reload the spreadsheet and use the Portfolio Sync menu.
 */

const CONFIG = {
  owner: "Sreekar-DS",
  repo: "taruns_portfolio",
  branch: "main",
  githubApiVersion: "2022-11-28",
  sheets: [
    {
      name: "Currently Working On",
      outputPath: "assets/data/currently-working-on.json",
      headers: [
        "title", "type", "status", "start_date", "expected_finish_date", "priority",
        "skills", "short_description", "progress", "github_link", "demo_link",
        "display_on_home"
      ]
    },
    {
      name: "Projects",
      outputPath: "assets/data/projects.json",
      headers: [
        "title", "type", "status", "start_date", "completion_date", "skills",
        "short_description", "long_description", "github_link", "demo_link", "image_url",
        "display_on_projects", "display_order"
      ]
    },
    {
      name: "Certifications",
      outputPath: "assets/data/certifications.json",
      headers: [
        "title", "issuer", "issue_date", "expiry_date", "credential_id",
        "credential_url", "image_url", "display_on_certifications"
      ]
    },
    {
      name: "Professional Development",
      outputPath: "assets/data/professional-development.json",
      headers: [
        "title", "provider", "type", "status", "start_date", "completion_date",
        "career_track_name", "skills", "short_description", "certificate_link", "image_url",
        "display_on_professional_development"
      ]
    },
    {
      name: "Experience",
      outputPath: "assets/data/experience.json",
      headers: [
        "company", "role", "experience_type", "location", "start_date", "end_date",
        "status", "summary", "highlights", "tools", "project_link", "image_url",
        "display_on_experience", "display_order"
      ]
    },
    {
      name: "Education",
      outputPath: "assets/data/education.json",
      headers: [
        "institution", "degree", "field_of_study", "location", "start_date", "end_date",
        "status", "details", "image_url", "display_on_education", "display_order"
      ]
    },
    {
      name: "Skills",
      outputPath: "assets/data/skills.json",
      headers: [
        "category", "skill", "display_on_skills", "display_order"
      ]
    }
  ]
};

const TOKEN_PROPERTY = "GITHUB_FINE_GRAINED_TOKEN";

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Portfolio Sync")
    .addItem("1. Save GitHub Token", "saveGitHubToken")
    .addItem("2. Validate Sheet Data", "validatePortfolioData")
    .addItem("3. Preview JSON", "previewPortfolioJson")
    .addSeparator()
    .addItem("Publish to GitHub", "publishPortfolioData")
    .addSeparator()
    .addItem("Clear Saved Token", "clearGitHubToken")
    .addToUi();
}

function saveGitHubToken() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    "Save GitHub Token",
    "Paste your fine-grained GitHub token. It will be stored in your Apps Script user properties, not in the sheet cells.",
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const token = response.getResponseText().trim();
  if (!token) {
    ui.alert("No token saved", "The token field was empty.", ui.ButtonSet.OK);
    return;
  }

  PropertiesService.getUserProperties().setProperty(TOKEN_PROPERTY, token);
  ui.alert("Saved", "GitHub token saved for your Google account. Now run Validate Sheet Data.", ui.ButtonSet.OK);
}

function clearGitHubToken() {
  PropertiesService.getUserProperties().deleteProperty(TOKEN_PROPERTY);
  SpreadsheetApp.getUi().alert("Cleared", "The saved GitHub token was removed from Apps Script user properties.", SpreadsheetApp.getUi().ButtonSet.OK);
}

function validatePortfolioData() {
  const result = buildPortfolioFiles();
  const ui = SpreadsheetApp.getUi();

  if (result.errors.length) {
    ui.alert("Validation failed", result.errors.join("\n\n"), ui.ButtonSet.OK);
    return;
  }

  ui.alert(
    "Validation passed",
    "Ready to publish. Files that will be generated:\n\n" + Object.keys(result.files).join("\n"),
    ui.ButtonSet.OK
  );
}

function previewPortfolioJson() {
  const result = buildPortfolioFiles();
  const ui = SpreadsheetApp.getUi();

  if (result.errors.length) {
    ui.alert("Validation failed", result.errors.join("\n\n"), ui.ButtonSet.OK);
    return;
  }

  const firstPath = CONFIG.sheets[0].outputPath;
  const preview = result.files[firstPath].slice(0, 4500);
  ui.alert("Preview: " + firstPath, preview + (result.files[firstPath].length > 4500 ? "\n\n...preview truncated..." : ""), ui.ButtonSet.OK);
}

function publishPortfolioData() {
  const ui = SpreadsheetApp.getUi();
  const token = getSavedToken_();

  if (!token) {
    ui.alert("GitHub token missing", "First run Portfolio Sync -> 1. Save GitHub Token.", ui.ButtonSet.OK);
    return;
  }

  const result = buildPortfolioFiles();
  if (result.errors.length) {
    ui.alert("Validation failed", result.errors.join("\n\n"), ui.ButtonSet.OK);
    return;
  }

  const commitResponse = ui.prompt(
    "Publish to GitHub",
    "Enter a commit message:",
    ui.ButtonSet.OK_CANCEL
  );
  if (commitResponse.getSelectedButton() !== ui.Button.OK) return;

  const commitMessage = commitResponse.getResponseText().trim() || "Update portfolio data from Google Sheets";

  const confirm = ui.alert(
    "Confirm publish",
    "This will create ONE GitHub commit on " + CONFIG.branch + " updating:\n\n" + Object.keys(result.files).join("\n") + "\n\nCommit message:\n" + commitMessage,
    ui.ButtonSet.OK_CANCEL
  );
  if (confirm !== ui.Button.OK) return;

  try {
    const commit = publishFilesToGitHub_(result.files, commitMessage, token);
    ui.alert(
      "Published successfully",
      "GitHub commit created:\n" + commit.html_url + "\n\nGitHub Pages will deploy automatically.",
      ui.ButtonSet.OK
    );
  } catch (error) {
    ui.alert("Publish failed", String(error.message || error), ui.ButtonSet.OK);
  }
}

function buildPortfolioFiles() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const timezone = spreadsheet.getSpreadsheetTimeZone() || Session.getScriptTimeZone();
  const files = {};
  const errors = [];

  CONFIG.sheets.forEach(config => {
    const sheet = spreadsheet.getSheetByName(config.name);
    if (!sheet) {
      errors.push("Missing sheet tab: " + config.name);
      return;
    }

    const values = sheet.getDataRange().getValues();
    if (!values.length) {
      files[config.outputPath] = "[]\n";
      return;
    }

    const headerRow = values[0].map(value => String(value || "").trim());
    const headerMap = {};
    headerRow.forEach((header, index) => {
      if (header) headerMap[header] = index;
    });

    const missingHeaders = config.headers.filter(header => !(header in headerMap));
    if (missingHeaders.length) {
      errors.push(config.name + " is missing headers: " + missingHeaders.join(", "));
      return;
    }

    const records = [];
    for (let rowIndex = 1; rowIndex < values.length; rowIndex++) {
      const row = values[rowIndex];
      if (isBlankRow_(row)) continue;

      const record = {};
      config.headers.forEach(header => {
        const cellValue = row[headerMap[header]];
        record[header] = normalizeValue_(header, cellValue, timezone);
      });
      records.push(record);
    }

    files[config.outputPath] = JSON.stringify(records, null, 2) + "\n";
  });

  return { files, errors };
}

function normalizeValue_(header, value, timezone) {
  if (value === null || value === undefined) return "";

  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, timezone, "yyyy-MM-dd");
  }

  if (["progress", "display_order"].includes(header)) {
    if (value === "") return "";
    const numberValue = Number(value);
    return isNaN(numberValue) ? value : numberValue;
  }

  if (header.startsWith("display_on_")) {
    if (value === "") return false;
    if (typeof value === "boolean") return value;
    const text = String(value).trim().toLowerCase();
    return ["true", "yes", "y", "1"].includes(text);
  }

  if (["skills", "tools"].includes(header)) {
    if (Array.isArray(value)) return value;
    return String(value || "")
      .split(/[,;|]/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  if (header === "highlights") {
    if (Array.isArray(value)) return value;
    return String(value || "")
      .split(/[|;]/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  return String(value || "").trim();
}

function isBlankRow_(row) {
  return row.every(value => value === null || value === undefined || String(value).trim() === "");
}

function getSavedToken_() {
  return PropertiesService.getUserProperties().getProperty(TOKEN_PROPERTY);
}

function publishFilesToGitHub_(files, message, token) {
  const head = githubRequest_("get", "/repos/" + CONFIG.owner + "/" + CONFIG.repo + "/git/ref/heads/" + CONFIG.branch, null, token);
  const parentSha = head.object.sha;

  const parentCommit = githubRequest_("get", "/repos/" + CONFIG.owner + "/" + CONFIG.repo + "/git/commits/" + parentSha, null, token);
  const baseTreeSha = parentCommit.tree.sha;

  const treeItems = [];
  Object.keys(files).forEach(path => {
    const blob = githubRequest_(
      "post",
      "/repos/" + CONFIG.owner + "/" + CONFIG.repo + "/git/blobs",
      { content: files[path], encoding: "utf-8" },
      token
    );

    treeItems.push({
      path: path,
      mode: "100644",
      type: "blob",
      sha: blob.sha
    });
  });

  const tree = githubRequest_(
    "post",
    "/repos/" + CONFIG.owner + "/" + CONFIG.repo + "/git/trees",
    { base_tree: baseTreeSha, tree: treeItems },
    token
  );

  const commit = githubRequest_(
    "post",
    "/repos/" + CONFIG.owner + "/" + CONFIG.repo + "/git/commits",
    { message: message, tree: tree.sha, parents: [parentSha] },
    token
  );

  githubRequest_(
    "patch",
    "/repos/" + CONFIG.owner + "/" + CONFIG.repo + "/git/refs/heads/" + CONFIG.branch,
    { sha: commit.sha, force: false },
    token
  );

  return commit;
}

function githubRequest_(method, path, payload, token) {
  const options = {
    method: method,
    muteHttpExceptions: true,
    headers: {
      "Authorization": "Bearer " + token,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": CONFIG.githubApiVersion
    }
  };

  if (payload !== null && payload !== undefined) {
    options.contentType = "application/json";
    options.payload = JSON.stringify(payload);
  }

  const url = "https://api.github.com" + path;
  const response = UrlFetchApp.fetch(url, options);
  const code = response.getResponseCode();
  const text = response.getContentText();

  if (code >= 200 && code < 300) {
    return text ? JSON.parse(text) : {};
  }

  throw new Error("GitHub API error " + code + " at " + path + ": " + text);
}
