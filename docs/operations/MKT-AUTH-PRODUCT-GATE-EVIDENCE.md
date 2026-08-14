# Marketing, Auth Chrome & Dynamic Product Access — Evidence

| Field  | Value                                                  |
| ------ | ------------------------------------------------------ |
| Status | **LOCAL IMPLEMENTED** 2026-08-10                       |
| Plan   | Public Marketing, Auth Chrome & Dynamic Product Access |

## Delivered

### Marketing

- Route group `apps/web/app/(marketing)/` — `/` landing, `/pricing` (exactly 3 cards), `/pricing/checkout`, `/contact`, `/legal/{terms,privacy,cookies,disclaimer}`
- Cookie notice banner; footer legal links; tokens-only light/dark atmosphere
- Middleware public paths for marketing + legal + auth; `/` no longer redirects to workspace

### Auth chrome

- Auth layout: **APZHUB \| page title**, `ThemeToggle`, left info sidebar with pricing/legal links
- Working forgot-password via Better Auth `requestPasswordReset`
- Register gated by `ALLOW_DEV_REGISTRATION` **or** `NEXT_PUBLIC_ALLOW_SELF_SERVE_REGISTER=true`

### Commercial plans + trial

- Catalogue: `plan.individual` / `plan.business` / `plan.custom` + product matrix (`qep` available; others `coming_soon`)
- `GET /api/v1/billing/catalogue` public-safe
- `POST /api/v1/billing/subscriptions/start-trial` — 7-day card trial + PayFast checkout
- `POST /api/v1/billing/subscriptions/convert-trials` — auto-convert / pending payment / expire
- Payment on plan SKUs activates org product subscriptions

### Product access gate

- Org subscriptions ∩ user grants ∩ available ∩ RBAC in workbench hydration
- Org Admin members UI: product grant checkboxes (subscribed products only)
- `POST /api/v1/iam/members/:id/products`
- QEP operate APIs: `requireQepPermission` enforces `requireProductAccess("qep")` when permission is `qep.*`

## Proof

```bash
pnpm exec vitest run \
  apps/web/lib/commercial/billing.test.ts \
  apps/web/lib/commercial/product-access.test.ts
```

## Ops notes

1. Existing orgs **lose Quality in the shell** until a trial/subscription grants `qep` to the org **and** the user.
2. Start trial: sign in → `/pricing` → Individual/Business → PayFast form (or ops `recordManualPayment` in non-prod).
3. Convert due trials (cron/ops): `POST /api/v1/billing/subscriptions/convert-trials` with billing.admin.
4. Self-serve register: set `NEXT_PUBLIC_ALLOW_SELF_SERVE_REGISTER=true`.
5. Marking a future product `available` in `PRODUCT_CATALOGUE` + module map is enough for shell mutation — no Activity Bar rewrite.
6. Product access ledger: `apps/web/.data/product-access/ledger.json` (when persist enabled).
