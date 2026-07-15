# M8-05 Completion Report — Platform Governance & Provisioning Framework

## Status

**COMPLETE** — Governance & Provisioning Framework delivered. Await owner approval before M8-06 (Security Hardening).

## Delivered

### Package

- `@apzhub/platform-governance` — governance, provisioning, capabilities, feature flags (foundation), diagnostics

### Schema

- `0014_platform_governance.sql` — capabilities, dependencies, enablements, provisioning records, feature flags, overrides

### APIs

- `GET/PATCH /api/platform/v1/governance`
- `GET /api/platform/v1/governance/diagnostics`
- `GET/POST /api/platform/v1/provisioning`
- `GET/PATCH /api/platform/v1/feature-flags`
- `GET /api/platform/v1/capabilities`

### Operations UX

- Governance, Capabilities sections (new manifests)
- Feature Flags — real UI (replaces placeholder)
- Provisioning — history, status, diagnostics

### Product integration

- `apps/web` — session governance context, APIs
- `apps/law-platform` — mirrored APIs + `createLawPlatformGovernanceContext`

### Documentation

- Governance Reference Architecture, Provisioning Architecture, Capability Model, Feature Flag Architecture, Developer guide, ADR-0044

## Out of scope (as specified)

Licensing, subscriptions, billing, usage metering, percentage rollouts, A/B testing, scheduled rollout, commercial licensing.

## Quality gates

Run: `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`, `pnpm test:coverage`.

## Next

M8-06 Security Hardening — **not started**; requires owner approval.
