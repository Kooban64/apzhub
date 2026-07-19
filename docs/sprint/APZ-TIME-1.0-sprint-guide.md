# APZ Time 1.0.0 Phase 1 — Sprint Guide

> **Programme / Release:** APZ Time **1.0.0** Phase 1  
> **Classification:** PRODUCT RELEASE · IMPLEMENTATION  
> **Prerequisite:** APZHUB-TIME-READINESS-002 **ACCEPTED** (Implementation Ready)  
> **Reference:** [APZ-TIME-1.0-PHASE-1-SCOPE.md](../releases/time/APZ-TIME-1.0-PHASE-1-SCOPE.md) · Projects pattern  
> **Status:** Implementation authorised by Owner Release Approval

---

## Objective

Deliver the first production Workbench for APZ Time on certified stack only:

Kimai **0.2.0** CERTIFIED_DOMAIN → Time Platform Services → Time HTTP `/api/v1/time/*` → Workbench.

## In scope

- Core time tracking / timesheet management
- Basic activities, customers, tags
- Module manifest + navigation + views + deep links
- Health, diagnostics, audit (platform surfaces), foundation search
- Session defaults, typed client, product tests, Playwright certification
- Product / release documentation

## Out of scope

Approvals · Reporting UI · Analytics · Dashboards · Notifications · Exports · Billing · Leave · Scheduling · AI · Workflow automation · Cross-product integrations · ADR-requiring changes · Platform/HTTP/Kimai redesign

## Architectural rules

- No direct Kimai API access from UI
- No Platform Service or HTTP bypass
- Integration SDK **1.0.0** unchanged
- Consume existing AuthN/AuthZ/pipeline/Workbench architecture

## Done when

- Module discovered; Activity Bar Time present
- Workbench views pass unit + Playwright cert
- Freeze packages unchanged
- Release evidence filed
- STOP awaiting Owner Acceptance

## STOP

Do not begin Phase 2. Await Owner Acceptance of APZ Time 1.0.0 Phase 1.
