# ARCHITECTURE-OVERVIEW — APZQEP Version 1.1

| Field     | Value                                   |
| --------- | --------------------------------------- |
| Programme | APZQEP-160                              |
| Timestamp | 20260803T141613Z                        |
| Mode      | Definition only — **no implementation** |

## Overall product architecture

Presentation (APZHUB shell) → Application/Domain (Platform Services) → Automation & Integration services → Runner/SCM adapters → Engines. Evidence and Event bus are cross-cutting.

## Facet index

| Facet         | Authoritative face in this pack                                        |
| ------------- | ---------------------------------------------------------------------- |
| Capability    | [PRODUCT-CAPABILITY-MODEL.md](./PRODUCT-CAPABILITY-MODEL.md)           |
| Domain / data | [QUALITY-DATA-MODEL.md](./QUALITY-DATA-MODEL.md)                       |
| Automation    | [AUTOMATION-ARCHITECTURE.md](./AUTOMATION-ARCHITECTURE.md)             |
| Integration   | [INTEGRATION-ARCHITECTURE.md](./INTEGRATION-ARCHITECTURE.md)           |
| AI / QI       | [AI-QUALITY-ARCHITECTURE.md](./AI-QUALITY-ARCHITECTURE.md)             |
| Plugin        | [PLUGIN-ARCHITECTURE.md](./PLUGIN-ARCHITECTURE.md)                     |
| Dashboards    | [ENTERPRISE-DASHBOARD-STRATEGY.md](./ENTERPRISE-DASHBOARD-STRATEGY.md) |
| Platform hub  | [ENTERPRISE-QUALITY-PLATFORM.md](./ENTERPRISE-QUALITY-PLATFORM.md)     |

## Event architecture

All orchestration publishes past-tense platform events (029). Subscribers: evidence, search, notifications, dashboards, integration status. At-least-once + idempotent consumers.

## Evidence architecture

Evidence Collection Engine centralises artefacts from runners and human execution. Immutable packs feed certification and AI context. Aligns with Version 1.0 evidence model and ES-002 spirit — no claim without path.

## Deployment architecture

Self-hosted first (CE). Optional hosted/enterprise later per Commercial Strategy. Coexist with APZHUB compose/Caddy patterns; no mandatory EE deps.

## Operational architecture

Inherit APZQEP-OPS-001 cadences. Version 1.1 features remain operations-led after each wave GA. Metrics: Defined – Awaiting Production Measurement until observed.

## Security architecture

Zero Trust (013): authn BetterAuth; authz APZHUB permissions; fail-closed; least privilege runners/workers; secrets out of repo; AI providers policy-gated; integration webhooks verified.

## Constraint

Layering 003/004/008/009/010 mandatory. Historical APZQEP-111 solution architecture remains reference; **this pack governs Version 1.1 product definition post-GA**.
