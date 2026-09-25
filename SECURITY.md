# Security and privacy

The maintained release line is 1.x. Archived curriculum editions are data views,
not separate maintained application releases.

## Reporting a vulnerability

Do not include credentials, personal learning records, or exploit details in a
public issue. If this repository offers GitHub's **Report a vulnerability**
action, use that private channel. Otherwise contact Rishik Kumar Chaurasiya
through https://rishik.tech to request a private reporting channel before
sending sensitive material. No response-time guarantee is currently offered.

Include the affected version, route, reproduction steps, impact, and a minimal
example without personal data. Test only with your own disposable records and
systems you are authorized to assess.

## Application boundaries

- The application is static. It has no server-side accounts, progress database,
  analytics, or embedded credentials.
- Progress and notes use browser localStorage. Anyone with access to the same
  browser profile or a learner's exported backup may access those records.
- Imports validate known IDs, statuses, types, and note sizes before merging.
  They are not an encrypted backup format.
- Diagnostic keys are separate from the initial learner payload and hidden
  until a submitted attempt is reviewed. They are public source data, not a
  secure examination system.
- External resources have their own security, privacy, licensing, and access
  conditions. Historical verification does not guarantee current safety or
  availability.
- `npm run dev` is for development. Use a suitable static host in production;
  hosting access controls are independent of the application's progress UI.

Do not place secrets in `web/`, `data/`, environment files committed to Git,
URLs, logs, or deployment archives. If a credential is accidentally exposed,
revoke it at its provider; removing the current file does not erase Git history.
