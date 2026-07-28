# APZHUB-1.2-004 — Completion Report

> **Programme:** APZHUB-1.2-004  
> **Backlog:** **R12-OPS-03**  
> **Status:** Complete — **ACCEPTED / CLOSED**  
> **Date:** 2026-07-20

---

## Scope delivered

Exactly one backlog item: **R12-OPS-03** Host coexistence capacity controls.

## Acceptance criteria (met)

| Criterion                          | Evidence                                                |
| ---------------------------------- | ------------------------------------------------------- |
| ENVIRONMENT.md dependency present  | Yes                                                     |
| Reserved APZHUB ports encoded      | `APZHUB_RESERVED_HOST_PORTS`                            |
| Forbidden legacy binds encoded     | `FORBIDDEN_LEGACY_HOST_PORTS`                           |
| Compose audited against catalogues | `ops:host-coexistence-audit` PASS                       |
| Capacity thresholds + runbook      | HOST-COEXISTENCE-CONTROLS · CAPACITY-PLANNING · runbook |
| No legacy remap / STOP themes      | Held                                                    |
| Quality gates green                | [QUALITY-EVIDENCE.md](./QUALITY-EVIDENCE.md)            |

## Repository impact

| Path                                                        | Change                       |
| ----------------------------------------------------------- | ---------------------------- |
| `packages/platform-operations/src/host-coexistence.ts`      | Added                        |
| `packages/platform-operations/src/host-coexistence.test.ts` | Added                        |
| `packages/platform-operations` version                      | **0.1.3**                    |
| `scripts/host-coexistence-audit.ts`                         | Added                        |
| `package.json`                                              | `ops:host-coexistence-audit` |
| Ops HOST-COEXISTENCE / CAPACITY / RISK / runbook / evidence | Added/updated                |
| `ENVIRONMENT.md` · `docker-compose.dev.yml` comments        | Pointers                     |
| `docs/releases/1.2/APZHUB-1.2-004/*`                        | Programme pack               |

## Remaining backlog

Open register rows after OPS-01…03: **28**. Remaining P0: SEARCH-01, SEARCH-02, TCMS-01 (**3**).

## Recommendation

# READY FOR OWNER ACCEPTANCE
