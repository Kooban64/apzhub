# APZ QEP — Engineering Foundation

> **Programme:** **APZQEP-ENG-010**  
> **Title:** Repository Bootstrap & Sprint Zero  
> **Classification:** ENGINEERING FOUNDATION  
> **Status:** **ACCEPTED**  
> **Baseline:** APZQEP-PLAN-001 — **ACCEPTED** (1.0.0-plan)  
> **Date accepted:** 2026-07-24  
> **Rule:** Foundation only — no business functionality  
> **Next after this pack:** [APZQEP-ENG-020A](../requirements/domain-foundation/README.md) (**ACCEPTED / CLOSED**) · then **APZQEP-ENG-020B**

## Purpose

This pack documents the **QEP engineering foundation** delivered inside the existing APZHUB pnpm monorepo. APZQEP-ENG-010 implements Sprint Zero from the accepted Engineering Plan: repository layout, manifest stubs, shared packages, test scaffold, audit gates, and developer documentation — **without** requirements, verification, execution, or any other domain behaviour.

## Pack index

| Document                                                 | Purpose                                                                |
| -------------------------------------------------------- | ---------------------------------------------------------------------- |
| [ENGINEERING-FOUNDATION.md](./ENGINEERING-FOUNDATION.md) | Principles, platform reuse, modular monolith posture, scope boundaries |
| [REPOSITORY-STRUCTURE.md](./REPOSITORY-STRUCTURE.md)     | Actual layout created under the monorepo roots                         |
| [DEVELOPMENT-GUIDE.md](./DEVELOPMENT-GUIDE.md)           | Local setup, pnpm scripts, contribution workflow                       |
| [TESTING-GUIDE.md](./TESTING-GUIDE.md)                   | Vitest scope, fixtures, deferred E2E strategy                          |
| [CI-CD.md](./CI-CD.md)                                   | Root CI participation, audit script, no deploy                         |
| [QUALITY-GATES.md](./QUALITY-GATES.md)                   | Build, lint, typecheck, tests, architecture boundaries                 |
| [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)           | Delivery summary, confirmations, evidence reference                    |
| [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)             | Owner checklist and downstream gate                                    |

## What APZQEP-ENG-010 delivered

| #   | Deliverable                                            | Location                                            |
| --- | ------------------------------------------------------ | --------------------------------------------------- |
| 1   | Shared QEP packages (types, contracts, foundation, UI) | `packages/qep-*`                                    |
| 2   | Module manifest stubs M01–M22                          | `modules/qep-*/module.yaml`                         |
| 3   | Platform service shell + 16 domain service stubs       | `services/qep/`                                     |
| 4   | Core lifecycle event manifests (8)                     | `events/qep/*/event.yaml`                           |
| 5   | GitHub integration stub                                | `integrations/qep-github/`                          |
| 6   | Test fixtures and Vitest participation                 | `testing/qep/`                                      |
| 7   | Foundation audit script                                | `scripts/apzqep-eng-010-foundation-audit.mjs`       |
| 8   | Root pnpm scripts                                      | `test:qep`, `typecheck:qep`, `audit:qep-foundation` |
| 9   | Engineering documentation pack                         | This folder                                         |

## Platform reuse (unchanged)

APZ QEP **consumes** certified Platform 1.4 capabilities. ENG-010 did not redesign or replace:

| Platform capability | QEP posture                                              |
| ------------------- | -------------------------------------------------------- |
| Identity & auth     | BetterAuth + APZHUB PermissionService                    |
| Desktop shell       | Module registration via existing shell (005/016)         |
| Search              | Platform Search Service (020) — no module search UIs     |
| Notifications       | Attention Engine (021) — events only, no direct notify   |
| Observability       | Platform metrics, logs, traces, health (014)             |
| Configuration       | Platform metadata PostgreSQL; connector refs not secrets |

QEP packages extend the monorepo workspace; platform packages, auth flows, gateway, and shell behaviour remain authoritative.

## Lifecycle gate

```text
APZQEP-PLAN-001 ACCEPTED
  → APZQEP-ENG-010 (this pack) ACCEPTED
    → APZQEP-ENG-020A ACCEPTED / CLOSED
      → APZQEP-ENG-020B AUTHORISED / NOT STARTED
```

## STOP

This foundation pack is **ACCEPTED**. Requirements Domain Foundation (**APZQEP-ENG-020A**) is **ACCEPTED / CLOSED**. Next authorised programme: **APZQEP-ENG-020B**.

## Related packs

| Pack                           | Path                                                                              | Status                |
| ------------------------------ | --------------------------------------------------------------------------------- | --------------------- |
| Engineering Plan               | [../engineering-plan/](../engineering-plan/README.md)                             | **ACCEPTED**          |
| Enterprise Architecture        | [../architecture/](../architecture/README.md)                                     | **ACCEPTED**          |
| Product Definition             | [../product-definition/](../product-definition/README.md)                         | **ACCEPTED**          |
| Requirements Domain Foundation | [../requirements/domain-foundation/](../requirements/domain-foundation/README.md) | **ACCEPTED / CLOSED** |
| Product root                   | [../README.md](../README.md)                                                      | —                     |

## Quick commands

```bash
pnpm install
pnpm test:qep
pnpm typecheck:qep
pnpm audit:qep-foundation
```

See [DEVELOPMENT-GUIDE.md](./DEVELOPMENT-GUIDE.md) for full local setup.
