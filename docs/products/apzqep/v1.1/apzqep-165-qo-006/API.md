# API — QO-006

SDK: `createPlatformOrchestration().policySelection`

| API                                              | Purpose                          |
| ------------------------------------------------ | -------------------------------- |
| registerRule / registerPolicy / registerProfile  | Declarative governance catalogue |
| evaluatePolicyProfile / produceSelectionDecision | Selection decision               |
| evaluatePolicy / evaluateRules                   | Partial evaluation               |
| getDecision / getExplainability / getHistory     | Retrieve                         |
| getConfidenceTarget                              | Profile confidence target        |
| discoverSelectionCapabilities                    | QO-002 catalogue read only       |
| diagnostics / health                             | Diagnostics                      |

No execution APIs. Does not transition Quality Flows or invoke capabilities.
