# Current Capability Assessment — APZQEP v1.0

| Field     | Value                                                          |
| --------- | -------------------------------------------------------------- |
| Programme | APZQEP-110 Phase 1                                             |
| Baseline  | CLOSE-001 · Standing Programme Record                          |
| Date      | 2026-08-01                                                     |
| Method    | Repository evidence only — no file mutations during assessment |

---

## Executive posture

| Dimension          | Status                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------- |
| Product            | APZ QEP v1.0 — Lifecycle Complete · Maintained                                               |
| Availability       | LIMITED_AVAILABILITY (Evidence + Test Execution); five foundation domains CERTIFIED / FROZEN |
| Live deploy        | Not performed                                                                                |
| Unrestricted GA    | Not authorised (Evidence / TE)                                                               |
| Active engineering | **NONE**                                                                                     |

---

## Implemented packages

| Package                           | Version | Class                    |
| --------------------------------- | ------- | ------------------------ |
| `@apzhub/qep-requirements`        | 1.0.0   | PRODUCTION (frozen)      |
| `@apzhub/qep-traceability`        | 1.0.0   | PRODUCTION (frozen)      |
| `@apzhub/qep-verification`        | 1.0.0   | PRODUCTION (frozen)      |
| `@apzhub/qep-test-specifications` | 1.0.0   | PRODUCTION (frozen)      |
| `@apzhub/qep-test-plans`          | 1.0.0   | PRODUCTION (frozen)      |
| `@apzhub/qep-test-execution`      | 1.0.1   | LIMITED_AVAILABILITY     |
| `@apzhub/qep-evidence`            | 1.0.0   | LIMITED_AVAILABILITY     |
| `@apzhub/search-qep`              | 0.1.0   | PARTIAL (5 entity types) |

Workbench: seven routers under `/workspace/qep/*`. REST: `/api/v1/qep/*` (~138 routes).  
Stub modules (0.1.0): home, defects, certification, audit, administration, integrations, reporting, search, quality-intelligence, portfolio, risk, automation, ai-workspace, mcp, knowledge, release-readiness, and related placeholders.

---

## Capability classification

| Capability                           | Class        | Notes                                             |
| ------------------------------------ | ------------ | ------------------------------------------------- |
| Requirements                         | **Complete** | Frozen 1.0.0                                      |
| Traceability                         | **Complete** | Matrix only; coverage/impact deferred             |
| Verification                         | **Complete** | Frozen 1.0.0                                      |
| Test Specifications                  | **Complete** | Frozen 1.0.0                                      |
| Test Plans                           | **Complete** | Frozen 1.0.0; known plan limitations              |
| Test Execution                       | **Partial**  | 1.0.1 LA; L-01/L-03/L-04/L-OP-01 open             |
| Evidence Management                  | **Partial**  | 1.0.0 LA; ADR-0088 memory; event/obs gaps         |
| Test Runs                            | **Future**   | Stub only                                         |
| Test Suites                          | **Future**   | Stub only                                         |
| Defects                              | **Future**   | Stub only                                         |
| Coverage / Impact                    | **Future**   | Explicitly deferred from Traceability 1.0         |
| Certification Engine (product)       | **Future**   | Programme CERT packs exist; product module stub   |
| Reporting                            | **Future**   | Stub                                              |
| Metrics (QEP-specific)               | **Deferred** | Platform metrics exist; QEP obs deferred          |
| Analytics / QI                       | **Future**   | Stub                                              |
| Dashboards                           | **Partial**  | Capability-scoped only                            |
| Search                               | **Partial**  | Not specs/plans/execution/evidence                |
| Notifications                        | **Deferred** | Events not on bus (TE L-03, Evidence L-EM-EVT-01) |
| Documents integration                | **Missing**  |                                                   |
| AI features                          | **Future**   | Stubs; out of v1.0 scope                          |
| Automation / CI                      | **Partial**  | Execution ingestion only                          |
| Portfolio views                      | **Future**   | Stub                                              |
| Administration (QEP)                 | **Future**   | Stub                                              |
| Security / RBAC                      | **Partial**  | Strong on 7 capabilities; stubs reserved          |
| Audit (unified)                      | **Partial**  | Per-capability; no unified compliance module      |
| ALM integrations                     | **Missing**  | GitHub stub only                                  |
| Accessibility / UX polish            | **Partial**  | Smoke E2E; L-OP-01 incomplete                     |
| Command palette                      | **Missing**  | No QEP command registration                       |
| Executive insights                   | **Future**   |                                                   |
| Risk management                      | **Future**   | Stub                                              |
| Compliance product features          | **Future**   |                                                   |
| Release/Freeze **programme** tooling | **Complete** | Docs/governance                                   |
| Release/Freeze **product** UI        | **Missing**  |                                                   |

---

## Binding limitations (must inform v1.1)

### Evidence (CERT-003)

| ID                      | Summary                         | Blocks GA?        |
| ----------------------- | ------------------------------- | ----------------- |
| ADR-0088 / L-EM-STOR-01 | Memory-only / storage undecided | Yes (durable SoR) |
| L-EM-01                 | List/search ACL incomplete      | Recommended       |
| L-EM-EVT-01             | No event bus publish            | Recommended       |
| L-EM-OBS-01             | No Evidence health/metrics      | Recommended       |
| GA / durable SoR        | Not approved                    | Yes               |

### Test Execution (CERT-001 / FREEZE-002)

| ID      | Summary                             | Blocks unrestricted GA? |
| ------- | ----------------------------------- | ----------------------- |
| L-01    | OpenAPI gap                         | No                      |
| L-03    | Outbox enqueue-only                 | If consumers required   |
| L-04    | No PG integration tests             | No                      |
| L-OP-01 | Incomplete authenticated Playwright | **Yes**                 |
| L-02    | Closed via REM-001                  | —                       |

---

## Planning implication

v1.1 should **not** redesign the frozen five. It should:

1. Harden LA capabilities toward operational trust
2. Fill missing operating-model modules (Runs, Suites, Defects)
3. Close discovery/productivity gaps (Search, Notify, Command Palette, Dashboards)
4. Introduce **guarded** AI value
5. Defer deep enterprise analytics / full ALM / unrestricted GA to later Owner programmes
