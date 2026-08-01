# Data Architecture — APZQEP v1.1

## 1. Principles

| Principle                | Rule                                                    |
| ------------------------ | ------------------------------------------------------- |
| One SoR per datum        | Domain packages own business entities                   |
| Platform PG for metadata | QI, search index, AI drafts, audit — derived/supporting |
| No engine duplication    | Project/ticket SoR remains in engines via adapters      |
| Tenant-ready             | All tables carry tenant/org scope fields                |
| Audit fields             | Standard created/updated/actor; immutable audit log     |
| Global platform IDs      | Backend IDs connector-internal only                     |

---

## 2. Entity groups

### Retained v1.0 (extend, don’t rewrite)

Requirements, Baselines, Relationships, Trace Links, Verifications, Specifications, Plans, Executions, Evidence (+ collections/sets/ACL).

### New v1.1 entities

| Entity                                        | Owner package            | Key relationships            |
| --------------------------------------------- | ------------------------ | ---------------------------- |
| TestSuite / SuiteVersion / SuiteMembership    | qep-test-suites          | → Specifications             |
| TestRun / RunItem / RunAssignment             | qep-test-runs            | → Plan/Suite, Executions     |
| Defect / DefectLink / DefectTransition        | qep-defects              | → Run/Execution/Req/Evidence |
| QiMetricCurrent / QiMetricHistory / QiFormula | qep-quality-intelligence | scope keys                   |
| AiDraft / AiPromptVersion / AiInvocationAudit | qep-ai                   | → target entity refs         |
| ReleaseReadinessSnapshot                      | qep-release-readiness    | → QI + defects + runs        |

---

## 3. Evidence storage

| Concern     | Architecture                                                           |
| ----------- | ---------------------------------------------------------------------- |
| Abstraction | Existing `StoragePort`                                                 |
| v1.0        | Memory adapter (ADR-0088)                                              |
| v1.1        | Owner-selected durable adapter (S3-compatible **recommended** default) |
| Metadata    | Remains in platform PG                                                 |
| Retention   | Policy service hooks; legal hold preserved                             |
| Hashing     | Move toward platform-computed hash (close L-EM-HASH-01 over time)      |

**Migration:** Export/import tool if memory→durable; no silent data loss; LA communication required.

---

## 4. Search strategy

| Index                         | Content                                                          | Maintenance                |
| ----------------------------- | ---------------------------------------------------------------- | -------------------------- |
| Platform FTS / search service | Entity projections                                               | Event-driven upsert/delete |
| v1.1 types                    | Add specification, plan, suite, run, execution, evidence, defect | Providers in `search-qep`  |
| Security                      | Permission filter at query time                                  | Mandatory                  |

Search index is **derived**, never SoR.

---

## 5. Audit model

| Stream           | Store                                         |
| ---------------- | --------------------------------------------- |
| Domain audit     | Per-package history tables (existing pattern) |
| AI audit         | AiInvocationAudit (immutable)                 |
| Security audit   | Platform audit                                |
| Unified explorer | Read model over streams (1.3)                 |

---

## 6. Documents

- v1.1: optional deep-links (`documentId` refs)
- 1.2: richer DocumentService integration
- Blobs for evidence ≠ Documents product SoR

---

## 7. Caching

- Redis for session/QI current scores hot path
- Invalidate on domain events
- Never cache authorization decisions across users

---

## 8. Versioning & retention

| Data               | Versioning                         | Retention              |
| ------------------ | ---------------------------------- | ---------------------- |
| Requirements/Specs | Content versions (v1.0)            | Policy                 |
| Suites             | SuiteVersion                       | Policy                 |
| Evidence           | Content versions + seal            | Legal hold aware       |
| QI history         | Append-only series                 | Rollup then downsample |
| AI drafts          | Soft-delete after apply/reject TTL | Short                  |

---

## 9. Migrations from v1.0

| Change                            | Type                | Risk                    |
| --------------------------------- | ------------------- | ----------------------- |
| New suite/run/defect schemas      | Additive migrations | Low                     |
| Execution→Run linkage nullable FK | Additive            | Med — backfill strategy |
| Evidence durable storage          | Adapter + data move | **High** — Owner gated  |
| Search reindex job                | Operational         | Med                     |
| Event outbox activation           | Config + workers    | Med                     |

All migrations versioned; expandable; no destructive drops in 1.1.

---

## 10. Observability of data plane

- Migration metrics
- QI lag (event→score)
- Search index lag
- Evidence storage health via connector/adapter health
