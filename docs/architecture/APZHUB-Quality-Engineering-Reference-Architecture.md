# APZHUB Quality Engineering Reference Architecture

> **Status:** **SUPERSEDED** for architecture direction — use **[APZ TCMS Reference Architecture](./APZHUB-APZ-TCMS-Reference-Architecture.md)** (APZTCMS-001). Retained as planning predecessor only.

**Milestone:** OSS-002  
**Status:** Planning architecture — no implementation  
**Authority:** [Capability Abstraction Standard](./APZHUB-Capability-Abstraction-Standard.md) · [Document 015](../015-software-quality-testing-qa-cicd-release-management-framework.md)

---

## Architecture overview

```text
┌─────────────────────────────────────────────────────────────────┐
│  Quality Engineering Workbench Module (quality-engineering)      │
│  Plans · Cases · Runs · Evidence · Gates · Dashboard             │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  QualityEngineeringService                                       │
│  Orchestration · Validation · Permissions · Audit · Events         │
└────────────┬───────────────────────────────┬────────────────────┘
             │                               │
┌────────────▼────────────┐    ┌─────────────▼────────────────────┐
│  Domain Engine (native)  │    │  Execution Worker Boundary        │
│  Platform PostgreSQL SoR │    │  Playwright · API · A11y · Visual │
└─────────────────────────┘    └──────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────────┐
│  Platform Core — Identity · Authz · Events · Search · Notify     │
└─────────────────────────────────────────────────────────────────┘
```

Users and modules never call execution workers or storage directly.

---

## Domain model

| Entity | Purpose | SoR |
|--------|---------|-----|
| **Requirement** | Traceability anchor; links to Projects/issues | Platform PostgreSQL |
| **Test case** | Steps, expected results, automation flag | Platform PostgreSQL |
| **Test suite** | Grouped cases for reuse | Platform PostgreSQL |
| **Test plan** | Scope for a release or milestone | Platform PostgreSQL |
| **Test cycle** | Time-bounded execution window within a plan | Platform PostgreSQL |
| **Test run** | Single execution instance (manual or automated) | Platform PostgreSQL |
| **Test result** | Pass/fail/blocked/skipped per step | Platform PostgreSQL |
| **Evidence** | Screenshots, traces, videos, attachments | Object storage + metadata in PG |
| **Defect link** | Reference to Projects issue or Support ticket | Platform PostgreSQL (ref only) |
| **Release gate** | Rule set for certification | Platform PostgreSQL |
| **Gate evaluation** | Point-in-time gate result | Platform PostgreSQL |

Backend engine IDs are never exposed to UI — platform global IDs only.

---

## Layer responsibilities

### Workbench module

- Presentation only — no business rules
- Permission-filtered navigation (017)
- Workbench views: case editor, plan board, run executor, gate dashboard
- Consumes `QualityEngineeringService` APIs via gateway

### QualityEngineeringService

- All business logic: validation, state transitions, gate evaluation
- Permission checks via `@apzhub/platform-authorization`
- Publishes domain events (test run completed, gate failed, etc.)
- Coordinates execution job submission to workers
- Audit every mutation

### Domain engine (native)

- Persistence repositories against platform PostgreSQL
- Tenant-scoped RLS
- No HTTP surface — internal to service package

### Execution worker boundary

- **Playwright integration** — primary runner; invokes test specs; captures traces
- **API testing** — HTTP contract tests via worker (not user-facing Postman clone)
- **Visual regression** — baseline compare via worker pipeline
- **Accessibility testing** — axe/Playwright a11y rules in worker
- Jobs: idempotent, retry/backoff, DLQ (012, PCv2-02)

---

## Feature architecture

### Requirements

- Import or link from Projects milestones
- Traceability matrix: requirement ↔ test case coverage
- Search-indexed; knowledge provider registration

### Test case management

- Manual steps + expected results
- Automation metadata (Playwright spec path, tags)
- Version history on case edit (audit)

### Test suites

