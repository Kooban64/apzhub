# APZHUB public host bring-up — apzhub.apzportal.apzor.com

| Field       | Value                                                           |
| ----------- | --------------------------------------------------------------- |
| Timestamp   | 20260803T160614Z (ops note after PBR-APZQEP-161)                |
| Purpose     | Owner hands-on Wave 1 validation without disturbing `apz-stack` |
| Engineering | Not a Wave 2 programme — ops only                               |

## Target

`https://apzhub.apzportal.apzor.com` → host nginx → `127.0.0.1:3300` → `@apzhub/web`

## Current state (verified)

| Check                                 | State                                                               |
| ------------------------------------- | ------------------------------------------------------------------- |
| DNS `apzhub.apzportal.apzor.com`      | Resolves to host                                                    |
| nginx vhost `05-apzhub-platform.conf` | Proxies to `:3300`                                                  |
| Dedicated TLS certificate             | Issued via certbot (HTTP-01); valid                                 |
| APZHUB Postgres `:54334`              | Healthy                                                             |
| APZHUB Redis `:6380`                  | Healthy                                                             |
| Runtime                               | `pnpm --filter @apzhub/web dev` on `:3300`                          |
| `/api/health`                         | **healthy** · `platformReady: true`                                 |
| Login / home / automation             | HTTP 200 (signed-out routes redirect to login as designed)          |
| Automation providers API              | HTTP 200                                                            |
| Legacy stack                          | Untouched (other `*.apzportal.apzor.com` still via gateway `:8080`) |

## Owner hands-on now

1. Open **https://apzhub.apzportal.apzor.com/login**
2. Sign in / register (dev registration enabled when configured)
3. Follow [APZQEP-161R Quick Start](../products/apzqep/v1.1/apzqep-161r/QUICK-START-GUIDE.md)
4. Run [Demo Script](../products/apzqep/v1.1/apzqep-161r/DEMO-SCRIPT.md)
5. Automation workspace: `/workspace/qep/automation`

## Optional production harden (later)

Production `next build` currently fails on an unrelated `qep-defects` Zod typecheck error. Fixing that requires a separate Owner-authorised micro-fix — **not** APZQEP-162. Until then, use the verified dev runtime for hands-on Wave 1 validation.

## Coexistence rules

- Do **not** bind APZHUB to `:8080`, `:54333`, or engine debug ports `18081–18088`.
- Do **not** change legacy `apzportal.apzor.com` routing.
- Wildcard LE cert is expired; keep using the dedicated `apzhub` cert (or renew wildcard separately via DNS-01).
