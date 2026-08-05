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

## Authorised priorities (Phase A slice order)

1. **A01 Native UX Audit** — **COMPLETE** — [TIME-NATIVE-001-A01](./TIME-NATIVE-001-A01/)
2. **A02 Identity** — **COMPLETE** — [TIME-NATIVE-001-A02](./TIME-NATIVE-001-A02/)
3. **A03 Workspace** — **COMPLETE** — [TIME-NATIVE-001-A03](./TIME-NATIVE-001-A03/)
4. **A04 APZQEP Operational Adoption** — **COMPLETE** — [TIME-NATIVE-001-A04](./TIME-NATIVE-001-A04/) · [../../apztime/](../../apztime/)

**Phase A COMPLETE** — [PHASE-A-COMPLETION.md](./PHASE-A-COMPLETION.md). Design complete; operate next.

## Explicit exclusions

- Measuring success by Kimai feature parity
- Exposing Kimai branding, URLs, terminology, docs, auth, or roles
- Dual / secondary login
- Chasing Approvals / Reporting / Dashboards / Billing / Leave / Scheduling / AI / Workflow **unless** operational evidence shows they block adoption
- Reopening APZQEP architecture
- APZQEP-170 without separate Owner Auth
