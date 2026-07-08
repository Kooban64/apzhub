# APZHUB Platform — Naming Review

> **Milestone:** M16 — Platform Stabilisation & Engineering Review  
> **Date:** 2026-07-08  
> **Type:** Analysis only — standards recommendations; no renames

---

## 1. Purpose

Assess naming consistency across packages, services, APIs, events, and platform artefacts. Recommend standards for future work.

---

## 2. Package names

| Current                                 | Convention                      | Consistency |
| --------------------------------------- | ------------------------------- | ----------- |
| `@apzhub/platform-runtime`              | `@apzhub/{framework-name}`      | ✅          |
| `@apzhub/command-framework`             | kebab-case, `-framework` suffix | ✅          |
| `@apzhub/knowledge-discovery-framework` | descriptive compound            | ✅          |
| `@apzhub/event-notification-framework`  | compound                        | ✅          |
| `@apzhub/activity-timeline-framework`   | compound                        | ✅          |
| `@apzhub/legal-business-core`           | product package                 | ✅          |
| `@apzhub/law-platform` (app)            | product app                     | ✅          |

**Inconsistency:** `command-framework` vs product term "Action Framework" (M4). Documentation uses both "Action" and "Command".

**Recommendation:** Public docs → "Action Framework"; package name frozen as `command-framework` (no rename).

---

## 3. Folder names

| Area                                    | Pattern               | Consistency |
| --------------------------------------- | --------------------- | ----------- |
| `packages/*/src/`                       | Standard src layout   | ✅          |
| `apps/law-platform/lib/{domain}/`       | Domain folders        | ✅          |
| `apps/web/lib/api/{resource}/`          | Resource folders      | ✅          |
| `docs/architecture/LAW-015-{nn}-*`      | Sprint-prefixed notes | ✅          |
| `docs/sprint/{ID}-completion-report.md` | Story ID prefix       | ✅          |

**Inconsistency:** Some docs use `SPR-00x` vs `MILESTONE-00x` vs `M{x}` interchangeably.

**Recommendation:** Platform milestones → `M{n}`; engineering stories → `{PREFIX}-{nnn}`; document in Engineering Handbook.

---

## 4. Service names

| Pattern            | Examples                                               | Consistency            |
| ------------------ | ------------------------------------------------------ | ---------------------- |
| `*WorkflowService` | `ClientWorkflowService`, `MatterWorkflowService`       | ✅ Law domains         |
| `Trust*Service`    | `TrustLedgerService`, `TrustReportingService`          | ✅ Trust subsystem     |
| `Default*Service`  | `DefaultNotificationService`, `DefaultActivityService` | ✅ Platform frameworks |
| `*Orchestrator`    | Runtime orchestrator                                   | ✅                     |

**Inconsistency:** Trust uses `TrustTransactionWorkflowService` (includes "Workflow") while Law domains use `*WorkflowService` suffix only.

**Recommendation:** New Law services → `{Domain}WorkflowService`; Trust names frozen.

---

## 5. Repository names

| Pattern                      | Examples                               | Consistency                        |
| ---------------------------- | -------------------------------------- | ---------------------------------- |
| `InMemory{Entity}Repository` | `InMemoryClientRepository`             | ✅                                 |
| `Postgres{Entity}Repository` | `PostgresMatterRepository`             | ✅                                 |
| `Writable{Entity}Repository` | Contract test naming                   | ✅                                 |
| Trust postgres               | `PostgresTrustStore` (aggregate store) | ⚠️ Differs from per-entity pattern |

**Recommendation:** Trust `PostgresTrustStore` is acceptable (multi-entity store); document as exception.

---

## 6. Workflow names

| Workflow        | Naming                                      | Notes                  |
| --------------- | ------------------------------------------- | ---------------------- |
| Draft lifecycle | `createDraft`, `validateDraft`, `postDraft` | ✅ Consistent in trust |
| Status enums    | `draft`, `posted`, `reversed`               | ✅                     |
| Approval        | `submitted`, `approved`, `rejected`         | ✅                     |

---

## 7. DTO names

| Pattern          | Examples                | Consistency          |
| ---------------- | ----------------------- | -------------------- |
| API response     | `{Entity}ResponseDto`   | ✅ Mostly            |
| API request      | `Create{Entity}Request` | ✅                   |
| Registry DTO     | `*RegistryDto`          | ✅ Framework exports |
| Hydration bundle | `*HydrationBundle`      | ✅                   |

