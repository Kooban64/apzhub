# APZ Workflow — Production Ready Closeout Inventory

| Field       | Value                                                                                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document    | **APZ-WORKFLOW-PRODUCTION-READY-CLOSEOUT**                                                                                                                                            |
| Kind        | Finite closeout inventory — **ACCEPTED** · closeout **COMPLETE**                                                                                                                      |
| Timestamp   | 20260808T153000Z                                                                                                                                                                      |
| Method      | Same cadence as APZ Projects Release 3.0 · APZQEP Version 1.1                                                                                                                         |
| Authority   | [OWNER-DECISION-PRODUCTION-READY-INVENTORY.md](./OWNER-DECISION-PRODUCTION-READY-INVENTORY.md) · [../release-1.0/OWNER-RELEASE-DECISION.md](../release-1.0/OWNER-RELEASE-DECISION.md) |
| Success     | **APZ Workflow Version 1.0 – Production Ready** · **CLOSED**                                                                                                                          |
| Engineering | **COMPLETE** · Product phase **OPERATIONAL**                                                                                                                                          |

**Product face:** [../PRODUCT-STATUS.md](../PRODUCT-STATUS.md)  
**Approved scope:** [../PRODUCT-SCOPE.md](../PRODUCT-SCOPE.md)  
**Delivery standard:** [../../APZHUB-DELIVERY-STANDARD.md](../../APZHUB-DELIVERY-STANDARD.md)

---

## Assessment (single page)

```text
APZ Workflow

Classification:
B – Partially Complete

Current State:
- Substantial platform + commercial + native delivery already in the repository
  (SoR packages, Postgres schemas, ~58 API routes, Activity Bar module,
  business-process surfaces, n8n read-only adapter, RI #005 N-01…N-04 COMPLETE/FROZEN).
- Historic packs claim PRODUCTION_READY_WITH_LIMITATIONS / Release 1.0.0
  “Await Owner Acceptance” — not closed under the Delivery Standard used for
  Projects 3.0 and APZQEP 1.1 (no finite closeout, no production tag, status dissonance).
- Identity (APPROVED): business process companion — journeys, governance, visibility.
  Automation execute remains below product boundary (executionEnabled: false).

Production Ready Definition:
APZ Workflow is Production Ready when a permissioned user can define, govern, and
observe business journeys/processes on durable platform Postgres, with honest
capability disclosure (no false execute affordances), fail-closed authz, hardened
evidence, Owner release decision, and a production git tag — without unlocking
provider execute or expanding to new engines.

Remaining Inventory
  Phase 1 — Remaining Product Functionality
  Phase 2 — Production Readiness
  Phase 3 — Hardening
  Phase 4 — Release

Recommendation:
Accepted — Begin Engineering → work down to Production Ready.
```

**Owner decision:** [OWNER-DECISION-PRODUCTION-READY-INVENTORY.md](./OWNER-DECISION-PRODUCTION-READY-INVENTORY.md) — **ACCEPTED** · Engineering **AUTHORISED**.

---

## 1. What already exists

| Layer                     | Evidence                                                                                         | State                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Approved product identity | `PRODUCT-SCOPE.md` · `PRODUCT-STATUS.md` · RI #005                                               | Business-process companion; mission CLOSED                            |
| Native adoption           | `apz-workflow-native-001/` N-01…N-04 · `PROGRAMME-FREEZE.md`                                     | **COMPLETE / FROZEN**                                                 |
| Platform SoR              | `packages/workflow-contracts` · `workflow-core` · `workflow-persistence` · drizzle `0044`/`0045` | Implemented; production factory forbids silent memory                 |
| Business process          | `platform-services/.../business-process` · drizzle `0103`/`0104`                                 | Implemented (Postgres + memory paths)                                 |
| Engine foundation         | `integrations/n8n` 0.1.0 · engine HTTP/UI                                                        | Read-only **CERTIFIED_FOUNDATION**; execute gated                     |
| Product module            | `services/workflow/manifests/workflow/module.yaml` · `apps/web/components/workflow/*`            | Activity Bar **APZ Workflow** `/workspace/workflow`                   |
| Historic facets           | `/workspace/workflows` · `/workspace/workflow-engine`                                            | Nested under workflow (N-03); operator tools                          |
| Projects bridge           | `projects-workflow-bridge` · drizzle `0114`                                                      | Present with tests                                                    |
| Authz catalogue           | `platform-authorization` `workflow.*` permissions                                                | Seeded                                                                |
| Tests / audits            | Playwright workflow specs · `testing/workflow-*` · `pnpm audit:workflow-*`                       | Substantial                                                           |
| Historic release pack     | `docs/releases/workflow/APZ-WORKFLOW-1.0-*`                                                      | PRWL recommended; **Owner Acceptance of APZ-WORKFLOW-002 still open** |
| Git production tag        | —                                                                                                | **None** for Workflow (contrast `apz-projects-3.0`, `apzqep-v1.1.0`)  |

