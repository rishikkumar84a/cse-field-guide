# CSE Field Guide

### Learn • Build • Explore • Become

An interactive seven-year Computer Science & Engineering education and mastery system for independent learners.

<p align="center"><img src="web/assets/logo.png" alt="CSE Field Guide" width="320"></p>

**Live Website:** [https://cse.rishik.tech](https://cse.rishik.tech)

**Created and maintained by:** Rishik Kumar Chaurasiya
**Portfolio:** [rishik.tech](https://rishik.tech) · [www.rishik.tech](https://www.rishik.tech)
**GitHub:** [rishikkumar84a/cse-field-guide](https://github.com/rishikkumar84a/cse-field-guide)

## Overview

CSE Field Guide combines curriculum planning, prerequisite navigation, learning resources, laboratories, projects, assessment and local progress tracking. It provides a structured route from foundational mathematics, science and computing to advanced engineering, one specialization and independent investigation. Learning is demonstrated through problems, experiments, implementations, reports and review, rather than through a list of visited links.

## Why CSE Field Guide

Independent study needs more than a collection of courses. Learners need to know what comes first, what to study now, how subjects connect and what evidence demonstrates understanding. This project makes those relationships inspectable while keeping a broad resource catalogue separate from the work currently assigned.

## Curriculum at a Glance

| Component | Planned scope |
| --- | --- |
| Foundation | 2 Foundation Years |
| Engineering | 5 Engineering Years |
| Semesters | 14 Semesters |
| Curriculum | 75 Units, U001–U075 |
| Time | 11,200 Planned Active Hours |
| Laboratories | 38 Labs |
| Engineering work | 24 Projects |
| Specialization | One Specialization, selected from 16 track options |

Laboratory and project hours are included in parent-unit allocations. Do not add them again. The catalogue contains **1,550 resource records**, including all **473 original resource IDs**. Archived study records are available separately for reference and progress compatibility; the current curriculum always contains all 75 units.

## What It Covers

- Mathematics, proof, probability, statistics and numerical methods.
- Physics, chemistry, materials, measurement, engineering drawing and CAD.
- Circuits, electronics, digital logic, architecture and embedded systems.
- Programming, algorithms, data structures, languages, compilers and computation theory.
- Operating systems, networks, databases, distributed systems and parallel computing.
- Security, cryptography, formal methods, AI and machine learning.
- Software engineering, design, testing, reliability, professional ethics and technical communication.
- Specialization, research literacy, independent engineering systems and external defense.

## Features

- Curriculum explorer with Year → Semester → Unit navigation and direct links to every unit.
- Prerequisite graph distinguishing hard dependencies, staged co-requisites and module gates.
- First14 orientation and 28 diagnostics with review after an attempted response.
- Active learning paths with assigned scopes, sequencing and stopping points.
- Searchable resource catalogue with type, year and verification filters.
- Complete laboratory, project and specialization contracts.
- Browser-local progress, evidence notes and validated JSON backup import/export.
- Resource provenance, source-qualified aliases and preserved verification states.
- Responsive interface, keyboard navigation, page metadata, sitemap and a 404 page.

## How to Start

1. Open [First14](https://cse.rishik.tech/first14) and establish a repeatable study routine.
2. Attempt the [Diagnostics](https://cse.rishik.tech/diagnostics) independently and record your reasoning.
3. Enter [Foundation Year 1](https://cse.rishik.tech/curriculum/FY1).
4. Begin with U001–U004, following prerequisites, repair routes and the active semester scope.
5. Keep evidence of your work and export progress backups regularly.

The starting route is **First14 → Diagnostics → Foundation → U001–U004**. Skip material only when you can demonstrate the required competence.

## First14 and Diagnostics

First14 contains fourteen starting sessions. DIAG-01 through DIAG-28 help identify skills as MASTERED, PARTIAL, WEAK or MISSING. Answer review is loaded only after submission and shown only for an attempted item. Classification does not automatically complete a curriculum unit.

The application is a self-study tool. Answer keys are public source files, so the interface does not provide a secure or proctored examination system.

## Prerequisite System

**Hard prerequisites** identify required earlier knowledge. **Staged co-requisites** permit carefully ordered work within a semester. **Same-semester module gates** require particular evidence before a later module begins. The graph and unit detail pages expose these relationships separately.

The source records 146 hard-prerequisite rows, four staged co-requisite rows and four module-gate rows. The U068 → U070 relationship appears as both a hard prerequisite and a module gate; both are retained for review. Completing a dependent unit never automatically completes its prerequisites.

## Labs and Projects

The 38 laboratory sequences specify objectives, theory, equipment, setup, safety, experiments, measurements, analysis, reports and assessment. The 24 projects include requirements, constraints, architecture, alternatives, implementation, testing, security, operations and maintenance.

Physical, simulated, virtual, remote and software evidence remain distinct. A simulation does not establish physical laboratory competence. Project completion requires actual work and evidence; catalogue labels do not certify execution.

## Resource Catalogue

The **master catalogue** is a broad reference universe. The **active learning path** is the smaller set relevant to current study, with exact chapters, lectures, practice, experiments and projects where recorded.

| Label | Purpose |
| --- | --- |
| NOW | Current semester pool, narrowed by assigned unit scopes |
| NEXT | Resources for the next planned stage |
| OPTIONAL | Enrichment or alternatives |
| LATER | Deferred work and explicit stopping points |
| REFERENCE | Consult when needed |
| ARCHIVE | Historical material without a current reading obligation |

Candidates, incomplete records, duplicate access routes and quarantined identities remain labelled. Catalogue membership is not an assignment. Source-qualified aliases prevent reused historical IDs from pointing to the wrong resource.

## Resource Verification

Verification labels describe the evidence recorded for a resource, not a promise of availability today.

| Label | What it establishes |
| --- | --- |
| PAGE VERIFIED | A page-level identity or metadata check was recorded |
| DIRECT ACCESS VERIFIED | Direct access to the resource was recorded |
| METADATA VERIFIED / BIBLIOGRAPHY VERIFIED | Specified descriptive or bibliographic information was checked |
| ACCESS NOT VERIFIED / NOT VERIFIED | The relevant check is absent or incomplete |
| RESTRICTED | Access is limited or blocked |
| BROKEN | A failed route is recorded |
| ARCHIVED | Material or a route is retained as an archive |
| DESIGNED | An activity has been specified; execution is not established |
| APP PLAYABILITY VERIFIED | An interactive application was checked for playability |
| PLAYBACK NOT VERIFIED | Video or audio playback has not been established |

Primary catalogue states are currently 570 PAGE VERIFIED, 60 DIRECT ACCESS VERIFIED, 876 NOT VERIFIED, 39 RESTRICTED and 5 BROKEN. Other dimensions and inherited labels remain in the detailed records. A URL existing does not verify playback, repository execution, licensing, book stock, current price or learner mastery. Availability may change; preserve inspection dates and evidence when proposing updates.

## Progress Tracking

Progress, notes, diagnostic attempts and specialization selection use browser `localStorage`. There are no learner accounts, cloud synchronization or progress databases. Records are specific to a browser profile and website origin.

Use **Export backup** before changing browsers or domains or clearing storage. Import validates IDs, statuses, types and note sizes before merging; imported records replace matching records. Earlier backup formats remain accepted, and archive progress stays separate from current curriculum progress. Do not commit personal backups to this repository.

## Architecture

The application uses HTML, CSS and plain browser JavaScript with no third-party JavaScript dependencies.

| Layer | Files | Responsibility |
| --- | --- | --- |
| Curriculum | `data/curriculum.json` | Units, dependencies, gates, scopes, First14 and specialization structure |
| Resources | `data/resources.json`, `data/provenance.json` | Catalogue, verification evidence and aliases |
| Reference tables | `data/resource-reference.json` | Resource groupings, comparisons, coverage and planning context |
| Laboratories/projects | `data/practice.json` | Activity contracts and hour allocations |
| Diagnostics | `data/diagnostics.json`, `data/diagnostic-keys.json` | Learner prompts and separately loaded review keys |
| Integrity | `data/integrity.json` | Original IDs, unit placements, counts and collection digests |
| Archives | `data/curriculum-archives.json` | Separate archived study records and year labels |
| Application | `web/` | Navigation, rendering, search, dialogs and local progress |
| Build | `scripts/` | Static routes, metadata, sitemap, local server and syntax checks |

The UI adapts source records for display without renumbering entities or silently changing their meaning. Resource records retain original authorship and provenance; internal collection identifiers use stable catalogue labels.

## Project Structure

```text
web/
  index.html, 404.html, robots.txt
  app.js, features.js
  style.css, rebrand.css
  assets/                     Official logo, favicon and social preview
data/                         Structured curriculum and resource data
scripts/
  build.mjs                   Generate deployable static pages in dist/
  dev.mjs                     Local development server
  routes.mjs                  Valid routes, page metadata and sitemap
  check-syntax.mjs            JavaScript syntax checks
  refresh-integrity.mjs       Update reviewed collection digests
tests/                       Data, progress and route regression tests
docs/VALIDATION.md            Recorded release checks
vercel.json                   Static hosting configuration
package.json                  Commands and software version
```

## Local Development

Use **Node.js 20 or later** and npm.

```sh
git clone https://github.com/rishikkumar84a/cse-field-guide.git
cd cse-field-guide
npm install --ignore-scripts
npm run dev
```

Open `http://localhost:5173`. No application environment variables or external services are required. Optional development arguments:

```sh
npm run dev -- --host 127.0.0.1 --port 5173
```

Do not open HTML directly through a file URL: structured data is loaded over HTTP.

## Testing

```sh
npm run lint
npm test
npm run build
```

Lint performs JavaScript syntax checks. There is no configured TypeScript or separate type-check command. Tests cover curriculum counts, all original IDs, collection digests, references, verification states, diagnostic key separation, backup compatibility, atomic import validation and static routing. The build produces `dist/` and a sitemap from known routes.

Browser review should cover desktop and mobile layouts, search/filter combinations, prerequisite links, diagnostics before and after submission, progress persistence, import/export and deep-route refreshes. See [release validation](docs/VALIDATION.md) for checks actually performed.

Data changes require review of their meaning, not just new digests. After an approved data change, use `node scripts/refresh-integrity.mjs`, inspect the diff and rerun all checks. Never adjust data to make a count pass.

## Deployment

The production target is **Vercel**, connected to this GitHub repository, with **Cloudflare** managing DNS for `cse.rishik.tech`. `vercel.json` declares a static project, build command `npm run build`, output directory `dist`, clean URLs and response headers. No server functions, database or application secrets are required.

Production deployments use `main`; pull-request deployments can be used for review. Each known page has a generated HTML entry with matching canonical metadata, so direct links and refreshes work without a catch-all route. Unknown paths use `404.html`.

Set only the `cse.rishik.tech` DNS record to the exact target supplied by the Vercel project. The portfolio domains `rishik.tech` and `www.rishik.tech` are separate and must remain unchanged. Deployment and domain status are recorded in [release validation](docs/VALIDATION.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for code, accessibility, curriculum and resource changes. Include affected IDs, a focused explanation and reproducible evidence. Preserve verification distinctions, provenance, curriculum relationships and progress compatibility. Follow the [code of conduct](CODE_OF_CONDUCT.md) and report sensitive vulnerabilities according to [SECURITY.md](SECURITY.md).

## License

The project's original source code and original documentation are available under the [MIT License](LICENSE). The license does not transfer ownership of third-party resources, trademarks, quoted titles or bibliographic metadata, and does not change their existing rights or licence terms.

## Content and Copyright

Third-party books, papers, courses, lectures, videos, datasets, standards and documentation are linked or referenced, not republished as project-owned content. Original authors, publishers and institutions retain their rights. Follow the resource's own licence, access conditions and attribution requirements. Do not submit unauthorized copies of external works.

## Limitations

- CSE Field Guide is a self-directed educational and software project. It does not award a university degree, accredited credits or professional registration.
- It does not imply university affiliation, official certification or guaranteed career outcomes.
- Resource availability changes; some catalogue resources remain unverified, restricted, broken or incomplete.
- Curriculum completion requires actual learning evidence and appropriate independent review.
- Planned hours are estimates, and physical laboratory access and equipment may require separate arrangements.
- Progress is local to one browser and domain unless exported and imported.
- Diagnostic review is suitable for self-study, not secure examinations.

## Creator & Maintainer

**Rishik Kumar Chaurasiya**

- Portfolio: [https://rishik.tech](https://rishik.tech)
- Portfolio: [https://www.rishik.tech](https://www.rishik.tech)
- GitHub profile: [rishikkumar84a](https://github.com/rishikkumar84a)
- Repository: [cse-field-guide](https://github.com/rishikkumar84a/cse-field-guide)
- Website: [https://cse.rishik.tech](https://cse.rishik.tech)

Citation metadata is provided in [CITATION.cff](CITATION.cff).
