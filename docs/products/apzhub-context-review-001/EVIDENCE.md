# Evidence — APZHUB-CONTEXT-REVIEW-001

Evidence gathered **2026-08-06**. No assumptions. Sources limited to Owner Auth.

## Evidence sources consulted

| Source                                  | Artefact                                                                                                                                                                         | Finding                                                                       |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Product Learning (live DB)              | `platform_product_learning_event`                                                                                                                                                | **0 events**                                                                  |
| Operational Friction Register (live DB) | `platform_operational_friction`                                                                                                                                                  | **0 rows**                                                                    |
| Product Learning instrumentation        | [../apzhub-context-learning-001/](../apzhub-context-learning-001/)                                                                                                               | Schema, APIs, Admin summary UI **COMPLETE** — designed for multi-week pilot   |
| Friction Register product               | [../apzhub-product-board-001/](../apzhub-product-board-001/)                                                                                                                     | Intake ready; Context Learning CTA present; **no Context frictions recorded** |
| OBSERVE friction log                    | [../apzhub-observe-001/FRICTION-REGISTER.md](../apzhub-observe-001/FRICTION-REGISTER.md)                                                                                         | Explicit: _“No friction recorded yet — pilot not started”_                    |
| Daily / weekly observation              | [../apzhub-observe-001/DAILY-OBSERVATION-LOG.md](../apzhub-observe-001/DAILY-OBSERVATION-LOG.md), [WEEKLY-LEARNING-SUMMARY.md](../apzhub-observe-001/WEEKLY-LEARNING-SUMMARY.md) | Templates only — no completed pilot entries                                   |
| User interviews                         | docs search                                                                                                                                                                      | **None filed**                                                                |
| CONTEXT-001 pilot questions             | [../apzhub-context-001/OPERATIONAL.md](../apzhub-context-001/OPERATIONAL.md)                                                                                                     | Questions defined; **answers not recorded**                                   |
| CONTEXT-002 completion                  | [../apzhub-context-002/COMPLETION.md](../apzhub-context-002/COMPLETION.md)                                                                                                       | Expansion COMPLETE; explicitly deferred AI until operational learning         |
| Operating state                         | [../framework/APZHUB-CURRENT-OPERATING-STATE.md](../framework/APZHUB-CURRENT-OPERATING-STATE.md)                                                                                 | _Observation before AI_                                                       |

## What instrumentation can measure (when used)

From LEARNING-001 / `ContextLearningSummary`:

- Panel open / collapse · average visible ms
- Section views → most / least used section
- Link follow-through by target product
- Helpful / not helpful ratio
- Average composition load · missing provider responses

## What is not instrumented

- Users leaving APZHUB to external tools (wiki, chat, email)
- Baseline product-switch counts before/after Context
- Decision quality outcomes
- Trust interviews

## Live operational snapshot (2026-08-06)

```text
platform_product_learning_event COUNT = 0
platform_operational_friction COUNT = 0
```

Unit-test fixtures contain synthetic events only and are **excluded** as operational evidence.
