# APZHUB AI Manifest

> **Audience:** Any AI agent (Cursor, ChatGPT, Claude, Gemini, Copilot, future)  
> **Type:** Machine-oriented operational bootstrap — keep short  
> **Detail:** [AI-BOOTSTRAP.md](./AI-BOOTSTRAP.md)  
> **Status docs:** [CURRENT-MILESTONE](./CURRENT-MILESTONE.md) · [CURRENT-STATE](./CURRENT-STATE.md)  
> **Last updated:** 2026-07-18  
> **Programme:** APZHUB-KF-002

---

# Purpose

Permanent AI entry document. Bootstrap from the **repository only**. Do not use conversation history to decide implementation status.

---

# Repository Status

| Field                       | Value                                                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Product                     | **APZHUB** (Enterprise Operating Platform — never “portal”)                                                            |
| Root version                | `0.1.0-foundation`                                                                                                     |
| Engineering phase           | **Phase 3 — Product Engineering** ([directive](./APZHUB-PHASE-3-Product-Engineering-Commencement.md))                  |
| Platform Foundation         | **CLOSED** — [APZHUB-FOUNDATION-001](./APZHUB-FOUNDATION-001-Platform-Foundation-Completion-Report.md) **ACCEPTED**    |
| Engineering stop (packages) | Last platform close: OSS-100-12+ — provisioning **0.1.0**; event-bus **0.1.0**; outbox **0.1.0**; SDK **1.0.0** frozen |
| KF programmes               | **APZHUB-KF-001** · **APZHUB-KF-002** — docs only (complete)                                                           |
| Authorised next programme   | **None** — await Owner Approval of first Product Engineering programme                                                 |

Live detail: [CURRENT-MILESTONE](./CURRENT-MILESTONE.md) · [CURRENT-STATE](./CURRENT-STATE.md) · [INTEGRATION-PRODUCT-CAPABILITY-INVENTORY](./INTEGRATION-PRODUCT-CAPABILITY-INVENTORY.md) · [APZHUB-FOUNDATION-001](./APZHUB-FOUNDATION-001-Platform-Foundation-Completion-Report.md) · [Phase 3 Directive](./APZHUB-PHASE-3-Product-Engineering-Commencement.md) · [Product Engineering Framework](../products/README.md) (APZHUB-PRODUCTS-000)

---

# Source of Truth Hierarchy

Use this order. Higher wins on conflict.

1. **Repository implementation** (`packages/`, `integrations/`, `apps/`)
2. **`package.json` versions**
3. **Completion reports** (`docs/sprint/`, `docs/foundation/completion-reports/`)
4. **CURRENT-STATE.md**
5. **CURRENT-MILESTONE.md**
6. **ACTIVE-BACKLOG.md**
7. **Capability Inventory** (`INTEGRATION-PRODUCT-CAPABILITY-INVENTORY.md`)
8. **Catalogues** (PRODUCT / OSS / INTEGRATION / PACKAGE / PLATFORM)
9. **ADRs** (`docs/adr/`)
10. **Conversation history** — advisory only; **never** overrides 1–9

---

# Frozen Architecture

Do not modify without **ADR + owner approval**.

| Subsystem                                | Freeze / closeout                             |
| ---------------------------------------- | --------------------------------------------- |
| Integration SDK                          | OSS-100-11 · Architecture Frozen · 1.0.0      |
| Search Platform                          | APZSEARCH-008 · Architecture Frozen           |
| Search Publication                       | APZSEARCH-019 · Architecture Frozen           |
| Documents                                | APZDOCS-006 · architecture frozen             |
| Workflow SoR + Engine (n8n)              | APZWORKFLOW-011 · frozen                      |
| Notifications SoR                        | APZNOTIFY-006 · closed/frozen                 |
| Configuration SoR                        | APZCONFIG-006 · closed/frozen                 |
| Administration SoR                       | APZADMIN-006 · closed/frozen                  |
| Identity Administration SoR              | APZIDENTITY-006 · closed/frozen               |
| Observability SoR                        | APZOBSERVE-006 · closed/frozen                |
| Metrics SoR                              | APZMETRICS-006 · Architecture Frozen / closed |
| CI/CD Reference Adapter (GitHub Actions) | APZTCMS-020 · frozen                          |
| Architecture Baseline v1.0               | Frozen reference                              |

**Platform outbox (PCv2-02):** `@apzhub/platform-outbox` **0.1.0** delivered (worker MVP). Not a freeze of ENF; Search journal unchanged.

**Platform Event Bus (OSS-100-12):** `@apzhub/platform-event-bus` **0.1.0** delivered (ingress + dispatch + outbox relay). Integration SDK public contracts unchanged.

**Platform Provisioning (OSS-100-12+):** `@apzhub/platform-provisioning` **0.1.0** — **ACCEPTED / CLOSED** (flows + status + events + outbox retry). Integration SDK public contracts unchanged.

---

# Certified Integrations

| Adapter                | Package                              | Classification                                                   |
| ---------------------- | ------------------------------------ | ---------------------------------------------------------------- |
| Plane → Projects       | `@apzhub/integration-plane`          | Certified Reference Adapter (Wave 1)                             |
| Zammad → Support       | `@apzhub/integration-zammad`         | CERTIFIED_WITH_LIMITATIONS; UI PRODUCTION_READY_WITH_LIMITATIONS |
| Meilisearch → Search   | `@apzhub/integration-meilisearch`    | Search Reference Adapter (platform frozen)                       |
| n8n → Workflow Engine  | `@apzhub/integration-n8n`            | Official Reference Adapter · frozen                              |
| GitHub Actions → CI/CD | `@apzhub/integration-github-actions` | Official CI/CD Reference Adapter · frozen                        |

