# APZHUB Platform — Duplication Review

> **Milestone:** M16 — Platform Stabilisation & Engineering Review  
> **Date:** 2026-07-08  
> **Type:** Analysis only — consolidation recommendations; no refactoring

---

## 1. Purpose

Identify duplicated patterns across the platform and Law product. Recommend consolidation targets for future approved sprints.

---

## 2. Summary

| Category                     | Duplication level     | Priority |
| ---------------------------- | --------------------- | -------- |
| App bootstrap / hydration    | **High**              | Critical |
| Repository implementations   | **Medium**            | High     |
| DTO mappers                  | **Medium**            | Medium   |
| Validation helpers           | **Medium**            | Medium   |
| Test utilities               | **Medium**            | Medium   |
| Workflow service patterns    | **Low** (intentional) | Low      |
| Platform framework internals | **Low**               | Low      |

---

## 3. Duplicate services

| Pattern                     | Locations                                                                                           | Recommendation                  |
| --------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------- |
| App action executor factory | `apps/web/lib/create-app-action-executor.ts`, `apps/law-platform/lib/create-app-action-executor.ts` | Extract `@apzhub/app-bootstrap` |
| Activity timeline context   | `apps/web/lib/create-app-activity-timeline-context.ts`, `apps/law-platform/lib/...`                 | Shared bootstrap package        |
| Event notification context  | `apps/web/lib/create-app-event-notification-context.ts`, `apps/law-platform/lib/...`                | Shared bootstrap package        |
| Knowledge hydration         | `apps/web/lib/knowledge-hydration.ts`, `apps/law-platform/lib/knowledge-hydration.ts`               | Shared bootstrap package        |
| Health aggregation          | `apps/web/app/api/health/route.ts`, `apps/law-platform/app/api/health/route.ts`                     | Shared health composer          |
| Workbench shell provider    | `apps/web/app/(platform)/action-workbench-shell-provider.tsx`, `apps/law-platform/...`              | Shared provider                 |

**Impact:** Bug fixes must be applied twice (e.g. LAW-015-13 client bundle fix in web only initially).

---

## 4. Duplicate helpers

| Helper                                   | Duplicated in                   | Notes                         |
| ---------------------------------------- | ------------------------------- | ----------------------------- |
| `resolve-command-palette-mode`           | `apps/web`, `apps/law-platform` | Identical E2E mode resolution |
| `e2e-activity-timeline-hooks`            | `apps/web`, `apps/law-platform` | Test-only hooks               |
| `e2e-event-notification-hooks`           | `apps/web`, `apps/law-platform` | Test-only hooks               |
| `load-shared-activity-timeline-context`  | `apps/web`, `apps/law-platform` | Server loader                 |
| `load-shared-event-notification-context` | `apps/web`, `apps/law-platform` | Server loader                 |
| `use-app-*-context` hooks                | Both apps                       | React context wrappers        |

---

## 5. Duplicate DTOs

| Area                  | Duplication                                        | Recommendation                               |
| --------------------- | -------------------------------------------------- | -------------------------------------------- |
| Law API DTO mappers   | `apps/web/lib/api/*/.*-dto-mapper.ts` per resource | Acceptable — API layer owns transport shape  |
| Health DTOs           | `@apzhub/types` + per-framework summaries          | **Good** — types centralised                 |
| Registry DTOs         | Each framework has `*-registry-dto.ts`             | **Intentional** — parallel framework pattern |
| Trust report payloads | Reporting service + export serializers             | **Good** — export is presentation-only       |

**Risk:** API mappers may drift from domain types — contract tests recommended (partially present).

---

## 6. Duplicate validators

| Pattern               | Locations                                                                            | Recommendation                                                              |
| --------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Per-entity validation | `client-validation.ts`, `matter-validation.ts`, `calendar-event-validation.ts`, etc. | Consider shared `ValidationResult` + field helpers in `legal-business-core` |
| Trust validator       | `trust-transaction-validator.ts`, `trust-transfer-validator.ts`                      | Domain-specific — keep separate                                             |
| API query parsers     | `*-query-parser.ts` per resource in `apps/web`                                       | Acceptable — HTTP concern                                                   |

