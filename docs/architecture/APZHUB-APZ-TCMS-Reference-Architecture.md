# APZ TCMS — Reference Architecture

**Product:** APZ TCMS (APZHUB Test & Certification Management System)  
**Milestone:** APZTCMS-001 (architecture) · **APZTCMS-002** (foundation packages) · **APZTCMS-003** (persistence)  
**Status:** Architecture + foundation + **persistence layer exist** — **still no product UI/APIs/runners**  
**Authority:** [000](../000-apzhub-engineering-constitution.md) · [003](../003-system-architecture-layered-design-principles.md) · [008](../008-module-platform-service-connector-architecture.md) · [009](../009-platform-service-layer-business-logic-architecture.md) · [011](../011-data-architecture-system-of-record-principles.md) · [012](../012-event-driven-architecture-background-processing.md) · [013](../013-security-architecture-zero-trust-model.md) · [015](../015-software-quality-testing-qa-cicd-release-management-framework.md) · [026](../026-integration-sdk-adapter-framework-integration-manifest-specification.md) · [Reference Adapter Standard](./REFERENCE-ADAPTER-STANDARD.md) · [ADR-0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md)

**Supersedes:** [QE Reference Architecture](./APZHUB-Quality-Engineering-Reference-Architecture.md) for product architecture direction.

---

## Implementation status note

| Layer | Status |
| ----- | ------ |
| Vision / reference architecture (APZTCMS-001) | ✅ Complete (docs) |
| Foundation packages & manifests (APZTCMS-002) | ✅ `@apzhub/testing-contracts` / `@apzhub/testing-foundation` **0.1.0**; service + disabled module manifests |
| Persistence / live authz (APZTCMS-003) | ✅ `@apzhub/testing-persistence` **0.1.0**; `testing_*` schema + migrations 0016/0017; platform authz namespaces |
| Product runtime (APIs, UI, workers, adapters) | ❌ Not started — still excluded |

See [Persistence Architecture](./APZHUB-APZ-TCMS-Persistence-Architecture.md) · [Foundation Architecture](./APZHUB-APZ-TCMS-Foundation-Architecture.md) · [APZTCMS-003 Completion Report](../sprint/APZTCMS-003-completion-report.md).

---

## Explicit exclusions (planning baseline through APZTCMS-003)

APZTCMS-001 was docs-only. APZTCMS-002 added contracts and manifests. APZTCMS-003 added **SoR persistence and permission wiring**. APZTCMS-004 added **manual domain services** (`@apzhub/testing-services` **0.1.0**; contracts/persistence **0.2.0**) — still **no** product UI, HTTP APIs, evidence binary upload, or enabled Testing module. Await **APZTCMS-005** for Manual Execution & Evidence (binary pipeline + delivery layer + Postgres completion).
---

## Architecture overview

```text
┌──────────────────────────────────────────────────────────────────────────┐
│  Testing Workbench Module (module id: testing)                            │
│  Dashboard · Requirements · Plans · Suites · Cases · Executions ·         │
│  Automation · Evidence · Defects · Coverage · Certification · Reports ·   │
│  Admin                                                                    │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │ Gateway → Auth → Authz (010)
┌─────────────────────────────────▼────────────────────────────────────────┐
│  Platform Services                                                        │
│  TestingService  ·  CertificationService                                  │
│  Orchestration · Validation · Permissions · Audit · Events · Gates        │
└────────────┬───────────────────────────────┬─────────────────────────────┘
             │                               │
┌────────────▼────────────┐    ┌─────────────▼─────────────────────────────┐
│  Domain SoR (native)     │    │  Async Workers (012)                       │
│  Platform PostgreSQL     │    │  Result ingestion · evidence processing ·  │
│  TCMS metadata           │    │  coverage recompute · certification jobs   │
└────────────┬────────────┘    └─────────────┬─────────────────────────────┘
             │                               │
┌────────────▼────────────┐    ┌─────────────▼─────────────────────────────┐
│  Evidence object store   │    │  Result Adapters (Integration SDK)         │
│  S3-compatible blobs     │    │  Vitest · Playwright · JUnit XML · …       │
└─────────────────────────┘    └─────────────┬─────────────────────────────┘
                                             │
                               ┌─────────────▼─────────────────────────────┐
                               │  External Execution Engines (independent)  │
                               │  Vitest · Playwright · Jest · JUnit ·      │
                               │  Allure · axe · Lighthouse · ZAP · k6 · …  │
                               └───────────────────────────────────────────┘
```

**Invariant:** Modules never call engines or adapters. Services never skip connectors for engine I/O. Engines never write APZHUB domain tables directly.

---

## Orchestration vs engines

| Concern                                                                  | Owner                                                    |
| ------------------------------------------------------------------------ | -------------------------------------------------------- |
| Test assets, plans, manual steps, results metadata, gates, certification | **APZ TCMS** (platform PG)                               |
| Evidence binary files                                                    | **Object storage** + metadata in PG                      |
| Running unit/E2E/a11y/perf/security tests                                | **External engines** (CI or local runners)               |
| Translating engine output into TCMS domain                               | **Result adapters**                                      |
| Adapter contract certification                                           | **Integration SDK harness** (orthogonal product concern) |

