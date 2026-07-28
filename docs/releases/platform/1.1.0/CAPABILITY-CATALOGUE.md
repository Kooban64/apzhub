# APZHUB Platform 1.1.0 — Capability Catalogue

> **Programme:** APZHUB-1.1-006  
> **Date:** 2026-07-20  
> **Delta vs 1.0.0:** Event Bus Support publish · Notification Attention foundation · Automation Foundation · Law AuthZ/ops hardening

| Capability                        | Maturity                            | 1.1.0 note                      |
| --------------------------------- | ----------------------------------- | ------------------------------- |
| Identity / AuthN (BetterAuth)     | Production                          | Unchanged                       |
| Authorization / PermissionService | Production                          | Law path hardened (1.1-001)     |
| API Gateway / RequestPipeline     | Production                          | Unchanged                       |
| Platform Services                 | Production                          | Additive publisher + automation |
| Integration SDK                   | Frozen **1.0.0**                    | Unchanged                       |
| Workbench Framework               | Production                          | Unchanged (no redesign)         |
| Search / Publication              | Production (frozen architecture)    | Unchanged                       |
| Event Bus / Outbox                | MVP **0.1.0** + Support publish     | Enhanced consumption (1.1-003)  |
| Notification Attention (ENF)      | Production foundation               | Support wired (1.1-003)         |
| Notification SoR (APZNOTIFY)      | Frozen metadata · no delivery       | Unchanged freeze                |
| Automation Foundation             | Production foundation (MVP journal) | New (1.1-004)                   |
| Activity Timeline                 | Production                          | Law durable stores (1.1-002)    |
| Workflow Platform                 | Production PRWL                     | Execute still gated             |
| Analytics Platform                | Production PRWL                     | Unchanged                       |
| Documents Platform                | Production PRWL                     | Unchanged                       |
| Testing / TCMS Platform           | Production PRWL                     | Unchanged                       |
| Legal / Law Platform              | Production PRWL                     | AuthZ + ops residuals closed    |
| Provisioning                      | MVP **0.1.0**                       | Unchanged                       |
| Observability / Metrics           | Production (SoR frozen)             | Unchanged                       |
