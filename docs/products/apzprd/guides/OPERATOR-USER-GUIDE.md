# APZPRD — Operator user guide

| Field     | Value                                                                                                                                                                   |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audience  | Delivery leads · Project contributors · Org admins (entitlements)                                                                                                       |
| Product   | APZPRD (Productivity — Projects workbench)                                                                                                                              |
| Authority | [SPR-DOCS-001](../../../sprint/SPR-DOCS-001-commercial-pillar-operator-guides.md) · [SPR-APZPRD-003](../../../sprint/SPR-APZPRD-003-projects-workbench-deepen.md)       |
| Related   | [SPR-APZPRD-001](../../../sprint/SPR-APZPRD-001-betterauth-productivity-workspace.md) · [SPR-APZPRD-002](../../../sprint/SPR-APZPRD-002-entitled-projects-workbench.md) |

## Auth non-negotiables

| Rule          | Operator expectation                                                                     |
| ------------- | ---------------------------------------------------------------------------------------- |
| Login         | **BetterAuth only** — one APZHUB sign-in                                                 |
| Authentik     | **Not used** for Projects (legacy host coexistence only; do not configure for APZHUB)    |
| Engine access | Silent adapter (`PLANE_API_TOKEN` on server) — **no Plane login screen** for normal work |
| AuthZ         | APZHUB permissions + product entitlement — BetterAuth never grants roles                 |

## 1. Getting started

1. Sign in to APZHUB with BetterAuth.
2. Confirm your organisation package includes **Projects**.
3. Open **Projects** from the Activity Bar (permission + entitlement filtered).
4. If Projects is missing: not entitled, wrong org, or missing grants — ask an admin.

## 2. Workbench map

| Need                                      | Where                | Path                               |
| ----------------------------------------- | -------------------- | ---------------------------------- |
| Project list / open project               | Projects home        | `/workspace/projects`              |
| Operator readiness (auth + adapter)       | Readiness            | `/workspace/projects/health`       |
| Search                                    | Projects search      | `/workspace/projects/search`       |
| Productivity (favourites, sessions, bulk) | Productivity         | `/workspace/projects/productivity` |
| Portfolio                                 | Portfolio views      | `/workspace/projects/portfolio`    |
| Teams                                     | Delivery teams       | `/workspace/projects/teams`        |
| Admin registries                          | Admin (permissioned) | `/workspace/projects/admin`        |

## 3. Readiness check (do this first on a new host)

1. Open **Readiness** (`/workspace/projects/health`).
2. Confirm **Identity posture**: AuthN = `betterauth`, Authentik used = `no`, Engine auth = adapter API key.
3. Confirm product / Plane adapter status and live list when configured.
4. If Authentik used ever showed `yes`, treat as a defect — that path is forbidden.

## 4. Day-to-day project work

1. Open a project from the list (APZHUB UI — engine branding masked).
2. Use lifecycle, delivery, collaboration, and admin surfaces as your role allows.
3. Never send colleagues to a separate Plane login for entitled APZHUB work.
4. If Readiness shows the Plane adapter **disabled / not configured**, the project list is empty until ops enable `PLANE_*` / adapter secrets — that is **not** an Authentik or Plane login problem.

## 5. Admin / entitlement notes

1. Org packages grant `projects` / `pkg.apzprd.projects` via commercial catalogue.
2. After granting Projects, users may need refresh / re-login for nav.
3. Adapter secrets (`PLANE_API_TOKEN`, workspace ids) are **ops-only** — never pasted into the UI.

## 6. Checklist — “can our team use Projects?”

- [ ] Org entitled to Projects
- [ ] Users sign in with BetterAuth only
- [ ] Readiness shows Authentik used = **no**
- [ ] Projects appears in the shell for entitled roles
- [ ] List/open project works without a Plane login screen
- [ ] Authentik containers are **not** required for this journey (legacy apps may still use them until Owner retirement GO)

## 7. Out of scope

- Stopping Authentik containers (separate Owner GO on [retire-authentik](../../../operations/runbooks/retire-authentik.md))
- Authentik config UI
- Support / Time GA expand beyond entitled Projects deepen
