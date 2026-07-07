# TariffsFreeComponents.com MVP

This is a static marketplace prototype for a tariff-advantaged component sourcing platform.

## Product direction

The strongest version of the idea is a procurement marketplace, not a simple directory. Buyers search components by industry, HTS family, country of origin, verification tier, and duty profile. Suppliers pay for premium visibility where buyer intent is strongest: category searches, HTS pages, alternative-source searches, and RFQ bundles.

## Current prototype

- Searchable component marketplace
- Supplier verification tiers
- Premium listing placement
- BOM-to-RFQ interaction
- RFQ modal
- Supplier pricing/monetization section
- Compliance-safe language that avoids guaranteeing tariff treatment
- Seed supplier database in `data/suppliers.csv`
- Supplier verification schema in `data/supplier_schema.json`
- Supplier acquisition playbook in `data/supplier_sourcing_playbook.md`

## Run locally

Run a static server from this directory:

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`. A server is recommended because the marketplace loads `data/suppliers.json`.

## Launch

This is ready for a static host such as Netlify, Cloudflare Pages, GitHub Pages, or Vercel. Netlify is the fastest path because the RFQ and supplier forms already include Netlify Forms attributes.

Deployment files included:

- `CNAME`
- `_headers`
- `_redirects`
- `robots.txt`
- `sitemap.xml`
- `site.webmanifest`
- `404.html`
- `privacy.html`
- `terms.html`
- `thanks.html`

## Suggested next build

- Supplier onboarding and listing management
- Real RFQ capture backed by email or CRM
- HTS/category content pages for SEO
- Admin review workflow for origin documentation
- Buyer account with saved searches and tariff alerts
