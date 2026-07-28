# APZ QEP — Engineering Guardrails

> **Programme:** APZQEP-CONSTITUTION-001  
> **Authority:** Constitutional (Article VIII)

## Lifecycle guardrails

| #   | Rule                                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | **Requirements before implementation** — no Engineering without accepted Requirements coverage for the change    |
| 2   | **Architecture before engineering** — no production implementation without authorised Architecture for the scope |
| 3   | **Definition before Architecture** — Product Definition Baseline precedes Architecture programmes                |
| 4   | **No implementation without traceability** — work items map to approved requirements (and Constitution)          |
| 5   | **Every feature shall map to approved requirements**                                                             |
| 6   | **Every release shall produce evidence** — release evidence packs are mandatory for certification-class releases |
| 7   | **Every API shall be documented** — versioned OpenAPI (or equivalent) under Gateway standards                    |
| 8   | **Every integration shall be governed** — Integration SDK / `integration.yaml`; no shadow connectors             |
| 9   | **Every AI capability shall have human oversight** — obey AI Constitution                                        |
| 10  | **CI quality gates** — lint, types, tests, security checks per Platform quality standards before merge           |

## Architecture guardrails

| #   | Rule                                                                   |
| --- | ---------------------------------------------------------------------- |
| 1   | Platform-first: Module → Platform Service → Connector → Engine         |
| 2   | No module-to-module coupling for business logic                        |
| 3   | No business logic in UI beyond presentation                            |
| 4   | No business logic in API Gateway                                       |
| 5   | Backend models never leak to UI untransformed                          |
| 6   | Manifest-first for modules, services, integrations, events, components |
| 7   | TypeScript strict; no `any` as escape hatch for SoR contracts          |
| 8   | Secrets never committed                                                |

## Integration guardrails

| #   | Rule                                                           |
| --- | -------------------------------------------------------------- |
| 1   | **API-first** — external automation uses Gateway APIs          |
| 2   | **MCP preferred** for AI IDE/agent interaction                 |
| 3   | **REST and Webhooks remain supported**                         |
| 4   | Integrations **consume** APZ QEP; they do **not own** QEP data |
| 5   | **Platform Services remain authoritative** for SoR writes      |
| 6   | Brand masking — no engine chrome for standard users            |

## Quality & evidence guardrails

| #   | Rule                                               |
| --- | -------------------------------------------------- |
| 1   | Tests at appropriate pyramid layers for the change |
| 2   | Accessibility target WCAG AA for QEP UI            |
| 3   | Known limitations published per release            |
| 4   | Correlation IDs end-to-end                         |

## Explicit engineering prohibitions (until separately authorised)

- Begin Product Definition / Architecture / production code under this Constitution programme (N/A — already prohibited here)
- Modify Platform 1.4 or begin Platform 2.0 without Platform Owner Approval
- Unlock Platform freezes unilaterally
- Auto-certify paths
- Kiwi (or other TCMS) as SoR
