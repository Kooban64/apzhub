# APZHUB-INTEGRATION-KIMAI-002 — Completion Report

> **Programme:** APZHUB-INTEGRATION-KIMAI-002  
> **Title:** Kimai Domain Services Expansion  
> **Status:** Implemented — **Awaiting Owner Acceptance**  
> **Date:** 2026-07-19

---

## Summary

Expanded `@apzhub/integration-kimai` from foundation **0.1.0** to domain-capable **0.2.0**. Platform Time wiring now uses `createKimaiDomainProvider(adapter)` (`domainMode: "kimai"`) — no foundation-only fallback for implemented CE domains.

## Deliverables

| Item                         | Location                                                                                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain REST + `adapter.core` | `integrations/kimai/src/`                                                                                                                                   |
| Platform domain provider     | `packages/platform-services/src/services/time/kimai-domain-provider.ts`                                                                                     |
| Certification pack           | `docs/integrations/kimai/`                                                                                                                                  |
| Acceptance                   | [APZHUB-INTEGRATION-KIMAI-002-programme-acceptance-report.md](../foundation/completion-reports/APZHUB-INTEGRATION-KIMAI-002-programme-acceptance-report.md) |

## Versions

| Package                              | Version                                |
| ------------------------------------ | -------------------------------------- |
| `@apzhub/integration-kimai`          | **0.2.0**                              |
| `@apzhub/integration-sdk`            | **1.0.0** (unchanged)                  |
| `@apzhub/platform-service-contracts` | **0.17.1** (`foundationOnly: boolean`) |
| `@apzhub/platform-services`          | **0.26.1** (Kimai domain wiring only)  |

## Final validation

| Check                     | Result |
| ------------------------- | ------ |
| Integration SDK unchanged | PASS   |
| Time HTTP unchanged       | PASS   |
| No Workbench / APZ Time   | PASS   |
| Architecture boundaries   | PASS   |

## STOP

Await Owner Acceptance. Do not implement APZ Time or Workbench. Do not reassess APZ Time in this programme.
