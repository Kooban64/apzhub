# APZHUB-1.1-001 — Compatibility Statement

> **Programme:** APZHUB-1.1-001  
> **Date:** 2026-07-19

---

## Public API compatibility

| Surface                                         | Posture                                                                                   |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Law OpenAPI / HTTP routes                       | **Unchanged** — no path, method, or envelope redesign                                     |
| BetterAuth session APIs                         | **Unchanged**                                                                             |
| `@apzhub/platform-authorization` public exports | **Unchanged**                                                                             |
| `@apzhub/workbench-framework`                   | Additive export `workbenchPermissionPatternMatches`; existing `can()` signature unchanged |
| Legal Business Core                             | **Unchanged**                                                                             |
| Workbench registry DTO shapes                   | **Unchanged**                                                                             |

## SemVer

| Package / product                 | Version impact                                                                                 |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| APZHUB Platform commercial SemVer | Remains **1.0.0** Production Baseline (no Platform 1.1.0 certification in this programme)      |
| `@apzhub/law-platform`            | Remains **1.0.0** — AuthZ honesty fix; no Law product SemVer bump authorised here              |
| `@apzhub/workbench-framework`     | Private `0.0.0` — behaviour-compatible for exact grants; wildcard grants now correctly allowed |

## Behaviour notes (intentional AuthZ correctness)

1. Law API / hydration no longer elevate empty grants to `*` when `isDevRegistrationAllowed()` is true.
2. Clients with only `legal.*` (or similar) now pass checks for nested `legal.*` keys (previously exact-match only).
3. Health diagnostic loaders may still use explicit allow-all — not a user AuthZ bypass on product paths.

## Conclusion

**Compatible** with Release 1.0 public contracts. Changes are authorization enforcement honesty and wildcard evaluation parity — not API breaks.
