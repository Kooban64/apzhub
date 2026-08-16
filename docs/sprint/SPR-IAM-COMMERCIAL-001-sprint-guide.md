# SPR-IAM-COMMERCIAL-001 — IAM, Commercial Platform & Professional UI

| Field        | Value                                                                                 |
| ------------ | ------------------------------------------------------------------------------------- |
| Status       | **ACCEPTED · ACTIVE** — Owner accepted 2026-08-16; residual Stream 6 ships continue   |
| Programme    | [APZHUB-IAM-COMMERCIAL-PROGRAMME](../architecture/APZHUB-IAM-COMMERCIAL-PROGRAMME.md) |
| Prerequisite | Platform foundation (SPR-001 / BUILD-001) available                                   |
| Out of scope | Partner marketplace runtime; full multi-engine SSO                                    |

## Objective

Deliver live org IAM (personas, invite/provision, Admin), PayFast commercial billing with Cursor-like dunning, entitlement-gated shell/APIs, and a professional light/dark UI upgrade.

## Sprints inside this guide

| Sprint slice | Scope                                        | Exit                                    |
| ------------ | -------------------------------------------- | --------------------------------------- |
| **S0**       | Docs + manifests (this pack)                 | Registry updated                        |
| **S1**       | Live IAM + personas + Org/Platform Admin     | Invite + role assign works; shell gated |
| **S2**       | Billing + Entitlement + PayFast + dunning    | Checkout + ledger + soft limits         |
| **S3**       | UI polish + commercial notices               | Professional Admin/Billing surfaces     |
| **S4**       | Harden + tests + ops + marketplace blueprint | Evidence pack complete                  |

## Architecture rules (non-negotiable)

1. BetterAuth = authentication only.
2. Module → Gateway → Platform Service → Connector → Engine.
3. PayFast only behind `PayFastAdapter` / Integration SDK.
4. One ruleset for all orgs including APZOR internal.
5. Never immediate account shutdown on payment failure.
6. Tokens-only UI; light + dark; no colour splash redesign.

## Acceptance criteria (programme)

- [ ] Org Admin invites users and assigns Doc-007 personas; shell shows only allowed + entitled areas.
- [ ] Individual can purchase `sku.qep.pentest` or `sku.qep.qa-report` via PayFast; entitlement unlocks capability.
- [ ] Overdue account receives staged notices; SoftLimited before Suspended; invoices/statements/refunds/discounts available.
- [ ] APZOR internal org uses the same APIs; platform control is separate and audited.
- [ ] UI is professional in light and dark.
- [ ] Unit + API + Playwright smoke for IAM and billing paths pass.

## Definition of Done (per slice)

Requirements → design → impl → tests → docs → Owner review before merge to main.

## Owner acceptance

| Field       | Value                                                                                                                                                                                                                                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accepted by | Owner (chat — “I accept, please continue”)                                                                                                                                                                                                                       |
| Accepted at | 2026-08-16                                                                                                                                                                                                                                                       |
| Notes       | S0–S4 evidence is **LOCAL IMPLEMENTED** ([EVIDENCE](../operations/SPR-IAM-COMMERCIAL-001-EVIDENCE.md)). Create-user wizard (Phase K) + APZOR dogfood smoke (Phase L / `pnpm test:e2e:phase-l`) landed under Stream 6. Residual: billing Playwright, S6-06 teams. |

**Engineering note:** Post-acceptance residual ships under Stream 6 / programme order (Phase K+). Evidence stays in `docs/operations/` and sprint gap maps.
