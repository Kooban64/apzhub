# APZ Workflow 1.0.0 — Compatibility Statement

> **Release:** APZ Workflow **1.0.0**  
> **Status:** Certification filed — **Awaiting Acceptance** (APZ-WORKFLOW-002)

| Component                            | Version            | Status                                     |
| ------------------------------------ | ------------------ | ------------------------------------------ |
| `@apzhub/integration-sdk`            | **1.0.0**          | **Unchanged** (Architecture Frozen)        |
| `@apzhub/integration-n8n`            | **0.1.0**          | **Unchanged** (CERTIFIED_FOUNDATION)       |
| `@apzhub/workflow-contracts`         | **0.4.2**          | **Unchanged** (Release 1.0 baseline)       |
| `@apzhub/platform-services`          | **0.28.0**         | **Unchanged** (Workflow services included) |
| Workflow HTTP `/api/v1/workflow/*`   | OpenAPI **1.12.0** | **Unchanged**                              |
| Workbench module `workflow`          | **0.1.0**          | **Unchanged**                              |
| `/workspace/workflows` SoR workbench | Unchanged          | Distinct from commercial product surface   |
| `/workspace/workflow-engine`         | Unchanged          | Distinct engine facet                      |
| APZ Projects                         | **1.1.0**          | Unaffected                                 |
| APZ Time                             | **1.0.0**          | Unaffected                                 |
| APZ Support                          | **1.0.0**          | Unaffected                                 |
| APZ Analytics                        | **1.0.0**          | Unaffected                                 |

## Notes

1. Workbench consumes Platform HTTP only — no Module → Connector bypass.
2. n8n branding must remain masked from standard users.
3. Provider execute remains limited per CERTIFIED_FOUNDATION until a separate unlock.
4. Runtime persistence may use in-memory mode depending on bootstrap — not an authoritative engine SoR.
5. Catalogue search is Workbench filter over HTTP definition payloads (not a dedicated Search Provider).
