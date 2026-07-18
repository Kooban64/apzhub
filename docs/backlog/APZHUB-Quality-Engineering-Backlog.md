# APZHUB Quality Engineering Backlog

> **Status:** **SUPERSEDED** for delivery — use **[APZTCMS-Backlog](./APZTCMS-Backlog.md)** and **[APZTCMS-Milestone-Roadmap](./APZTCMS-Milestone-Roadmap.md)**. Do not implement QE-* IDs for new work. Retained as planning predecessor only.

**Milestone:** OSS-002 — planning backlog  
**Status:** Phased delivery plan — **no implementation until QE-001 approved** _(superseded by APZTCMS-002+)_  
**Authority:** [Quality Engineering Platform Strategy](../strategy/APZHUB-Quality-Engineering-Platform-Strategy.md)

---

## Overview

| Phase | ID     | Theme                            |
| ----- | ------ | -------------------------------- |
| 1     | QE-001 | Foundation & Domain Model        |
| 2     | QE-002 | Test Case Management             |
| 3     | QE-003 | Test Plans & Suites              |
| 4     | QE-004 | Manual Test Execution            |
| 5     | QE-005 | Playwright Execution Integration |
| 6     | QE-006 | Evidence & Attachments           |
| 7     | QE-007 | Defect Integration               |
| 8     | QE-008 | Release Gates                    |
| 9     | QE-009 | Quality Analytics                |
| 10    | QE-010 | AI Test Generation               |
| 11    | QE-011 | AI Failure Analysis              |
| 12    | QE-012 | Visual Regression                |
| 13    | QE-013 | Accessibility Testing            |
| 14    | QE-014 | API Testing                      |
| 15    | QE-015 | Production Readiness             |

Each phase requires an approved sprint guide before implementation.

---

## QE-001 — Foundation & Domain Model

**Objective:** Establish Quality Engineering as a native capability with manifests, service shell, domain model, and platform registrations.

**Scope:**

- `module.yaml`, `service.yaml` for `quality-engineering`
- `QualityEngineeringService` interface and package scaffold
- Domain entity definitions (requirement, case, suite, plan, cycle, run, result, gate)
- Platform PostgreSQL schema design (migration plan only at planning; migration in QE-001 impl)
- Governance capability registration
- Lifecycle product registration
- Operations control plane capability entry (stub health)

**Out of scope:**

- UI beyond shell placeholder
- Execution workers
- Playwright runner
- AI features

**Platform capabilities consumed:**

- Platform Runtime, Bootstrap, Identity, Authorization, Governance, Provisioning, Lifecycle, Operations, Configuration

**Tests:**

- Service contract tests (interface)
- Manifest validation tests
- Architecture compliance tests (no layer bypass)

**Deliverables:**

- Manifests approved
- Service package scaffold
- Schema migration
- QE-001 completion report

**Stop condition:** QE-001 complete; await owner approval before QE-002.

---

## QE-002 — Test Case Management

**Objective:** CRUD test cases with steps, expected results, and automation metadata.

**Scope:**

- Test case API (gateway-routed)
- Case editor Workbench view (basic)
- Permission model: view, edit, execute
- Audit on create/update/delete
- Search provider registration (case title, tags)

**Out of scope:**

- Plans, suites, execution
- Evidence upload
- AI generation

**Platform capabilities consumed:**

- Authorization, Audit, Search (020), Activity (007), API Gateway (010)

**Tests:**

- Unit tests for case validation rules
- API integration tests
- Permission denial tests
- Playwright smoke: create case

**Deliverables:**

- Case CRUD API + UI
- Search index for cases
- QE-002 completion report

**Stop condition:** QE-002 complete; await approval before QE-003.

---

## QE-003 — Test Plans & Suites

**Objective:** Organise cases into suites and plans with cycle scheduling.

**Scope:**

- Suite CRUD and case membership
- Test plan and cycle entities
- Plan board Workbench view
- Events: `test_plan.created`, `test_cycle.started`

**Out of scope:**

- Execution results
- Release gates
- Projects linking

**Platform capabilities consumed:**

- Events (029), Notifications (021), Search, Activity

**Tests:**

- Suite membership invariant tests
- Plan lifecycle state tests
- API + component tests

**Deliverables:**

- Plans/suites API + UI
- Event catalogue entries
- QE-003 completion report

**Stop condition:** QE-003 complete; await approval before QE-004.

---

## QE-004 — Manual Test Execution

**Objective:** Execute test cases manually in Workbench with step-level results.

