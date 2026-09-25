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

Browser, deployment, domain and HTTPS checks are pending publication. Build and
unit-test results above do not claim those checks have passed.
