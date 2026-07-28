# Certification Report — APZQEP-CERT-001

| Field                 | Value                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| Programme             | **APZQEP-CERT-001**                                                                                |
| Title                 | Test Execution Capability Certification                                                            |
| Package               | `@apzhub/qep-test-execution` **0.0.0**                                                             |
| Status                | **IMPLEMENTED / AWAITING OWNER CERTIFICATION DECISION**                                            |
| Certification level   | **Capability Certification** (Waves 1–5 + ECR integrated)                                          |
| Recommended class     | **PRODUCTION_READY_WITH_LIMITATIONS**                                                              |
| Freeze recommendation | **PROCEED TO PRODUCTION FREEZE** (subject to Risk Acceptance Register)                             |
| Nature                | Independent assurance — **no engineering** under CERT-001                                          |
| Date                  | 2026-07-29                                                                                         |
| Evidence              | `20260729T151506Z-APZQEP-CERT-001.json`                                                            |
| Independence          | [OES-CERTIFICATION-INDEPENDENCE.md](../../../../engineering/oes/OES-CERTIFICATION-INDEPENDENCE.md) |
| Levels                | [OES-CERTIFICATION-LEVELS.md](../../../../engineering/oes/OES-CERTIFICATION-LEVELS.md)             |
| ECR Acceptance        | [../ECR-001/OWNER-ACCEPTANCE.md](../ECR-001/OWNER-ACCEPTANCE.md) — **CLOSED**                      |

## Scope

Certification of the Test Execution capability as an integrated system: Domain → Application → Infrastructure & API → Workbench, against ARCH-015, OES-ENG-090A, Build Contract, Waves 1–5, and ECR-001.

This is **not** feature development, architecture change, Freeze, or Release.

## Recommended decision (Owner pending)

**PRODUCTION_READY_WITH_LIMITATIONS**

### Rationale

Functional, API, security (permission-gated), data schema/RLS, Workbench ADR-0083 authority, and regression suites are present and revalidated. Four ECR High limitations remain material; each is dispositioned in [LIMITATION-DISPOSITION-REGISTER.md](./LIMITATION-DISPOSITION-REGISTER.md). None is classified as a correctness defect that forces `CERTIFICATION_FAILED` for a controlled first production baseline **provided** Owner accepts the Risk Acceptance Register (especially L-02 EvidenceAccessPort).

| Outcome                           | Why not selected                                                                                                               |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| PRODUCTION_READY (no limitations) | L-01…L-04 remain material                                                                                                      |
| CERTIFICATION_FAILED              | No critical correctness defect; authz/pipeline/schema/Workbench gates pass                                                     |
| RETURN TO ENGINEERING (mandatory) | Prefer Owner risk acceptance path; L-02 remediation remains **recommended** via separate ENG if Owner declines risk acceptance |

## Governance compliance

| Check                                                       | Result |
| ----------------------------------------------------------- | ------ |
| No governance docs modified                                 | ✅     |
| No engineering under CERT-001                               | ✅     |
| Evaluated against ARCH / OES / Waves / ECR / Build Contract | ✅     |
| ECR limitations individually dispositioned                  | ✅     |
| Freeze / Release not commenced                              | ✅     |

## Certification activity summary

| Area                  | Result                    | Detail                                                                          |
| --------------------- | ------------------------- | ------------------------------------------------------------------------------- |
| Functional            | **PASS WITH LIMITATIONS** | [FUNCTIONAL-CERTIFICATION-REPORT.md](./FUNCTIONAL-CERTIFICATION-REPORT.md)      |
| API                   | **PASS WITH LIMITATIONS** | [API-CERTIFICATION-REPORT.md](./API-CERTIFICATION-REPORT.md) — OpenAPI gap L-01 |
| Data                  | **PASS WITH LIMITATIONS** | Schema 0087/0088 + RLS; no PG integration tests L-04                            |
| Security              | **PASS WITH LIMITATIONS** | Authz map + pipeline pass; EvidenceAccess L-02 residual                         |
| Performance           | **PASS (assumptions)**    | [PERFORMANCE-CERTIFICATION-REPORT.md](./PERFORMANCE-CERTIFICATION-REPORT.md)    |
| Reliability           | **PASS WITH LIMITATIONS** | Outbox enqueue-only L-03                                                        |
| Integration           | **PASS WITH LIMITATIONS** | Search/evidence seams present; defaults limited                                 |
| Accessibility         | **PASS**                  | Playwright axe critical/serious = 0 on primary surfaces                         |
| Documentation         | **PASS WITH LIMITATIONS** | OpenAPI gap                                                                     |
| Operational readiness | **PASS WITH LIMITATIONS** | Platform health; no QEP-execution-specific HTTP health                          |

## Revalidated suites (CERT-001)

| Suite                                 | Result                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| `@apzhub/qep-test-execution` Vitest   | **56/56 PASS**                                                                 |
| Workbench contract + views + handlers | **24/24 PASS**                                                                 |
| Playwright Workbench (ENG-100E)       | Accepted from Wave 5 (mocked APIs) — not re-executed under CERT-001 live stack |

## Production Freeze recommendation

```text
PROCEED TO PRODUCTION FREEZE
CLASS: PRODUCTION_READY_WITH_LIMITATIONS
CONDITION: Owner accepts RISK-ACCEPTANCE-REGISTER (L-01…L-04 dispositions)
```

If Owner rejects risk acceptance for **L-02**, Certification recommendation becomes **RETURN TO ENGINEERING** for a narrowly scoped EvidenceAccessPort wiring programme before Freeze.

Version promotion (`0.0.0` → production SemVer) is a Freeze/Release concern — **not applied** under CERT-001.
