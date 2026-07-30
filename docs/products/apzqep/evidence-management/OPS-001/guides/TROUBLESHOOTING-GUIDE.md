# Troubleshooting Guide — Evidence Management

| Symptom                                  | Likely cause                             | Action                                                                                   |
| ---------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| HTTP 503 `QEP_SERVICE_UNAVAILABLE`       | QEP disabled or gateway not bootstrapped | Check `APZHUB_QEP_ENABLED`, `DATABASE_URL`, platform bootstrap logs                      |
| HTTP 403 Forbidden                       | L-02 deny                                | Verify `qep.evidence.*` permissions, ownership, grants, tenant                           |
| HTTP 409 Conflict                        | Revision conflict / integrity            | Refresh revision; re-verify content hash                                                 |
| HTTP 400 Validation                      | Request schema                           | Fix body / path params                                                                   |
| Evidence missing after restart           | Memory persistence                       | Expected — not a defect                                                                  |
| `PersistenceNotImplementedError`         | Skeleton adapter invoked                 | Do not activate skeleton registry; use Application memory runtime                        |
| Workbench shows Home instead of Evidence | Shell view-activation race / catalogue   | Retry deep link; ensure authenticated session; QEP router path `/workspace/qep/evidence` |

## Logs to collect

- Correlation ID from API envelope
- Platform API gateway request logs
- Whether `bootstrap.qepEnabled` is true
