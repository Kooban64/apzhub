# Testing — QO-009

| Suite                    | Coverage                                           |
| ------------------------ | -------------------------------------------------- |
| Unit / integration       | Create package, outcomes, APIs, diagnostics        |
| Decision profile tests   | Built-ins + inactive rejection                     |
| Decision outcome tests   | GO / CONDITIONAL_GO / NO_GO / DEFERRED / lifecycle |
| Confidence composition   | Pass-through overall confidence                    |
| Residual risk            | Max composition of impact + governance             |
| Explainability           | Why / refs / outstanding                           |
| Architecture conformance | No evaluate/deploy/approveRelease APIs             |
| Regression               | QO-001…QO-008 green                                |

**Target:** 100% Decision Package coverage for exercised paths.

Evidence: `evidence/apzqep-165-qo-009/20260804T143849Z/TESTING.txt` — **66** tests passed.
