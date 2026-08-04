# Week 1 Exercise — APZQEP-ADOPT-001

| Field     | Value                                        |
| --------- | -------------------------------------------- |
| Programme | APZQEP-ADOPT-001                             |
| Status    | **PENDING**                                  |
| Timestamp | 20260804T185900Z                             |
| Label     | **APZQEP Release 0001** (first real dogfood) |

## Intent

Do **not** invent an artificial exercise.

Choose something that would have happened anyway. When someone says
“Can we fix this button?”, answer: **this becomes APZQEP Release 0001.**

Treat it as a real release — tiny, real, full pipeline.

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
