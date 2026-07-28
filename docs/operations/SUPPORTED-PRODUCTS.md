# APZHUB Supported Products

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20  
> **Register:** [PORTFOLIO-RELEASE-REGISTER](../releases/PORTFOLIO-RELEASE-REGISTER.md)

---

| Product          | SemVer    | Class                    | Ops notes                                                                |
| ---------------- | --------- | ------------------------ | ------------------------------------------------------------------------ |
| APZHUB Platform  | **1.1.0** | PRWL                     | Current Production Baseline                                              |
| APZ Projects     | **1.1.0** | Production (limitations) | Plane adapter; Search publication                                        |
| APZ Time         | **1.0.0** | Production (limitations) | Kimai; limited cross-product                                             |
| APZ Support      | **1.0.0** | PRWL                     | Zammad; Event Bus + ENF Attention (1.1); no webhook/attachments/realtime |
| APZ Documents    | **1.0.0** | PRWL                     | Native SoR; binary DMS limits per product KL                             |
| APZ TCMS         | **1.0.0** | PRWL                     | GHA read-only CI path; no Kiwi/GitLab/AI                                 |
| APZ Analytics    | **1.0.0** | PRWL                     | Metabase CERTIFIED_FOUNDATION; branding/embed boundaries                 |
| APZ Workflow     | **1.0.0** | PRWL                     | n8n metadata; execute gated                                              |
| APZ Law Platform | **1.0.0** | PRWL                     | OBS-LAW-01/02 closed; no Email SoR; FIN-001 deferred                     |

## Product support rule

1. Product KL docs win on product-specific limits.
2. Engine brand names never appear in user-facing ops messages.
3. Incidents on engines are handled via Integration Adapters + engine runbooks — users see APZHUB product names.
4. Product SemVer bumps require named Owner Approval (Engineering Operating Model + Release Management).
