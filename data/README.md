# Portfolio Data Workbook

Upload the Excel workbook as `data/portfolio_data.xlsx`.

The GitHub Actions workflow runs `scripts/export_portfolio_data.py` before the Jekyll build. The script reads the workbook sheets and exports JSON files to `assets/data/`.

Expected sheets:

- `Currently Working On`
- `Projects`
- `Certifications`
- `Professional Development`

For the homepage, the most important sheet is `Currently Working On`.
