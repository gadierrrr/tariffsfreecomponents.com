# Launch Checklist

## Current Launch State

The site has been published to GitHub:

- Repository: `https://github.com/gadierrrr/tariffsfreecomponents.com`
- Pages source: `main` branch, repository root
- Custom domain configured in GitHub Pages: `tariffsfreecomponents.com`
- Current blocker: DNS still points to Namecheap forwarding/parking records, not GitHub Pages.
- RFQ and supplier forms open an email draft to `hello@tariffsfreecomponents.com` on GitHub Pages.

## DNS Records To Set

At Namecheap, remove URL forwarding/parking records for the apex and `www`, then set:

```text
Type   Host   Value                  TTL
A      @      185.199.108.153        Automatic
A      @      185.199.109.153        Automatic
A      @      185.199.110.153        Automatic
A      @      185.199.111.153        Automatic
CNAME  www    gadierrrr.github.io    Automatic
```

After DNS resolves, return to GitHub Pages settings and enable "Enforce HTTPS".

## Email Setup

Create or forward this mailbox before sending buyer/supplier traffic:

```text
hello@tariffsfreecomponents.com
```

The GitHub Pages launch uses mail draft forms so the site can collect RFQ and supplier interest without a backend. If the site is later moved to Netlify, the existing form attributes can be used for hosted form capture.

## Alternate Upload Path

Use Netlify for the first launch because the static forms are already marked up for Netlify Forms.

1. Create a new Netlify site from this folder or drag the folder into Netlify deploys.
2. Set the publish directory to the repository root.
3. Leave the build command empty.
4. Add the custom domain `tariffsfreecomponents.com`.
5. Configure DNS:
   - Apex: Netlify A records or ALIAS/ANAME, depending on registrar support.
   - `www`: CNAME to the Netlify site hostname.
6. Enable HTTPS after DNS resolves.
7. Submit `https://tariffsfreecomponents.com/sitemap.xml` in Google Search Console.

## Launch Verification

Verify these after deployment:

- Home page loads at `https://tariffsfreecomponents.com/`
- `data/suppliers.json` returns HTTP 200
- Marketplace shows 60 supplier candidates
- Search for `connectors` returns relevant suppliers
- Buyer RFQ form submits and lands on `/thanks.html`
- Supplier listing form submits and lands on `/thanks.html`
- On GitHub Pages, buyer and supplier forms open addressed email drafts
- `/robots.txt` and `/sitemap.xml` return HTTP 200
- `/privacy.html`, `/terms.html`, and `/404.html` render
- Browser console has no JavaScript errors

## Compliance Guardrails

Do not publicly label a supplier or product as tariff-free, duty-free, USMCA eligible, Made in USA, or Section 301 exempt until product-level documentation has been collected and reviewed.

Use these safer labels before review:

- Supplier candidate
- Documented candidate
- North America source
- US manufacturing candidate
- Alternative source
- Verification needed

## Immediate Commercial Next Steps

- Contact the 18 priority-1 suppliers from `data/suppliers.csv`
- Ask for product-level origin and HTS documentation
- Convert qualified suppliers into verified listings
- Send buyer traffic to `#market`
- Send supplier acquisition traffic to `#sell`
