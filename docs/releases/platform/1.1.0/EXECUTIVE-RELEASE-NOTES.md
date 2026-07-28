# APZHUB Platform 1.1.0 — Executive Release Notes

> **Programme:** APZHUB-1.1-006  
> **Date:** 2026-07-20  
> **Certification class:** **PRODUCTION_READY_WITH_LIMITATIONS**  
> **Predecessor:** Platform **1.0.0** Production Baseline

---

## Summary

APZHUB Platform **1.1.0** packages the Owner-authorised Release **1.1** engineering programmes into the next portfolio Production Baseline. It closes Law AuthZ and operational residuals, delivers Support Event Bus publish with in-app Notification Attention, and introduces a reusable Cross-Product Automation Foundation — without redesigning frozen platforms or expanding into STOP items.

## What is new in 1.1.0

| Area                      | Change                                                                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Law AuthZ                 | OBS-LAW-01 closed — pattern-aware permissions; no allow-all / `*` injection on Law path ([APZHUB-1.1-001](../../1.1/APZHUB-1.1-001/README.md)) |
| Law ops                   | OBS-LAW-02 closed — durable platform ENF/ATF session stores ([APZHUB-1.1-002](../../1.1/APZHUB-1.1-002/README.md))                             |
| Event Bus + Notifications | Support catalogue publish + ENF Attention foundation ([APZHUB-1.1-003](../../1.1/APZHUB-1.1-003/README.md))                                    |
| Automation                | Platform-owned Automation Foundation — event-driven + workflow-trigger registration ([APZHUB-1.1-004](../../1.1/APZHUB-1.1-004/README.md))     |

## Compatibility

- Public HTTP APIs and Identity contracts from Release **1.0** remain compatible.
- Commercial product SemVer baselines unchanged (Projects **1.1.0**; others **1.0.0**).
- Additive Platform Service surfaces only (domain event publisher, automation foundation).

## Limitations (must travel with release)

Workflow execute remains gated · Email SoR absent · FIN-001 deferred · Support webhook/attachments/realtime residual · product AU-* automations not delivered · Law UX polish not delivered. Full register: [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md).

## Marketing constraint

Describe **1.1.0** as a platform enhancement release under **PRODUCTION_READY_WITH_LIMITATIONS**. Do **not** claim full cross-product orchestration, Workflow execute, Email SoR, or Support 2.0.

## Recommendation

# PRODUCTION_READY_WITH_LIMITATIONS
