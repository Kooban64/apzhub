# TESTING — QO-004

| Suite            | File                          | Coverage                                                                |
| ---------------- | ----------------------------- | ----------------------------------------------------------------------- |
| Unit / lifecycle | `quality-flow-engine.test.ts` | Definitions, instances, progression, terminals, recovery, history, APIs |
| Transition table | same                          | Every `QUALITY_FLOW_TRANSITION_RULES` edge asserted                     |
| Integration      | Trigger + Capability Registry | Routing create; discover-only                                           |
| Regression       | QO-001…QO-003 suites          | Kernel, catalogue, triggers                                             |

Target: **100% lifecycle progression edge coverage** + full transition-rule assertion.

Evidence: `evidence/apzqep-165-qo-004/20260804T085113Z/TESTING.txt` — 35 tests passed.
