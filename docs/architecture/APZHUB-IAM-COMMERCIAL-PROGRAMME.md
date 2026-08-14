# APZHUB IAM + Commercial Platform Programme

| Field       | Value                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status      | **ACTIVE** — architecture authority for SPR-IAM-COMMERCIAL-001                                                                                                                                                                                                                                                                                                                                  |
| Date        | 2026-08-10                                                                                                                                                                                                                                                                                                                                                                                      |
| Complements | [007](../007-identity-authentication-authorisation-rbac-architecture.md) · [005](../005-desktop-experience-workspace-framework.md) · [010](../010-api-gateway-integration-communication-standards.md) · [027](../027-platform-service-sdk-business-service-framework-service-manifest-specification.md) · [026](../026-integration-sdk-adapter-framework-integration-manifest-specification.md) |
| Sprint      | [SPR-IAM-COMMERCIAL-001](../sprint/SPR-IAM-COMMERCIAL-001-sprint-guide.md)                                                                                                                                                                                                                                                                                                                      |

## 1. Purpose

Unify live Identity & Access (Doc 007), org-scoped user provisioning, Cursor-like commercial billing (PayFast), entitlement gating, and a professional light/dark UI — under **one ruleset for every organisation**, including APZOR internal.

## 2. Locked Owner decisions

| Decision    | Choice                                                                       |
| ----------- | ---------------------------------------------------------------------------- |
| Delivery    | Architecture + sprint guide, then implement IAM **and** PayFast commerce     |
| Tenancy     | **Mixed** — organisation tenants and individual self-serve                   |
| Rules       | One ruleset for all orgs; platform control plane above orgs                  |
| Billing UX  | Notices → warnings → grace → soft limits → suspend (never immediate cut-off) |
| Sell now    | Direct SKUs (pen-test, QA report) + Enterprise org plans                     |
| Marketplace | Designed now; partner runtime deferred                                       |
| UI          | Professional shell; keep light + dark; no colour splash                      |

## 3. Identity & access model

```text
Platform Control (audited superadmin / platform-ops)
        ↓
Organisation (tenant)  ←── APZOR Internal is a normal org + platform_operator_org flag
        ↓
Membership + Job Role (persona) + product roles (e.g. qep-operator)
        ↓
PermissionService + EntitlementService → shell / APIs
```

### Personas (job roles)

| Role slug                     | Scope    | Intent                                           |
| ----------------------------- | -------- | ------------------------------------------------ |
| `platform-admin`              | platform | Platform Control                                 |
| `org-admin`                   | tenant   | Invite, assign roles, suspend members in own org |
| `manager`                     | tenant   | Team oversight                                   |
| `supervisor`                  | tenant   | Day-to-day supervision                           |
| `employee`                    | tenant   | Standard member                                  |
| `support-agent`               | tenant   | Support operations                               |
| `auditor`                     | tenant   | Read-heavy compliance                            |
| `compliance-officer`          | tenant   | Compliance controls                              |
| `executive`                   | tenant   | Executive dashboards                             |
| `qep-operator` / `qep-reader` | product  | QEP (existing)                                   |
| `tenant-member`               | tenant   | Baseline membership (existing)                   |

### SoR

- **Authentication:** BetterAuth only.
- **Authorisation:** `platform_authorization_*` (Postgres).
- **Org membership:** platform-identity tenants + memberships.
- Modules never implement local authz catalogues.

## 4. Commercial model

| Actor        | Buys                      | Billing account                                 |
| ------------ | ------------------------- | ----------------------------------------------- |
| Individual   | Self-serve SKUs           | Personal billing account + soft personal tenant |
| Organisation | Seats / edition + add-ons | Org billing admin                               |
| Enterprise   | Contract + invoice        | Platform commercial + org admin                 |

### Entitlements

`EntitlementService` maps `plan | addon | sku` → capability keys / limits.  
**RBAC AND entitlement** required for gated actions. UI distinguishes `forbidden` vs `upgrade_required`.

### Dunning (Cursor-like)

`Active` → `Notice` → `Warning` → `Grace` → `SoftLimited` → `Suspended`  
Recovery returns to `Active`. SoftLimited retains read/export; blocks new paid-capacity actions.

### PayFast

- Adapter only: `PaymentGatewayService` → `PayFastAdapter` (`integrations/payfast`).
- ITN/webhooks signature-verified; idempotent ledger; no PAN storage.
- Secrets: `.secrets` / env.

### Direct catalogue (near-term)

| SKU id               | Kind               | Notes                  |
| -------------------- | ------------------ | ---------------------- |
| `sku.org.team`       | org plan           | Team seats             |
| `sku.org.enterprise` | org plan           | Enterprise             |
| `sku.qep.pentest`    | addon / individual | Pen-test pack          |
| `sku.qep.qa-report`  | addon / individual | QA report subscription |

Partner marketplace: blueprint only (see programme Phase 4).

## 5. Platform Services (manifest-first)

| Service id                   | Responsibility                                            |
| ---------------------------- | --------------------------------------------------------- |
| `identity-lifecycle-service` | Invites, membership, suspend, persona assign              |
| `entitlement-service`        | Capability grants/limits from commercial state            |
| `billing-service`            | Invoices, payments, credits, refunds, statements, dunning |
| `catalogue-service`          | SKU catalogue (APZHUB direct store)                       |

## 6. Events (past-tense)

- `platform-iam-member-invited`
- `platform-iam-member-role-assigned`
- `platform-iam-member-suspended`
- `platform-billing-invoice-issued`
- `platform-billing-payment-received`
- `platform-billing-payment-failed`
- `platform-billing-dunning-advanced`
- `platform-billing-refund-issued`
- `platform-entitlement-granted`
- `platform-entitlement-revoked`

## 7. ADR candidates

| Candidate        | Topic                                       |
| ---------------- | ------------------------------------------- |
| ADR-IAM-COMM-001 | Single org ruleset + platform control plane |
| ADR-IAM-COMM-002 | Entitlement + RBAC dual gate                |
| ADR-IAM-COMM-003 | PayFast as first PaymentGateway adapter     |
| ADR-IAM-COMM-004 | Mixed individual + org billing accounts     |

## 8. Non-goals

- Partner storefront runtime
- Full engine SSO handoff (follow-on)
- Immediate wipe on failed payment
- Modules owning billing or authz
