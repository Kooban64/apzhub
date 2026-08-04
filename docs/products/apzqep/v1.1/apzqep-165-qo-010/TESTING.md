# Testing — QO-010

| Suite                    | Coverage                                         |
| ------------------------ | ------------------------------------------------ |
| Envelope validation      | Required fields, schema payload                  |
| Command rejection        | `run-tests`, `approve-release`, etc.             |
| Routing                  | broadcast, directed, tenant_scoped               |
| Versioning               | multi-version types, no mutation                 |
| History / ordering       | correlation sequence                             |
| Replay metadata          | recorded; no executeReplay                       |
| Integration              | kernel events via backbone + legacy side-channel |
| Architecture conformance | no evaluate/deploy APIs                          |
| Regression               | QO-001…QO-009 green                              |

Evidence: `evidence/apzqep-165-qo-010/20260804T161410Z/TESTING.txt` — **73** tests passed.
