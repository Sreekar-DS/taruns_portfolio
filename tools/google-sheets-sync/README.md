# Google Sheets portfolio data workflow

The Google Sheet can be the main source of truth for portfolio content. The Apps Script in `Code.gs` converts sheet tabs to JSON files in `assets/data/` and commits them to `main`, which triggers the GitHub Pages deployment.

## One-time setup after updating `Code.gs`

1. Open the portfolio Google Sheet.
2. Go to **Extensions → Apps Script**.
3. Replace the existing script with the current repository version of `tools/google-sheets-sync/Code.gs`.
4. Save the Apps Script project and reload the Google Sheet.
5. Open **Portfolio Sync → 0. Create Missing Sheet Tabs**.
6. Review the new seeded tabs and values.
7. Run **Portfolio Sync → 2. Validate Sheet Data**.
8. Publish with **Portfolio Sync → Publish to GitHub**.

Existing sheet tabs are never overwritten by **Create Missing Sheet Tabs**. It only creates tabs that do not already exist.

## Tabs managed by Portfolio Sync

- `Profile & Opportunity`
- `Links`
- `Publications`
- `Awards`
- `Currently Working On`
- `Projects`
- `Certifications`
- `Professional Development`
- `Experience`
- `Education`
- `Skills`

## New dashboard content tabs

### Profile & Opportunity

Headers:

`name | primary_role | secondary_role | profile_summary | opportunity_label | opportunity_roles | display_on_home`

Use `opportunity_label` for text such as `Open to opportunities`, `Open to internships`, or `Working at Company Name`.

Enter multiple `opportunity_roles` separated by commas, semicolons, or `|`.

### Links

Headers:

`platform | label | url | external | display_on_home | display_order`

Examples include LinkedIn, GitHub, Kaggle, Tableau Public, a résumé link, or an internal portfolio page.

For an internal project-site route, use a relative path such as `projects/` rather than `/projects/`.

### Publications

Headers:

`title | publisher | publication_date | short_description | publication_url | display_on_home | display_order`

The homepage uses the first visible publication by `display_order`. The Publication page lists all publication records.

### Awards

Headers:

`title | organization | award_date | category | display_on_home | display_order`

The dashboard Awards KPI counts visible award records.

## Normal update workflow

1. Edit data in the Google Sheet.
2. Run **Portfolio Sync → 2. Validate Sheet Data**.
3. Run **Portfolio Sync → Publish to GitHub**.
4. Enter a commit message.
5. GitHub Pages rebuilds automatically after the commit reaches `main`.

Editing sheet cells alone does not publish the website. The **Publish to GitHub** step is what writes the updated JSON files to the repository.
