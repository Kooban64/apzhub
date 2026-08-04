# OWNER-AUTHORISATION — APZHUB-TIME-NATIVE-001

| Field             | Value                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------- |
| Programme         | **APZHUB-TIME-NATIVE-001**                                                               |
| Title             | APZ Time Native Platform Experience                                                      |
| Classification    | **Adoption & Product Evolution** (not greenfield development)                            |
| Status            | **AUTHORISED / STARTED**                                                                 |
| Timestamp         | 20260804T193500Z                                                                         |
| Parent programme  | [APZQEP-ADOPT-001 Phase 1](../../apzqep/apzqep-adopt-001/OWNER-AUTHORISATION-PHASE-1.md) |
| Product baseline  | APZ Time **1.0.0** Production — **ACCEPTED / CLOSED** (documented limitations)           |
| Engine (internal) | Kimai CE via `@apzhub/integration-kimai` **0.2.0** — never user-visible                  |
| Quality platform  | APZQEP Version 1.1 (mandatory)                                                           |

## Objective (corrected)

Not: “Build APZ Time.”

> **Make APZ Time feel like a first-class APZHUB product while preserving the existing production capability.**

APZ Time already exists. Integration is certified. Work is **maturation**, not creation.

## Product vs implementation contract

> **The product contract is APZ Time. The implementation contract is the Kimai adapter. These evolve independently.**

- Users interact with **APZ Time**
- Developers evolve the **integration adapter**
- APZHUB owns the product experience
- Kimai remains an implementation detail

## Authorised priorities (order)

1. Native User Experience (navigation, terminology, branding, help, notifications)
2. Identity (one login, session, identity, RBAC — APZHUB only)
3. Workspace (Time as a workbench workspace, not a standalone app)
4. APZQEP binding (every enhancement through APZQEP)
5. Close Phase 1 gaps that block **daily use** — not feature parity with Kimai

## Explicit exclusions

- Measuring success by Kimai feature parity
- Exposing Kimai branding, URLs, terminology, docs, auth, or roles
- Dual / secondary login
- Chasing Approvals / Reporting / Dashboards / Billing / Leave / Scheduling / AI / Workflow **unless** operational evidence shows they block adoption
- Reopening APZQEP architecture
- APZQEP-170 without separate Owner Auth
