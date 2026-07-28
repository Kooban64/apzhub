# APZ Workflow — Known Limitations (Release 1.0.0)

> **Programme:** APZ-WORKFLOW-002  
> **Product SemVer:** **1.0.0**  
> **Certification class:** PRODUCTION_READY_WITH_LIMITATIONS  
> **Date:** 2026-07-19  
> **Evidence:** [docs/releases/workflow/1.0.0/](../../releases/workflow/1.0.0/README.md)

---

## Release 1.0 production limitations

| Limitation                                     | Treatment                                                                                                         |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Primary provider n8n only                      | No Temporal/Camunda/Logic Apps/Power Automate in 1.0                                                              |
| n8n CERTIFIED_FOUNDATION                       | Provider execute remains limited until separate unlock                                                            |
| No visual drag-and-drop designer as primary UX | Forms/metadata Workbench is the 1.0 interaction model                                                             |
| Engine branding masked                         | Standard users never see n8n product UI as primary                                                                |
| Credentials as references only                 | Never plain secrets in UI/logs                                                                                    |
| Human approvals / forms                        | Simple patterns via tasks/approvals HTTP + Workbench                                                              |
| Search                                         | Definition catalogue via HTTP/Workbench — not a dedicated Search Provider                                         |
| Runtime persistence modes                      | In-memory modes may apply depending on bootstrap — not engine SoR                                                 |
| Dual historic facets                           | `/workspace/workflows` (SoR) and `/workspace/workflow-engine` remain; commercial surface is `/workspace/workflow` |
| Self-hosted first                              | No SaaS-only SKU claim                                                                                            |

---

## Explicitly out of Release 1.0

AI orchestration · predictive automation · additional providers · designer-first UX · commercial edition packaging beyond 1.0 · execute unlock beyond CERTIFIED_FOUNDATION

---

## Historical planning note

APZ-WORKFLOW-001 planning limitations are superseded for commercial maturity by this Production Release pack. Platform SoR/Engine engineering freeze (APZWORKFLOW wave) remains documented separately.
