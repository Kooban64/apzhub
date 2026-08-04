# APZQEP-ADOPT-001 — Enterprise Internal Adoption Programme

| Field        | Value                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| Programme    | **APZQEP-ADOPT-001**                                                                                  |
| Title        | Enterprise Internal Adoption Programme                                                                |
| Status       | **OPEN** — Phase 1 **IN PROGRESS**                                                                    |
| Phase        | [Phase 1 – Production Adoption & APZ Time Integration](./PHASE-1-PRODUCTION-ADOPTION.md)              |
| Timestamp    | 20260804T191500Z                                                                                      |
| Baseline     | APZQEP Version 1.1 — Enterprise Quality Baseline                                                      |
| Engineering  | APZQEP packages **frozen**; APZ Time product track **STARTED**                                        |
| Authority    | [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md) · [Phase 1 Auth](./OWNER-AUTHORISATION-PHASE-1.md) |
| Change class | Operational improvement / Documentation / Product (Time native)                                       |

## Premise

For months we **built APZQEP**.

Now we **build APZHUB using APZQEP**.

Those are two different projects. This programme is the second.

## What success looks like

APZQEP becomes like Git inside APZHUB: nobody asks whether to use it —
it is simply how engineering quality and release work.

### Institutionalised learning loop

```text
Engineering
      │
      ▼
Release
      │
      ▼
Operational Learning
      │
      ▼
Pattern Recognition
      │
      ▼
Authorised Programme
```

APZQEP architecture remains frozen. Phase 1 puts APZQEP into **daily production
use** and starts **APZ Time** as a native APZHUB product (Kimai invisible).

| Track             | Face                                                               |
| ----------------- | ------------------------------------------------------------------ |
| Phase 1 plan      | [PHASE-1-PRODUCTION-ADOPTION.md](./PHASE-1-PRODUCTION-ADOPTION.md) |
| Phase 1 Auth      | [OWNER-AUTHORISATION-PHASE-1.md](./OWNER-AUTHORISATION-PHASE-1.md) |
| APZ Time native   | [APZHUB-TIME-NATIVE-001](../../time/APZHUB-TIME-NATIVE-001/)       |
| Working agreement | [WORKING-AGREEMENT.md](./WORKING-AGREEMENT.md)                     |

## Deliverables

| #   | Deliverable                        | Artefact                                                               | Status   |
| --- | ---------------------------------- | ---------------------------------------------------------------------- | -------- |
| 0   | Phase 1 Production Adoption Auth   | [OWNER-AUTHORISATION-PHASE-1.md](./OWNER-AUTHORISATION-PHASE-1.md)     | **DONE** |
| 1   | Programme charter & authority      | [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md)                     | **DONE** |
| 2   | Product onboarding order           | [PRODUCT-ONBOARDING-ORDER.md](./PRODUCT-ONBOARDING-ORDER.md)           | **DONE** |
| 3   | Three-month adoption roadmap       | [ADOPTION-ROADMAP.md](./ADOPTION-ROADMAP.md)                           | **DONE** |
| 4   | End-to-end workflow target         | [E2E-WORKFLOW-TARGET.md](./E2E-WORKFLOW-TARGET.md)                     | **DONE** |
| 5   | Quality Story concept              | [QUALITY-STORY-CONCEPT.md](./QUALITY-STORY-CONCEPT.md)                 | **DONE** |
| 6   | Friction log (living)              | [FRICTION-LOG.md](./FRICTION-LOG.md)                                   | **OPEN** |
| 7   | **Operational Learning Register**  | [OPERATIONAL-LEARNING-REGISTER.md](./OPERATIONAL-LEARNING-REGISTER.md) | **OPEN** |
| 8   | Improvement backlog (living)       | [IMPROVEMENT-BACKLOG.md](./IMPROVEMENT-BACKLOG.md)                     | **OPEN** |
| 9   | Adoption metrics                   | [METRICS.md](./METRICS.md)                                             | **OPEN** |
| 10  | Training notes                     | [TRAINING-NOTES.md](./TRAINING-NOTES.md)                               | **OPEN** |
| 11  | Week 1 tiny-change exercise        | [WEEK-1-EXERCISE.md](./WEEK-1-EXERCISE.md)                             | Pending  |
| 12  | After-five-releases review prompts | [AFTER-FIVE-RELEASES.md](./AFTER-FIVE-RELEASES.md)                     | **DONE** |
| 13  | First E2E dogfood run (APZHUB)     | evidence under `evidence/apzqep-adopt-001/`                            | Pending  |

## How learning artefacts relate

```text
Pain in the moment     → Friction Log
Reality taught us Y    → Operational Learning Register
Candidate: build X     → Improvement Backlog (not authorised)
```

Closing question after every run: **Would I release this again the same way?**

## Explicit exclusions

- No new orchestration engines
- No APZQEP-170 / 180 / 190 / 200 until this programme produces evidence
- No architecture reopen without Board / Owner baseline review

## Companion governance

- [ADOPTION-AND-OPERATIONS.md](../v1.1/apzqep-version-1.1-architecture-freeze/ADOPTION-AND-OPERATIONS.md)
- [APZQEP-CHANGE-CONTROL.md](../v1.1/apzqep-version-1.1-architecture-freeze/APZQEP-CHANGE-CONTROL.md)
- [ENTERPRISE-QUALITY-BASELINE.md](../v1.1/apzqep-version-1.1-architecture-freeze/ENTERPRISE-QUALITY-BASELINE.md)
