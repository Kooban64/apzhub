# APZQEP-PORTFOLIO-001 — Foundation Completion & Portfolio Baseline

| Field                     | Value                                                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Programme                 | **APZQEP-PORTFOLIO-001**                                                                                                                                                  |
| Title                     | Foundation Completion & Portfolio Baseline                                                                                                                                |
| Date                      | 2026-07-28                                                                                                                                                                |
| Status                    | **ACCEPTED / APPROVED / CLOSED**                                                                                                                                          |
| Nature                    | **Portfolio / documentation baseline only** — no new functionality, no React/Next.js, no Domain/Infrastructure/Workbench engineering, no version bumps to frozen packages |
| Authority                 | Owner Portfolio Declaration 2026-07-28 + recommendation to insert this programme before Wave 2                                                                            |
| Owner Decision            | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) — **ACCEPTED / APPROVED / CLOSED**                                                                                           |
| Location                  | `docs/products/apzqep/portfolio/PORTFOLIO-001/`                                                                                                                           |
| Pointer                   | [../README.md](../README.md)                                                                                                                                              |
| Evidence (implementation) | `docs/operations/evidence/portfolio-recert/20260728T094331Z-APZQEP-PORTFOLIO-001.json`                                                                                    |
| Evidence (acceptance)     | `docs/operations/evidence/portfolio-recert/20260728T100955Z-APZQEP-PORTFOLIO-001-ACCEPTANCE.json`                                                                         |

## Purpose

Create a clean, permanent handover point between two eras of APZ QEP delivery:

> **This is exactly where APZQEP Foundation ended and Capability Expansion began.**

This pack does not perform engineering, certification, or freeze activity. It **consolidates, indexes, and formally closes out** the First Capability Wave (Requirements, Traceability, Verification, Test Specifications, Test Plans — all **1.0.0 CERTIFIED / FROZEN**) and prepares — but does **not** authorise — the Wave 2 direction.

**Owner Acceptance recorded 2026-07-28:** this pack is **ACCEPTED / APPROVED / CLOSED**. Effective immediately, **APZQEP FOUNDATION IS FORMALLY COMPLETE** and **Capability Expansion is READY** — see [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) and [FOUNDATION-COMPLETION-STATEMENT.md](./FOUNDATION-COMPLETION-STATEMENT.md). No Wave 2 programme is authorised.

## What this programme is

- A portfolio-level documentation baseline, in the same spirit as a Capability Certification pack but scoped to the **whole First Capability Wave**, not a single capability
- A single authoritative reference point an engineer, owner, or AI agent can read to understand exactly what is frozen, what was learned, and what comes next
- The formal trigger for the **Foundation → Expansion** transition, subject to Owner Acceptance

## What this programme is **not**

- Not an engineering, architecture, certification, or freeze programme for any capability
- Not an authorisation of Wave 2 or any of its indicative capabilities
- Not a change to any frozen package (`@apzhub/qep-requirements`, `@apzhub/qep-traceability`, `@apzhub/qep-verification`, `@apzhub/qep-test-specifications`, `@apzhub/qep-test-plans` all remain untouched at their frozen **1.0.0** baselines)
- Not a revision of frozen OES-000 / OES-001 / OES-002 or Document 000

## Pack contents

| Document                                                                                                 | Purpose                                                    |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| [OWNER-SUMMARY.md](./OWNER-SUMMARY.md)                                                                   | Plain-English summary for the Owner                        |
| [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)                                                             | **ACCEPTED / APPROVED / CLOSED** decision                  |
| [COMPLETE.md](./COMPLETE.md)                                                                             | Completion report — what was done, confirmations, evidence |
| [EXECUTIVE-SUMMARY.md](./EXECUTIVE-SUMMARY.md)                                                           | One-page executive overview                                |
| [ENGINEERING-OPERATING-MODEL-VALIDATION-SUMMARY.md](./ENGINEERING-OPERATING-MODEL-VALIDATION-SUMMARY.md) | Operating Model validation, cited not re-argued            |
| [FROZEN-CAPABILITY-REGISTER.md](./FROZEN-CAPABILITY-REGISTER.md)                                         | The five frozen 1.0.0 capabilities                         |
| [CERTIFICATION-REGISTER.md](./CERTIFICATION-REGISTER.md)                                                 | Every Component + Capability CERT programme                |
| [ARCHITECTURE-BASELINE-REGISTER.md](./ARCHITECTURE-BASELINE-REGISTER.md)                                 | Every accepted architecture baseline                       |
| [VERSION-BASELINE-REGISTER.md](./VERSION-BASELINE-REGISTER.md)                                           | Package versions at close of Foundation                    |
| [KNOWN-LIMITATIONS-REGISTER.md](./KNOWN-LIMITATIONS-REGISTER.md)                                         | Consolidated limitations, by reference                     |
| [PROGRAMME-METRICS.md](./PROGRAMME-METRICS.md)                                                           | Counts, coverage, Owner progress estimate                  |
| [LESSONS-LEARNED.md](./LESSONS-LEARNED.md)                                                               | What the Foundation proved in practice                     |
| [STANDARD-TEMPLATES-INDEX.md](./STANDARD-TEMPLATES-INDEX.md)                                             | Where the reusable pack templates live                     |
| [WAVE-2-ROADMAP.md](./WAVE-2-ROADMAP.md)                                                                 | Indicative only — **not authorised**                       |
| [FOUNDATION-COMPLETION-STATEMENT.md](./FOUNDATION-COMPLETION-STATEMENT.md)                               | Formal statement that Foundation is complete               |

## Lifecycle gate

```text
First Capability Wave (Requirements → Traceability → Verification → Test Specifications → Test Plans)
  all 1.0.0 CERTIFIED / FROZEN
    ↓
Owner Portfolio Declaration (2026-07-28) — DECLARED
    ↓
APZQEP-PORTFOLIO-001 (this pack) — IMPLEMENTED
    ↓
Owner Acceptance (2026-07-28) — ACCEPTED / APPROVED / CLOSED
    ↓
Foundation formally CLOSED  ← we are here — Capability Expansion READY
    ↓
Wave 2 (indicative capability family) — requires a NEW, separate Owner-authorised Architecture programme per capability — NOT AUTHORISED
```

## Read next

- Owner: [OWNER-SUMMARY.md](./OWNER-SUMMARY.md) then [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) — **ACCEPTED**
- Engineer / AI agent bootstrapping into the repository: [FOUNDATION-COMPLETION-STATEMENT.md](./FOUNDATION-COMPLETION-STATEMENT.md) — **EFFECTIVE**, then the registers

## STOP

```text
Programme: APZQEP-PORTFOLIO-001
Status: ACCEPTED
APPROVED
CLOSED

APZQEP FOUNDATION FORMALLY COMPLETE
CAPABILITY EXPANSION READY
NO WAVE-2 PROGRAMMES AUTHORISED
```
