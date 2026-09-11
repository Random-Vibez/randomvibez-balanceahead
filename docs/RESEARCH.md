# Research and Product Decision

## Process

Three independent agents were assigned before implementation:

1. Research agent A ranked credential-free public-good applications using government and standards sources.
2. Research agent B independently compared impact, safety, privacy, accessibility, and static-hosting fit.
3. Product/UX agent ranked everyday problems and specified first-visit, mobile, accessibility, and edge-case needs.

I also inspected the existing RandomVibez catalog so this request would create a genuinely new application rather than relabel existing work. The comparison prioritized broad usefulness, immediate standalone value, privacy, safety, accessibility, build completeness, and whether a public static release could be honestly verified without paid services.

## Options considered

### Household emergency planner

Two research agents ranked an offline household emergency planner first. Ready.gov recommends a plan covering alerts, shelter, evacuation, communication, household-specific needs, and kits.[3] This was not selected because RandomVibez already publishes HearthPlan with substantially the same purpose, and the request explicitly required a new build rather than reuse.

### Suspicious-message triage

The product/UX agent ranked a calm phishing and scam checklist first. CISA describes common phishing signs and advises people not to click suspicious links or attachments.[5] This was not selected because it overlaps the existing GuardianLight safety product, and a deterministic static checker could create harmful false reassurance unless very carefully bounded.

### Monthly cash-flow planner — selected

The CFPB's Your Money, Your Goals toolkit explicitly includes tools for keeping track of income and bills, paying bills, and getting through the month.[1] The CFPB also explains that even a minor financial shock can set someone back when savings are unavailable.[2] A private forward-looking calendar can convert that guidance into a concrete daily view without bank credentials, subscriptions, advertising, or server-side financial records.

### Moving checklist

USAGov provides a clear list of address-change tasks spanning USPS and federal/state services.[4] A moving assistant would be useful but episodic, and much of its value would be a curated checklist rather than an interactive application.

### Caregiving organizer

The CDC says care plans can keep important information in one place, organize caregiving activities, and support consistent care through caregiver transitions.[6] This is valuable, but storing health conditions, medicines, insurance, and contacts in ordinary browser storage raises a higher privacy burden than the selected scope.

### Password-security guide

A password-health checklist could be broadly useful, but a static app should never collect real passwords, and established password managers and official guidance already cover the space better.

## Decision matrix

Scores are 1–5, where 5 is strongest. Safety scores reflect suitability for a static local-only implementation, not the importance of the underlying problem.

| Option | Breadth | Immediate value | Static fit | Safety/privacy fit | New in this environment | Total |
|---|---:|---:|---:|---:|---:|---:|
| Monthly cash-flow planner | 5 | 5 | 5 | 4 | 5 | 24 |
| Emergency planner | 5 | 5 | 5 | 4 | 1 | 20 |
| Suspicious-message triage | 5 | 4 | 5 | 3 | 1 | 18 |
| Moving checklist | 4 | 4 | 5 | 5 | 5 | 23 |
| Caregiving organizer | 4 | 5 | 4 | 2 | 4 | 19 |
| Password-security guide | 5 | 3 | 5 | 4 | 3 | 20 |

## Final decision

Build BalanceAhead: a private browser-local monthly cash-flow planner that helps people map income and bills by date, forecast the lowest projected balance, spot timing gaps before they happen, and plan around a personal safety buffer. This translates the CFPB's income-and-bill tracking and emergency-savings guidance into an interactive planning view.[1][2]

It is intentionally not a budgeting authority, bank connection, debt-management service, or source of financial advice. It stores data only in the current browser, performs integer-cent calculations locally, and gives the user explicit export, import, print, and erase controls.

## Intended users

- People living paycheck to paycheck who need to see timing rather than only monthly totals.
- Households with irregular pay dates or recurring bills.
- Anyone who does not want to connect a bank account to a budgeting service.
- People who benefit from a simple, mobile-friendly calendar and plain-language warnings.

## Sources

[1] https://www.consumerfinance.gov/consumer-tools/educator-tools/your-money-your-goals/toolkit
[2] https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund
[3] https://www.ready.gov/plan
[4] https://www.usa.gov/change-address
[5] https://www.cisa.gov/secure-our-world/recognize-and-report-phishing
[6] https://www.cdc.gov/caregiving/guidelines
