# Tarun Sreekar Parasa Portfolio

This repository contains my GitHub Pages portfolio built with Jekyll and `jekyll-theme-minimal`.

Live site: `https://sreekar-ds.github.io/taruns_portfolio/`

## Repository structure

- `_pages/home.html` — Home page content and homepage containers.
- `_pages/` — Other portfolio pages such as About, Experience, Education, Projects, Skills, Certifications, Professional Development, and Publication.
- `_layouts/default.html` — Main site layout, sidebar, header, footer, and navigation.
- `_sass/home.scss` — Homepage-specific SCSS styles.
- `assets/css/style.scss` — Main stylesheet that imports the theme and custom SCSS partials.
- `assets/js/home.js` — JavaScript that loads and renders the homepage “Currently Working On” cards.
- `assets/data/` — JSON data used by the portfolio pages.
- `data/portfolio_data.xlsx` — Source workbook for portfolio data updates.
- `scripts/export_portfolio_data.py` — Converts Excel workbook sheets into JSON files for the site.

## Data workflow

The GitHub Actions workflow runs before the Jekyll build:

1. Installs Python dependency `openpyxl`.
2. Runs `scripts/export_portfolio_data.py`.
3. Exports workbook sheets from `data/portfolio_data.xlsx` into `assets/data/`.
4. Builds and deploys the Jekyll site through GitHub Pages.

The homepage currently reads from:

```text
assets/data/currently-working-on.json
```

To update the homepage cards, update the `Currently Working On` sheet in `data/portfolio_data.xlsx`, commit the workbook, and let GitHub Actions rebuild the site.
