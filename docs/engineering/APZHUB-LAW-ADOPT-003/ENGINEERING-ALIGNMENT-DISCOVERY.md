# ENGINEERING-ALIGNMENT-DISCOVERY

| Field     | Value                        |
| --------- | ---------------------------- |
| Programme | APZHUB-LAW-ADOPT-003         |
| Timestamp | 20260803T131530Z             |
| Rule      | Discovery before engineering |

## Implement vs defer matrix

| ID         | Verdict     | ADOPT-003 action             | Rationale                                                                                          |
| ---------- | ----------- | ---------------------------- | -------------------------------------------------------------------------------------------------- |
| **EAB-01** | VALID       | **Implement**                | Add `events/legal/**/event.yaml` for `registerLawEvents` + trust runtime IDs; no publisher rewires |
| **EAB-02** | CONDITIONAL | **Docs / service.yaml only** | Full Platform Service extraction = architecture redesign (**PROHIBITED**)                          |
| **EAB-03** | VALID       | **Implement honesty**        | Spec/KL honesty; do **not** implement planned Search/Dashboard/Activities/Notifications routes     |
| **EAB-04** | CONDITIONAL | **Verify + narrow KL**       | Session tenant already preferred; residual = header/dev fallback when session lacks tenant         |
| **EAB-05** | **INVALID** | **Record N/A**               | First-party Law SoR — no external engine; inventing connector = out of scope                       |
| **EAB-06** | CONDITIONAL | **Docs only**                | No proven 018 eng defect; full workspace-session features = scope creep                            |

## Board review items (not silently omitted)

| ID                  | Status for Board                                       |
| ------------------- | ------------------------------------------------------ |
| EAB-05              | Invalid for eng — first-party product                  |
| EAB-02 extraction   | Deferred beyond ADOPT-003 (redesign)                   |
| EAB-06 eng delivery | Deferred unless future Owner narrows concrete 018 gaps |

## Current implementation anchors

| Area            | Paths                                          |
| --------------- | ---------------------------------------------- |
| Event registry  | `apps/law-platform/lib/register-law-events.ts` |
| Event manifests | `events/legal/` (was 2 only)                   |
| Trust events    | `apps/law-platform/lib/trust/*`                |
| Service face    | `services/legal-platform/service.yaml`         |
| OpenAPI         | `docs/specs/LAW-OpenAPI-v1.yaml`               |
| Trust HTTP      | `apps/web/app/api/law/v1/trust/**`             |
| Tenant resolve  | `apps/web/lib/api/tenant/tenant-resolver.ts`   |

## Per-item discovery (mandatory)

| ID     | Current implementation                                       | Affected                                                  | Dependencies   | Eng impact                                     | Test impact             | Cert impact                            | Ops impact |
| ------ | ------------------------------------------------------------ | --------------------------------------------------------- | -------------- | ---------------------------------------------- | ----------------------- | -------------------------------------- | ---------- |
| EAB-01 | 2 legacy manifests; `registerLawEvents` + trust publish keys | `events/legal/**`                                         | Event SDK 029  | Catalogue YAML only                            | Manifest↔registry tests | Catalogue completeness aids later cert | None       |
| EAB-02 | App-local `*-workflow-service.ts`                            | `services/legal-platform/service.yaml`, apps/law-platform | 009/027        | **Docs only** — extraction = redesign          | Manifest validate       | Defer extraction for Board             | None       |
| EAB-03 | OpenAPI planned paths; Trust routes on disk                  | `docs/specs/LAW-OpenAPI-v1.yaml`, KL                      | ES-003 honesty | Spec honesty; **no** new routes                | Honesty tests           | Honesty required                       | None       |
| EAB-04 | Session-first resolver already present                       | tenant-resolver, KL-LAW-05                                | Auth session   | Verify + narrow KL                             | Tenant unit/regression  | Narrows KL                             | None       |
| EAB-05 | No external Law engine                                       | N/A                                                       | 008/026        | **Invalid** — inventing connector out of scope | N/A                     | N/A                                    | N/A        |
| EAB-06 | Shell/session platform exists; no proven Law 018 defect      | Docs                                                      | 018            | **Docs only**                                  | N/A                     | Defer                                  | None       |

## Exclusions confirmed

No new business features · no domain redesign · no AI · no new integrations · no ops alignment · no certification claim.
