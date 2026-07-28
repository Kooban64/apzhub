# APZHUB-1.1-003 — Compatibility Statement

> **Programme:** APZHUB-1.1-003  
> **Date:** 2026-07-20

---

## Public API compatibility

| Surface                              | Posture                                                                                               |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Support HTTP `/api/v1/support-*`     | **Unchanged**                                                                                         |
| BetterAuth / Identity APIs           | **Unchanged**                                                                                         |
| Workflow / Workbench public surfaces | **Unchanged**                                                                                         |
| ENF public service APIs              | **Additive** — `wireDomainEventNotifications`                                                         |
| platform-services                    | **Additive** — optional `domainEventPublisher` on `createPlatformServices`; Support publish fail-soft |

## SemVer

| Package / product                 | Version impact                                                                         |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| APZHUB Platform commercial SemVer | Remains **1.0.0** Production Baseline                                                  |
| APZ Support product SemVer        | Remains **1.0.0** — foundation wire-up; no Support product SemVer bump authorised here |
| `@apzhub/platform-services`       | Additive optional publisher injection — callers without publisher unchanged            |

## Behaviour notes (intentional)

1. Support mutations succeed even if event publish fails (fail-soft).
2. In-app notifications require ENF shell context (client bridge) or server subscribers — not APZNOTIFY delivery providers.
3. Realtime/WS/SSE remains out of scope.

## Conclusion

**Compatible** with Release 1.0 public contracts.
