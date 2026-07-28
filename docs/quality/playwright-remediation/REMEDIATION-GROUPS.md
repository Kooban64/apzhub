# Remediation Groups

> **Programme:** APZHUB-QA-RECERT-001  
> **Status:** Orders 1–6 groups **CLOSED / REMEDIATED**.  
> **Residual CERT-001 failures:** New groups under [../residual-analysis/REMEDIATION-GROUPS.md](../residual-analysis/REMEDIATION-GROUPS.md) (APZHUB-QA-RECERT-002).

Every historical failure belonged to exactly one group below.

---

## RG-HEALTH-503

| Field            | Value                                                                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Count            | **6**                                                                                                                                  |
| Status           | **REMEDIATED** (APZHUB-ENG-0006) — 6/6 PASS                                                                                            |
| Primary category | Infrastructure                                                                                                                         |
| Priority         | P0                                                                                                                                     |
| Est. size        | M                                                                                                                                      |
| Owner            | Platform Ops + Runtime                                                                                                                 |
| Root cause       | Playwright webServer /api/health returned 503 (DB/Redis or runtime not healthy for request context)                                    |
| Recommended fix  | Address RG-HEALTH-503: Playwright webServer /api/health returned 503 (DB/Redis or runtime not healthy for request context)             |
| Closure          | n8n manifest `supportedApiVersion` + Playwright env merge; see [ENG-0006](../../engineering/APZHUB-ENG-0006/IMPLEMENTATION-SUMMARY.md) |

Member tests:

- `spr-001.spec.ts` — health endpoint returns platform status
- `spr-002-runtime.spec.ts` — health endpoint includes platform runtime summary
- `spr-004-action-framework.spec.ts` — health endpoint includes Action Framework hydration summary
- `spr-005-knowledge-discovery-framework.spec.ts` — health endpoint includes Knowledge Service hydration summary
- `spr-006-event-notification-framework.spec.ts` — health endpoint includes Event and Notification Framework summaries
- `spr-007-activity-timeline-framework.spec.ts` — health endpoint includes Activity and Timeline Framework summaries

---

## RG-AUTH-SHELL

| Field            | Value                                                                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Count            | **20**                                                                                                                                        |
| Status           | **ROOT CAUSE REMEDIATED** (APZHUB-ENG-0006); **4 residual** post-auth UI/session/palette failures                                             |
| Primary category | Authentication                                                                                                                                |
| Priority         | P0                                                                                                                                            |
| Est. size        | M                                                                                                                                             |
| Owner            | Identity + Shell                                                                                                                              |
| Root cause       | Sign-in/register path did not reach Home heading (auth seed / Invalid password cascade)                                                       |
| Recommended fix  | Address RG-AUTH-SHELL: Sign-in/register path did not reach Home heading (auth seed / Invalid password cascade)                                |
| Closure          | globalSetup DEV auth + `signInDevUser`; residuals listed in [REMEDIATION-EVIDENCE](../../engineering/APZHUB-ENG-0006/REMEDIATION-EVIDENCE.md) |

Member tests:

- `spr-001.spec.ts` — registration and desktop shell
- `spr-003-workbench-context-selection.spec.ts` — navigation updates persisted workbench context after sidebar selection
- `spr-003-workbench-navigation.spec.ts` — activity bar renders manifest-driven workspaces
- `spr-003-workbench-navigation.spec.ts` — sidebar renders manifest-driven items for active workspace
- `spr-003-workbench-navigation.spec.ts` — selecting sidebar item activates view and updates route
- `spr-003-workbench-navigation.spec.ts` — selecting administration workspace updates active activity bar item
- `spr-003-workbench-session.spec.ts` — restores sidebar selection and active view after reload
- `spr-004-action-framework.spec.ts` — authenticated shell hydrates workbench surfaces from Action Registry
- `spr-004-action-framework.spec.ts` — command palette opens and lists platform actions
- `spr-004-action-framework.spec.ts` — command palette executes an action through the registry pipeline
- `spr-005-knowledge-discovery-framework.spec.ts` — authenticated shell mounts KnowledgeDiscoveryProvider with live service diagnostics
- `spr-005-knowledge-discovery-framework.spec.ts` — palette knowledge mode queries through Knowledge Service
- `spr-005-knowledge-discovery-framework.spec.ts` — palette knowledge mode delegates action selection through Action Framework
- `spr-005-knowledge-discovery-framework.spec.ts` — palette knowledge mode delegates navigation through Workbench paths
- `spr-006-event-notification-framework.spec.ts` — authenticated shell mounts notification providers with hidden diagnostics hooks
- `spr-006-event-notification-framework.spec.ts` — action execution flows through to badge and panel notifications
- `spr-006-event-notification-framework.spec.ts` — notification panel supports mark read and mark all read with badge updates
- `spr-007-activity-timeline-framework.spec.ts` — authenticated shell mounts Activity Timeline providers with hidden diagnostics hooks
- `spr-007-activity-timeline-framework.spec.ts` — action execution flows through Event Bus to Activity Timeline and parallel notifications
- `spr-007-activity-timeline-framework.spec.ts` — activity actionRef delegates through Action Framework execute

