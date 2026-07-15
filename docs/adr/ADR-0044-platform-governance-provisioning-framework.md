# ADR-0044: Platform Governance & Provisioning Framework (M8-05)

## Status

Accepted — implemented M8-05.

## Context

M8-03 deferred feature flags and governance workflows. Products must not own enablement or provisioning logic. Runtime registry discovers capabilities; platform needs persisted enablement, provisioning history, and feature flag evaluation.

## Decision

1. Introduce `@apzhub/platform-governance` with governance, provisioning, capability, and feature-flag services.
2. Persist data in PostgreSQL migration `0014_platform_governance.sql`.
3. Expose platform APIs under `/api/platform/v1/governance`, `/provisioning`, `/feature-flags`, `/capabilities`.
4. Replace Operations Console placeholders with Governance, Capabilities, Feature Flags, and enhanced Provisioning sections.
5. Integrate products via `resolveSessionGovernance()` — mirrored APIs in `apps/law-platform`.

## Consequences

- Clear boundary: governance = enabled, provisioning = available.
- Feature flag foundation supports scoped overrides without advanced rollout engines.
- Licensing/subscriptions remain future work.

## Alternatives considered

- Feature flags in personalisation package — rejected (wrong concern).
- Product-local provisioning tables — rejected (violates platform ownership).
