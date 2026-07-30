# Policy Integration Report — APZQEP-ENG-110E

| Service                       | Role                                                                |
| ----------------------------- | ------------------------------------------------------------------- |
| `EvidenceAccessPolicyService` | evaluateAccess / assertAccessible / evaluatePrincipalResourceAccess |
| `PermissionPort`              | Platform permission keys from security context                      |
| `EvidenceAccessPolicyAdapter` | DI wiring to UnitOfWork + PermissionPort                            |

No new policy engine. Reuses grant repository + permission context. Only `outcome === "allowed"` grants access.