---

## 7. Duplicate workflow patterns

| Pattern                 | Count                               | Assessment                                                  |
| ----------------------- | ----------------------------------- | ----------------------------------------------------------- |
| `*WorkflowService`      | 7+ domains                          | **Intentional** — consistent template, not duplication debt |
| Draft → validate → post | Trust, invoices, calendar           | **Intentional** — shared pattern, different rules           |
| Repository factory      | `getShared*Repository()` per domain | **Moderate** — could use generic factory helper             |

**Recommendation:** Document workflow service template in Law developer guide; do not force abstract base class.

---

## 8. Duplicate repositories

| Pattern                       | Locations                                           | Notes                                          |
| ----------------------------- | --------------------------------------------------- | ---------------------------------------------- |
| InMemory + Postgres pairs     | Every Law aggregate                                 | **Intentional** dual-mode pattern              |
| Trust memory bundle           | API bundle vs workbench bundle                      | **Unintentional** — TD-T01                     |
| Writable repository contracts | `writable-*-repository.contract.test.ts` per domain | **Intentional** — shared contract test pattern |

**Critical duplication:** `getSharedTrustServiceBundle()` (API) vs `getSharedTrustWorkbench()` (UI) — separate singletons.

---

## 9. Duplicate test helpers

| Helper                         | Locations                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------- |
| `test-utils.tsx` per domain    | `clients/`, `matters/`, `tasks/`, `documents/`, `calendar/`, `time/`, `search/` |
| `law-api-test-helpers.ts`      | `apps/web/lib/api/testing/`                                                     |
| E2E presentation refresh hooks | Both apps                                                                       |

**Recommendation:** Extract `legal-test-utils` package with shared render wrappers and seed factories.

---

## 10. Duplicate utilities

| Utility                       | Duplication                                   |
| ----------------------------- | --------------------------------------------- |
| `relative-time.ts`            | law-platform only — no dup                    |
| OpenAPI/collection generators | `scripts/` — single copy ✅                   |
| Manifest registration         | Per-module `register-law-*` — **intentional** |

---

## 11. Consolidation roadmap (recommendations only)

| Priority     | Consolidation                                                | Effort | Milestone     |
| ------------ | ------------------------------------------------------------ | ------ | ------------- |
| **Critical** | `@apzhub/app-bootstrap` — shared hydration, executor, health | L      | M17 or M8     |
| **High**     | Unify trust API/workbench memory bundle                      | M      | LAW-015-15    |
| **High**     | Outbox worker service (single consumer)                      | L      | Post-M8       |
| **Medium**   | `legal-test-utils` package                                   | M      | Law hardening |
| **Medium**   | Shared validation helpers in `legal-business-core`           | M      | Law hardening |
| **Low**      | Generic repository factory helper                            | S      | Optional      |
| **Low**      | Merge duplicate theme toggle actions (TD-AF20-03)            | S      | UX polish     |

---

## 12. What should NOT be consolidated

- Framework registry implementations (M4–M7) — parallel pattern is architectural strength
- Per-domain workflow services — domain rules differ
- Per-resource API handlers — resource boundaries are correct
- Trust compliance logic — must not move to generic financial engine without FIN-001 approval

---

## 13. Verdict

**Duplication risk: MODERATE**

The platform frameworks are intentionally parallel, not duplicated. The primary duplication debt is **application bootstrap** between `web` and `law-platform`, plus **trust memory bundle split**. Consolidation should target app composition first, not framework internals.

---

_Related: [Dependency Review](./APZHUB-Platform-Dependency-Review.md) · [Technical Debt Register](./APZHUB-Platform-Technical-Debt-Register.md)_
