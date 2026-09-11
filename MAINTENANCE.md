# Maintenance

## Routine checks

Run `npm test` and `npm run check` before publishing. Serve the directory locally and smoke-test first visit, currency/month-specific starting balances, add/edit/delete, monthly/one-time recurrence, paid/received toggles across months, day 29–31 clamping, import/export rejection, print, clear confirmation, forecast data alternative, and narrow-screen layout.

Keep the static host policy aligned with the CSP meta tag. Do not add remote fonts, CDN scripts, analytics, API requests, cookies, or embedded third-party assets without revisiting `SECURITY.md` and the data boundary.

## Data compatibility

`app-core.js` owns the versioned, allowlisted local schema. v1 is migrated explicitly to v2; future changes require another explicit migration or safe fallback. Keep `MAX_ITEMS`, `MAX_FIELD_LENGTH`, `MAX_STATE_BYTES`, `MAX_MONTH_ENTRIES`, and `MAX_CENTS` bounded.

## Deployment boundary

This repository is intentionally deployment-free. Publish only the static files and `.htaccess` to a host configured for HTTPS. Never publish test artifacts, backups, or user-exported JSON. Verify response headers, no directory listing, and `connect-src 'none'` after publishing.
