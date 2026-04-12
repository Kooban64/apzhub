# Single edge Caddy (one host, dual hostname)

Use this when **staging** and **production** app stacks run on the **same machine** and each stack’s `web` service publishes a **different host port** (via `APZHUB_WEB_PUBLISH_PORT` in each stack’s `.env`).

Recommended **one-host** sequence (see also [deploy/README.md](../README.md) § “First real run”):

1. Bring up **staging** only: `postgres`, `migrate`, `web`, `worker` (no `bundled-caddy`).
2. Optionally smoke staging on the host port: `BASE_URL=http://127.0.0.1:3001` (see repo root `deploy/scripts/smoke.sh`).
3. Bring up **production** the same way (`web` on host port `3000` by default).
4. Start **this** edge stack **once** (below). After that, `https://staging.apzportal.apzor.com` and `https://apzportal.apzor.com` can both work (DNS + ports 80/443 open).

Commands:

```bash
cd deploy/staging && docker compose --env-file .env up -d --build postgres migrate web worker
cd deploy/production && docker compose --env-file .env up -d --build postgres migrate web worker
cd deploy/edge
cp ../Caddyfile.dual-host.example ./Caddyfile
docker compose up -d
```

This compose file uses **`network_mode: host`** so the Caddyfile can `reverse_proxy` to `127.0.0.1:3000` and `127.0.0.1:3001` (adjust ports to match your `.env` files).

**Do not** run `deploy/edge` Caddy **and** enable `bundled-caddy` on either app stack on the same host (duplicate `:80` / `:443` bind).