**Inconsistency:** Some mappers use `mapXToDto` vs `toDto` vs `xDtoMapper`.

**Recommendation:** Standardise on `{entity}-dto-mapper.ts` + `map{Entity}ToDto()` — apply to new code only.

---

## 8. API naming

| Convention   | Example           | Status                            |
| ------------ | ----------------- | --------------------------------- |
| Base path    | `/api/law/v1/`    | ✅                                |
| Resources    | plural kebab      | `/clients`, `/trust/transactions` | ✅  |
| Actions      | POST sub-resource | `/transactions/{id}/post`         | ✅  |
| Query params | camelCase         | `trustAccountId`                  | ✅  |

**Inconsistency:** Route param was `[draftId]` vs `[trustTransactionId]` (fixed LAW-015-13).

**Recommendation:** Route params always use full entity name: `{trustTransactionId}` not `{draftId}`.

---

## 9. Event naming

| Convention      | Example         | Status                              |
| --------------- | --------------- | ----------------------------------- |
| Platform events | `platform.*`    | ✅                                  |
| Law events      | `legal.*`       | ✅                                  |
| Trust events    | `legal.trust.*` | ✅                                  |
| Tense           | past tense      | ✅ `posted`, `created`, `completed` |

**Inconsistency:** Some early docs reference `legal.module.opened` vs manifest `legal/feature-available`.

**Recommendation:** Event catalogue in specs is authoritative; align manifests on next touch.

---

## 10. Permission naming

| Convention | Example                                    | Status |
| ---------- | ------------------------------------------ | ------ |
| Namespace  | `legal.{domain}.{action}`                  | ✅     |
| Trust      | `legal.trust.manage`, `legal.trust.report` | ✅     |
| Platform   | `platform.*` (planned M8)                  | ⏸      |

**Inconsistency:** Export uses `legal.trust.report` but spec mentions `legal.trust.export`.

**Recommendation:** Align permission key in RBAC seed (LAW-015-15).

---

## 11. Knowledge source naming

| Pattern      | Examples                                | Consistency |
| ------------ | --------------------------------------- | ----------- |
| Provider ID  | `law-client`, `law-matter`, `law-trust` | ✅          |
| Registration | `registerLaw{Domain}Knowledge`          | ✅          |

---

## 12. Activity naming

| Pattern          | Examples                   | Consistency |
| ---------------- | -------------------------- | ----------- |
| Activity type ID | `legal.client.created`     | ✅          |
| Registration     | `registerLawActivityTypes` | ✅          |

---

## 13. Timeline naming

| Pattern     | Examples                | Consistency |
| ----------- | ----------------------- | ----------- |
| Timeline ID | `legal.matter.timeline` | ✅          |
| Scope       | matter, client          | ✅          |

---

## 14. Product terminology (006 / constitution)

| Correct (APZHUB) | Avoid (engine names)       | Compliance                         |
| ---------------- | -------------------------- | ---------------------------------- |
| Projects         | Plane                      | ✅ in Law docs                     |
| Trust Accounting | (not "trust module" in UI) | ✅                                 |
| APZHUB           | "portal", "launcher"       | ⚠️ repo folder `apz-portal` legacy |

**Recommendation:** Repo rename is cosmetic — defer; user-facing strings compliant.

---

## 15. Proposed naming standards (for future work)

```text
Packages:        @apzhub/{kebab-case}
Platform svcs:   Default{Capability}Service
Law workflows:   {Domain}WorkflowService
Law platform:    Trust{Capability}Service
Repositories:    InMemory{Entity}Repository | Postgres{Entity}Repository
API paths:       /api/law/v1/{plural-resource}
API params:      {fullEntityId}
Events:          {namespace}.{domain}.{entity}.{past-tense-verb}
Permissions:     {namespace}.{domain}.{verb}
Knowledge:       {product}-{domain} provider IDs
Activities:      {namespace}.{entity}.{past-tense-verb}
Timestamps:      ISO 8601; *_At suffix on fields
IDs:             {entity}Id camelCase
```

---

## 16. Verdict

**Naming consistency: GOOD (7/10)**

Core conventions are established and mostly followed. Inconsistencies are concentrated in app-layer duplication, a few permission key mismatches, and Action/Command terminology drift. No renames recommended in M16 — document standards and apply to new code only.

---

_Related: [Engineering Review](../reviews/APZHUB-Platform-Engineering-Review.md)_
