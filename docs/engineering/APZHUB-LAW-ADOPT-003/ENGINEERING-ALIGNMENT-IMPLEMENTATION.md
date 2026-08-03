# ENGINEERING-ALIGNMENT-IMPLEMENTATION

| Field     | Value                                        |
| --------- | -------------------------------------------- |
| Programme | APZHUB-LAW-ADOPT-003                         |
| Timestamp | 20260803T132559Z                             |
| Rule      | Traceability-driven only — approved EAB gaps |

## Summary

Engineering executed only after discovery. No architecture redesign. No new product features. No enterprise standards or governance edits beyond status references.

| ID     | Action taken                                                                                                                 | Behaviour change                |
| ------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| EAB-01 | Added/augmented `events/legal/**/event.yaml` for all `registerLawEvents` IDs + trust runtime keys (`documentation.eventKey`) | None (catalogue completeness)   |
| EAB-02 | Declared app-local orchestration in `services/legal-platform/service.yaml` **metadata.description**; extraction deferred     | None                            |
| EAB-03 | OpenAPI honesty in `docs/specs/LAW-OpenAPI-v1.yaml` (`x-apzhube-implementation-honesty`); planned paths not implemented      | Docs/spec honesty only          |
| EAB-04 | Verified session-first tenant resolution; narrowed KL-LAW-05                                                                 | None (existing order preserved) |
| EAB-05 | Recorded **INVALID** — first-party SoR; no connector pack                                                                    | N/A                             |
| EAB-06 | Docs only — no proven 018 eng defect in scope                                                                                | None                            |

## EAB-01 — Event catalogue

- 64 legal event manifests under `events/legal/` (no duplicate capability `id`s).
- Existing `module-opened` / `feature-available` retained; `documentation.eventKey` added.
- Generated domain + trust manifests include `programme: APZHUB-LAW-ADOPT-003` / `backlog: EAB-01`.
- Publishers not rewired; runtime registration path unchanged.

## EAB-02 — Orchestration boundary

- Full move of `apps/law-platform/lib/*-workflow-service.ts` into Platform Service packages = redesign (**PROHIBITED**).
- Alignment recorded on service face metadata only (strict `service:` schema rejects unknown keys such as `orchestration`).

## EAB-03 — API honesty

- Planned Search / Dashboard / Activities / Notifications paths remain `x-implementation-status: planned` and are disclosed as not shipped.
- Trust HTTP residual: runtime under `/api/law/v1/trust/**` noted as not fully enumerated in OpenAPI path set (Board residual, not silent omission).

## EAB-04 — Tenant claim

- `resolveLawApiTenant`: `auth_session` → `tenant_claim` → `persistence_context` → `development_fallback`.
- KL-LAW-05 narrowed in product + ADOPT-002 known-limitations faces.
- No session enrichment feature added.

## Explicit non-changes

- No connector pack (EAB-05 invalid).
- No workspace-session feature build (EAB-06 deferred).
- No Trust OpenAPI full path expansion (honesty residual only).
- No service extraction (EAB-02 deferred).
