# APZHUB-1.2-004 — Quality Evidence

> **Programme:** APZHUB-1.2-004  
> **Date:** 2026-07-20

---

| Gate                | Command / evidence                                    | Result    |
| ------------------- | ----------------------------------------------------- | --------- |
| Typecheck           | `pnpm --filter @apzhub/platform-operations typecheck` | Pass      |
| Lint                | `pnpm --filter @apzhub/platform-operations lint`      | Pass      |
| Unit tests          | `host-coexistence.test.ts` (6)                        | Pass      |
| Regression          | alert + backup + control-plane + reliability          | Pass (28) |
| Integration / audit | `pnpm ops:host-coexistence-audit`                     | PASS      |
| Live conflict scan  | `pnpm ops:host-coexistence-audit -- --live`           | PASS      |
| Compatibility       | Additive exports; compose ports unchanged             | Pass      |
| Architecture        | Ops guards only; no Module→Connector; no legacy remap | Pass      |

## Evidence artefacts

- `docs/operations/evidence/host-coexistence/20260720T090036Z-R12-OPS-03-audit-PASS.json`
- `docs/operations/evidence/host-coexistence/20260720T090104Z-R12-OPS-03-audit-PASS.json` (live)
