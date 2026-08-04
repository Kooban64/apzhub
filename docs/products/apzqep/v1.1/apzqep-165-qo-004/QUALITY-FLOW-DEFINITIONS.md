# QUALITY-FLOW-DEFINITIONS — QO-004

Definitions are **immutable**. Registration freezes the record. Versioning creates a new immutable version; prior versions are never mutated.

## Fields

| Field                              | Notes                                      |
| ---------------------------------- | ------------------------------------------ |
| flowId                             | Stable definition identity                 |
| name, version, description, owner  | Catalogue metadata                         |
| supportedTriggerTypes              | Provider-neutral trigger type labels       |
| supportedCapabilityStages          | Stages from Capability Registry catalogue  |
| supportedPolicies / supportedGates | Declarative support lists (not evaluation) |
| lifecycleVersion                   | Lifecycle model version                    |
| documentationRef                   | Docs pointer                               |
| metadata                           | Provider-neutral string map                |
| createdAt, status                  | `draft` \| `active` \| `retired`           |

## Persistence

Process-local registry (current orchestration persistence model). Future durable store is an outstanding issue — no redesign in this slice.