---

## RG-LAW-DNS

| Field            | Value                                                                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Count            | **7**                                                                                                                                                                      |
| Status           | **REMEDIATED** (APZHUB-ENG-0007) — 7/7 PASS                                                                                                                                |
| Primary category | Infrastructure                                                                                                                                                             |
| Priority         | P1                                                                                                                                                                         |
| Est. size        | M                                                                                                                                                                          |
| Owner            | Law PO + Platform                                                                                                                                                          |
| Root cause       | Next.js client bundle pulls `pg` → Module not found: Can't resolve 'dns'                                                                                                   |
| Recommended fix  | Address RG-LAW-DNS: Next.js client bundle pulls `pg` → Module not found: Can't resolve 'dns'                                                                               |
| Closure          | Client-safe memory singletons + no persistence barrel on client; workbench deep-link preserve; see [ENG-0007](../../engineering/APZHUB-ENG-0007/IMPLEMENTATION-SUMMARY.md) |

Member tests:

- `law-015-trust-workflow.spec.ts` — navigates to trust via Law Platform workspace and sidebar
- `law-015-trust-workflow.spec.ts` — renders trust dashboard metrics and diagnostics from seeded workbench data
- `law-015-trust-workflow.spec.ts` — walks all trust sub-routes and renders page shells with tables
- `law-015-trust-workflow.spec.ts` — displays seeded transactions, allocations, reconciliation, interest, and transfers
- `law-015-trust-workflow.spec.ts` — generates a trust report and enables export actions
- `law-015-trust-workflow.spec.ts` — opens print view in a new tab after generating a report
- `law-015-trust-workflow.spec.ts` — trust diagnostics counters reflect seeded engine activity

---

## RG-A11Y-CONTRAST

