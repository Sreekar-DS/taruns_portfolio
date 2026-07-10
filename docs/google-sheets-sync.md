# Google Sheets Portfolio Sync

This workflow lets you edit portfolio data in Google Sheets and manually publish updates to GitHub only when you choose.

## Source spreadsheet

Google Sheet: `Taruns Portfolio Data`

Expected sheet tabs:

- `Currently Working On`
- `Projects`
- `Certifications`
- `Professional Development`
- `Experience`
- `Education`

The Apps Script reads these tabs and creates one GitHub commit that updates:

- `assets/data/currently-working-on.json`
- `assets/data/projects.json`
- `assets/data/certifications.json`
- `assets/data/professional-development.json`
- `assets/data/experience.json`
- `assets/data/education.json`

The deployed website reads these committed JSON files directly.

## Sorting rules

- `Currently Working On`: sorted by `priority` on the homepage: High, then Medium, then Low.
- `Projects`: sorted manually using `display_order`.
- `Certifications`: sorted by `issue_date` descending on the Certifications page.
- `Professional Development`: sorted by `completion_date` descending on the Professional Development page.
- `Experience`: sorted manually using `display_order`.
- `Education`: sorted manually using `display_order`.

## Required sheet headers

### Currently Working On

```text
title, type, status, start_date, expected_finish_date, priority, skills, short_description, progress, github_link, demo_link, display_on_home
```

### Projects

```text
title, type, status, start_date, completion_date, skills, short_description, long_description, github_link, demo_link, image_url, display_on_projects, display_order
```

### Certifications

```text
title, issuer, issue_date, expiry_date, credential_id, credential_url, image_url, display_on_certifications
```

### Professional Development

```text
title, provider, type, status, start_date, completion_date, career_track_name, skills, short_description, certificate_link, image_url, display_on_professional_development
```

### Experience

```text
company, role, experience_type, location, start_date, end_date, status, summary, highlights, tools, project_link, image_url, display_on_experience, display_order
```

### Education

```text
institution, degree, field_of_study, location, start_date, end_date, status, details, image_url, display_on_education, display_order
```

## Files in this repo

- `tools/google-sheets-sync/Code.gs` - copy this code into Google Sheets Apps Script.
- `docs/google-sheets-sync.md` - this setup guide.

## Step 1: Create a GitHub fine-grained token

Create a fine-grained personal access token with the smallest useful permission scope.

Recommended settings:

- Resource owner: `Sreekar-DS`
- Repository access: Only selected repositories
- Selected repository: `Sreekar-DS/taruns_portfolio`
- Repository permissions:
  - Contents: Read and write
- Expiration: choose a reasonable expiry, for example 90 days or 1 year

Copy the token when GitHub shows it. You will not be able to view it again later.

Do not paste the token into a normal spreadsheet cell and do not commit it to GitHub.

## Step 2: Add the Apps Script to Google Sheets

1. Open the `Taruns Portfolio Data` Google Sheet.
2. Go to **Extensions -> Apps Script**.
3. Delete any placeholder code.
4. Copy the full code from `tools/google-sheets-sync/Code.gs`.
5. Paste it into Apps Script.
6. Save the project.
7. Reload the Google Sheet tab.

A new menu should appear:

**Portfolio Sync**

## Step 3: Save the token privately

In the Google Sheet, open:

**Portfolio Sync -> 1. Save GitHub Token**

Paste the fine-grained GitHub token.

The token is stored using Apps Script user properties. It is not stored in any visible spreadsheet cell.

## Step 4: Validate data

Run:

**Portfolio Sync -> 2. Validate Sheet Data**

This checks that the required tabs and headers exist before publishing.

## Step 5: Preview JSON

Run:

**Portfolio Sync -> 3. Preview JSON**

This shows a preview of the generated `currently-working-on.json` file.

## Step 6: Publish to GitHub

Run:

**Portfolio Sync -> Publish to GitHub**

Enter a commit message such as:

```text
Update portfolio data from Google Sheets
```

The script will create one commit on `main` and update all JSON data files together.

## Important notes

- Edit the Google Sheet as much as you want. GitHub is not touched until you click **Publish to GitHub**.
- The Google Sheet and committed JSON files are now the live data source for the website.
- The old Excel export script is kept only as a legacy helper and is no longer run during GitHub Pages deployment.
- JSON is better for the portfolio because it is readable, version-controlled, and loaded directly by the website.
- If publishing fails with a GitHub API permission error, create a new fine-grained token and confirm that `Contents: Read and write` is enabled for this repository.
- If publishing fails because the branch moved, simply run Publish again after checking that the repo looks correct.