**Scope:**

- Test run creation from plan/cycle
- Step-by-step execution UI
- Result states: pass, fail, blocked, skipped
- Activity timeline for runs
- Notifications on run assignment

**Out of scope:**

- Automated execution
- Evidence attachments (QE-006)
- Defect linking (QE-007)

**Platform capabilities consumed:**

- Notifications, Activity, Personalisation (run filters)

**Tests:**

- Run state machine tests
- Manual execution E2E
- Notification route tests

**Deliverables:**

- Manual execution flow end-to-end
- QE-004 completion report

**Stop condition:** QE-004 complete; await approval before QE-005.

---

## QE-005 — Playwright Execution Integration

**Objective:** Submit and track automated Playwright test runs via platform workers.

**Scope:**

- Execution job model and worker contract
- Playwright runner worker (PCv2-02 dependency)
- Result ingestion API (worker callback)
- Automated run trigger from UI
- Real-time progress (SSE/WebSocket)
- M17 CI webhook stub (integration point documented)

**Out of scope:**

- Visual regression (QE-012)
- A11y scans (QE-013)
- API testing (QE-014)

**Platform capabilities consumed:**

- Workers/outbox (PCv2-02), Operations (queue depth), Events

**Tests:**

- Worker integration tests with sample spec
- Idempotent result ingestion tests
- E2E: trigger run → result displayed

**Deliverables:**

- Playwright execution pipeline
- Worker runbook
- QE-005 completion report

**Stop condition:** QE-005 complete; await approval before QE-006.

---

## QE-006 — Evidence & Attachments

**Objective:** Capture and store execution evidence (screenshots, traces, videos, files).

**Scope:**

- Object storage integration (S3-compatible)
- Evidence metadata in PostgreSQL
- Upload from manual execution and automated runs
- Permission-gated evidence viewer in Workbench
- Retention policy hooks (governance)

**Out of scope:**

- AI analysis of evidence (QE-011)
- External CDN

**Platform capabilities consumed:**

- Configuration (storage refs), Security (access control), Governance

**Tests:**

- Upload/download permission tests
- Storage failure handling tests
- Evidence linked to result invariant tests

**Deliverables:**

- Evidence model + UI viewer
- QE-006 completion report

**Stop condition:** QE-006 complete; await approval before QE-007.

---

## QE-007 — Defect Integration

**Objective:** Link failed test results to Projects issues and Support tickets.

**Scope:**

- Defect link entity (reference-only — no duplicate SoR)
- Link/unlink API and UI
- Activity events on link
- Search index for linked defects
- **Dependency:** Wave 1 Projects (OSS-101) for issue creation; graceful degrade if unavailable

**Out of scope:**

- Native defect management
- Support ticket creation (Wave 4) — link only when available

**Platform capabilities consumed:**

- Events, Activity, Search; optional ProjectService connector call via service layer

**Tests:**

- Link reference integrity tests
- Graceful degrade when Projects unavailable
- Cross-product activity tests

**Deliverables:**

- Defect linking feature
- QE-007 completion report

**Stop condition:** QE-007 complete; await approval before QE-008.

---

## QE-008 — Release Gates

**Objective:** Define and evaluate release certification gates.

**Scope:**

- Gate rule definitions (pass rate, critical cases, manual sign-off)
- Gate evaluation engine in service
- Gate dashboard Workbench view
- Events: `release_gate.failed`, `release_gate.passed`
- Notifications on gate failure
- Override with audit (permission-gated)

**Out of scope:**

- Automation workflow triggers (Wave 7) — event published for consumers
- Metabase dashboards (Wave 6)

**Platform capabilities consumed:**

- Authorization (sign-off permissions), Audit, Notifications, Events

**Tests:**

- Gate rule evaluation unit tests
- Override audit tests
- E2E: block scenario

**Deliverables:**

- Release gates feature
- QE-008 completion report

**Stop condition:** QE-008 complete; await approval before QE-009.

---

## QE-009 — Quality Analytics

**Objective:** Quality dashboard with pass rates, trends, and requirement coverage.

**Scope:**

- Derived metrics from run and gate data
- Native dashboard Workbench view
- Search/analytics index for aggregates
- Export API for Metabase (Wave 6 prep)

**Out of scope:**

- Metabase embed (Wave 6)
- AI insights (QE-010/011)

**Platform capabilities consumed:**

- Search (aggregates), Personalisation (dashboard layout)

**Tests:**

- Metric calculation tests
- Dashboard component tests

**Deliverables:**

