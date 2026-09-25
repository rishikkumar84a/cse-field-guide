# Release validation

Release: **1.0.0**. Validation date: **2026-09-25**.

## Data integrity

- 75 unique units, U001–U075; fourteen semesters; 11,200 planned active hours.
- 1,550 unique resource records; all 473 original resource IDs retained.
- 38 laboratory sequences and 24 project contracts; parent-unit allocations resolve.
- First14 includes fourteen sessions; DIAG-01 through DIAG-28 are present.
- All hard prerequisite, staged co-requisite and module-gate references resolve.
- All active-path, specialization, laboratory, project and resource mappings resolve.
- 1,014 mapping rows are retained, including intentional repeated rows.
- Primary verification counts remain 570 PAGE VERIFIED, 60 DIRECT ACCESS VERIFIED,
  876 NOT VERIFIED, 39 RESTRICTED and 5 BROKEN.
- A comparison against the preceding source tree confirms preservation of all
  curriculum, resource, activity, diagnostic and provenance data except approved
  public collection labels and removal of two URL tracking parameters.

## Automated checks

- `npm install --ignore-scripts`: passed; no dependencies to install.
- `npm run lint`: passed; syntax checks for seven JavaScript source files.
- `npm test`: passed; sixteen tests, zero failures.
- `npm run build`: passed; 2,135 static page routes generated with a sitemap.
- No TypeScript or separate type-check command is configured.

Progress tests cover earlier backup formats, separate archived progress,
current-curriculum migration, invalid and duplicate imports, learning records,
persistence and protection of unreadable browser data. Route tests cover all
current units/resources, required views, invalid IDs, canonical metadata and
root-relative assets.

## Public file review

No matching credential values or disallowed filenames were found in the public
file scan. Personal learning records, environment values, source archives and
build output are excluded. Legitimate external attribution, technical learning
terms and the identifiers required to accept existing progress backups remain.
This review does not imply that third-party resource URLs were freshly verified.

## Browser and production status

Production is available at https://cse.rishik.tech on Vercel. The production
deployment is READY and was built from GitHub main commit
`f1c258d952d93315fe65638c2b66a535d33278a4`. Its build logs confirm that all
2,135 static page routes and the sitemap were generated successfully.

Verified against the live deployment:

- Homepage, U001 and U075 deep links, About, Diagnostics, robots.txt and sitemap.xml
  return HTTP 200 over HTTPS.
- Unknown routes return the custom HTTP 404 page.
- Direct page responses contain the expected titles and canonical URLs.
- First14 renders fourteen sessions; Diagnostics renders DIAG-01 through DIAG-28.
- Diagnostic answer review is hidden before an attempt is submitted.
- U001 opens from the diagnostic repair route; unit details survive a page refresh.
- A changed unit status and evidence note persist through a full browser refresh.
- HTTPS responses include HSTS, content-type protection and framing protection.
- Cloudflare has a DNS-only CNAME for cse.rishik.tech targeting
  59d3fb422986e249.vercel-dns-017.com.
- The portfolio DNS records are unchanged. https://rishik.tech redirects to
  https://www.rishik.tech, which returns HTTP 200 with the maintainer's portfolio.

## Verification limits

Live browser checks of catalogue search/filter interactions and the mobile viewport
were not completed in this verification session. Automated route and integrity
checks cover the generated routes; not every route was individually visited in a
browser. HTTPS loaded successfully, but certificate issuer and expiry were not
separately inspected.

Diagnostic keys are deferred until review in the normal learner interface. This
static application is not a secure examination system: technically skilled users
can retrieve published assessment data. Progress is self-reported and browser-local.
Third-party resource availability and verification labels have not been upgraded.
