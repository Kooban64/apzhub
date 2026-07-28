# APZQEP-ENG-020C — Completion Report

> **Programme:** APZQEP-ENG-020C  
> **Title:** Requirements Lifecycle Engine & State Machine  
> **Classification:** ENGINEERING IMPLEMENTATION  
> **Status:** **ACCEPTED / CLOSED** · **COMPLETE**  
> **Date:** 2026-07-24  
> **Date accepted:** 2026-07-25  
> **Recommendation at submission:** READY FOR OWNER LIFECYCLE ACCEPTANCE  
> **Owner decision:** **ACCEPTED**  
> **Prerequisite:** APZQEP-ENG-020B — **ACCEPTED / CLOSED**

## Summary

Delivered a reusable `@apzhub/lifecycle-engine` and Requirements-specific lifecycle policy, history, events, permissions, API, and UI. Business state transitions are enforced in the domain; presentation renders available actions only.

## Deliverables

| Artefact | Location |
| -------- | -------- |
| Reusable lifecycle engine | `packages/lifecycle-engine` **0.1.0** |
| Requirements policy + services | `packages/qep-requirements` **0.3.0** |
| History table + migrations | `qep_requirement_lifecycle_history` · 0070/0071 |
| Contracts + permissions | `@apzhub/qep-contracts` lifecycle methods/permissions |
| Platform gateway | `packages/platform-services/src/services/qep/` |
| API | `/transitions`, `/lifecycle` under requirements |
| UI | badge · actions · dialog · history timeline |
| Reporting stub | `summariseRequirementLifecycle` |
| Evidence | `docs/operations/evidence/portfolio-recert/20260724T230000Z-APZQEP-ENG-020C.json` |

## Confirmations

| Confirmation | Status |
| ------------ | ------ |
| Platform unchanged (additive) | **Confirmed** |
| Lifecycle engine reusable | **Confirmed** |
| State machine operational | **Confirmed** |
| Invalid transitions prevented | **Confirmed** |
| History operational | **Confirmed** |
| Permissions enforced | **Confirmed** |
| Audit + events on transition | **Confirmed** |
| UI integrated (no client lifecycle logic) | **Confirmed** |
| No approvals/baselines/AI/MCP | **Confirmed** |
| Next programme | **APZQEP-ENG-020D** |

## Owner decision

**ACCEPTED / CLOSED / COMPLETE** on 2026-07-25. Adopted as the authoritative Requirements Lifecycle implementation baseline. See [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md).

## STOP

This programme is closed. Subsequent work proceeds under **APZQEP-ENG-020D** only after complete Owner programme instruction, without silent amendment of ENG-020C foundations.
