# APZHUB Platform 1.1.0 — Portfolio Overview

> **Programme:** APZHUB-1.1-006  
> **Date:** 2026-07-20

---

## Portfolio statement

APZHUB Platform **1.1.0** is the integrated Production portfolio of shared platform capabilities and commercial APZ products. It succeeds Platform **1.0.0** by packaging Release **1.1** engineering (Law AuthZ/ops, Event Bus + Notification Attention foundation, Cross-Product Automation Foundation) without changing product commercial SemVer baselines.

## Layering (unchanged)

```text
Workbench / Law Platform UI
  → APZHUB API Gateway
  → AuthN / AuthZ / Validation
  → Platform Services
  → Integration Adapters
  → Backend Engines (Plane, Kimai, Zammad, Metabase, n8n, …)
  → (async) Event Bus / Outbox → Search | Audit | Activity | Attention | Automation
```

## Production products

Projects **1.1.0** · Time **1.0.0** · Support **1.0.0** · Documents **1.0.0** · TCMS **1.0.0** · Analytics **1.0.0** · Workflow **1.0.0** · Law **1.0.0**

## Platform SemVer

| Release   | Role                                                                |
| --------- | ------------------------------------------------------------------- |
| **1.0.0** | Historical Production Baseline (ACCEPTED)                           |
| **1.1.0** | Current Production Baseline (pending Owner Acceptance of this pack) |

## Related

- [PRODUCT-CATALOGUE.md](./PRODUCT-CATALOGUE.md)
- [CAPABILITY-CATALOGUE.md](./CAPABILITY-CATALOGUE.md)
- [PORTFOLIO-RELEASE-REGISTER](../../PORTFOLIO-RELEASE-REGISTER.md)
