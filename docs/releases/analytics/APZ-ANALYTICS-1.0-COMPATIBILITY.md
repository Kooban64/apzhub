# APZ Analytics 1.0.0 — Compatibility Statement

> **Release:** APZ Analytics **1.0.0**  
> **Status:** Certification filed — **Awaiting Acceptance** (APZ-ANALYTICS-002)

| Component                            | Version            | Status                                      |
| ------------------------------------ | ------------------ | ------------------------------------------- |
| `@apzhub/integration-sdk`            | **1.0.0**          | **Unchanged** (Architecture Frozen)         |
| `@apzhub/integration-metabase`       | **0.1.0**          | **Unchanged** (CERTIFIED_FOUNDATION)        |
| `@apzhub/analytics-contracts`        | **0.1.1**          | **Unchanged** (Release 1.0 baseline)        |
| `@apzhub/platform-service-contracts` | **0.17.1**         | **Unchanged**                               |
| `@apzhub/platform-services`          | **0.28.0**         | **Unchanged** (Analytics services included) |
| Analytics HTTP `/api/v1/analytics/*` | OpenAPI **1.11.0** | **Unchanged**                               |
| Workbench module `analytics`         | **0.1.0**          | **Unchanged**                               |
| APZ Projects                         | **1.1.0**          | Unaffected                                  |
| APZ Time                             | **1.0.0**          | Unaffected                                  |
| APZ Support                          | **1.0.0**          | Unaffected                                  |

## Notes

1. Workbench consumes Platform HTTP only — no Module → Connector bypass.
2. Metabase branding must remain masked from standard users.
3. In-memory analytics registry is MVP / non-authoritative — not a Postgres SoR.
4. Live visual embed issuance is out of Release 1.0 scope (metadata detail view only).
5. Catalogue search is client-side filter over HTTP catalogue payloads.
