# API — Automation Coordination

Surface: `orchestration.automationCoordination` (DI: `orchestration.automation.coordination`).

| Operation                   | Purpose                         |
| --------------------------- | ------------------------------- |
| Create Coordination Package | Decision Package snapshot → ACP |
| Read Coordination Package   | Fetch by id                     |
| Query Automation Intent     | Intents on a package            |
| Read Coordination History   | Audit trail                     |
| Read Coordination Status    | Status enum                     |
| Diagnostics                 | Counts, distributions, health   |

No execution endpoints. No provider invoke endpoints.
