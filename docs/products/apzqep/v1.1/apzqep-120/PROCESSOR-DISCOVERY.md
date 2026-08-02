# Processor Discovery — APZQEP-120-S10

## Product discovery (`EvidenceProcessorRegistry`)

| API                   | Purpose                                 |
| --------------------- | --------------------------------------- |
| `list()`              | All Evidence registrations              |
| `metadata()`          | Version, health, ownership, event types |
| `discover(eventType)` | Resolve Evidence processor for an event |
| `getById(id)`         | Lookup by processor id                  |
| `diagnostics()`       | Aggregate health + event coverage       |

## Platform discovery

After `registerOnto(platformRegistry)`, the platform resolves by `eventType` (then `*`). No switch statements. No hard-coded Evidence imports in the engine.
