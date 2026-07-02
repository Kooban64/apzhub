# ADR-0017 — Phased Implementation Review Gate

> **Status:** Accepted  
> **Date:** 2026-06-30  
> **Sprint:** SPR-002 onward  
> **Decided by:** Project owner (Sprint 002 implementation approval)

## Problem

Multi-phase sprints risk undetected drift when several phases land without review. Large unreviewed changes increase regression and architecture violation risk.

## Decision

Sprint implementation follows a **permanent phased review gate**:

```text
Phase implementation
        ↓
Quality gates (lint, typecheck, test, build)
        ↓
Documentation updates (architecture, SDK, developer, CHANGELOG, sprint)
        ↓
Phase summary for owner
        ↓
Owner review and approval
        ↓
Next phase
```

### Rules

- **Do not execute multiple phases without review**
- No undocumented implementation is acceptable (Decision 12)
- Cursor (and all contributors) stop after each phase until owner approves continuation

### Phase completion checklist

- [ ] Exit criteria for phase met
- [ ] Quality gates pass
- [ ] Documentation updated
- [ ] Phase report filed in `docs/sprint/`
- [ ] Owner approval received

## Alternatives

| Alternative               | Why rejected                          |
| ------------------------- | ------------------------------------- |
| Single bulk delivery      | Owner mandated phased review          |
| Review only at sprint end | Too late for architectural correction |

## Consequences

- SPR-002 Phase 0 report: `docs/sprint/SPR-002-phase-0-report.md`
- Subsequent phases file `SPR-002-phase-N-report.md`
- Process applies to all future sprints unless superseded by ADR
