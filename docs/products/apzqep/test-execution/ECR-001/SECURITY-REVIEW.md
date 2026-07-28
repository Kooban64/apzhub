# Security Review — APZQEP-ECR-001

Verification only.

## Authentication

| Check                             | Result | Evidence                                            |
| --------------------------------- | ------ | --------------------------------------------------- |
| API routes use platform auth      | ✅     | `withPlatformApiAuth` on `/api/v1/qep/executions/*` |
| Session / Better Auth integration | ✅     | Inherited platform gateway path                     |
| No engine login surfaces          | ✅     | Workbench uses APZHUB shell routes                  |

## Authorisation / RBAC

| Check                             | Result | Evidence                               |
| --------------------------------- | ------ | -------------------------------------- |
| Permission catalogue              | ✅     | `qep.execution.*`                      |
| Op-auth map                       | ✅     | `qepTestExecution` platform operations |
| Gateway authz before handlers     | ✅     | `gateway.qep.executions` pipeline      |
| Workbench nav permission-gated    | ✅     | `module.yaml` + shell registration     |
| availableActions permission-aware | ✅     | Application AvailableActionsService    |

## Audit

| Check                        | Result | Evidence                     |
| ---------------------------- | ------ | ---------------------------- |
| Command path audit recording | ✅     | AuditPort in Application UoW |
| Immutable audit intent       | ✅     | Platform audit adapter       |

## Data protection / API exposure

| Check                                     | Result | Evidence                        |
| ----------------------------------------- | ------ | ------------------------------- |
| Evidence as references only (no blob SoR) | ✅     | ADR-0080 conformance            |
| Backend engine details not leaked         | ✅     | Standard error translation path |
| Secrets in package                        | ✅     | None observed                   |

## Findings

| ID     | Severity | Finding                                                      | Recommendation                                                             |
| ------ | -------- | ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| SEC-01 | High     | EvidenceAccessPort defaults to allow when check not injected | Wire Platform evidence accessibility before production Certification close |
| SEC-02 | Medium   | Outbox events enqueued but not dispatched                    | Ensure audit/event consumers are not assumed live until dispatcher exists  |
| SEC-03 | Low      | Playwright E2E mocks authz surface                           | Acceptable for Wave 5; live authz E2E optional under Certification         |

**Critical security defects blocking ECR:** none identified.
