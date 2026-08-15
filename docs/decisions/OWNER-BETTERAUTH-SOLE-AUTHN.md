# Owner decision — BetterAuth sole AuthN; Authentik retirement with APZPRD

| Field     | Value                                                                                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Status    | **IN FORCE**                                                                                                                                                                         |
| Date      | 2026-08-15                                                                                                                                                                           |
| Authority | Owner                                                                                                                                                                                |
| Related   | [007](../007-identity-authentication-authorisation-rbac-architecture.md) · [ENVIRONMENT.md](../../ENVIRONMENT.md) · [APZPRD](../strategy/APZPRD-ENTERPRISE-PRODUCTIVITY-PLATFORM.md) |

## Decision

1. **APZHUB AuthN is BetterAuth only.** Email/password (and future BetterAuth-supported IdP plugins if Owner-authorised) — not Authentik as the product login.
2. **APZHUB AuthZ remains APZHUB** (PermissionService, roles, provisioning, audit). BetterAuth never grants permissions.
3. **Authentik is legacy host coexistence only** (`apz-stack` forward-auth). No new Authentik features. No QEP/APZHUB dependency on Authentik for login.
4. **Retirement target:** decommission Authentik when **APZPRD** is working as the productivity workspace path (engine silent handoff via APZHUB adapters, not Authentik forward-auth for user journeys).

## Consequences

- Do not build Authentik config UI in QEP or Platform Console.
- Admin / ops docs describe BetterAuth as canonical AuthN.
- Per-engine SSO (Plane, Kimai, Zammad, …) is adapter work under Document 007 — tokens/OIDC/proxy owned by APZHUB, masked from users.
- Until APZPRD cutover, leave Authentik running for legacy vhosts only; do not expand it.

## Non-goals

Replacing BetterAuth · Porting Authentik policies into APZHUB · Claiming full SAML enterprise IdP in this decision (separate Owner auth if needed later via BetterAuth/plugins).
