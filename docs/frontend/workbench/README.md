# User Workbench

## Slice 1 — Global Shell

**Status:** ACCEPTED (Owner)

Global Workbench Shell · Home / My Work · Productivity launcher · Search / Quick Actions / Notifications · resizable panels.

Evidence: `evidence/01`–`10`

## Slice 2 — APZPRD Daily Work Experience

**Status:** ACCEPTED · COMPLETE (Owner)

Preserve genuine UX gaps as **optimisation backlog** — do not expand APZPRD without Owner.

### APZPRD UX backlog (accepted gaps — do not build now)

- Shell Inspector for Time / Workflow / Analytics / Knowledge / Documents
- Product-specific mobile bottom actions beyond Slice 1 chrome
- Favourites / Recent when real product capability exists
- Support queue views (Assigned / Team Queue / etc.) only if product models support them
- Documents upload UX + per-id deep-links
- Cross-product related-context Inspector (no inference engine)

### Evidence

`docs/frontend/workbench/evidence/apzprd/01`–`15`

## Slice 3 — APZQEP Quality Engineering + Source Workspace v1

**Status:** ACCEPTED · COMPLETE (Owner)

Quality engineering connected to software · Source Workspace v1 Read+Context · QEP ≠ Source · explicit deep-link mapping only (no automatic test↔file inference).

Evidence: `docs/frontend/workbench/evidence/qep/01`–`18`

## Slice 4 — APZPEN Penetration Testing

**Status:** ACCEPTED · COMPLETE (Owner)

APZPEN owns the engagement workflow; tools provide capabilities. PEN ≠ Source ≠ Terminal. Desktop E2E timeout recorded as **test-infrastructure debt** (not a functional rejection).

Evidence: `docs/frontend/workbench/evidence/pen/01`–`18`

### Tests

- Unit: `compose-pen-sidebars` · `workbench-routes` · `pen-source-links` · rail Security (**22 passed**)
- E2E: `pnpm test:e2e:workbench-slice4-apzpen` — **smoke 2 passed**; historic long desktop suite **skipped** (Next.js dev saturation debt — not labelled PASS)

## Commercial Product UX Pass

**Status:** COMPLETE — stop after this pass  
**Authority:** Owner — integration / coherence / customer journey only  
**Not:** New capability programme · AI · Source v2 · new scanners · fake green / invented prices

### What changed

- Public landing is a commercial page (three disciplines), not the Workbench
- `/products` + `/products/apzprd|apzqep|apzpen` use Owner copy
- `/build` configure → register → organisation → PayFast checkout (catalogue amounts only)
- Checkout processing no longer claims success after poll timeout
- Org Admin lands on Workbench; Organisation Administration is an account-menu entry
- Authenticated Marketplace = Organisation Admin products (subscription state, Manage / Explore)

### Journey matrix

| Journey                                                        | UI                    | Backend                   | Real State                                    | Gap                                                            | Test                          |
| -------------------------------------------------------------- | --------------------- | ------------------------- | --------------------------------------------- | -------------------------------------------------------------- | ----------------------------- |
| A Landing → Products → APZPRD → Get Started → Register         | Yes                   | BetterAuth signup         | Self-serve register flag                      | Combinations of suites are sequential packages, not one cart   | Evidence 01–07                |
| B Landing → APZQEP → Get Started → Register                    | Yes                   | Same                      | Same                                          | Same                                                           | Evidence 04, 06, 07           |
| C Existing user → Sign in → Workbench (entitled only)          | Yes                   | BetterAuth + entitlements | Soft product keys                             | Access is permission-filtered; rail shows entitled products    | Evidence 08, 16               |
| D Org Admin → Workbench → Organisation Administration → return | Yes                   | home-context kind         | `org_admin` → `/workspace/home`               | —                                                              | Evidence 16–17 · unit landing |
| E User → Marketplace → org subscription state                  | Yes                   | Org Admin products API    | Active / Not subscribed                       | Ordinary users do not get a buyer Marketplace inside Workbench | Evidence 14–15                |
| F APZPRD Time-only → Workbench Time only                       | Existing entitlements | Soft product access       | Time “Not configured” when not in composition | `pkg.apzprd.time` is `coming_soon`                             | Evidence 16 honesty           |
| G QEP without Source                                           | Existing              | `source.read` independent | 403 / unavailable                             | —                                                              | Slice 3 evidence 15           |
| H PEN without Terminal                                         | Existing              | Terminal Not configured   | Honest                                        | Long PEN desktop suite is debt, not PASS                       | Slice 4 smoke **passed**      |

