# QA and Security Review Record

## Initial implementation gate

Date: 2026-09-10
Decision: NO-GO; remediation required before public deployment.

Three reviewers worked independently and did not implement the original application.

### Functional QA agent

Fresh checks:

- `npm test`: 11 passed.
- `npm run check`: passed.
- Source-level behavioral probes: completed.
- Local browser harness: blocked private localhost navigation, so no visual claim was made.

Findings:

1. Forecast bars used CSP-incompatible dynamic inline styles.
2. Paid/received status on recurring items incorrectly persisted across every month.
3. One global starting balance made month navigation misleading.
4. Day 31 was clamped in the forecast but displayed as day 31 in shorter-month timelines.
5. Setup values bypassed proper finite/range validation.
6. The no-login boundary was appropriate because there was no backend, account, API, cookie, database, server-side mutable user data, or admin surface.

### Security and privacy agent

Fresh checks:

- Reviewed every deployable file and the static host policy.
- Re-ran 11 tests and JavaScript syntax checks.
- Searched for network APIs, external assets, dangerous DOM sinks, cookies, analytics, and unbounded import paths.

Findings:

1. Required response security headers must be verified on the real host; `.htaccess` intent alone is insufficient.
2. Interactive setup values could bypass normalization bounds.
3. Imported duplicate item IDs could make edit/delete/status actions target the wrong record.

Positive controls:

- User names were rendered through text nodes.
- No runtime network API, analytics, cookie, external asset, backend, or server mutation route was found.
- Import size, collection count, and field lengths were bounded.
- Browser-storage and plaintext-export limitations were disclosed.

### UX and accessibility agent

Fresh checks:

- Reviewed first-visit flow, keyboard/dialog behavior, screen-reader semantics, responsive and print CSS, contrast, error states, and currency assumptions.
- Re-ran 11 tests and syntax checks.
- Browser navigation was blocked for localhost, so rendered geometry remained pending.

Findings:

1. Item-dialog close and Cancel buttons could submit/save instead of closing.
2. The forecast chart lacked an accessible day/balance data alternative.
3. Validation/import/storage failures were only in a visually hidden live region.
4. Timeline mini-buttons lacked explicit focus-visible styling.
5. Warning graphics had insufficient non-text contrast.
6. Print CSS left an interactive example button visible.
7. Hard-coded GBP was too narrow and insufficiently explained for a broadly public tool.
8. First-use safety-buffer guidance and empty-plan sample discovery needed improvement.
9. Narrow viewport behavior needed stronger containment and real-browser verification.

## Remediation

Status: completed. Two separate fix agents addressed the complete finding set with test-first changes. A final independent combined gate returned GO after 16 unit/static tests, JavaScript syntax checks, and 5 Chromium end-to-end tests passed. Live desktop and 390px mobile screenshot reviews also returned GO. Production GET headers, HTTPS redirect, asset MIME types, non-mutation methods, and absence of repository-only artifacts were verified after deployment.
