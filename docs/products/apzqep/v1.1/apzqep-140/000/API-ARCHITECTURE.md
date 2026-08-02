# API Architecture — APZQEP-140-000

| Field     | Value                       |
| --------- | --------------------------- |
| Programme | APZQEP-140-000              |
| Status    | **COMPLETE** (architecture) |
| Timestamp | 20260802T163547Z            |

REST-first capability APIs behind APZHUB API Gateway (010). **No implementation.**

---

## Principles

1. **One client API** — clients never call engines or connectors.
2. Path: Client → Gateway → Auth → Authz → Platform Service → (Connector) → Engine.
3. Standard request context: token, correlation ID, org, workspace, locale, timezone.
4. Standard response envelope + typed error categories.
5. Versioned under `/api/v1/qep/...`.
6. Every endpoint: auth, authz, validation, rate limit, audit, correlation ID.

---

## Capability API ownership

| Prefix                     | Owner service          | Capability |
| -------------------------- | ---------------------- | ---------- |
| `/api/v1/qep/suites`       | SuiteService           | A          |
| `/api/v1/qep/libraries`    | SuiteService           | A          |
| `/api/v1/qep/runs`         | RunService             | B          |
| `/api/v1/qep/executions`   | ExecutionService       | C          |
| `/api/v1/qep/defects`      | DefectService          | D          |
| `/api/v1/qep/requirements` | RequirementService     | E          |
| `/api/v1/qep/traceability` | TraceabilityService    | E          |
| `/api/v1/qep/reporting`    | ReportingService       | F (read)   |
| `/api/v1/qep/evidence`     | Evidence (existing)    | Platform   |
| `/api/v1/qep/search`       | Knowledge Search (QKI) | Platform   |
| `/api/v1/qep/commands`     | Command Platform       | Platform   |

---

## Boundary rules

| Allowed                                   | Forbidden                         |
| ----------------------------------------- | --------------------------------- |
| UI → Gateway → Capability Service         | UI → Connector / Engine           |
| Service → Connector (if external SoR)     | Service → another capability’s DB |
| Service → Outbox publish                  | Module → Outbox directly          |
| Reporting → QKI / projections             | Reporting → Suite/Run DB queries  |
| Commands → registered handlers → Services | Commands → SQL / engines          |

---

## Versioning

- Additive changes preferred within `v1`
- Breaking changes require new version + ADR + Board notice
- Deprecation windows documented per ES practice

---

## Resource sketch (illustrative)

```text
POST   /api/v1/qep/suites
GET    /api/v1/qep/suites/{suiteId}
POST   /api/v1/qep/runs
POST   /api/v1/qep/runs/{runId}/assignments
POST   /api/v1/qep/executions/{executionId}/steps
POST   /api/v1/qep/defects
GET    /api/v1/qep/traceability/matrix
GET    /api/v1/qep/reporting/dashboards/{id}
GET    /api/v1/qep/search?q=
POST   /api/v1/qep/commands/execute
```

Exact schemas land in per-capability engineering specs (ES-003).

---

## Security

- Tenant isolation on every query
- Project scope where entity is project-bound
- Permission keys: `qep.<capability>.*`
- No privilege escalation via reporting or search