### Commerce status

| Topic              | Status                                                                                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Commerce catalogue | Durable `PACKAGE_CATALOGUE` / `PLAN_CATALOGUE`. Self-serve available: `pkg.apzprd.projects`, `pkg.apzqep.starter`, `pkg.apzpen.starter`. Other APZPRD modules `coming_soon`. |
| Pricing            | Plan amounts only (`plan.individual` 99.00 ZAR, `plan.business` 249.00 ZAR). Packages have **no** `amountCents`. UI does not invent package prices.                          |
| PayFast            | Hosted form POST adapter + ITN. Live merchant credentials: **not configured** (sandbox defaults). Card details are not collected in APZ.                                     |
| Registration       | BetterAuth email signup. First/last name + Terms checkbox. No parallel auth.                                                                                                 |
| Subscription       | Trial start + PayFast authorisation. Activation waits for server ITN — browser return is not treated as paid.                                                                |
| Provisioning       | `/api/v1/commerce/provisioning/status` exists. Unverified timeout stays pending / “Provisioning status unavailable” — **not** success.                                       |
| Marketplace        | Public catalogue + Org Admin subscription management. Platform Admin marketplace remains operator-only.                                                                      |

### Genuine blockers to selling APZ to an external customer

1. **PayFast live merchant credentials are not configured** — checkout can only be sandbox/demo until merchant ID/key are set.
2. **Package-level prices are not in the catalogue** — only plan prices exist; APZPRD module mix cannot be quoted honestly beyond the plan amount.
3. **Self-serve combinations are incomplete** — one package per checkout; APZPRD+QEP+PEN as a single basket is not a catalogue SKU.
4. **Most APZPRD modules are `coming_soon` in the sellable catalogue** (Support, Time, Workflow, Analytics, Documents, full workspace).
5. **Self-serve registration depends on env flags** (`NEXT_PUBLIC_ALLOW_SELF_SERVE_REGISTER`).
6. **Country/timezone on organisation setup are UI-only** — onboarding API persists name + slug only.

### APZPEN desktop E2E timeout — classification

**Next.js dev saturation + oversized suite** — not an application hang.

- Focused smoke (`pnpm test:e2e:workbench-slice4-apzpen`): **2 passed**, long suite **skipped** (debt)
- Do **not** label the historic 480s desktop suite PASS

### Evidence

`docs/frontend/workbench/evidence/commerce/01`–`20`

### Stop

Do not begin another programme.

## Commercial Activation Closure

**Status:** COMPLETE — engineering closure; Owner commercial values still required for live activation  
**Authority:** Owner decision — Commercial Product UX Pass ACCEPTED; no new UX programme

### Area matrix

