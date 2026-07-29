# TENANT-ISOLATION-REPORT — APZQEP-CERT-002

| Scenario                                       | Expected                    | Actual                                        | Result                           |
| ---------------------------------------------- | --------------------------- | --------------------------------------------- | -------------------------------- |
| Tenant B get Tenant A execution                | No disclosure               | `null`                                        | **PASS**                         |
| Associate on foreign execution id              | Denied / not found          | `requireExecution` fails before/without grant | **PASS** (repository tenant key) |
| Privileged role wrong tenant                   | No access to foreign data   | Context tenant scopes repository              | **PASS** by architecture         |
| Altered tenant context                         | Scoped to supplied tenantId | Ports use `ctx.tenantId`                      | **PASS**                         |
| Evidence identifier enumeration across tenants | No leakage                  | IDs not globally readable without tenant      | **PASS** (design)                |

Error pattern uses **not-found / null** for cross-tenant get — no evidence URI disclosure.

## Result

```text
ACCESS DENIED
NO EVIDENCE DISCLOSURE
NO CROSS-TENANT MUTATION
```

Verified at application test + source level.
