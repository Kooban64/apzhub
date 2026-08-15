# APZPRD — Operator user guide

| Field     | Value                                                                                                                                                                   |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audience  | Delivery leads · Project contributors · Org admins (entitlements)                                                                                                       |
| Product   | APZPRD (Productivity — Projects workbench)                                                                                                                              |
| Authority | [SPR-DOCS-001](../../../sprint/SPR-DOCS-001-commercial-pillar-operator-guides.md)                                                                                       |
| Related   | [SPR-APZPRD-001](../../../sprint/SPR-APZPRD-001-betterauth-productivity-workspace.md) · [SPR-APZPRD-002](../../../sprint/SPR-APZPRD-002-entitled-projects-workbench.md) |

**Rules**

- **BetterAuth** is the only APZHUB login (Authentik is legacy/retirement path — not the product AuthN).
- Users see **Projects** — not Plane or other engine brands.
- Work goes Client → APZHUB APIs → Platform Service → connector → engine.

## 1. Getting started

1. Sign in to APZHUB with BetterAuth.
2. Confirm your organisation package includes **Projects** (productivity).
3. Open **Projects** from the Activity Bar / workbench (permission + entitlement filtered).
4. If Projects is missing: you are not entitled, not in the org, or lack `projects` grants — ask an admin.

## 2. What you can do today

| Capability         | How                                                                                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entitled workbench | Catalogue → adapter path for Projects when product access is granted                                                                               |
| Health             | Operators/admins can check Projects health (`GET /api/v1/projects/health` style surface) — Authentik must not be required (`authentikUsed: false`) |
| Soft product gate  | APIs for `projects.*` respect commercial entitlement                                                                                               |

Day-to-day project work (issues, cycles, modules) is served through APZHUB’s Projects experience backed by the configured engine (e.g. Plane CE) via connector — always via APZHUB UI/API, never by sending users to a separate engine login for normal work.

## 3. Admin / entitlement notes

1. Org packages and entitlements are managed in the commercial / admin surfaces (see COMM sprint docs).
2. After granting Projects, users may need a refresh / re-login for nav to appear.
3. Dogfood / operator grants may include `pkg.apzprd.projects` style package keys — exact labels follow the commercial catalogue.

## 4. AuthN honesty

| Topic            | Operator expectation                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Login            | One APZHUB BetterAuth screen                                                             |
| Engine SSO       | Silent/session handoff owned by platform — no user-facing Plane login for entitled flows |
| Legacy Authentik | Not part of the APZPRD product path; retirement is a separate ops checklist              |

## 5. Checklist — “can our team use Projects?”

- [ ] Org entitled to Projects
- [ ] Users can sign in with BetterAuth
- [ ] Projects appears in the shell for entitled roles
- [ ] Health check does not depend on Authentik
- [ ] Work stays inside APZHUB (no “open Plane separately” as the primary path)

## 6. Out of scope for this guide

- Full Plane administration UI (engine-native admin)
- Authentik cutover runbook (ops)
- Building new APZPRD modules beyond the entitled Projects workbench already delivered