**Absent on disk:** Kimai, Paperless, Metabase, Grafana, Prometheus, Loki, Kiwi, Greenbone, MobSF, Faraday, GitLab CI.

---

# Current Platform Packages

Names only (versions → `package.json` / CURRENT-STATE):

`@apzhub/activity-timeline-framework` · `@apzhub/admin-contracts` · `@apzhub/admin-core` · `@apzhub/admin-persistence` · `@apzhub/auth` · `@apzhub/command-framework` · `@apzhub/config` · `@apzhub/configuration-contracts` · `@apzhub/configuration-core` · `@apzhub/configuration-persistence` · `@apzhub/document-contracts` · `@apzhub/document-core` · `@apzhub/document-persistence` · `@apzhub/document-storage` · `@apzhub/event-notification-framework` · `@apzhub/identity-contracts` · `@apzhub/identity-core` · `@apzhub/identity-persistence` · `@apzhub/integration-github-actions` · `@apzhub/integration-meilisearch` · `@apzhub/integration-n8n` · `@apzhub/integration-plane` · `@apzhub/integration-sdk` · `@apzhub/integration-search-sdk` · `@apzhub/integration-zammad` · `@apzhub/knowledge-discovery-framework` · `@apzhub/legal-business-core` · `@apzhub/metrics-contracts` · `@apzhub/metrics-core` · `@apzhub/metrics-persistence` · `@apzhub/notification-contracts` · `@apzhub/notification-core` · `@apzhub/notification-persistence` · `@apzhub/observe-contracts` · `@apzhub/observe-core` · `@apzhub/observe-persistence` · `@apzhub/platform-authorization` · `@apzhub/platform-bootstrap` · `@apzhub/platform-governance` · `@apzhub/platform-identity` · `@apzhub/platform-lifecycle` · `@apzhub/platform-operations` · `@apzhub/platform-outbox` · `@apzhub/platform-event-bus` · `@apzhub/platform-provisioning` · `@apzhub/platform-personalisation` · `@apzhub/platform-runtime` · `@apzhub/platform-security` · `@apzhub/platform-service-contracts` · `@apzhub/platform-services` · `@apzhub/reporting-contracts` · `@apzhub/reporting-core` · `@apzhub/sdk` · `@apzhub/search-contracts` · `@apzhub/search-documents` · `@apzhub/search-integration` · `@apzhub/search-orchestrator` · `@apzhub/search-persistence` · `@apzhub/search-projects` · `@apzhub/search-publication-admin` · `@apzhub/search-reporting` · `@apzhub/search-support` · `@apzhub/search-testing` · `@apzhub/shared` · `@apzhub/testing-contracts` · `@apzhub/testing-foundation` · `@apzhub/testing-persistence` · `@apzhub/testing-services` · `@apzhub/theme` · `@apzhub/types` · `@apzhub/ui` · `@apzhub/workbench-framework` · `@apzhub/workflow-contracts` · `@apzhub/workflow-core` · `@apzhub/workflow-persistence` · `@apzhub/workspace`

Apps: `@apzhub/web` · `@apzhub/law-platform`

---

# Bootstrap Procedure

1. Read **this file** ([AI-MANIFEST](./AI-MANIFEST.md)).
2. Read [CURRENT-MILESTONE](./CURRENT-MILESTONE.md) — stop if work is not approved.
3. Read [AI-BOOTSTRAP](./AI-BOOTSTRAP.md) for full procedure (or [SESSION-START](./SESSION-START.md) for the short map).
4. Read [AI-CONTEXT](./AI-CONTEXT.md) + [APZHUB-CONSTITUTION](./APZHUB-CONSTITUTION.md).
5. Verify disk vs CURRENT-STATE / Inventory / completion reports (hierarchy above).
6. For product work, read [Product Engineering Framework](../products/README.md) · [PRODUCT-ENGINEERING-HANDBOOK](../products/PRODUCT-ENGINEERING-HANDBOOK.md).
7. Read the approved sprint/backlog for the authorised milestone only.
8. Follow [AI-WORKFLOW](./AI-WORKFLOW.md) · [AI-ENGINEERING-STANDARDS](./AI-ENGINEERING-STANDARDS.md).
9. Stop at the milestone boundary. Await owner approval for anything further.

---

# Engineering Rules

- **Repository first** — never invent status from chat.
- **Never invent** milestone numbers or programme names.
- **Never recreate** completed work.
- **Never skip** certification / quality gates when required.
- **Never continue** past a stop condition without owner approval.
- **Never modify** frozen architecture without ADR + owner.
- **Never** Module → Connector bypass; never expose engine names in UI.
- **Docs-only programmes** must not change production code or package versions.

---

# Completion Requirements

Every completed programme must include:

| Gate                    | Required                            |
| ----------------------- | ----------------------------------- |
| Tests                   | Pass (per programme scope)          |
| Certification / audit   | Pass when the programme defines one |
| Documentation           | Reconciled to repository            |
| Completion Report       | Written                             |
| CURRENT-STATE           | Updated                             |
| CURRENT-MILESTONE       | Updated                             |
| ACTIVE-BACKLOG          | Updated                             |
| Version verification    | Matches `package.json`              |
| Repository verification | Implementation matches claims       |

---

**Detail manual:** [AI-BOOTSTRAP.md](./AI-BOOTSTRAP.md)  
**Constitution:** [000](../000-apzhub-engineering-constitution.md)
