# APZ Analytics — Implementation Plan (Release 1.0)

> **Programme:** APZ-ANALYTICS-001  
> **Classification:** DOCUMENTATION ONLY — plan only  
> **Date:** 2026-07-19  
> **Rule:** Does not authorise code. Sequencing assumes Owner Approvals per phase.

---

## 1. Recommended sequencing

```text
Phase A — Prerequisites (blockers)
  A1 Metabase Integration SDK adapter (foundation → domain)
  A2 Architecture ADR: AnalyticsService vs Metrics/Reporting/Observe boundaries
  A3 Analytics service contracts + permission catalogue design

Phase B — Platform Analytics vertical
  B1 Analytics Platform Services + gateway facets
  B2 HTTP API / OpenAPI + typed client
  B3 Embed token / collection mapping (connector-internal Metabase)

Phase C — Workbench product
  C1 module.yaml + navigation + permissions wiring
  C2 Dashboard registry UI + role views
  C3 Saved dashboards + search provider registration

Phase D — Quality & release
  D1 Tests · Playwright · certification
  D2 Release 1.0.0 evidence pack · Owner Acceptance
```

**Do not start Phase B/C until Phase A dependencies exist on disk** (see readiness).

---

## 2. Workstreams

| ID  | Workstream                 | Outcome                                                                                 | Depends on                         |
| --- | -------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------- |
| W1  | **Metabase Integration**   | `@apzhub/integration-metabase` + `integration.yaml` · health · embed/admin capabilities | Integration SDK **1.0.0** (frozen) |
| W2  | **Analytics Services**     | `AnalyticsService` / dashboard registry / embed orchestration in platform-services      | W1 · contracts · ADR               |
| W3  | **Dashboard Registry**     | Catalogue of curated dashboards (SoR refs, not Metabase as SoR for platform metadata)   | W2                                 |
| W4  | **Permissions**            | `analytics.view` / `analytics.manage` (names illustrative) · AuthZ gates                | Identity / AuthZ platform          |
| W5  | **HTTP / API Consumption** | `/api/v1/analytics/**` · OpenAPI · typed client                                         | W2                                 |
| W6  | **Workbench Module**       | Analytics module UI in shell                                                            | W5 · workbench-framework           |
| W7  | **Navigation**             | Activity Bar + Sidebar registration                                                     | W6 · module manifest               |
| W8  | **HTTP Client (UI)**       | Module uses platform typed client only                                                  | W5                                 |
| W9  | **Caching**                | Short-lived embed tokens / catalogue cache (Redis)                                      | Platform Redis                     |
| W10 | **Role Views**             | Executive / Ops / Product Owner default sets                                            | W3 · W4                            |
| W11 | **Search integration**     | Search provider for dashboard titles                                                    | Search Publication (frozen)        |
| W12 | **Health / Diagnostics**   | Adapter + service health reporting                                                      | W1 · W2                            |
| W13 | **Testing**                | Unit · contract · Playwright                                                            | W6+                                |
| W14 | **Certification**          | Vertical + UI + release evidence                                                        | W13                                |

---

## 3. Pattern to follow

Reuse [PRODUCT-ENGINEERING-REFERENCE-IMPLEMENTATION](../APZHUB-PRODUCT-ENGINEERING-REFERENCE-IMPLEMENTATION.md) (Projects / Time):

```text
Integration adapter → Platform Services → HTTP → Workbench module → Cert → SemVer packaging
```

Never: Module → Metabase direct.

---

## 4. Effort shape (indicative, non-binding)

| Phase               | Relative size | Risk                                           |
| ------------------- | ------------- | ---------------------------------------------- |
| A Prerequisites     | Large         | Metabase embed/license (OSS-T04 risk register) |
| B Platform vertical | Large         | Boundary vs frozen Metrics/Reporting           |
| C Workbench         | Medium        | Embed UX / a11y                                |
| D Quality/Release   | Medium        | Data sandbox / tenancy                         |

---

## Related

- [IMPLEMENTATION-BACKLOG.md](./IMPLEMENTATION-BACKLOG.md)
- [IMPLEMENTATION-READINESS.md](./IMPLEMENTATION-READINESS.md)
