# SECURITY-REVIEW — APZQEP-150-03

| Field      | Value                                               |
| ---------- | --------------------------------------------------- |
| Workstream | 150-03 Security & Compliance                        |
| Result     | **PASS WITH RESIDUAL RISKS** (LIMITED_AVAILABILITY) |
| Timestamp  | 20260802T184500Z                                    |

---

## Validated controls

| Control                     | Finding                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------- |
| API authentication          | Cap A–F routes use `withPlatformApiAuth`                                            |
| Domain permission checks    | Present in Cap services (`requirePermission` / equivalent)                          |
| Execution immutability      | Cap C rejects mutation after complete; amend path separate — verified in chain test |
| Evidence integrity platform | `@apzhub/qep-evidence` integrity/security unit suites **PASS**                      |
| Traceability integrity      | Cap E derived-only — no alternate SoR for A–D                                       |
| Reporting isolation (SoR)   | Cap F projection — never business SoR                                               |
| Secrets in repo             | No Cap A–F secrets committed; `.secrets/` local only (ops)                          |
| Session behaviour           | Platform Better Auth / session policy retained (platform 1.2.0)                     |

---

## Residual risks (unresolved)

| ID     | Risk                                                                                | Severity                            |
| ------ | ----------------------------------------------------------------------------------- | ----------------------------------- |
| RB-002 | HTTP Cap permission elevation for LIMITED_AVAILABILITY                              | Release Blocker (unrestricted prod) |
| HR-001 | Cap F `system-reporting` actor bypasses caller authz for Cap E coverage aggregation | High                                |
| RB-001 | In-memory SoR — tenant data lost on restart; no multi-instance isolation guarantees | Release Blocker (unrestricted prod) |

---

## Checklist

| Item                              | Status                                                                                    |
| --------------------------------- | ----------------------------------------------------------------------------------------- |
| RBAC (production least privilege) | **FAIL** for unrestricted — LA elevation active                                           |
| Tenant isolation                  | **PARTIAL** — domain tenantId filtering present; process-local store                      |
| Project isolation                 | **PARTIAL** — projectId filters present where modelled                                    |
| Permission boundaries             | **PARTIAL** — domain yes; HTTP elevates                                                   |
| Audit integrity                   | **PASS** (platform audit + Cap history events) for engineering posture                    |
| OWASP review                      | **Documented residual** — no new attack surface introduced by 150; prior platform posture |
| Dependency review                 | CI security gate present; no 150 dependency expansion for features                        |
| Secrets handling                  | **PASS** for Cap packages                                                                 |

---

## Disposition

Security remediation that would remove LA elevation or implement durable tenant stores is **out of feature-freeze scope** as designed (requires PermissionService provisioning + Postgres programmes).

Workstream 150-03: **COMPLETE** — residual risks registered; unrestricted production **blocked** by RB-001/RB-002.
