# Google Sheets Portfolio Sync

This workflow lets you edit portfolio data in Google Sheets and manually publish updates to GitHub only when you choose.

## Source spreadsheet

Google Sheet: `Taruns Portfolio Data`

Expected sheet tabs:

- `Currently Working On`
- `Projects`
- `Certifications`
- `Professional Development`

The Apps Script reads these tabs and creates one GitHub commit that updates:

- `assets/data/currently-working-on.json`
- `assets/data/projects.json`
- `assets/data/certifications.json`
- `assets/data/professional-development.json`

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
- The `.xlsx` file is no longer the best live source because Excel files are binary and do not show clean Git diffs.
- JSON is better for the portfolio because it is readable, version-controlled, and loaded directly by the website.
- If publishing fails with a GitHub API permission error, create a new fine-grained token and confirm that `Contents: Read and write` is enabled for this repository.
- If publishing fails because the branch moved, simply run Publish again after checking that the repo looks correct.
