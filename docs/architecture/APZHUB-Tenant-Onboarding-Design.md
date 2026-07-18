# APZHUB Tenant Onboarding Design

> **Programme:** PRH-012–018  
> **Story:** PRH-015 — Commercial readiness foundation (**design only**)  
> **Out of scope:** Billing, licensing, automated SaaS signup (PCv2-03 / PCv2-10 / OSS-100-12+)

---

## Purpose

Define the pilot tenant onboarding flow and monitoring hooks so commercial provisioning programmes can implement against a stable design. This document does **not** authorise provisioning implementation.

---

## Current foundation (on disk)

| Capability                              | Package / location                                       |
| --------------------------------------- | -------------------------------------------------------- |
| Governance / feature flags / enablement | `@apzhub/platform-governance` · ADR-0044                 |
| Identity Administration SoR             | `@apzhub/identity-*` (frozen APZIDENTITY-006)            |
| Administration SoR                      | `@apzhub/admin-*` (frozen APZADMIN-006)                  |
| Outbox + Event Bus                      | `@apzhub/platform-outbox` · `@apzhub/platform-event-bus` |
| Production verification                 | `@apzhub/platform-operations`                            |

First-login / bootstrap enablement already exists. Commercial multi-tenant product activation does **not**.

---

## Target pilot flow (design)

```text
1. Owner / admin creates tenant shell (platform metadata)
2. Assign initial admin identity (platform IAM — not engine roles)
3. Governance enablement sequence activates products/capabilities
4. Optional: async provisioning jobs via outbox (future OSS-100-12+)
5. Health/diagnostics expose onboarding monitoring hooks
6. Pilot users sign in via BetterAuth (APZHUB owns session)
```

### Governance enablement sequence (pilot)

1. Validate tenant record exists and is active.
2. Enable baseline platform capabilities (shell, identity admin, operations).
3. Enable product modules per pilot charter (e.g. Support, Documents) — **permission-driven**.
4. Register connector configs by **reference** (no plaintext secrets in DB).
5. Record audit events for each enablement step.
6. Emit platform events (future): `platform.tenant.onboarding.started` / `.completed` (names illustrative; register via ENF when implemented).

---

## Monitoring hook points

Hook IDs are implemented as a typed catalogue in `@apzhub/platform-operations` (`commercial-readiness-hooks.ts`) for diagnostics consumers:

| Hook ID                            | Domain      | Purpose                                       |
| ---------------------------------- | ----------- | --------------------------------------------- |
| `onboarding.tenant.active`         | Tenant      | Tenant shell present and active               |
| `onboarding.admin.assigned`        | Identity    | At least one tenant admin bound               |
| `onboarding.governance.baseline`   | Governance  | Baseline capabilities enabled                 |
| `onboarding.products.enabled`      | Products    | Pilot product set enabled                     |
| `onboarding.connectors.configured` | Integration | Required connector refs present (not secrets) |
| `onboarding.health.ready`          | Ops         | Production verification not `NOT_READY`       |

These hooks are **observation points** for pilot readiness. They must not grant permissions.

---

## Health / diagnostics integration

- Operations Control Plane continues to own production verification verdicts.
- Commercial readiness hooks are additive warnings/observations for pilot operators.
- Full automated SaaS signup, webhooks, and status polling APIs belong to **OSS-100-12+ / PCv2-03**.

---

## Explicit exclusions

| Item                             | Deferred to               |
| -------------------------------- | ------------------------- |
| Self-service signup              | PCv2-03 / OSS-100-12+     |
| Billing / metering UI            | PCv2-10                   |
| Vault-backed secrets             | PCv2-04                   |
| Engine user provisioning fan-out | Per-engine SSO programmes |

---

## Acceptance (PRH-015)

- [x] Design document published
- [x] Monitoring hook catalogue coded (typed, tested)
- [x] Governance enablement sequence documented for pilot
- [x] No commercial provisioning implementation

---

## Related

- [ADR-0044](../adr/ADR-0044-platform-governance-provisioning-framework.md)
- [Production Operations Checklist](../governance/APZHUB-Production-Operations-Checklist.md)
- [Programme Recommendation OSS-100-12+](../foundation/completion-reports/PROGRAMME-RECOMMENDATION-OSS-100-12-PLUS.md)