---

## Layer responsibilities

### Presentation — Testing module (`testing`)

- Workbench views only (005, 016–017); no business rules
- Permission-filtered Activity Bar / Sidebar / commands
- Calls `TestingService` / `CertificationService` via API Gateway only

### Application / Domain — Platform Services

| Service                  | Responsibility                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **TestingService**       | Requirements, risks, plans, suites, cases, steps, executions, runs, results, evidence metadata, defects, coverage, regression suites, dashboards |
| **CertificationService** | Certification records/states, quality gates, approvals, signatures/witnesses, release decision orchestration                                     |

Both: validate → authz → mutate → audit → publish events; never call engines directly.

### Adapters — Result connectors (future)

- Integration SDK pattern (`integration.yaml` in future milestones)
- Ingest only: parse result artefacts → normalised `TestResult` / evidence refs
- Examples: `VitestResultAdapter`, `PlaywrightResultAdapter`, `JUnitXmlAdapter`
- Health, error translation, CE/self-hosted first (026)

### Workers

- Idempotent ingestion, evidence virus-scan/thumbnail jobs, coverage aggregation, gate evaluation batches
- Never long-running work in request handlers (012)

### Backend engines

- Remain independent products/tools
- Not Systems of Record for APZ TCMS domain

---

## Data & storage

| Data class           | Store                     | Notes                                          |
| -------------------- | ------------------------- | ---------------------------------------------- |
| TCMS domain metadata | Platform PostgreSQL       | **System of Record** (011)                     |
| Evidence blobs       | S3-compatible             | Refs + hashes in PG                            |
| Search index         | Platform search (derived) | Not SoR                                        |
| Cache                | Redis (platform)          | Non-authoritative                              |
| Engine result files  | Transient / CI artefacts  | Ingested then discarded or archived per policy |

Backend business data from Projects/Support is **referenced**, never duplicated as authoritative copies.

---

## Events (conceptual)

Past-tense examples (029; `event.yaml` in later milestones):

| Event                         | Publisher            |
| ----------------------------- | -------------------- |
| `test_run.completed`          | TestingService       |
| `test_result.recorded`        | TestingService       |
| `evidence.attached`           | TestingService       |
| `quality_gate.evaluated`      | CertificationService |
| `certification.state_changed` | CertificationService |
| `approval.signed`             | CertificationService |

Modules do not notify, search, or audit directly — services publish; frameworks deliver.

---

## AI boundary

| Allowed                                                                    | Forbidden                    |
| -------------------------------------------------------------------------- | ---------------------------- |
| Suggest cases, steps, failure triage, coverage gaps (`AISuggestion` types) | Auto-pass results            |
| Draft risk/requirement links for human confirm                             | Auto-certify or auto-approve |
| Summarise reports                                                          | Bypass permissions or audit  |

Humans certify. AI is advisory only.

---

## Security (013)

- Zero Trust on every API: auth, authz, validation, rate limit, audit, correlation ID
- Least privilege for workers (dedicated identities)
- Secrets never in TCMS domain tables or logs
- Evidence access permission-gated; signed download URLs with expiry
- Superadmin is explicit tier, not a silent bypass

---

## Observability (014)

Health hierarchy includes Testing module → TestingService / CertificationService → result adapters → evidence store → workers. Metrics, structured logs, traces correlated by correlation ID.

---

## Manifest-first (APZTCMS-002 delivered; later phases remaining)

| Manifest                                    | Purpose                                     | Milestone                |
| ------------------------------------------- | ------------------------------------------- | ------------------------ |
| `module.yaml` (`testing`)                   | Module registration, nav, permissions hooks | **APZTCMS-002** (disabled shell) |
| `service.yaml` (`testing`, `certification`) | Service contracts                           | **APZTCMS-002**          |
| `integration.yaml` (result adapters)        | Adapter capabilities                        | Later ingestion phases   |
| `event.yaml`                                | Domain events                               | With event wiring phases |

---

## Coexistence notes

| System                     | Relationship                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------- |
| Integration SDK harness    | Certifies **adapters**; does not manage product tests                                 |
| Document 015 CI/Playwright | Platform quality process; TCMS **consumes** CI results, does not replace CI ownership |
| Kiwi TCMS                  | Superseded as product SoR / UI                                                        |

---

## Related

- [Domain Model](./APZHUB-APZ-TCMS-Domain-Model.md)
- [Module Catalogue](./APZHUB-APZ-TCMS-Module-Catalogue.md)
- [UI Architecture](./APZHUB-APZ-TCMS-UI-Architecture.md)
- [Integration Strategy](./APZHUB-APZ-TCMS-Integration-Strategy.md)
- [Technology Decisions](./APZHUB-APZ-TCMS-Technology-Decisions.md)
- [Product Vision](../strategy/APZHUB-APZ-TCMS-Product-Vision.md)
