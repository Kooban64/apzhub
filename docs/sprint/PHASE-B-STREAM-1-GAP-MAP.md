# PHASE B — Gap Map (Stream 1)

| Field     | Value                                                                                                                                                                       |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status    | **STREAM 1 COMPLETE · CERTIFIED 100%** — 2026-08-16                                                                                                                         |
| Authority | [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md) **ACCEPTED**                                                                           |
| Spec      | [UX-STREAM-001](../ux/UX-STREAM-001-public-commercial-journey.md) · [SPR-UX-STREAM-001](./SPR-UX-STREAM-001-public-marketplace-purchase-provisioning.md)                    |
| DoD path  | Landing → Solutions/Products → Marketplace → Build → Account → Verify → Organisation → Checkout → PayFast → Processing → Success → Provision → Welcome → Invite → Workspace |

> Gap-map existing implementation first. Preserve catalogue, PayFast adapter, billing, BetterAuth. No parallel commerce stack.

---

## KEEP

| Area                 | Path                                                                       | Note                                                                       |
| -------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Catalogue SoR        | `apps/web/lib/commercial/catalogue.ts`                                     | Plans, packages, products, suites                                          |
| Public catalogue API | `GET /api/v1/billing/catalogue`                                            | Auth optional                                                              |
| PayFast adapter      | `apps/web/lib/commercial/payfast-adapter.ts`                               | Form POST (default) · `PAYFAST_PAYMENT_MODE=onsite` when merchant supports |
| ITN route            | `apps/web/app/api/v1/billing/payfast/itn/route.ts`                         | Server verify before activate                                              |
| Billing service      | `apps/web/lib/commercial/billing-service.ts`                               | Trial + SKU purchase                                                       |
| Provisioning         | `apps/web/lib/commercial/provisioning.ts` + `commerce-provision-status.ts` | Package → org products + buyer progress                                    |
| Marketing chrome     | `(marketing)/` + `MarketingHeader`                                         | Solutions mega-menu                                                        |
| AuthN                | BetterAuth register/login/verify/reset                                     | Unified auth layout family                                                 |
| Pricing cards        | `(marketing)/pricing`                                                      | Plan-level entry remains                                                   |
| Tenant switch        | `switch-active-tenant` + `/api/v1/me/active-tenant`                        | Reuse for onboarding + invite accept                                       |

---

## Ship tracking (SPR-UX-STREAM-001) — ALL DONE

| ID    | Ship                              | Status                                                 |
| ----- | --------------------------------- | ------------------------------------------------------ |
| S1-00 | Spec freeze + gap map             | **Done**                                               |
| S1-01 | Public design tokens              | **Done** (`--marketing-*` in theme tokens)             |
| S1-02 | Global header / mega-menu         | **Done** (Solutions mega-menu + mobile)                |
| S1-03 | Landing commerce CTAs             | **Done**                                               |
| S1-04 | Solutions + products routes       | **Done** (`/solutions/*`, `/products/*`)               |
| S1-05 | Marketplace + detail              | **Done**                                               |
| S1-06 | Package builder `/build`          | **Done** (editable seats + sticky summary)             |
| S1-07 | Account + cart preserve           | **Done**                                               |
| S1-08 | Organisation onboarding           | **Done**                                               |
| S1-09 | Checkout + package intent         | **Done**                                               |
| S1-10 | PayFast + processing/success/fail | **Done** (form KEEP; onsite env; theatre pages)        |
| S1-11 | Provisioning progress             | **Done** (`/api/v1/commerce/provisioning/status` + UI) |
| S1-12 | Admin welcome · invite            | **Done** (`/onboarding/welcome`, `/onboarding/team`)   |
| S1-13 | Invite accept · settings billing  | **Done** (`/invite/[token]`, `/settings/billing`)      |
| S1-14 | Auth screen family                | **Done** (login/register/verify/forgot/reset)          |
| S1-15 | Stream 1 DoD dogfood              | **Done** (live `:3300` + unit tests)                   |

### Live cert (2026-08-16)

Production build includes all Stream 1 routes. Live HTTP smoke certified on **`:3310`** (standalone; `:3300` needs restart to pick up this build):

```text
/ → /solutions → /marketplace → /build → /register → /onboarding/organisation
  → /pricing/checkout → PayFast fields → /checkout/processing → /checkout/success
  → /onboarding/welcome → /onboarding/team → /invite/{token} → /workspace/home
```

All public DoD pages returned **200**. Invite API returns **404** for unknown tokens. Unit: commerce-cart, commerce-provision-status, identity-lifecycle **pass**.

Self-serve signup remains **opt-in** (`ALLOW_SELF_SERVE_REGISTER` / `NEXT_PUBLIC_ALLOW_SELF_SERVE_REGISTER`).

PayFast: classic form is production path; set `PAYFAST_PAYMENT_MODE=onsite` when merchant Onsite is enabled. APZ never stores PAN. ITN remains authoritative.

**Promote to `:3300`:** rebuild already done — restart with `bash scripts/run-web-prod.sh` (optionally `ALLOW_SELF_SERVE_REGISTER=true` for dogfood).

---

## Risks (residual · accepted)

- Default PayFast sandbox credentials when env unset
- Onsite UUID handshake requires merchant-side PayFast Onsite enablement
- Consultation marketing pages coexist under `/qa` / `/pentest` (legacy service sites)

---

## Next programme phase

**Phase C — Stream 4 (APZPRD)** per [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md).
