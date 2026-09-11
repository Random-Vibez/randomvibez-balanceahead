# BalanceAhead build log

## RED
- Added focused v2 state, migration, recurring completion, one-time scope, clamping, bounds, currency, duplicate-ID, import, and accessibility regression contracts first.
- `npm test` before remediation failed during module loading because `MAX_CENTS` and the new v2 helpers were absent.

## GREEN
- Implemented v2 month-keyed starting balances, month-keyed completion, recurrence scope, bounded allowlisted migration/import/export, duplicate-ID rejection, six explicit currencies, and consistent end-of-month clamping.
- Replaced dynamic inline chart heights with bounded predefined CSS height classes.
- Added visible status/error feedback, semantic forecast table, recurrence selector, safe dialog close/cancel handlers, validation bounds, item-limit enforcement, responsive/print/focus-visible refinements, and `X-Powered-By` removal.

## Verification
- `npm test`: 13 passed, 0 failed.
- `npm run check`: passed (`node --check app-core.js && node --check app.js`).
- Local static smoke: `python3 -m http.server 4174` plus HTTP 200 checks for `/`, `/app.js`, `/app-core.js`, `/styles.css`, and `/index.html` (all returned expected static MIME types).
- Browser-use navigation to `127.0.0.1` was blocked by the harness private-address policy; no visual/browser interaction claim is made.

## Fresh visual/runtime remediation
- Visual findings reproduced from the supplied inspection: `[hidden]` was overridden by `.warning-banner`, the native file input was cramped, mobile timeline actions were below touch-size, the blanket body overflow rule masked sizing errors, the content grid stretched the timeline, and the example action stayed misleading after data existed.
- Runtime findings fixed: month navigation no longer creates starting-balance keys; starting-balance and per-item status maps reject new entries at `MAX_MONTH_ENTRIES`; invalid runtime state now fails export visibly instead of falling back to an empty plan; invalid form fields reset and the first actual invalid field receives focus.
- Verified fixes: global hidden contract, visually-hidden keyboard/screen-reader file input, mobile 44px action targets/header wrapping, `min-width:0`/`max-width:100%` containment, `align-items:start`, honest disabled sample button, chart endpoint labels, and focused safe-warning/sample-state Playwright assertions.

## Final verification
- `npm test`: 16 passed, 0 failed.
- `npm run check`: passed (`node --check app-core.js && node --check app.js`).
- `npx playwright test tests/e2e.spec.js --browser=chromium --reporter=line --workers=1`: 5 passed, 0 failed.
