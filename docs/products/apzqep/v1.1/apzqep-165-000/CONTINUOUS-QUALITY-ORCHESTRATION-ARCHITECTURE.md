# CONTINUOUS-QUALITY-ORCHESTRATION-ARCHITECTURE — APZQEP-165-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-000   |
| Timestamp | 20260804T054651Z |

## 1. Problem

Waves 1–4 delivered coherent capability platforms. Without a coordination layer, continuous quality becomes ad-hoc scripts, UI hard-coding, or a dumping-ground package that absorbs peer SoRs.

## 2. Solution

Introduce **Continuous Quality Orchestration** as a reusable coordinator (`@apzhub/platform-orchestration`) that:

1. Accepts triggers
2. Correlates impact context
3. Selects a Quality Flow and policies
4. Invokes **registered** capabilities
5. Orchestrates gates and human approval
6. Records audited release recommendations / decisions
7. Projects state to consumers (dashboards, search, notifications)

## 3. Domain model (summary)

| Entity                    | SoR owner                                 | Notes                           |
| ------------------------- | ----------------------------------------- | ------------------------------- |
| Capability registration   | Orchestration                             | Metadata + contract refs        |
| Quality Flow definition   | Orchestration                             | Versioned, auditable            |
| Flow run / step state     | Orchestration                             | Coordination state only         |
| Selection / gate policies | Orchestration                             | Versioned policy docs           |
| Approval requests         | Orchestration                             | Links to identity / permissions |
| Release decisions         | Orchestration (+ Release Governance refs) | Immutable decision records      |
| Automation runs           | Automation                                | Referenced by run id            |
| SCM events / repos        | SCM                                       | Referenced by event / repo ids  |
| QI evaluations            | QI                                        | Referenced by evaluation id     |
| Evidence artifacts        | Evidence                                  | Referenced by evidence ids      |
| Dashboard layouts         | Dashboard                                 | Consume projections             |

## 4. Ownership at each arrow

```text
SCM / platform events / schedules / manual / API / command / notification
        ↓  Trigger Router (orchestration) — correlation ID minted or inherited
Quality Flow selection (orchestration policy)
        ↓  Impact correlation request (orchestration coordinates; impact data from SCM + capability projections)
Capability orchestration steps
        ↓  Invoke Automation contract → evidence/results remain in Automation/Evidence
        ↓  Invoke QI contract → scores/recommendations remain in QI
Gate composition evaluation (orchestration policy + QI/Evidence inputs as refs)
        ↓
Human approval (orchestration coordinator + PermissionService)
        ↓
Release recommendation / decision record (orchestration audit)
        ↓
Dashboard / Visualization / QKI / Notifications (consumers)
```

## 5. Answers to mandatory architecture questions

### Triggers & correlation

| Question                        | Answer                                                                                                                                                                                                                  |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What triggers workflows?        | See [TRIGGER-CATALOGUE.md](./TRIGGER-CATALOGUE.md) — SCM events, schedules, manual, API, Command, notification responses, external integration events, future registered providers                                      |
| SCM events in-scope V1.1 Wave 5 | `push`, `pull_request` (open/sync), `pull_request` merge, `create`/`push` tags, `release` published, `workflow_run` completed (informational/correlation). Provider-neutral names; GitHub is first SCM provider mapping |
| Correlation with impact         | See [IMPACT-CORRELATION-MODEL.md](./IMPACT-CORRELATION-MODEL.md) — change set → files/services/modules → suites/requirements/risk; orchestration stores correlation graph refs, not duplicate SoR                       |
| Correlation / causation IDs     | Standard platform envelope (010/012/029); orchestration propagates `correlationId` / `causationId` on every capability invocation and event                                                                             |

### Test selection & execution

| Question                             | Answer                                                                                                                                   |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| When suites run                      | Versioned **selection policies** decide; see [TEST-SELECTION-POLICY.md](./TEST-SELECTION-POLICY.md)                                      |
| Policy model                         | Rules + impact inputs + optional QI advisory + manual override; all versioned/audited                                                    |
| Invoke Automation                    | Via registered Automation orchestration contract only — never provider/client internals                                                  |
| Retries / cancel / concurrency / env | Orchestration policies + Automation contract semantics; workers reuse existing processing/outbox (S07–S10) — no parallel worker platform |

### Intelligence & recommendation

| Question                               | Answer                                                                                                                        |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| How QI recommends in the loop          | Orchestration requests evaluation; QI owns scoring/recommendation logic                                                       |
| Advisory vs gate-relevant              | Policy marks which QI outputs bind gates vs display-only; default: scores/risks may be gate inputs; free-text advice advisory |
| Confidence / explainability / override | Consumed from QI contracts; human override recorded as approval/waiver with reason                                            |
| QI unavailable / low confidence        | Flow policy: `fail-closed` for production-bound flows, `degrade-advisory` for non-prod, or `wait-retry`; never silent pass    |

### Gates, approval & release

| Question                         | Answer                                                                                                                        |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Gates before decision            | See [QUALITY-GATES.md](./QUALITY-GATES.md)                                                                                    |
| Human approval                   | Default retained for governed production release — [APPROVAL-MODEL.md](./APPROVAL-MODEL.md)                                   |
| Who request/approve/reject/waive | Permission-gated roles; waivers immutable-audited                                                                             |
| Decision recording               | [RELEASE-ARCHITECTURE.md](./RELEASE-ARCHITECTURE.md) — searchable via QKI projections                                         |
| Autonomous GO out of scope       | Unmanaged autonomous production GO is **out of scope**; any constrained automated path requires explicit later Board approval |

### Orchestration platform specifics

| Question                                     | Answer                                                                     |
| -------------------------------------------- | -------------------------------------------------------------------------- |
| Lifecycle states                             | See [QUALITY-FLOW.md](./QUALITY-FLOW.md)                                   |
| SoR split                                    | Orchestration owns coordination state; peers own domain SoR                |
| Retry/scheduling without duplicating workers | Compose on existing outbox/processing platform                             |
| Notifications / Command                      | Touchpoints only — always through Platform Services                        |
| Failure / observability                      | [OBSERVABILITY-AND-FAILURE-MODEL.md](./OBSERVABILITY-AND-FAILURE-MODEL.md) |

## 6. Rejected designs

- Workflow business rules in dashboards / widgets
- Module → connector calls
- Authoritative duplication of Evidence / QI / Automation data
- `@apzhub/platform-experience` or unbounded ops mega-package
- Embedding wave-number switches in engine core

## 7. Finish line

Declared: last V1.1 foundational architecture programme — [VERSION-1.1-ARCHITECTURE-FINISH-LINE.md](./VERSION-1.1-ARCHITECTURE-FINISH-LINE.md).
