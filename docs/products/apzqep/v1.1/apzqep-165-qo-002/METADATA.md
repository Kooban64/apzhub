# METADATA — QO-002

Every registration requires:

| Field                      | Purpose                                       |
| -------------------------- | --------------------------------------------- |
| capabilityId               | Stable id                                     |
| name                       | Display name                                  |
| version                    | Capability version                            |
| provider                   | Owning provider/package                       |
| supportedContractVersions  | Contract versions supported                   |
| triggerTypes               | Triggers it can respond to (metadata)         |
| supportedQualityFlowStages | Stages it may participate in                  |
| healthStatus               | Stored health                                 |
| requiredPermissions        | Permission ids (evaluation later)             |
| dependencies               | Capability/platform dependency ids            |
| featureFlags               | Flag map                                      |
| lifecycle                  | declared/registered/active/deprecated/retired |
| documentationRef           | Docs path/URI                                 |
| contractIds                | Exposed orchestration contract ids            |