| Area                      | Before                                    | After                                                                                      | Real Backend                                   | Test                                                | Remaining Gap                                                              |
| ------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------- |
| Catalogue structure       | Plans + packages; no package prices       | `ProductStatus` + nullable `amountCents`; admin overlay store                              | `catalogue.ts` + `catalogue-price-overlay.ts`  | `commerce-quote.test.ts`                            | Owner must set list prices via Platform Admin → Billing → Catalogue prices |
| Admin pricing             | Not editable                              | `PATCH /api/v1/platform-admin/catalogue/prices`                                            | File-backed overlay (durable)                  | Manual + API                                        | Product-level module prices optional; package prices required for checkout |
| Multi-product basket      | One `packageId` per checkout              | `packageIds[]` cart v2; compose basket without bundle SKUs                                 | `commerce-cart.ts`                             | `commerce-cart.test.ts`                             | —                                                                          |
| Quote / calculation       | Plan SKU only                             | `POST /api/v1/commerce/quote` — server validates availability + prices + VAT               | `commerce-quote.ts`                            | `commerce-quote.test.ts`                            | `COMMERCE_VAT_BPS` if VAT required                                         |
| Checkout                  | Trial start + immediate dogfood provision | `POST /api/v1/commerce/checkout/create` — invoice from quote; no pre-payment entitlement   | `billing-service.ts` + `commerce-order.ts`     | `commerce-activation.test.ts`                       | Checkout blocked until prices set                                          |
| PayFast                   | Sandbox defaults; basic ITN               | Production config boundary documented; amount verify; duplicate ITN idempotent             | `payfast-adapter.ts`                           | ITN negative cases in `commerce-activation.test.ts` | Live `PAYFAST_MERCHANT_ID` / `KEY` / `PASSPHRASE`                          |
| Subscription lifecycle    | Trial + ad-hoc provision                  | Order: `pending_payment` → `paid` → `provisioning` → `active`                              | `commerce-order.ts` + ledger                   | `commerce-activation.test.ts`                       | —                                                                          |
| Provisioning              | Package intent applied on trial start     | Basket intent applied **only** after verified payment; org entitlement without user grants | `commerce-package-intent.ts`                   | `commerce-package-intent.test.ts`                   | Org Admin assigns users via IAM                                            |
| Organisation setup        | Name + slug only                          | `countryCode` + IANA `timezone` in tenant metadata                                         | `commerce-onboarding.ts` + Postgres tenant row | Unit (onboarding handler)                           | No customer master-data expansion                                          |
| Self-service registration | Undocumented env flags                    | `ALLOW_SELF_SERVE_REGISTER` / `NEXT_PUBLIC_*` in `.env.production.example`                 | `packages/config/src/env.ts`                   | Existing register page gate                         | Set `true` in production when ready                                        |
| Coming-soon guard         | UI filter                                 | Quote + checkout reject `coming_soon` / `contact_sales`                                    | `commerce-quote.ts`                            | `commerce-quote.test.ts`                            | Owner decides when modules become sellable                                 |

### Owner commercial values still required

Set via **Platform Admin → Billing → Catalogue prices** (do not invent in code):

- `pkg.apzprd.projects.amountCents`
- `pkg.apzqep.starter.amountCents`
- `pkg.apzpen.starter.amountCents`
- Other APZPRD packages when moved from `coming_soon`
- Optional: module-level product prices; `COMMERCE_VAT_BPS` for VAT

### External customer activation verdict

| Capability            | Status                                                               |
| --------------------- | -------------------------------------------------------------------- |
| Discovery             | READY                                                                |
| Registration          | READY (when `ALLOW_SELF_SERVE_REGISTER=true`)                        |
| Organisation creation | READY                                                                |
| Catalogue             | READY                                                                |
| Pricing               | **NOT READY** — package list prices unset until Owner sets via admin |
| Checkout              | READY (blocked until pricing set)                                    |
| PayFast               | **NOT READY** — production merchant credentials absent               |
| Subscription          | READY                                                                |
| Provisioning          | READY                                                                |
| IAM assignment        | READY                                                                |
| Workbench access      | READY                                                                |
| Tenant isolation      | READY                                                                |

**OVERALL: COMMERCE FLOW CERTIFIED — PRODUCTION CONFIGURATION PENDING**

Not **COMMERCIALLY ACTIVATABLE** until Owner package prices are set and live PayFast credentials are configured.

## Commercial Pricing & Catalogue Control Plane

**Status:** COMPLETE — stop for Owner review  
**Authority:** Owner — bounded enhancement; do not seed launch prices

### Area matrix

