# APZHUB-1.2-004 — Implementation Summary

> **Programme:** APZHUB-1.2-004  
> **Backlog item:** **R12-OPS-03** — Host coexistence capacity controls  
> **Date:** 2026-07-20

---

## Selection

| Field                        | Value                                          |
| ---------------------------- | ---------------------------------------------- |
| Identifier                   | **R12-OPS-03**                                 |
| Position                     | Next P0 immediately after R12-OPS-02           |
| Classification               | Operational Improvement / Scalability          |
| Dependencies                 | ENVIRONMENT.md — **complete**                  |
| Affected packages            | `@apzhub/platform-operations` **0.1.3**        |
| Affected platform services   | Host/ops governance only (no service redesign) |
| Affected commercial products | None directly                                  |

## What was implemented

1. **Reserved APZHUB port catalogue** + **forbidden legacy port set** (OPS-R-01).
2. **Capacity thresholds** (disk, ports, PG/Redis pressure signals).
3. **Compose/port audit** (`pnpm ops:host-coexistence-audit`, optional `--live`).
4. Ops docs: HOST-COEXISTENCE-CONTROLS, CAPACITY-PLANNING depth, coexistence runbook, ENVIRONMENT pointer.
5. Compose comment documenting reserved/forbidden ports.

## Explicit non-goals (held)

Legacy stack remapping · host nginx redesign · Email SoR · FIN-001 · Workflow Execute · second backlog item · breaking API changes.