---

## 2. What is missing (for Delivery-Standard Production Ready)

| Gap                                                                                  | Why it blocks                                                                                    |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| No accepted finite closeout inventory                                                | Portfolio rule: no Engineering Execution without it                                              |
| Status dissonance                                                                    | Planned (portfolio) vs PRWL / Awaiting Acceptance vs RI Mature — no single Production Ready face |
| Owner Acceptance of commercial 1.0.0 never recorded as closed under current standard | Release recommendation still “Await Owner Acceptance”                                            |
| Business-process store can fall back to in-memory on Postgres failure                | Silent durability risk (`resolveBusinessProcessStore`)                                           |
| Runtime / runs plane MVP + `executionEnabled: false` while UI exposes “Start run”    | False affordance / honesty gap                                                                   |
| Hardening not re-certified to Projects/APZQEP H1–H5 bar for this closeout            | A11y, authz sweep, perf, journeys, ops pack                                                      |
| No Workflow production tag + Owner release decision pack                             | Cannot declare Production Ready closed                                                           |

**Not missing for this closeout:** provider execute unlock · Temporal/Camunda · designer · architecture rewrite · new programme.

---

## 3. What Production Ready means (this product)

**In scope identity (APPROVED):** journey/process definition & governance, step intent, cross-product references, instance visibility, progress observability, engines masked.

**Production Ready = all inventory items Closed or Owner-deferred in writing**, plus:

1. Durable SoR for workflow + business-process metadata on platform Postgres in production defaults
2. Honest UX for deferred automation (no pretend execute)
3. Fail-closed permission enforcement on product APIs and nav
4. Hardening evidence (journeys, a11y, security, performance, ops)
5. Release pack + Owner decision + git tag
6. Portfolio scoreboard updated to Production Ready

**Explicitly out of this Production Ready definition:**

- Unlocking `providerExecuteSupported` / n8n execute
- Additional providers
- Visual designer-first UX
- Reopening Native N-05+ or architecture freeze

---

## 4. Shortest path

```text
Accept inventory
  → Phase 1 close residual product honesty / identity face
  → Phase 2 certify durability + migrations + authz production defaults
  → Phase 3 H1–H5 harden
  → Phase 4 RC → Owner decision → tag → Operational Learning
```

Do not rebuild the platform vertical. Close what is open.

---

## Classification rationale

| Class                      | Verdict                                                                           |
| -------------------------- | --------------------------------------------------------------------------------- |
| A – Mostly Complete        | **No** — Delivery-Standard closeout incomplete; Acceptance/tag/hardening residual |
| **B – Partially Complete** | **Yes** — large real implementation + RI; finite closeout remaining               |
| C – Foundation Only        | **No** — far beyond scaffolds                                                     |

---

## Phase 1 — Remaining Product Functionality

