# Operator Consoles & Dynamic Subscription Programme

## Shells

| Path          | Persona                    | Purpose                                                                 |
| ------------- | -------------------------- | ----------------------------------------------------------------------- |
| `/console`    | Superadmin                 | Customers, suites/pricing, limits, payments, API keys, secret refs      |
| `/ops`        | Platform Admin (+ Support) | Health, monitoring, performance, sessions, workers, diagnostics, tuning |
| `/finance`    | Finance                    | Billing APIs — accounts, dunning, credits, refunds, statements          |
| `/compliance` | Compliance                 | Signup review, statutory/tax, entitlements, audit                       |
| `/org`        | Org Admin                  | Members/RBAC, service roles, suite subscriptions, billing               |
| `/workspace`  | End users only             | Productivity workbench; operators are redirected                        |

Sidebar is resizable (180–360px) and collapsible; width persists in `localStorage`.

## Suites

Commercial categories: **qa**, **pentest**, **productivity**.

- **APZOR** (`APZOR_ORGANISATION_ID` / default platform tenant) is seeded with all three suites free via `ensureApzorAllSuitesFree()`.
- Org/individual subscribe via provisioning pipeline (`applySubscriptionChanged` / `subscribeOrganisationToSuites`).
- Removing a suite cancels product subscriptions and strips member grants automatically.
- Workbench nav is filtered by `resolveEffectiveProductKeys` in `workbench-hydration.ts`.

## Key APIs

- `GET/POST /api/v1/console/platform`
- `GET/POST /api/v1/ops/platform`
- `GET/POST /api/v1/compliance/overview`
- `GET/POST /api/v1/org/console`
- `GET /api/v1/me/home-context` — includes `landing.path` for post-login redirect

## Demo

Quick login personas land on the correct shell. Shared password: `DemoPassword123!`.

Platform Admin no longer receives break-glass `*` — ops permissions only.
