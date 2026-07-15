# APZHUB APZ TCMS — Release Governance Architecture

**Milestone:** APZTCMS-014 — Release & Quality Governance Domain  
**Status:** Implemented (domain + persistence + gateway facet; no HTTP/UI)  
**Authority:** [ADR-0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md) · Document 009  

> **Scope note:** Owner redefined APZTCMS-014 as **TCMS-only** Release & Quality Governance.  
> Prior cross-product “Platform Quality Integration Layer” / Product Registry work is **superseded** for this milestone’s meaning and must not be treated as the 014 deliverable. See deprecated Platform Quality docs.

---

## Purpose

Formal, deterministic, auditable release governance **inside APZ TCMS**, consuming existing certification, quality, coverage, defects, evidence, approvals, automation, and manual-testing services. All release decisions remain human-authorised. Advisory evaluations always return `isDecision: false`.

## Architecture

```text
PlatformServiceGateway.testing.releaseGovernance
        ↓
RequestPipeline + Production Authorization
        ↓
TestingReleaseGovernanceServiceImpl
        ↓
@apzhub/testing-services release-governance domain
        ↓
@apzhub/testing-persistence (Postgres production / in-memory tests)
        ↓
PostgreSQL (migrations 0029 / 0030)
```

## Packages

| Package | Version |
| ------- | ------- |
| `@apzhub/testing-contracts` | **0.8.0** |
| `@apzhub/testing-persistence` | **0.8.0** |
| `@apzhub/testing-services` | **0.7.0** |
| `@apzhub/platform-service-contracts` | **0.10.0** |
| `@apzhub/platform-services` | **0.10.0** |

## Explicit exclusions

REST/OpenAPI, Workbench UI, dashboards, reporting, CI/CD, Event Bus, notifications, realtime, deployments, runners, binary evidence, AI, platform-wide Product Registry, cross-product governance, platform health monitoring.

## Related

[Release State Machine](./APZHUB-APZ-TCMS-Release-State-Machine.md) · [Release Domain Model](./APZHUB-APZ-TCMS-Release-Domain-Model.md) · [Release Permissions](./APZHUB-APZ-TCMS-Release-Permissions.md) · [Release Readiness Model](./APZHUB-APZ-TCMS-Release-Readiness-Model.md) · [Release Approval Model](./APZHUB-APZ-TCMS-Release-Approval-Model.md) · [Release Risk Model](./APZHUB-APZ-TCMS-Release-Risk-Model.md) · [Developer Guide](./APZHUB-APZ-TCMS-Release-Governance-Developer-Guide.md)