| ID           | Description                                                                                                                                               | Status                                                                                              | Complexity | Acceptance                                                                                              |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------- |
| **WF-P1-01** | Single authoritative Production Ready product face (resolve Planned / PRWL / Awaiting Acceptance / RI Mature into one status during closeout)             | **Closed** — [evidence/WF-P1-01-PRODUCT-STATUS-FACE.md](./evidence/WF-P1-01-PRODUCT-STATUS-FACE.md) | S          | `PRODUCT-STATUS.md` (or closeout status face) states closeout posture only; conflicts marked superseded |
| **WF-P1-02** | Honest automation boundary in commercial UI — remove or disable false “Start run” / execute affordances while `executionEnabled: false`                   | **Closed** — [evidence/WF-P1-02-EXECUTE-HONESTY.md](./evidence/WF-P1-02-EXECUTE-HONESTY.md)         | S          | No user-visible start/execute control unless readiness allows; capability views state limitation        |
| **WF-P1-03** | Business journey / process daily path — Home → Journeys/Processes → instance visibility works for permissioned user (fix residual gaps only; no redesign) | **Closed** — [evidence/WF-P1-03-DAILY-PATH.md](./evidence/WF-P1-03-DAILY-PATH.md)                   | M          | One documented happy path exercises definition + instance visibility on durable store; defects only     |
| **WF-P1-04** | Projects ↔ Workflow approval bridge path operable or honestly unavailable under permissions                                                               | **Closed** — [evidence/WF-P1-04-PROJECTS-BRIDGE.md](./evidence/WF-P1-04-PROJECTS-BRIDGE.md)         | S          | Bridge route/API permission-filtered; no dead nav; smoke evidence                                       |

**Phase 1 exit:** WF-P1-01…04 Closed or Owner-deferred in writing. No new capabilities.

---

## Phase 2 — Production Readiness

| ID           | Description                                                                                                                                                    | Status                                                                                                                | Complexity | Acceptance                                                      |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------- |
| **WF-PR-01** | Production default = Postgres for workflow SoR; certify no silent in-memory in production bootstrap                                                            | **Closed** — [evidence/WF-PR-01-WORKFLOW-POSTGRES.md](./evidence/WF-PR-01-WORKFLOW-POSTGRES.md)                       | M          | Restart-survival evidence; production path uses Postgres        |
| **WF-PR-02** | Business-process store: eliminate silent memory fallback in production (fail closed or explicit env only for tests)                                            | **Closed** — [evidence/WF-PR-02-BUSINESS-PROCESS-FAIL-CLOSED.md](./evidence/WF-PR-02-BUSINESS-PROCESS-FAIL-CLOSED.md) | M          | Production cannot silently degrade to memory; evidence recorded |
| **WF-PR-03** | Migration verification for `0044`/`0045`/`0103`/`0104`/`0114` on supported APZHUB Postgres targets                                                             | **Closed** — [evidence/WF-PR-03-MIGRATION-VERIFICATION.md](./evidence/WF-PR-03-MIGRATION-VERIFICATION.md)             | M          | Apply/verify PASS on each supported env                         |
| **WF-PR-04** | Runtime / runs plane disposition — document as non-SoR MVP under PRWL **or** gate UI/API consistently with `executionEnabled: false` (no half-enabled execute) | **Closed** — [evidence/WF-PR-04-RUNTIME-DISPOSITION.md](./evidence/WF-PR-04-RUNTIME-DISPOSITION.md)                   | S          | Written disposition + matching API/UI behaviour                 |
| **WF-PR-05** | API authz sweep on `/api/v1/workflow*`, `/api/v1/workflows*`, bridge — fail-closed permission checks                                                           | **Closed** — [evidence/WF-PR-05-API-AUTHZ.md](./evidence/WF-PR-05-API-AUTHZ.md)                                       | M          | Automated authz tests; unauthorised → 401/403                   |
| **WF-PR-06** | Ops readiness pack — health, feature flag, n8n foundation posture, backup/migration notes                                                                      | **Closed** — [evidence/WF-PR-06-OPS-READINESS.md](./evidence/WF-PR-06-OPS-READINESS.md)                               | S          | Runbook section exists and matches runtime                      |

**Phase 2 exit:** WF-PR-01…06 Closed or Owner-waived; no Blocking durability items.

---

## Phase 3 — Hardening

