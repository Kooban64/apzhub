# Week 1 Exercise — APZQEP-ADOPT-001

| Field     | Value                                                                                                |
| --------- | ---------------------------------------------------------------------------------------------------- |
| Programme | APZQEP-ADOPT-001                                                                                     |
| Status    | **SUPERSEDED AS SOLE OBJECTIVE** — still valid when a real change ships                              |
| Timestamp | 20260804T191500Z                                                                                     |
| Label     | **APZQEP Release 0001** (when a real change occurs)                                                  |
| Phase 1   | Daily production use + APZ Time — [PHASE-1-PRODUCTION-ADOPTION.md](./PHASE-1-PRODUCTION-ADOPTION.md) |

## Intent (updated)

Phase 1 primary objective is **daily APZQEP use**, not a proof-of-pipeline toy.

When a real change occurs anyway, label it **APZQEP Release 0001** and run the
full pipeline. Do **not** invent artificial exercises just to create 0001.

Examples of suitable first work (only if they arise naturally):

- change a settings page;
- fix a UI bug;
- improve an API response;
- update a workflow.

Then insist it goes through the **full** path — no shortcuts:

```text
Source Change
      ↓
Trigger
      ↓
Quality Flow
      ↓
Impact
      ↓
Policy
      ↓
Governance
      ↓
Approval
      ↓
Decision
      ↓
Evidence
      ↓
Executive Projection
      ↓
Operational Package
      ↓
Workspace
      ↓
Release
```

If that feels painful — **good**. Write it down in
[FRICTION-LOG.md](./FRICTION-LOG.md) and promote durable insight to
[OPERATIONAL-LEARNING-REGISTER.md](./OPERATIONAL-LEARNING-REGISTER.md).

## Capture timings (not just software)

Record wall-clock / effort for each step on Release 0001:

| Step                   | Time | Notes |
| ---------------------- | ---: | ----- |
| Source change detected |      |       |
| Impact correlation     |      |       |
| Policy selection       |      |       |
| Governance review      |      |       |
| Approval               |      |       |
| Evidence generation    |      |       |
| Release decision       |      |       |

Copy the completed table into the release evidence folder.

## Exit criteria (Week 1)

| Criterion                                                             | Done? |
| --------------------------------------------------------------------- | ----- |
| Real (non-artificial) APZHUB change labelled Release 0001             |       |
| Full pipeline exercised (no shortcuts)                                |       |
| Timings table completed                                               |       |
| Evidence folder under `evidence/apzqep-adopt-001/`                    |       |
| Closing question answered (below)                                     |       |
| Engineering Friction noted whenever someone says “this feels awkward” |       |
| At least one friction or learning entry if anything hurt              |       |

## Closing question (every run)

> **Would I release this again the same way?**

If “No, because…”, record an Operational Learning entry. Do not immediately
change code or reopen architecture.

## What not to create yet

Do **not** invent `TOP-20-FRICTIONS.md` now. It should emerge after enough
releases. Until then: observe, time, and write friction down.
