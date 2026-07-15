# ADR-0045: Platform Security & Operational Resilience (M8-06)

## Status

Accepted — implemented M8-06.

## Context

Platform Core milestones M8-01–M8-05 delivered Identity, Authorization, Operations, Personalisation, and Governance. The final Platform Core milestone requires security hardening and operational resilience without redesigning prior capabilities.

## Decision

1. Introduce `@apzhub/platform-security` as the security and resilience package (no new DB migration; Redis for rate limits).
2. Expose platform APIs: `/security`, `/security/diagnostics`, `/system/health`, `/system/readiness`, `/system/liveness`.
3. Consolidate operational diagnostics from all Platform Core capabilities into one view.
4. Extend Operations Console with Security and Resilience sections.
5. Strengthen edge headers (Permissions-Policy) and API guard (`requirePlatformSession`, `requirePlatformPermission`).
6. Defer SOC/SIEM, external secret managers, key rotation, scanners, pen testing, and DR automation.

## Consequences

- Products consume platform security APIs; no duplicate security subsystems in products.
- Rate limiting is foundation-only; auth routes may adopt incrementally.
- CSP remains Report-Only until inline script audit.

## References

- [Platform Security Reference Architecture](../architecture/APZHUB-Platform-Security-Reference-Architecture.md)
- [Operational Resilience Architecture](../architecture/APZHUB-Operational-Resilience-Architecture.md)
- [M8-06 Completion Report](../sprint/M8-06-completion-report.md)
