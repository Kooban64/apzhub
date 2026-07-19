# APZHUB-PLATFORM-TIME-001 — Sprint Guide

> **Programme:** APZHUB-PLATFORM-TIME-001  
> **Title:** Canonical Time Platform Services  
> **Classification:** PLATFORM SERVICES · IMPLEMENTATION  
> **Status:** **APPROVED** — Owner Programme Approval  
> **Prerequisite:** APZHUB-INTEGRATION-KIMAI-001 **ACCEPTED**  
> **Authority:** Owner Decision (repository programme approval)

---

## Objective

Create the canonical Platform Services layer for Time Management. Services consume the certified Kimai Integration Foundation and become the **only** supported interface for future Time products.

## In scope

TimeTrackingService · ActivityService · CustomerService · ProjectTimeService · TimesheetService · TagService · ReportingService (foundation) · registration · provider resolution · entity mapping · authorization · request pipeline · diagnostics · health · metrics

## Out of scope

Workbench UI · HTTP APIs · React · APZ Time product · Reporting UI · Analytics UI · Exports · Approvals · Notifications

## Architecture

Consume only: Kimai Integration · Integration SDK 1.0.0 · existing Platform Service / AuthZ / Pipeline / Governance architecture.

Kimai 0.1.0 is foundation-only (ping/version/ops). Domain CRUD providers: in-memory for tests; Kimai-limited production provider returns `PROVIDER_CAPABILITY_UNSUPPORTED` until a future Kimai domain expansion. TimeTrackingService foundation methods use real Kimai adapter APIs.

## Done when

Contracts + implementations + tests + certification docs complete; Kimai and Integration SDK unchanged; no HTTP/Workbench/APZ Time; Owner Acceptance.
