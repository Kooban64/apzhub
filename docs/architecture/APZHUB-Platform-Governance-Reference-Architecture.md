# APZHUB Platform Governance Reference Architecture (M8-05)

## Purpose

Platform Governance owns **what is enabled** on the platform. Provisioning owns **what is available** after enablement. Products consume `GovernanceService`; they never implement independent provisioning or feature-flag systems.

## Separation of concerns

| Concern           | Owner           |
| ----------------- | --------------- |
| WHO               | Identity        |
| WHAT              | Authorization   |
| HOW               | Personalisation |
| WHAT IS ENABLED   | Governance      |
| WHAT IS AVAILABLE | Provisioning    |

## Package

`@apzhub/platform-governance` — services, repositories, PostgreSQL adapters, session resolver, API handlers.

## Services

- `GovernanceService` / `PlatformGovernanceService` — facade
- `GovernanceEnablementService` — tenant/product/module/capability enablement
- `ProvisioningService` — provisioning workflows and history
- `FeatureFlagService` — foundation evaluation (no percentages/experiments)
- `CapabilityService` — capability metadata and dependencies
- `ProductProvisioningService` / `ModuleProvisioningService` — scoped provisioning
- `GovernanceDiagnosticsService` — storage diagnostics

## Feature flag evaluation order

1. user → 2. module → 3. product → 4. tenant → 5. global → 6. default

No percentage rollouts, A/B tests, or scheduled activation in M8-05.

## APIs

| Route                                     | Methods    |
| ----------------------------------------- | ---------- |
| `/api/platform/v1/governance`             | GET, PATCH |
| `/api/platform/v1/governance/diagnostics` | GET        |
| `/api/platform/v1/provisioning`           | GET, POST  |
| `/api/platform/v1/feature-flags`          | GET, PATCH |
| `/api/platform/v1/capabilities`           | GET        |

## Out of scope

Licensing, subscriptions, billing, usage metering, commercial licensing — future milestones.

## References

- [Provisioning Architecture](./APZHUB-Platform-Provisioning-Architecture.md)
- [Capability Model](./APZHUB-Platform-Capability-Model.md)
- [Feature Flag Architecture](./APZHUB-Platform-Feature-Flag-Architecture.md)
- [ADR-0044](../adr/ADR-0044-platform-governance-provisioning-framework.md)
