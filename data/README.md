# Portfolio data workbook

Edit `portfolio_data.xlsx` to maintain small portfolio datasets from Excel.

The GitHub Actions workflow runs `scripts/export_portfolio_data.py` before the Jekyll build. The script converts workbook sheets into JSON files under `assets/data/`.

Current supported sheets:

- Currently Working On → `assets/data/currently-working-on.json`
- Projects → `assets/data/projects.json`
- Certifications → `assets/data/certifications.json`
- Professional Development → `assets/data/professional-development.json`

For now, the homepage uses only the `Currently Working On` sheet.
