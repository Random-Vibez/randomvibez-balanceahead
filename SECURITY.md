# Security and privacy

## Threat model

BalanceAhead is a static, browser-local tool. It has no authentication surface, no API, no database, no server-side mutable user data, and no admin surface. The main risks are accidental disclosure on a shared device, unencrypted exported backups, and malicious content inserted into a locally opened page.

## Mitigations

- User-entered text is rendered through DOM text nodes, not HTML interpolation.
- Imported data is parsed through an allowlisted, versioned v2 schema with collection, field, amount, month-map, unique-ID, and serialized-size bounds. Duplicate IDs and malformed status maps are rejected.
- Corrupt local state falls back to an empty plan without throwing user-facing errors.
- CSP disallows runtime connections and inline scripts/styles; static host headers are supplied in `.htaccess`.
- Destructive actions require confirmation and item actions have specific accessible names.
- The static host policy explicitly removes `X-Powered-By`; its CSP is aligned with the CSP meta tag and blocks network connections.

## User responsibility

Local storage is not encryption. Anyone with access to the browser profile/device may be able to inspect the plan. Exported JSON is plaintext. Do not use this tool on a compromised or shared device for sensitive information, and delete backups when no longer needed.

## Boundary

No login is needed because the app intentionally has no server-side mutable data or admin functionality. If multi-device sync, collaboration, or account recovery is ever added, this static architecture must be replaced or extended with authenticated ownership, authorization, encrypted transport/storage, CSRF protection, rate limiting, and an explicit privacy review.