- Reusable case collections
- Suite membership versioning for plan snapshots

### Test plans

- Target release/milestone; assigned suites and cycles
- Permission: plan owner vs executor roles

### Test cycles

- Scheduled or ad hoc execution windows
- Aggregate progress and completion metrics

### Manual test execution

- Step-by-step UI in Workbench
- Mark pass/fail/blocked with comment
- Evidence capture upload → object storage

### Automated execution

- Trigger from UI, schedule, or M17 CI webhook
- Worker pulls spec manifest; runs Playwright
- Results streamed to service; real-time progress via SSE/WebSocket

### Playwright integration

- Reuse monorepo Playwright config patterns (015)
- Store HTML report, trace, screenshot refs in evidence model
- Correlation ID links CI build ↔ test run

### API testing

- Declarative request definitions in platform metadata
- Worker executes; results as test results
- Not a replacement for service unit tests — integration layer

### Visual regression

- Baseline images per tenant/project
- Worker diff engine; failures as test results with image evidence
- Baseline approval workflow (permission-gated)

### Accessibility testing

- Automated a11y scans in Playwright worker
- WCAG rule sets configurable per tenant
- Failures linked to cases and defects

### Evidence capture

- S3-compatible storage for blobs
- Metadata + permissions in PostgreSQL
- Retention policy via governance

### Defect linking

- Link failed results → Projects issue (Wave 1) or Support ticket (Wave 4)
- Bi-directional activity events
- No duplicate defect SoR — reference only

### Release gates

- Rule types: automated pass rate, critical case pass, manual sign-off, a11y threshold
- Evaluation on demand or on CI completion
- Block promotion event published to Automation/Projects consumers

### Quality dashboard

- Pass rates, trend, coverage by requirement, cycle burn-down
- Metabase (Wave 6) may consume aggregated metrics — QE owns SoR
- Native dashboard in module for day-to-day; analytics wave for exec BI

### AI test generation (QE-010)

- Input: requirements + existing cases
- Output: draft cases — **requires human approval** before active
- Audit: model version, prompt hash, approver

### AI failure analysis (QE-011)

- Input: failed run evidence + traces
- Output: suggested root cause groupings
- No auto-resolution — human triage

### Coverage analytics

- Requirement coverage %, automation coverage %, gate history
- Derived indexes for search/dashboard — not authoritative

---

## API boundary

All endpoints under Platform API Gateway:

- `GET/POST /api/platform/v1/quality-engineering/test-cases`
- `GET/POST /api/platform/v1/quality-engineering/test-plans`
- `POST /api/platform/v1/quality-engineering/runs`
- `POST /api/platform/v1/quality-engineering/gates/evaluate`
- Internal worker callbacks — authenticated service identity only

Standard envelope, correlation IDs, typed errors (010).

---

## Events (illustrative)

| Event | Subscribers |
|-------|-------------|
| `test_run.completed` | Notifications, activity, search index |
| `release_gate.failed` | Notifications, Automation, Projects |
| `defect.linked` | Activity, Projects |
| `evidence.uploaded` | Search (metadata) |

---

## Data architecture

- Platform PostgreSQL — authoritative for all QE entities (011)
- Object storage — evidence blobs only
- Redis — job queue (PCv2-02)
- No duplicate business data in external engines

---

## Security

- Tenant isolation on all entities (RLS)
- Evidence access permission-gated
- Worker service accounts — least privilege
- Audit immutable for gate overrides and sign-offs (013)

---

## Planning constraints

**Not in OSS-002 scope:** database migrations, API routes, UI components, Playwright runner code, AI model integration.

Implementation begins only with **QE-001** owner approval.

---

## Related

- [Quality Engineering Platform Strategy](../strategy/APZHUB-Quality-Engineering-Platform-Strategy.md)
- [Quality Engineering Backlog](../backlog/APZHUB-Quality-Engineering-Backlog.md)
- [Document 015 — Quality Framework](../015-software-quality-testing-qa-cicd-release-management-framework.md)
