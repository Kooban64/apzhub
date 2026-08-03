# Known Limitations — APZQEP-152

| Field     | Value                               |
| --------- | ----------------------------------- |
| Programme | APZQEP-152                          |
| Timestamp | 20260803T064000Z                    |
| Status    | Engineering remediation in progress |

---

| ID        | Limitation                                              | Classification         | Notes                                                                                                                |
| --------- | ------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| KL-152-01 | Project membership ACL not platform-complete            | **Known limitation**   | `projectId` is attribute filter only; same-tenant project ACL not enforced                                           |
| KL-152-02 | Workspace / shell Cap permission gating                 | **Known limitation**   | `/workspace/*` session middleware only; Cap UI may render without Cap grants (API still fail-closed)                 |
| KL-152-03 | Cap commands / QKI / notifications Cap ACL              | **Partial**            | Tenant scoping exists; Cap permission ACL on those surfaces not certified under 152                                  |
| KL-152-04 | Cap paths skip ProductionAuthorizationProvider pipeline | **Accepted (interim)** | Domain `requirePermission` enforces Cap grants; dedicated gateway op-map for Caps A–F not required for elevation fix |
| KL-152-05 | Dedicated authz-decision audit ledger                   | **Gap**                | API logs + domain history; not a full authz decision store                                                           |
| KL-152-06 | Cap packages remain 0.1.0                               | **Correct**            | No promotion; after 152 must re-run APZQEP-150                                                                       |
| KL-152-07 | Permission resolve overhead not load-tested             | **Measurement gap**    | See PERFORMANCE-REPORT                                                                                               |
| KL-152-08 | `APZQEP_QEP_AUTO_ASSIGN_OPERATOR` if enabled in prod    | **Operational risk**   | Must remain off in production least-privilege deployments                                                            |

## Closed by remediation (relative to APZQEP-150)

| Prior ID        | Topic                  | Status under 152 engineering            |
| --------------- | ---------------------- | --------------------------------------- |
| KL-002 / RB-002 | Cap HTTP elevation     | Remediated in code; formal cert pending |
| KL-003 / HR-001 | Cap F system-reporting | Remediated in code                      |

## Explicit non-claims

No production GO. No deploy. No package promotion.
