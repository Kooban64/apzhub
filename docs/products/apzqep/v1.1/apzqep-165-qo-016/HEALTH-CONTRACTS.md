# Health Contracts

Provider-neutral descriptive health observation.

- Kind: `health`
- States include: `healthy`, `degraded`, `unknown`, …
- `descriptive: true`, `prescriptive: false`

Does not restart processes, change routing, or heal dependencies.
Consumers (probes, ops consoles) interpret the observation.
