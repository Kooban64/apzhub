# APZHUB Platform 1.0.0 — Architecture Summary

| Topic            | Summary                                                                               |
| ---------------- | ------------------------------------------------------------------------------------- |
| Product identity | APZHUB — Platform / Workspace / Workbench (never “portal”)                            |
| AuthN            | BetterAuth only                                                                       |
| AuthZ            | APZHUB-owned permissions; superadmin is audited tier                                  |
| Integration      | Adapter Layer via Integration SDK **1.0.0**                                           |
| UI               | Tokens + shared UI; Lucide; WCAG AA target                                            |
| Data             | Platform PostgreSQL for platform metadata; engines own business SoRs where OSS-backed |
| Quality          | CI pyramid · Playwright · QA-002 PRODUCTION READY                                     |
| Delivery         | Manifest-first SDKs (024–029) · Platform Delivery Standard                            |

Full catalogue: [ENTERPRISE-ARCHITECTURE-CATALOGUE](../../../architecture/ENTERPRISE-ARCHITECTURE-CATALOGUE.md).
