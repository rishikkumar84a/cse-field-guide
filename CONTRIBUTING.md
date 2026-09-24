# Contributing to CSE Field Guide

Start with an issue that states the problem, the affected unit/resource IDs or
route, and a reproducible example. Keep pull requests focused enough to review.

## Code and accessibility

Preserve working navigation, browser-local progress, import compatibility, and
the existing design system. Test keyboard use, narrow layouts, dialogs, empty
results, and reloads for the flows you change. Escape source and learner text;
permit only HTTP(S) links to external resources. Never commit learning backups,
credentials, local environment files, or build output.

Run before proposing a change:

```sh
npm test
npm run lint
npm run build
```

No third-party dependencies are needed. Add a dependency only when its benefit
justifies its maintenance, accessibility, and security cost.

## Curriculum and data

CSE Engineer Master Package V2.0 is the canonical baseline. Curriculum changes
need a separate rationale and maintainer review. Do not shorten the curriculum,
change hours to make a test pass, renumber entities, turn catalogue candidates
into assignments, or merge the archived 69-unit edition into V2.0.

For a proposed data correction, include:

- Affected IDs, original values, proposed values, and the reason.
- The exact source and inspection date, with evidence for each verification claim.
- Effects on prerequisites, co-requisites, module gates, resource mappings,
  parent-unit hour accounting, and existing progress.
- Any uncertainty or access restrictions that remain.

A page response is not evidence of full-text access, video playback, execution,
licensing, or mastery. Preserve these dimensions separately. Keep failed or
restricted routes traceable. Never add unauthorized copies of books, papers,
course files, or other third-party works.

`data/provenance.json` records source-qualified aliases. Reused historical IDs
must be resolved within their original source release; a global search/replace
can link a learner to the wrong resource. Repeated source mapping rows may be
intentional and must not be silently deleted.

The importer and manifest make source changes reviewable. Re-import only from
an authorized, explicitly selected source version. Update manifests and tests
with evidence, not merely to silence a failing integrity check. Preserve the
previous source's identity when a new version is introduced.

## Documentation and submissions

Use clear language and distinguish curriculum intentions from tested outcomes.
Do not claim accreditation, guaranteed careers, university affiliation, or
verification that has not occurred. Include the actual commands and browser
flows you checked in your pull request. Follow CODE_OF_CONDUCT.md; use SECURITY.md
for sensitive vulnerability reports.
