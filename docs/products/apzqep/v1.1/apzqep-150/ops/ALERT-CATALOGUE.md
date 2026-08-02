# APZQEP Alert Catalogue

| Alert                  | Condition                                    | Severity | Response                               |
| ---------------------- | -------------------------------------------- | -------- | -------------------------------------- |
| APZQEP-HEALTH-DOWN     | `/api/health` non-200 or critical facet fail | Critical | Operational Runbook §Health            |
| APZQEP-WEB-5XX         | Elevated 5xx on `/api/v1/qep/**`             | High     | Check logs; rollback if deploy-related |
| APZQEP-AUTH-FAIL-SPIKE | Auth failures spike                          | High     | Identity/session runbooks              |
| APZQEP-DISK            | Host disk pressure                           | High     | Platform capacity checks               |

Cap-specific saturation alerts await durable SoR + health facets.
