# Marketing / Product Gate — Ops note

## Unlock Quality (QEP) for an org

1. Sign in as org admin.
2. Open `/pricing` → start Individual or Business trial (card via PayFast).
3. Confirm org subscription + personal grant (starter is auto-granted).
4. Invite members and tick **qep** under product grants.

## Convert trials

```http
POST /api/v1/billing/subscriptions/convert-trials
```

Requires `billing.admin`. Outcomes: `activated` (paid invoice), `pending_payment` (open invoice), `expired`.

## Public catalogue

```http
GET /api/v1/billing/catalogue
```

Returns plans + products (no auth). Pricing UI consumes this only.

## Coexistence

Marketing routes are public on the APZHUB web app port (`:3300`). Do not bind conflicting hosts without updating Caddy / `ENVIRONMENT.md`.
