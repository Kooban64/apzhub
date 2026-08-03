# APZHUB public host bring-up — apzhub.apzportal.apzor.com

| Field       | Value                                                           |
| ----------- | --------------------------------------------------------------- |
| Timestamp   | 20260803T160614Z (ops note after PBR-APZQEP-161)                |
| Purpose     | Owner hands-on Wave 1 validation without disturbing `apz-stack` |
| Engineering | Not a Wave 2 programme — ops only                               |

## Target

`https://apzhub.apzportal.apzor.com` → host nginx → `127.0.0.1:3300` → `@apzhub/web`

## Already in place (2026-08-03)

| Check                                 | State                                                         |
| ------------------------------------- | ------------------------------------------------------------- |
| DNS `apzhub.apzportal.apzor.com`      | Resolves to host                                              |
| nginx vhost `05-apzhub-platform.conf` | Installed; proxies to `:3300`                                 |
| Dedicated TLS certificate             | Issued via certbot (HTTP-01)                                  |
| APZHUB Postgres `:54334`              | Healthy                                                       |
| APZHUB Redis `:6380`                  | Healthy                                                       |
| Login route                           | HTTP 200 observed                                             |
| `/api/health` platformReady           | **false** on current process (needs production rebuild/start) |
| Home / automation workspace           | HTTP 500 on current process                                   |

## Remaining ops steps (Owner / operator)

1. Stop the current `next start` process on `:3300`.
2. Ensure `.env` has:
   - `NODE_ENV=production`
   - `APP_URL=https://apzhub.apzportal.apzor.com`
   - `NEXT_PUBLIC_APP_URL=https://apzhub.apzportal.apzor.com`
   - `BETTER_AUTH_URL=https://apzhub.apzportal.apzor.com`
3. Rebuild: `pnpm --filter @apzhub/web build`
4. Start standalone (recommended for `output: "standalone"`):

```bash
cd /home/ubuntu/apz-portal/apps/web
HOSTNAME=0.0.0.0 PORT=3300 NODE_ENV=production \
  node .next/standalone/apps/web/server.js
```

5. Verify:

```bash
curl -sS https://apzhub.apzportal.apzor.com/api/health
# expect platformReady true (or degraded with clear reasons)
curl -sS -o /dev/null -w '%{http_code}\n' https://apzhub.apzportal.apzor.com/workspace/qep/automation
```

6. Follow [APZQEP-161R Quick Start](../products/apzqep/v1.1/apzqep-161r/QUICK-START-GUIDE.md) and [Demo Script](../products/apzqep/v1.1/apzqep-161r/DEMO-SCRIPT.md).

## Coexistence rules

- Do **not** bind APZHUB to `:8080`, `:54333`, or engine debug ports `18081–18088`.
- Do **not** change legacy `apzportal.apzor.com` routing.
- Wildcard LE cert is expired; keep using the dedicated `apzhub` cert (or renew wildcard separately via DNS-01).
