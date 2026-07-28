# APZ Workflow 1.0.0 — Release Notes

> **Product:** APZ Workflow  
> **Version:** **1.0.0**  
> **Status:** Certification filed — **Awaiting Acceptance** (APZ-WORKFLOW-002)  
> **Certification class:** PRODUCTION_READY_WITH_LIMITATIONS  
> **Date:** 2026-07-19

---

## Summary

First production APZ Workflow product release. Operators manage provider-neutral workflow definitions, runs, schedules, tasks, approvals, notifications, health, diagnostics, and capabilities through APZHUB branding on the certified n8n foundation + Workflow Platform vertical.

## Added (Release 1.0 vertical)

| Layer               | Delivery                                                   |
| ------------------- | ---------------------------------------------------------- |
| Commercial Planning | APZ-WORKFLOW-001 · **READY WITH CONDITIONS** (accepted)    |
| Platform Foundation | APZHUB-PLATFORM-WORKFLOW-001 · ADR-0068/0069               |
| Information Model   | APZHUB-PLATFORM-WORKFLOW-002                               |
| n8n Integration     | `@apzhub/integration-n8n` **0.1.0** CERTIFIED_FOUNDATION   |
| Contracts           | `@apzhub/workflow-contracts` **0.4.2**                     |
| Platform Services   | Workflow runtime on `@apzhub/platform-services` **0.28.0** |
| HTTP APIs           | `/api/v1/workflow/*` · OpenAPI **1.12.0**                  |
| Workbench Module    | `/workspace/workflow/*` · manifest `workflow` **0.1.0**    |

## Consumed

| Package / surface            | Version                         |
| ---------------------------- | ------------------------------- |
| `@apzhub/integration-n8n`    | **0.1.0** CERTIFIED_FOUNDATION  |
| `@apzhub/workflow-contracts` | **0.4.2**                       |
| `@apzhub/platform-services`  | **0.28.0**                      |
| Workflow HTTP OpenAPI        | **1.12.0**                      |
| `@apzhub/integration-sdk`    | **1.0.0** (Architecture Frozen) |

## Not included (Release 1.0)

Visual drag-and-drop designer as primary UX · Temporal/Camunda/Logic Apps/Power Automate providers · commercial AI orchestration · SaaS-only SKU · full provider execute unlock beyond CERTIFIED_FOUNDATION · post-1.0 product editions

## Known limitations

See [KNOWN-LIMITATIONS.md](../../products/apz-workflow/KNOWN-LIMITATIONS.md).

## CHANGELOG

Root [CHANGELOG.md](../../../CHANGELOG.md) — section **[APZ-WORKFLOW-002]**.
