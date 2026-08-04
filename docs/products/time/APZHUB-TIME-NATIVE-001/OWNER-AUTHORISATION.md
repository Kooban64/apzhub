# OWNER-AUTHORISATION — APZHUB-TIME-NATIVE-001

| Field             | Value                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------- |
| Programme         | **APZHUB-TIME-NATIVE-001**                                                               |
| Title             | APZ Time Native Platform Experience                                                      |
| Status            | **AUTHORISED / STARTED**                                                                 |
| Timestamp         | 20260804T191500Z                                                                         |
| Parent programme  | [APZQEP-ADOPT-001 Phase 1](../../apzqep/apzqep-adopt-001/OWNER-AUTHORISATION-PHASE-1.md) |
| Product baseline  | APZ Time **1.0.0** Production (ACCEPTED/CLOSED)                                          |
| Engine (internal) | Kimai CE via `@apzhub/integration-kimai` **0.2.0** — never user-visible                  |
| Quality platform  | APZQEP Version 1.1 (mandatory)                                                           |

## Purpose

Present APZ Time as a completely native APZHUB product. Users must never know
or care that Kimai exists underneath.

## Authorised deliverables

- Product vision (native platform refresh)
- Functional specification
- APZHUB UX
- Integration architecture (adapter-only; no engine exposure)
- Identity integration (APZHUB Identity only)
- Permission model (APZHUB Roles only)
- Workspace integration & navigation
- Notification integration
- Operational model
- APZQEP quality integration

## Explicit exclusions

- Kimai branding, terminology, URLs, documentation, authentication, or roles in any user-facing surface
- Dual / secondary login
- Bypassing APZQEP for Time changes
- Reopening APZQEP architecture
