# Human-ready browser audit

| Field    | Value                                                                                               |
| -------- | --------------------------------------------------------------------------------------------------- |
| Script   | `pnpm audit:human-ready` → `scripts/human-ready-browser-audit.ts`                                   |
| Evidence | `docs/operations/evidence/human-ready-browser-audit-*.json`                                         |
| Host     | Prefer `PLAYWRIGHT_BASE_URL` matching the browsing origin (public HTTPS or `http://127.0.0.1:3300`) |

## What it covers

- Public marketing routes + home CTAs (`Explore Products`, `View Solutions`) + header nav
- Demo personas via UI Quick Login: superadmin, platform_admin, finance, support, compliance, org_admin, org_member, individual
- Operator shell menus (console / ops / finance / compliance / org)
- Workspace product routes + create-user wizard smoke
- CSS chunk health (unstyled-page detector)
- Provider-brand leakage scan in visible text

## Fixes landed from this audit pass (2026-08-16)

1. **Same-origin auth client** — `packages/auth/src/client.ts` uses `window.location.origin` so CSP `connect-src 'self'` does not block login when HTML is served from `127.0.0.1` while `NEXT_PUBLIC_APP_URL` is the public host.
2. **Prod bind host** — `scripts/run-web-prod.sh` forces `0.0.0.0` (do not inherit machine `HOSTNAME`).
3. **`/workspace/settings`** — redirects to `/workspace/personalisation` (server page + catch-all client alias).
4. **Auth rate limit** — Better Auth window raised; **`/get-session` exempt** (middleware hits it on every protected navigation). Sign-in keeps a dedicated cap.
5. **Middleware false logout** — transient get-session failures (429/5xx/network) with a present session cookie no longer redirect to `/login`; route handlers remain authoritative.
6. **Org members UX** — removed nested `QepPageShell` under Operator shell (double chrome / slower wizard paint).
7. **Product switcher** — always mounts a header control (loading / empty / entitled) so chrome does not vanish while entitlements load.
8. **OperatorGate persona default** — never invent `org_member` when `/api/v1/me/home-context` fails; that falsely ejected org admins from `/org/*` mid-walkthrough.

## Known root cause of “mid-walkthrough logout”

Cookies remained valid while middleware self-fetch to `/api/auth/get-session` returned non-OK (typically rate-limit). Middleware previously treated that as signed-out → `callbackUrl` bounce. Fixed by (4)+(5). A second false-eject path defaulted failed home-context to `org_member` inside OperatorGate — fixed by (8).

## How to re-run

```bash
# Against live prod on this host
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3300 pnpm audit:human-ready

# Against public URL (recommended for Owner walkthrough parity)
PLAYWRIGHT_BASE_URL=https://apzhub.apzportal.apzor.com pnpm audit:human-ready
```

## Latest green run

| Field    | Value                                                                   |
| -------- | ----------------------------------------------------------------------- |
| Evidence | `docs/operations/evidence/human-ready-browser-audit-1786914984188.json` |
| Result   | **0 blockers, 0 majors, 146 checks** (2026-08-16)                       |
| Origin   | `http://127.0.0.1:3300`                                                 |

Personas landed correctly; org create-user wizard advanced; workspace chrome + product switcher present for org_member and individual.
