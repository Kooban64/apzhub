# Security Certification Report — APZQEP-CERT-001

## Authentication

| Check                                        | Result                       |
| -------------------------------------------- | ---------------------------- |
| Better Auth / platform session on API routes | ✅ via `withPlatformApiAuth` |
| No engine login surfaces in Workbench        | ✅                           |
| Unauthenticated Workbench routes do not 5xx  | ✅ Playwright ENG-100E       |

## RBAC / permissions

| Check                                   | Result                      |
| --------------------------------------- | --------------------------- |
| Permission catalogue `qep.execution.*`  | ✅                          |
| Op-auth map 28 operations               | ✅ `package` + platform map |
| Gateway pipeline before service methods | ✅ `gateway.qep.executions` |
| Module nav permission-gated             | ✅ `module.yaml`            |
| availableActions permission-filtered    | ✅ Application computer     |

## Audit

| Check                                      | Result                          |
| ------------------------------------------ | ------------------------------- |
| Command path audit append after persist    | ✅ `orchestration.afterPersist` |
| Dedicated `qep_test_execution_audit` table | ✅ migration 0087               |

## Sensitive data / evidence

| Check                                            | Result                                     |
| ------------------------------------------------ | ------------------------------------------ |
| Evidence stored as references only (no blob SoR) | ✅ ADR-0080                                |
| EvidenceAccessPort accessibility check           | ⚠ **Default-allow when uninjected** (L-02) |
| Production bootstrap injects `evidenceCheck`     | ❌ Confirmed absent                        |

### L-02 determination

`createEvidenceAccessPort` returns early when no `check` is injected (`evidence-access-port.ts`). Production `createQepServicesBundle` does not pass `evidenceCheck`. Association remains gated by **permission** (`associateEvidence` op), but **URI accessibility / evidence ACL is not enforced**.

**Remediation required before unrestricted multi-tenant Evidence-integrated GA:** Yes (separate ENG).  
**Blocking CERTIFICATION_FAILED:** No — if Owner accepts residual risk for controlled deployment (see Limitation Disposition + Risk Acceptance).

## Session handling

Inherited platform session cookies / CSRF posture — no QEP-specific bypass found.

## Verdict

**PASS WITH LIMITATIONS** — authentication and RBAC certified; EvidenceAccessPort residual **High** — dispositioned under L-02.
