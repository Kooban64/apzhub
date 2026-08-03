# Audit Integrity — APZQEP-152

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-152       |
| Artefact  | AUDIT-INTEGRITY  |
| Timestamp | 20260803T064000Z |

---

## What is audited / logged

| Mechanism                            | Cap A–F coverage                                                    |
| ------------------------------------ | ------------------------------------------------------------------- |
| Domain aggregate history / lifecycle | Yes (domain packages)                                               |
| Platform API request/response logs   | Yes — correlation ID, actor, tenant, operation, status, duration    |
| Cap F facts attribution              | Derived under caller session; no anonymous `system-reporting` actor |

## Remediations affecting audit honesty

| Before                                            | After                                                            |
| ------------------------------------------------- | ---------------------------------------------------------------- |
| HTTP elevation granted Cap write silently         | No elevation — denials reflect real grants                       |
| Cap F collector used `userId: "system-reporting"` | Repository reads under Cap F call path; no synthetic admin actor |

## Gaps (honest)

| Gap                                            | Notes                                                                              |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| ProductionAuthorizationProvider decision audit | Cap A–F still primarily enforce in domain `requirePermission`, not RequestPipeline |
| Elevation event audit                          | N/A after removal; historical elevation was not audited                            |
| Authz deny structured audit trail              | Platform API logs status/error code; dedicated authz-decision ledger not claimed   |

APZQEP-152 does not invent a new immutable authz audit store. Certification of full authz-decision audit remains outside completed remediation evidence.
