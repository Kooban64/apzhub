# QX-HD / H4 — Security

| Field     | Value                                                                                                                             |
| --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Timestamp | 20260808T064300Z                                                                                                                  |
| Status    | **CLOSED**                                                                                                                        |
| Suites    | `testing/apzqep-v11-h4/v11-api-authz.test.ts` · `testing/apzqep-152/*` · `packages/qep-evidence/.../security.enforcement.test.ts` |

---

## Verification

| Area                                                                           | Result                                          |
| ------------------------------------------------------------------------------ | ----------------------------------------------- |
| Permission boundaries (Cap fail-closed 152)                                    | PASS                                            |
| Orchestration / Quality Flow API authz (`qep.quality_flows.read` / `.operate`) | PASS — gated                                    |
| Tenant isolation (session tenant only; cross-tenant get → 404)                 | PASS — QFW · Automation · SCM · QI · Dashboards |
| Evidence protection (domain security enforcement)                              | PASS (12 tests)                                 |
| Audit integrity (QI / evidence audit paths in existing suites)                 | PASS (re-certified)                             |
| API authorisation helper (`requireQepPermission`, wildcards)                   | PASS (6 tests)                                  |
| Dashboard permission-query spoof removed                                       | PASS — session grants only                      |

---

## Corrections applied (Hardening only)

1. `require-qep-permission.ts` — fail-closed session permission gate + `sessionTenantId`.
2. V1.1 handlers wired: quality-flows · automation · scm · QI · dashboards.
3. Cap role catalogue extended with wave read/operate + dashboards.read; seed idempotently grants onto existing Cap roles.
4. Module manifests declare automation/scm/qi operate permissions.

---

## Defects

| Severity | Count   |
| -------- | ------- |
| Critical | 0       |
| High     | 0       |
| Medium   | 0 filed |
| Low      | 0 filed |
