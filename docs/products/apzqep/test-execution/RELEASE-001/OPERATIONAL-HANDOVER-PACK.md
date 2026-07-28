# Operational Handover Pack — APZQEP-RELEASE-001

## Handover summary

| Item         | Reference                                                                    |
| ------------ | ---------------------------------------------------------------------------- |
| Capability   | Test Execution                                                               |
| Package      | `@apzhub/qep-test-execution` **1.0.0**                                       |
| Class        | **PRODUCTION_READY_WITH_LIMITATIONS**                                        |
| Availability | **LIMITED** (pilot/controlled) until L-02 remediated                         |
| Runbook      | [../FREEZE-001/OPERATIONAL-RUNBOOK.md](../FREEZE-001/OPERATIONAL-RUNBOOK.md) |
| Deploy       | [../FREEZE-001/DEPLOYMENT-GUIDE.md](../FREEZE-001/DEPLOYMENT-GUIDE.md)       |
| Rollback     | [../FREEZE-001/ROLLBACK-GUIDE.md](../FREEZE-001/ROLLBACK-GUIDE.md)           |
| Limitations  | [KNOWN-LIMITATIONS-REGISTER.md](./KNOWN-LIMITATIONS-REGISTER.md)             |
| Risks        | [FINAL-RISK-ACCEPTANCE-REGISTER.md](./FINAL-RISK-ACCEPTANCE-REGISTER.md)     |
| Tag          | `apzqep-test-execution-v1.0.0`                                               |

## Support handover

| Topic                    | Guidance                                                                 |
| ------------------------ | ------------------------------------------------------------------------ |
| Permissions              | `qep.execution.*` — least privilege; tighten evidence association grants |
| API base                 | `/api/v1/qep/executions`                                                 |
| Workbench                | `/workspace/qep/test-execution`                                          |
| Incidents                | Use platform incident process; correlate via request correlation IDs     |
| Known false expectations | No outbox consumers; no Evidence ACL at associate; no OpenAPI yet        |

## Mandatory tracker (Ops + Engineering backlog)

**L-02 EvidenceAccessPort** — Owner-mandated remediation before unrestricted GA. Track as release-blocking for GA, not for limited pilot.
