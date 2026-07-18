# OSS-100-12+ — Platform Product Provisioning Flows — Sprint Guide

> **Status:** IMPLEMENTED — Awaiting Owner Acceptance  
> **Package:** `@apzhub/platform-provisioning` **0.1.0**  
> **Authority:** Owner Programme Approval OSS-100-12+ · [CURRENT-MILESTONE](../foundation/CURRENT-MILESTONE.md)

---

## Objective

Implement Product Provisioning Flows only — tenant enablement, product enablement, product activation, lifecycle management, status, diagnostics, and audit — using existing `@apzhub/platform-governance`, `@apzhub/platform-outbox`, `@apzhub/platform-event-bus`, and `@apzhub/platform-operations`.

---

## MVP scope

| Item       | Deliverable                                                                   |
| ---------- | ----------------------------------------------------------------------------- |
| Package    | `@apzhub/platform-provisioning` **0.1.0**                                     |
| Engine     | Product Provisioning Engine + workflow state model                            |
| Governance | Enablement + provisioning records via platform-governance                     |
| Events     | Lifecycle events on ENF bus (via platform-event-bus registry composition)     |
| Outbox     | Async step jobs + retry via platform-outbox                                   |
| Operations | Commercial readiness hook evaluation (`provisioningImplemented: true`)        |
| HTTP       | Flows / status / health / diagnostics under `/api/platform/v1/provisioning/*` |
| Tests      | Unit + integration                                                            |
| Audit      | `pnpm audit:platform-provisioning`                                            |

---

## Out of scope

- Billing, licensing, subscriptions, payments
- Kimai, Paperless, Metabase, GitLab CI, BullMQ, AI Assist
- Identity redesign, Search redesign
- Notification provider implementation
- Integration SDK public contract changes (STOP + ADR if required)
- Frozen SoR / Search architecture rewrites

---

## Architecture

```text
Client → POST /api/platform/v1/provisioning/flows
  → ProductProvisioningEngine.start*(…)
  → PlatformGovernance (enablement + records)
  → EventBus.publish (platform.provisioning.*)
  → optional Outbox insert (async step / retry)

Outbox worker
  → ProvisioningOutboxHandler → continue step → retry | complete
```

---

## Stop condition

MVP complete: typecheck / unit / integration / audit PASS; docs + CURRENT-* updated; Completion Report + Programme Acceptance Report written. **STOP** — await Owner Acceptance. Do not recommend or start another programme.
