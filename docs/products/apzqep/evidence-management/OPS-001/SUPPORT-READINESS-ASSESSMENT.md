# Support Readiness Assessment — APZQEP-OPS-001

| Area                  | Result                                                                          |
| --------------------- | ------------------------------------------------------------------------------- |
| Deployment guide      | ✅ [guides/DEPLOYMENT-GUIDE.md](./guides/DEPLOYMENT-GUIDE.md)                   |
| Configuration guide   | ✅ [guides/CONFIGURATION-GUIDE.md](./guides/CONFIGURATION-GUIDE.md)             |
| Operational handbook  | ✅ [guides/OPERATIONAL-HANDBOOK.md](./guides/OPERATIONAL-HANDBOOK.md)           |
| Troubleshooting guide | ✅ [guides/TROUBLESHOOTING-GUIDE.md](./guides/TROUBLESHOOTING-GUIDE.md)         |
| Support runbook       | ✅ [guides/SUPPORT-RUNBOOK.md](./guides/SUPPORT-RUNBOOK.md)                     |
| Known limitations     | ✅ [DEFERRED-IMPLEMENTATION-REGISTER.md](./DEFERRED-IMPLEMENTATION-REGISTER.md) |
| Escalation path       | ✅ Platform QEP / Owner — storage & cert programmes                             |

## Support model

| Severity                         | Guidance                                                                |
| -------------------------------- | ----------------------------------------------------------------------- |
| REST 503 QEP_SERVICE_UNAVAILABLE | Check `APZHUB_QEP_ENABLED` + `DATABASE_URL` + gateway bootstrap         |
| 403 Forbidden                    | Expected under L-02 — verify permissions + ownership/grants             |
| Data loss after restart          | Expected under memory persistence — not a defect                        |
| PersistenceNotImplementedError   | Skeleton adapter activated without storage programme — misconfiguration |

## Verdict

**PASS** — support artefacts complete for limited-availability operation.
