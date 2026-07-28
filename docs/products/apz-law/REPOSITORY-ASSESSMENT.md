# APZ Law Platform — Repository Assessment

> **Programme:** APZ-LAW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Bootstrap:** AI-MANIFEST · PACKAGE-CATALOGUE · PRODUCT-CATALOGUE · INTEGRATION-PRODUCT-CAPABILITY-INVENTORY · disk

---

## Platform maturity

| Area                     | Status                                     | Evidence                                                            |
| ------------------------ | ------------------------------------------ | ------------------------------------------------------------------- |
| Product identity         | **Established**                            | Law Platform · primary commercial offering                          |
| Engineering completeness | **LAW-001…015 closed**                     | Backlog · Foundation reports · PRODUCT-CATALOGUE                    |
| Architecture             | **Documented**                             | Reference Architecture · Capability Map · Trust RA · ADRs 0036–0039 |
| Validation readiness     | **APPROVED FOR PRODUCT VALIDATION**        | Law Platform Readiness review                                       |
| Portfolio maturity       | **In Development**                         | [docs/products/law/](../law/README.md) · IR matrix                  |
| Commercial SemVer        | **Not established**                        | No `docs/releases/law/`                                             |
| QA baseline              | **QA-002 PRODUCTION READY** (repo hygiene) | Does not alone equal Law commercial GA                              |

**Maturity summary:** Substantial native vertical product **on disk** with closed engineering milestones; commercial product SemVer **absent**; residual polish/OBS limitations documented.

---

## Packages & apps (disk)

| Artefact                      | Version   | Role                                                |
| ----------------------------- | --------- | --------------------------------------------------- |
| `@apzhub/law-platform`        | **1.0.0** | Law product application (`apps/law-platform`)       |
| `@apzhub/legal-business-core` | **1.0.0** | Shared legal domain types / business infrastructure |
| `services/legal-platform`     | **1.0.0** | Service + law-* module manifests                    |

Port coexistence: Law app defaults to **3301** (`package.json`) — see ENVIRONMENT.md for host coexistence.

---

## Existing APIs

| Surface                     | Status                                                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LAW OpenAPI                 | `docs/specs/LAW-OpenAPI-v1.yaml` — matters, clients, documents, tasks, time, billing, calendar, search, notifications, dashboard, activities, health, … |
| Bruno / Postman collections | `docs/specs/collections/bruno/LAW-OpenAPI-v1/` · mirrored under `apps/web/public/specs/`                                                                |
| Law app platform routes     | `apps/law-platform/app/api/platform/v1/*` (health, governance, security, personalisation, provisioning, …) · BetterAuth `[...all]`                      |
| Law app health              | `GET /api/health` in law-platform                                                                                                                       |

Packaging programme must map OpenAPI claims to runtime handlers/tests honestly (do not invent missing routes).

---

## Workbench / product modules

| Surface          | Status                                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Application      | Dedicated `apps/law-platform` (not only `apps/web` module)                                                                                                               |
| Manifest modules | law-root, law-dashboard, law-matters, law-clients, law-documents, law-tasks, law-time, law-billing, law-calendar, law-trust, law-search, law-reports, law-administration |
| Domains in UI    | Matters, Clients, Documents, Tasks, Time, Billing, Calendar, Trust, Search, Dashboard (components under `apps/law-platform/components/*`)                                |
| User-facing name | **Law Platform** (APZHUB branding — not third-party legal suite brands)                                                                                                  |

---

## Documentation

| Layer                             | Status                                                                                                          |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Architecture / strategy / backlog | Extensive under `docs/architecture/APZHUB-Law-*`, Trust RA, LAW backlog, validation strategy                    |
| Historical planning release       | [APZHUB-Law-Platform-v1.0.md](../../releases/APZHUB-Law-Platform-v1.0.md) (planning-era; code has since landed) |
| Trust release note                | [LAW-Trust-v1.0.md](../../releases/LAW-Trust-v1.0.md)                                                           |
| Portfolio Definition Pack         | [docs/products/law/](../law/README.md)                                                                          |
| PDS commercial planning pack      | **This folder** (`docs/products/apz-law/`) — new                                                                |
| Commercial SemVer evidence        | **Absent**                                                                                                      |

---

## Testing assets

| Asset                                   | Status                                                                            |
| --------------------------------------- | --------------------------------------------------------------------------------- |
| Unit / component / integration tests    | Extensive under `apps/law-platform` (workflows, trust, search, persistence, etc.) |
| Placeholder UX debt                     | Documented (QA-001 M-05 · Known Limitations)                                      |
| Commercial SemVer Playwright cert suite | To be defined/revalidated in packaging programme                                  |

---

## Implementation status

| Layer                                   | Implemented?                                         |
| --------------------------------------- | ---------------------------------------------------- |
| Native Law SoR patterns + app           | **Yes**                                              |
| Domain package + service manifests      | **Yes**                                              |
| Trust Accounting (LAW-015)              | **Yes** (milestone closed)                           |
| OpenAPI / collections                   | **Yes** (spec + collections)                         |
| Calendar (in-app)                       | **Yes**                                              |
| Dedicated Email product surface for Law | **Not evidenced** as a first-class Law email product |
| Financial Engine extraction             | **Deferred** (FIN-001)                               |
| Commercial SemVer pack                  | **No**                                               |

---

## Architecture status

| Item                                       | Status                                                             |
| ------------------------------------------ | ------------------------------------------------------------------ |
| Native SoR (not Plane/Zammad core)         | **Established**                                                    |
| Consumes Platform Core frameworks          | **Yes** (Workbench, Auth, ENF, Knowledge, Activity, Governance, …) |
| Trust as Law capability (not separate OSS) | **Yes** · ADR-0036–0039                                            |
| Full PDS re-foundation                     | **Not required** for Release 1.0 packaging                         |

---

## Assessment conclusion

Supports **Existing Platform → Commercial Packaging**. See [DELIVERY-PATH.md](./DELIVERY-PATH.md).
