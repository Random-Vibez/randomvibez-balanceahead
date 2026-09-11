# BalanceAhead

BalanceAhead is a private, browser-local monthly cash-flow planner. It helps a person see recurring income and bills in a simple timeline, forecast each day's projected balance, and spot when the plan may fall below a chosen safety buffer.

## Use

Open `index.html` in a modern browser, or serve this directory with any static HTTP server. Choose a month, currency (USD, CAD, GBP, EUR, AUD, or NZD), starting balance, and safety buffer, then add monthly or one-time income and bills. Starting balances and paid/received status are month-specific; monthly items begin in their creation month and one-time items remain in that month. Day 29–31 entries clamp to the selected month's last day. Currency changes display only—no conversion is performed. Use the example plan to understand the flow; it only fills an empty timeline.

## Data boundary

There is no server, account, cookie, analytics, backend, or runtime network request. The app stores a bounded, normalized version-2 plan in `localStorage` on the current browser/device. Safe version-1 data is migrated on read; malformed or out-of-bound imports are rejected without replacing the current plan. A browser profile reset or clearing site data removes it. Exported JSON backups are unencrypted and may contain sensitive financial information; keep them private. No login is needed because there is no server-side mutable user data or admin surface.

BalanceAhead is a planning aid, not financial advice. It does not connect to banks and does not predict uncertain income or expenses.

## Development

- `npm test` — Node's built-in test runner for calculations, schema bounds, persistence contracts, and static contracts.
- `npm run check` — JavaScript syntax checks.
- `python3 -m http.server 4173` — local static smoke server.

The application is plain HTML, CSS, and vanilla ES modules. No build step or package installation is required.
