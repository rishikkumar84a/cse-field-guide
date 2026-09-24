# V2.0 release validation

Validation date: **2026-09-21**. Source: **CSE Engineer Master Package V2.0**,
`Recovery and Resource Expansion 2.0 — 2026-09-20`.

Canonical source JSON SHA-256:
`26e729b6eba4f3e0eb1bf9dd9aab13b02b1f108e375900ea47434b0a66bc35e4`

## Data integrity

| Check | Result |
| --- | --- |
| Sequential units U001–U075 | 75/75; unique primary IDs |
| Original semester assignments and unit hours | Preserved exactly against the 75-unit baseline |
| Semesters and total planned active hours | 14; 11,200 (2,600 Foundation + 8,600 Engineering) |
| Canonical resources | 1,550; unique primary IDs |
| Original resource IDs | 473/473 preserved |
| Full laboratory / project contracts | 38/38 and 24/24 |
| First14 / diagnostics | 14 days; DIAG-01–DIAG-28 |
| Active scopes / semester queues | 75 unit scopes; 14 queues |
| Specialization options | 16 supplied tracks; learner chooses one |
| Prerequisite references | All resolve; no hard-prerequisite cycle |
| Dependency rows | 146 hard, 4 staged co-requisite, 4 same-semester module-gate |
| Unit/resource maps | All 1,014 source rows retained; all references resolve |
| Source preservation | SHA-256 checks for all 52 non-QA top-level source fields pass |
| Aliases / provenance | 2,410 source-qualified aliases; 1,964 provenance rows retained |
| Historical references | Old IDs in resource notes resolve through aliases from their source release |
| Verification | 570 PAGE VERIFIED; 60 DIRECT ACCESS VERIFIED; 876 NOT VERIFIED; 39 RESTRICTED; 5 BROKEN |
| Diagnostic learner payload | No answer keys; review keys are a separate file |

Repeated mapping rows and source-qualified aliases are preserved. They are not
duplicate canonical resource/unit IDs. Original grouped resource views and
planning/audit tables remain in `source-views.json` separately from assignments.

## Automated checks

Executed with Node.js **24.19.0**, npm **11.9.0**, and Python **3.12.14**:

```sh
npm test
npm run lint
npm run build
```

- **13 tests passed**, zero failures: canonical integrity, reference resolution,
  exact source hashes, verification preservation, legacy progress isolation,
  valid import/reload, invalid-import atomicity, and unreadable-storage protection.
- JavaScript syntax checks passed for the two application files and three Node
  scripts. This is syntax validation, not a separate style-lint engine.
- Static production output was generated successfully from `web/` and `data/`.

The environment emits an npm warning about its `http-proxy` configuration. It
does not change the exit status or indicate a project dependency failure.

## Browser review

Reviewed the existing application in Chromium through the development preview:

- First14 contains fourteen sessions; day status and notes survive reload.
- DIAG-01–DIAG-28 are navigable. No review key is rendered before submission;
  a submitted attempt reveals its key. The next unsubmitted question keeps its
  key hidden, even after a previous review.
- Foundation Year 1 contains U001–U008; its first semester contains U001–U004.
  All-years browsing displays all 75 units. Semester and text filters work.
- Unit details retain source scopes, resource mappings, and prerequisite links.
  Unit progress and literal markup in notes survive a direct-link reload safely.
- U029 shows hard prerequisites separately from the U028 staged co-requisite
  and module gate. U032 shows its supplied staged and module requirements.
- The graph renders all 75 navigable nodes inside its viewBox. U032 selection
  updates the displayed relationships and gate evidence.
- The catalogue shows 1,550 records and 18 resource types. BROKEN returns five
  records. Type plus ID search locates BOOK-5016; its provenance loads on request.
- The active path has fourteen semester choices and six queue categories.
  U002 uses BOOK-5016 with the supplied high-school physics scope and deferral.
- Labs and projects show 38 and 24 contracts. Their detail dialogs expose the
  source experiment/design requirements and local evidence fields.
- Specialization offers sixteen tracks and stores one selected track; the choice survives reload.
- Browser import accepts a valid backup. An invalid version is rejected while the existing completion count remains unchanged. The exported JSON file was read and checked for the expected unit, First14, lab, and specialization records.

Desktop layout showed no page-wide horizontal overflow. A temporary same-origin
review harness tested **390 px and 768 px frames** (375 px and 753 px content
widths with scrollbars). First14, diagnostics, curriculum, graph, active path,
catalogue, labs, projects, specialization, and About all fit their content widths.
The phone unit dialog and prerequisite tab also fit without horizontal overflow.
The graph and mobile navigation intentionally scroll inside their own regions.
The temporary harness is excluded from the release.

## Release cleanup

The release file scan found no private keys, known GitHub/OpenAI/AWS credential
patterns, credential-bearing URLs, private workspace paths, environment files,
source archives, PDFs, spreadsheets, or logs. Generated output and the temporary
responsive harness are excluded from Git. The supplied logo and useful social
asset remain in the application. This pattern scan is not a general security
audit.

## Limits of this validation

- Responsive frames test CSS layout in Chromium; they are not physical Android,
  iOS, Safari, touch-input, or screen-reader certification.
- This is not an external link-verification sweep. Source access restrictions,
  broken links, historical states, and unverified candidates remain unchanged.
- Static diagnostic keys remain accessible through source inspection; the app
  provides practice-test review gating, not examination security.
- Existing source tensions, including a same-semester hard prerequisite and
  module gate for U068 → U070, are preserved rather than silently rewritten.
- Release publication and repository settings must be verified through their
  hosting/GitHub responses; a successful local build alone does not prove them.
