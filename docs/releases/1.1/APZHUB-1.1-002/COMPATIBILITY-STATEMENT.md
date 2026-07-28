# APZHUB-1.1-002 — Compatibility Statement

> **Programme:** APZHUB-1.1-002  
> **Date:** 2026-07-19

---

## Public API compatibility

| Surface                                                         | Posture                                                      |
| --------------------------------------------------------------- | ------------------------------------------------------------ |
| Law OpenAPI / HTTP routes                                       | **Unchanged**                                                |
| BetterAuth / Identity APIs                                      | **Unchanged**                                                |
| `@apzhub/legal-business-core`                                   | **Unchanged**                                                |
| ENF / ATF public service APIs (`add*` / `list*` / `markAsRead`) | **Unchanged** — durable stores implement existing interfaces |
| ENF / ATF exports                                               | **Additive** — persisted store factories + key helpers       |
| Workbench shell structure                                       | **Unchanged**                                                |

## SemVer

| Package / product                 | Version impact                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------- |
| APZHUB Platform commercial SemVer | Remains **1.0.0** Production Baseline                                                             |
| `@apzhub/law-platform`            | Remains **1.0.0** — operational hardening; no Law product SemVer bump authorised here             |
| ENF / ATF packages                | Additive private workspace exports — behaviour-compatible for callers not opting into persistence |

## Behaviour notes (intentional)

1. Law client shell with authenticated user/tenant uses durable platform stores (browser storage).
2. Server registry hydration and unit tests without `persistenceScope` continue to use in-memory defaults.
3. No new Law HTTP endpoints.

## Conclusion

**Compatible** with Release 1.0 public contracts.