- Quality dashboard
- QE-009 completion report

**Stop condition:** QE-009 complete; await approval before QE-010.

---

## QE-010 — AI Test Generation

**Objective:** Generate draft test cases from requirements with mandatory human approval.

**Scope:**

- AI provider integration (governed — AI Strategy)
- Draft case generation API
- Approval workflow before activation
- Audit: model version, prompt hash, approver

**Out of scope:**

- Auto-activation without review
- Unsupervised production gate decisions

**Platform capabilities consumed:**

- Governance, Audit, AI governance hooks

**Tests:**

- Approval workflow tests
- Audit trail completeness tests
- Mock AI provider contract tests

**Deliverables:**

- AI generation feature (gated)
- QE-010 completion report

**Stop condition:** QE-010 complete; await approval before QE-011.

---

## QE-011 — AI Failure Analysis

**Objective:** Suggest failure groupings and root causes from run evidence.

**Scope:**

- Analysis job on failed runs
- Suggestion UI — no auto-close
- Group similar failures
- Audit analysis requests

**Out of scope:**

- Autonomous defect creation
- Model training on tenant data without consent

**Platform capabilities consumed:**

- Workers, Audit, AI governance

**Tests:**

- Suggestion display tests
- No auto-action invariant tests

**Deliverables:**

- Failure analysis feature
- QE-011 completion report

**Stop condition:** QE-011 complete; await approval before QE-012.

---

## QE-012 — Visual Regression

**Objective:** Baseline and compare visual snapshots in automated runs.

**Scope:**

- Baseline storage and versioning
- Worker diff pipeline
- Fail results with image evidence
- Baseline approval workflow

**Out of scope:**

- Non-Playwright visual tools

**Platform capabilities consumed:**

- Evidence storage (QE-006), Workers

**Tests:**

- Diff algorithm integration tests
- Baseline approval permission tests

**Deliverables:**

- Visual regression feature
- QE-012 completion report

**Stop condition:** QE-012 complete; await approval before QE-013.

---

## QE-013 — Accessibility Testing

**Objective:** Automated WCAG scans in Playwright execution pipeline.

**Scope:**

- A11y rule configuration per tenant
- Worker integration (axe / Playwright a11y)
- Failures as test results with violation detail
- Link to Document 015 a11y targets

**Out of scope:**

- Manual a11y audit replacement
- Platform-wide a11y scanner for non-QE pages

**Platform capabilities consumed:**

- Workers, Governance (rule sets)

**Tests:**

- A11y violation mapping tests
- Sample page scan E2E

**Deliverables:**

- A11y testing feature
- QE-013 completion report

**Stop condition:** QE-013 complete; await approval before QE-014.

---

## QE-014 — API Testing

**Objective:** Declarative HTTP contract tests executed by workers.

**Scope:**

- API test definition model
- Worker HTTP executor
- Results as standard test results
- Link to test cases

**Out of scope:**

- Full API design tool
- Load/performance testing (future)

**Platform capabilities consumed:**

- Workers, Security (credential refs for test auth)

**Tests:**

- HTTP executor tests
- Auth header handling tests

**Deliverables:**

- API testing feature
- QE-014 completion report

**Stop condition:** QE-014 complete; await approval before QE-015.

---

## QE-015 — Production Readiness

**Objective:** Certify Quality Engineering Platform for production deployment.

**Scope:**

- Full test pyramid completion
- Security review
- Ops runbooks (backup, DR, monitoring)
- Performance baseline
- Architecture compliance certification
- Commercial tier entitlement mapping
- QE platform completion report

**Out of scope:**

- New feature development

**Platform capabilities consumed:**

- All Platform Core capabilities — full integration verification

**Tests:**

- Full regression suite
- Playwright E2E certification path
- Load smoke on execution queue
- Architecture compliance tests

**Deliverables:**

- Production readiness review (PASS/FAIL)
- Ops runbooks
- QE-015 / Quality Engineering v1.0 completion report

**Stop condition:** Quality Engineering Platform certified; wave 5 complete.

---

## Wave 5 gate

Wave 5 (Quality Engineering) is complete when **QE-015** passes owner acceptance.

**Prerequisites:** PCv2-02 Workers · M17 CI/CD · OSS-002 accepted · QE-001 approved.

---

## Related

- [Quality Engineering Reference Architecture](../architecture/APZHUB-Quality-Engineering-Reference-Architecture.md)
- [Capability Abstraction Standard](../architecture/APZHUB-Capability-Abstraction-Standard.md)
