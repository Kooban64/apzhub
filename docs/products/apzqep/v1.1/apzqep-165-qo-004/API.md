# API — QO-004

In-package SDK APIs on `QualityFlowEngine` / `createPlatformOrchestration().qualityFlows`:

| API                                                                             | Purpose                                   |
| ------------------------------------------------------------------------------- | ----------------------------------------- |
| registerDefinition / versionDefinition / getDefinition / listDefinitions        | Immutable definitions                     |
| createInstance / createInstanceFromRouting / getInstance / listInstances        | Instances                                 |
| transition / canTransition / allowedTransitions                                 | State machine                             |
| pause / resume / cancel / fail / timeout / reject / supersede / retry / restart | Recovery                                  |
| getHistory / getMetadata / getStatus                                            | Audit & status                            |
| discoverCapabilities                                                            | QO-002 catalogue intersection (no invoke) |
| diagnostics / health                                                            | Diagnostics                               |

No execution endpoints. No provider contracts. No HTTP surface in this slice.