| Field            | Value                                                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Count            | **4**                                                                                                                                   |
| Status           | **REMEDIATED** (APZHUB-ENG-0008) — 4/4 PASS                                                                                             |
| Primary category | Application Bug                                                                                                                         |
| Priority         | P1                                                                                                                                      |
| Est. size        | S                                                                                                                                       |
| Owner            | Design System                                                                                                                           |
| Root cause       | Primary button token contrast 2.66 < WCAG AA 4.5 (fg #0f172a on #1d4ed8)                                                                |
| Recommended fix  | Address RG-A11Y-CONTRAST: Primary button token contrast 2.66 < WCAG AA 4.5 (fg #0f172a on #1d4ed8)                                      |
| Closure          | Primary-foreground application + success/warning AA tokens; see [ENG-0008](../../engineering/APZHUB-ENG-0008/IMPLEMENTATION-SUMMARY.md) |

Member tests:

- `accessibility.spec.ts` — login page has no critical axe violations
- `oss-110-14-support-accessibility.spec.ts` — inbox has no critical/serious axe violations
- `oss-110-14-support-accessibility.spec.ts` — search has no critical/serious axe violations
- `oss-110-14-support-accessibility.spec.ts` — organizations has no critical/serious axe violations

---

## RG-MOCK-FETCH

| Field            | Value                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Count            | **4**                                                                                                                           |
| Status           | **REMEDIATED** (APZHUB-ENG-0009) — 4/4 PASS                                                                                     |
| Primary category | Playwright Test Defect                                                                                                          |
| Priority         | P1                                                                                                                              |
| Est. size        | S                                                                                                                               |
| Owner            | Platform QA                                                                                                                     |
| Root cause       | page.evaluate fetch(relative path) lacks base URL in this Playwright/Chromium context                                           |
| Recommended fix  | Address RG-MOCK-FETCH: page.evaluate fetch(relative path) lacks base URL in this Playwright/Chromium context                    |
| Closure          | Absolute `baseURL` origin in `page.evaluate` fetch; see [ENG-0009](../../engineering/APZHUB-ENG-0009/IMPLEMENTATION-SUMMARY.md) |

Member tests:

- `apzadmin-003-administration-http.spec.ts` — mock fetch to /api/v1/administration serves module list envelope
- `apzidentity-003-identity-http.spec.ts` — mock fetch to /api/v1/identity serves user list envelope
- `apzmetrics-003-metrics-http.spec.ts` — mock fetch to /api/v1/metrics serves metrics list envelope
- `apzobserve-003-observe-http.spec.ts` — mock fetch to /api/v1/observe serves health-check list envelope

---

## RG-PW-API

| Field            | Value                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| Count            | **3**                                                                                                        |
| Status           | **REMEDIATED** (APZHUB-ENG-0010) — 3/3 PASS (1 flaky residual)                                               |
| Primary category | Playwright Test Defect                                                                                       |
| Priority         | P1                                                                                                           |
| Est. size        | S                                                                                                            |
| Owner            | Platform QA                                                                                                  |
| Root cause       | Tests call page.getByLabelText (non-existent Playwright API); should use getByLabel                          |
| Recommended fix  | Address RG-PW-API: Tests call page.getByLabelText (non-existent Playwright API); should use getByLabel       |
| Closure          | `getByLabelText` → `getByLabel`; see [ENG-0010](../../engineering/APZHUB-ENG-0010/IMPLEMENTATION-SUMMARY.md) |

Member tests:

- `apzreport-002-platform-reporting-workbench.spec.ts` — exposes command toolbar and a11y landmarks
- `apztcms-022-engineering-intelligence-workbench.spec.ts` — opens Engineering Intelligence through mocked /api/v1/testing
- `apztcms-022-engineering-intelligence-workbench.spec.ts` — supports panel tabs and a11y landmarks

---

## RG-SELECTORS

| Field            | Value                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| Count            | **4**                                                                                                     |
| Status           | **REMEDIATED** (APZHUB-ENG-0011) — 4/4 PASS (1 flaky residual)                                            |
| Primary category | Playwright Test Defect                                                                                    |
| Priority         | P1                                                                                                        |
| Est. size        | S                                                                                                         |
| Owner            | Platform QA + Product PO                                                                                  |
| Root cause       | Ambiguous getByText/getBy* matches multiple nodes (table cell + heading)                                  |
| Recommended fix  | Address RG-SELECTORS: Ambiguous getByText/getBy* matches multiple nodes (table cell + heading)            |
| Closure          | Role-based cell/row locators; see [ENG-0011](../../engineering/APZHUB-ENG-0011/IMPLEMENTATION-SUMMARY.md) |

Member tests:

- `apzdocs-005-platform-documents-workbench.spec.ts` — opens Documents workbench through mocked /api/v1/documents
- `apzsearch-007-platform-search-workbench.spec.ts` — query section shows mocked hit
- `apztcms-018-pipeline-workbench.spec.ts` — opens workflow runs and asserts a11y landmarks
- `apzobserve-004-observe-workbench.spec.ts` — manifest journey across overview, health, metrics, alerts, diagnostics

---

## RG-METRICS-WB

| Field            | Value                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Count            | **2**                                                                                                                      |
| Status           | **REMEDIATED** (APZHUB-ENG-0012) — 2/2 PASS · **ACCEPTED**                                                                 |
| Primary category | UI Change                                                                                                                  |
| Priority         | P2                                                                                                                         |
| Est. size        | M                                                                                                                          |
| Owner            | Metrics PO                                                                                                                 |
| Root cause       | Expected metrics-page / unavailable testids not visible (route/mock/hydration)                                             |
| Recommended fix  | Address RG-METRICS-WB: Expected metrics-page / unavailable testids not visible (route/mock/hydration)                      |
| Closure          | Playwright `signIn` before metrics navigation; see [ENG-0012](../../engineering/APZHUB-ENG-0012/IMPLEMENTATION-SUMMARY.md) |

Member tests:

- `apzmetrics-004-metrics-workbench.spec.ts` — metadata journey across overview, definitions, versions, formulas, KPIs, diagnostics
- `apzmetrics-004-metrics-workbench.spec.ts` — shows METRICS_SERVICE_UNAVAILABLE when disabled

---

## RG-TCMS-WB

| Field            | Value                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Count            | **2**                                                                                                                                                   |
| Status           | **REMEDIATED** (APZHUB-ENG-0013) — 2/2 PASS · **ACCEPTED**                                                                                              |
| Primary category | UI Change                                                                                                                                               |
| Priority         | P2                                                                                                                                                      |
| Est. size        | M                                                                                                                                                       |
| Owner            | TCMS PO                                                                                                                                                 |
| Root cause       | Expected testing-* testids / landmarks not found (UI or mock path)                                                                                      |
| Recommended fix  | Address RG-TCMS-WB: Expected testing-* testids / landmarks not found (UI or mock path)                                                                  |
| Closure          | Playwright `/api/v1/testing/**` mocks for dashboard + certification detail; see [ENG-0013](../../engineering/APZHUB-ENG-0013/IMPLEMENTATION-SUMMARY.md) |

Member tests:

- `apztcms-010-testing-workbench.spec.ts` — dashboard loads with testing page shell
- `apztcms-010-testing-workbench.spec.ts` — certification detail shows gates and advisory recommendation

---

## RG-WORKFLOW-WB

| Field            | Value                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Count            | **2**                                                                                                                                |
| Status           | **REMEDIATED** (APZHUB-ENG-0014) — 2/2 PASS · **ACCEPTED**                                                                           |
| Primary category | UI Change                                                                                                                            |
| Priority         | P2                                                                                                                                   |
| Est. size        | M                                                                                                                                    |
| Owner            | Workflow PO                                                                                                                          |
| Root cause       | READ-ONLY ENGINE text / list viewer not matching (mock path or timeout)                                                              |
| Recommended fix  | Address RG-WORKFLOW-WB: READ-ONLY ENGINE text / list viewer not matching (mock path or timeout)                                      |
| Closure          | Exact `/api/v1/workflows/engine` list/detail mock paths; see [ENG-0014](../../engineering/APZHUB-ENG-0014/IMPLEMENTATION-SUMMARY.md) |

Member tests:

- `apzworkflow-009-workflow-engine-workbench.spec.ts` — overview shows READ-ONLY ENGINE via mocked typed-client path
- `apzworkflow-009-workflow-engine-workbench.spec.ts` — workflows section shows list and definition viewer

---

## RG-VISUAL

| Field            | Value                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Count            | **2**                                                                                                                                |
| Status           | **REMEDIATED** (APZHUB-ENG-0015) — 2/2 PASS · **ACCEPTED**                                                                           |
| Primary category | UI Change                                                                                                                            |
| Priority         | P2                                                                                                                                   |
| Est. size        | S                                                                                                                                    |
| Owner            | Support PO + QA                                                                                                                      |
| Root cause       | Screenshot baseline drift vs current Support UI                                                                                      |
| Recommended fix  | Address RG-VISUAL: Screenshot baseline drift vs current Support UI                                                                   |
| Closure          | Regenerated detail + analytics Chromium Linux baselines; see [ENG-0015](../../engineering/APZHUB-ENG-0015/IMPLEMENTATION-SUMMARY.md) |

Member tests:

- `oss-110-14-support-visual.spec.ts` — detail screenshot
- `oss-110-14-support-visual.spec.ts` — analytics screenshot

---

## Residual pointer (post CERT-001)

Orders 1–6 are **CLOSED**. Remaining portfolio certification failures are inventoried and grouped in:

- [../residual-analysis/FAILURE-INVENTORY.md](../residual-analysis/FAILURE-INVENTORY.md)
- [../residual-analysis/REMEDIATION-GROUPS.md](../residual-analysis/REMEDIATION-GROUPS.md)
- [../residual-analysis/ENGINEERING-PLAN.md](../residual-analysis/ENGINEERING-PLAN.md)
