# Wave 2 Roadmap — APZQEP-PORTFOLIO-001

> **Status: INDICATIVE ONLY for items 2–8.**  
> **Exception:** Item 1 — **Test Execution** — **APZQEP-ARCH-015** Architecture is **ACCEPTED / APPROVED / CLOSED**. See [test-execution/OES-ARCH-015/](../../test-execution/OES-ARCH-015/README.md). Engineering Specification remains **NOT AUTHORISED**.

This roadmap restates the Wave 2 capability family exactly as named in the [Owner Portfolio Declaration](../../OWNER-PORTFOLIO-DECLARATION.md) (2026-07-28). Aside from the closed ARCH-015 Architecture baseline above, it does **not** authorise Engineering Specification, Engineering, Certification, or Freeze for any item. No engineering of any kind may begin against this document.

## Indicative capability family

1. Test Execution
2. Test Runs
3. Test Suites
4. Evidence Management
5. Defect Management
6. Coverage & Quality Analytics
7. Reporting & Dashboards
8. AI-Assisted Testing

## Binding rules for every item above

- **Each capability SHALL begin with its own, separately Owner-authorised Architecture programme** — no capability on this list may proceed to Engineering Specification or Engineering without one
- **Each SHALL reuse the validated APZOR governance model** (Architecture → Owner Architecture Acceptance → OES → Owner OES Acceptance → Engineering → ECR → Owner Acceptance → Independent Certification → Version Promotion → Owner Freeze) — see [ENGINEERING-OPERATING-MODEL-VALIDATION-SUMMARY.md](./ENGINEERING-OPERATING-MODEL-VALIDATION-SUMMARY.md)
- **No ENG (Engineering) programme is authorised by this document.** This roadmap is direction, not a work order
- Test Plans (the only orchestration-shaped capability in the First Capability Wave) is the closest structural reference for capabilities 1–5 above — see [LESSONS-LEARNED.md](./LESSONS-LEARNED.md) §7
- Where a capability naturally depends on another (for example, Test Runs likely depending on Test Execution outputs; Coverage & Quality Analytics likely depending on Evidence Management), sequencing is an Owner decision at authorisation time, not fixed by the numbering above

## Why these eight, and not others

These eight are the natural continuation of the boundary every First Capability Wave capability already drew around itself: "no Evidence, no Coverage, no Impact, no Certification Engine, no AI, no MCP" (see [KNOWN-LIMITATIONS-REGISTER.md](./KNOWN-LIMITATIONS-REGISTER.md) — cross-capability pattern). Wave 2 is simply the set of capabilities that fill in exactly that previously-declared-out-of-scope space — nothing here is a new idea, it is the space the Foundation always said it was leaving for later.

## What must happen before any Wave 2 engineering can start

```text
Owner reviews this roadmap
        ↓
Owner selects ONE capability to authorise
        ↓
Owner issues a new Architecture programme identifier (e.g. APZQEP-ARCH-0nn)
        ↓
Architecture → Owner Architecture Acceptance
        ↓
(only then) OES → Owner OES Acceptance → Engineering → ...
```

## What this document explicitly does not do

- Does not create any programme identifier
- Does not authorise Architecture, Engineering Specification, Engineering, Certification, or Freeze for any of the eight capabilities
- Does not sequence or prioritise the eight beyond the numbering already declared by the Owner
- Does not commit to a timeline

## STOP

```text
WAVE 2 ROADMAP
INDICATIVE ONLY
NO PROGRAMMES AUTHORISED
NO ENGINEERING AUTHORISED
OWNER MUST ISSUE A NEW ARCHITECTURE PROGRAMME BEFORE ANY WORK BEGINS
```