| Area               | Existing                 | Extended                        | Admin Controlled               | Runtime Used                | Tests                      | Gap                               |
| ------------------ | ------------------------ | ------------------------------- | ------------------------------ | --------------------------- | -------------------------- | --------------------------------- |
| Catalogue IDs      | Durable packages/plans   | Retained                        | Availability + display overlay | Quote / Marketplace         | pricing-engine             | Owner prices unset                |
| Pricing overlay    | amountCents file overlay | Draft/publish + regions + units | Platform Admin Billing         | Pricing engine              | pricing-engine.test        | No Owner amounts seeded           |
| Regional pricing   | ZAR-only                 | GLOBAL / AFRICA / SOUTH_AFRICA  | Regional Pricing UI            | Region from billing country | precedence tests           | Africa adjustment unset by design |
| Tax                | `COMMERCE_VAT_BPS` env   | Admin tax rules (draft/publish) | Tax UI                         | Quote tax                   | annual+tax test            | Not published until Owner         |
| Discounts          | None                     | Promotional draft/publish       | Discounts UI                   | Quote promo                 | unpublished promo rejected | No complex campaigns              |
| Plans              | Catalogue R99/R249       | Draft/publish overlay           | Plans UI                       | Catalogue + overlay         | —                          | Existing values retained          |
| Quote              | Server basket quote      | Snapshot + expiry + adjustments | Preview uses same engine       | Checkout                    | quote + activation         | —                                 |
| Checkout / PayFast | Server total             | Consumes quoteId snapshot       | —                              | PayFast amount              | activation                 | Live PayFast secrets still env    |
| Audit              | Empty APE providers      | Commercial history provider     | History on item                | APE-Audit                   | history rows               | —                                 |
| Permissions        | catalogue.manage         | commerce.*.read/manage          | Finance manage; PA read        | API guards                  | permission unit            | Superadmin / Finance mutate       |

### Sources of truth

| Concern                          | Source                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Catalogue source of truth        | `catalogue.ts` package/plan IDs + status; overlay may refine availability                              |
| Pricing source of truth          | Published commercial control plane (`commercial-config` / overlay)                                     |
| Regional pricing precedence      | Country fixed → country adjustment → regional fixed/adjusted → Global → legacy overlay → catalogue     |
| Tax source of truth              | Published admin tax rule, else `COMMERCE_VAT_BPS`                                                      |
| Discount precedence              | Regional list → annual → published promotion → tax                                                     |
| Quote source of truth            | Server `quoteCommerceBasket` + stored quote snapshot                                                   |
| Subscription price snapshot      | Order stores quote at checkout; catalogue changes do not mutate existing orders (`new_customers_only`) |
| Audit                            | Control-plane history + APE-Audit administration provider                                              |
| Draft/publish                    | Draft ignored by public/checkout; publish (or legacy setPackageListPrice) customer-visible             |
| PayFast configuration visibility | Configured / sandbox / unavailable only — no secrets                                                   |

### Owner can change a published South African product price without:

| editing code? | **NO** |
| changing environment? | **NO** |
| redeploying? | **NO** |

Path: Platform Admin → Billing → Pricing / Catalogue item → Save draft → Publish (requires `commerce.pricing.manage` + reason).

**Do not populate Owner launch prices here.** Enter them in Platform Admin after commercial model review.

### Stop

Commercial Pricing Administration complete. Stop for Owner review.

## OWNER DIRECTIVE — Commercial Pricing Decision Gate

**Status:** **IN FORCE** (2026-08-18)  
**Authority:** [OWNER-COMMERCIAL-PRICING-DECISION-GATE](../../decisions/OWNER-COMMERCIAL-PRICING-DECISION-GATE.md)

```text
PLATFORM ENGINEERING                 COMPLETE FOR CURRENT SCOPE
COMMERCE FLOW                        CERTIFIED
COMMERCIAL PRICING ADMINISTRATION    COMPLETE
PRICE BOOK                           OWNER RECOMMENDED (v1.0 filed — draft entry pending)
PAYFAST PRODUCTION                   CONFIGURATION PENDING
SELF-SERVICE REGISTRATION            OWNER DECISION PENDING
OVERALL                              PRODUCTION CONFIGURATION PENDING
```

Engineering remains stopped. Runtime prices remain **Unset**.

Price book document: [APZ-COMMERCIAL-PRICE-BOOK-V1](../../strategy/commercial/APZ-COMMERCIAL-PRICE-BOOK-V1.md).

Next authorised Cursor action (only when Owner issues it): map approved values → DRAFT regions → ZA VAT 15% draft → preview baskets → **STOP before publish**.