| ID        | Description                                                         | Status                                                                                  | Complexity | Acceptance                                     |
| --------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------- |
| **WF-H1** | Playwright product journeys (permissioned happy path + denied path) | **Closed** — [evidence/WF-H1-PRODUCT-JOURNEYS.md](./evidence/WF-H1-PRODUCT-JOURNEYS.md) | M          | Specs green in CI                              |
| **WF-H2** | Accessibility (axe / keyboard / SR on primary Workflow surfaces)    | **Closed** — [evidence/WF-H2-ACCESSIBILITY.md](./evidence/WF-H2-ACCESSIBILITY.md)       | M          | No Critical/Serious open on scoped pages       |
| **WF-H3** | Performance smoke (warm-shell budgets on primary routes)            | **Closed** — [evidence/WF-H3-PERFORMANCE.md](./evidence/WF-H3-PERFORMANCE.md)           | S          | Budgets recorded; no blocking regression       |
| **WF-H4** | Security residual — authz + tenant binding evidence pack            | **Closed** — [evidence/WF-H4-SECURITY.md](./evidence/WF-H4-SECURITY.md)                 | M          | Complements WF-PR-05; no Critical/High open    |
| **WF-H5** | Operational hardening — runbook exercised, health checks documented | **Closed** — [evidence/WF-H5-OPERATIONAL.md](./evidence/WF-H5-OPERATIONAL.md)           | S          | Ops can start/stop/diagnose from runbook alone |

**Phase 3 exit:** WF-H1…H5 Closed → Release Candidate.

---

## Phase 4 — Release

| ID           | Description                                                                      | Status                                                                                                             | Complexity | Acceptance                                        |
| ------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------- |
| **WF-RL-01** | Release notes + Admin/User/Ops guides (thin pack; reuse existing where accurate) | **Closed** — [../release-1.0/](../release-1.0/)                                                                    | S          | Pack under `docs/products/apzworkflow/release-*/` |
| **WF-RL-02** | Engineering evidence index (Phase 1–3 closures)                                  | **Closed** — [../release-1.0/ENGINEERING-EVIDENCE-PACK.md](../release-1.0/ENGINEERING-EVIDENCE-PACK.md)            | S          | One index linking evidence                        |
| **WF-RL-03** | Owner Release Decision — Production Ready                                        | **Closed** — [../release-1.0/OWNER-RELEASE-DECISION.md](../release-1.0/OWNER-RELEASE-DECISION.md) RC1 **APPROVED** | S          | Signed Owner decision document                    |
| **WF-RL-04** | Git tag + freeze branch (e.g. `apz-workflow-1.0` or agreed SemVer)               | **Closed** — tag `apz-workflow-1.0` · branch `release/apz-workflow-1.0`                                            | S          | Tag on accepted tip; remote backup                |
| **WF-RL-05** | Portfolio scoreboard → Production Ready; enter Operational Learning              | **Closed** — [../../APZHUB-PORTFOLIO-STATUS.md](../../APZHUB-PORTFOLIO-STATUS.md)                                  | S          | `APZHUB-PORTFOLIO-STATUS.md` updated              |

**Phase 4 exit:** Owner decision + tag + scoreboard → **Production Ready · CLOSED**.

---

## Explicitly out of scope (do not invent)

- Provider execute unlock / schedule workers / Event Bus designer
- Temporal · Camunda · Flowable · Logic Apps · Power Automate
- Architecture reopen or dual-workbench redesign beyond honesty/nav fixes
- New Mission / Native / Capability programmes
- Portfolio products other than Workflow
- Documentation-only churn outside inventory items

---

## Reporting cadence (during Engineering Execution)

Report only: **Closed / In Progress / Remaining** against WF-\* IDs.  
No architecture debates unless a repository defect proves necessity.

---

## Owner decision required

| Decision                  | Options                                                         | Recommendation                                                         |
| ------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Accept this inventory     | Accept · Revise · Reject                                        | **Accept** → Begin Engineering                                         |
| Production Ready identity | Business-process companion (RI #005) · or Automation execute GA | **Business-process companion** (matches APPROVED scope; shortest path) |
| Execute unlock            | In this closeout · Deferred                                     | **Deferred** (separate Owner Auth)                                     |

**Accepted.** Engineering Execution is authorised. Work inventory items only.
