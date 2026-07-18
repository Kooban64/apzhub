# APZHUB Plane Environment Guide

**Milestone:** OSS-101-02  
**Status:** Environment setup guide — no Plane deployment in APZHUB repo yet

---

## Principles

1. Plane is an **internal engine** — not routed to APZHUB users
2. APZHUB monorepo uses **non-conflicting ports** with legacy `apz-stack` (see `ENVIRONMENT.md`)
3. Configuration via `@apzhub/config` governance registry only
4. Default: **`PLANE_INTEGRATION_ENABLED=false`**

---

## Local development

### Option A — Legacy host Plane (reference)

Legacy stack runs Plane at:

| Item            | Value                                                     |
| --------------- | --------------------------------------------------------- |
| Public hostname | `apzprojects.apzportal.apzor.com`                         |
| Host debug port | `18085`                                                   |
| Stack           | `apz-stack` (`/home/ubuntu/apzportal/docker/compose.yml`) |

**APZHUB dev `.env` (illustrative — do not expose to users):**

```bash
PLANE_INTEGRATION_ENABLED=true
PLANE_BASE_URL=http://localhost:18085
PLANE_API_BASE_URL=http://localhost:18085/api
PLANE_API_TOKEN=<service-account-token-from-plane-admin>
PLANE_WORKSPACE_ID=<workspace-slug-or-uuid>
```

Obtain API token from Plane CE admin (operator-only — not APZHUB user flow).

### Option B — Dedicated Plane Compose (OSS-101-02+ future)

Dedicated Plane CE compose for APZHUB dev will be added in a later phase when adapter implementation begins. Expected pattern:

- Internal Docker network only
- No public vhost in APZHUB Caddy
- Pin Plane CE version per [Plane Deployment Notes](./APZHUB-Plane-Deployment-Notes.md)

---

## Environment variables

Copy from `.env.example`:

```bash
PLANE_INTEGRATION_ENABLED=false
# Uncomment and set when testing adapter (OSS-101-04+)
```

---

## Coexistence with legacy stack

| Service           | Legacy port | APZHUB dev ports        |
| ----------------- | ----------- | ----------------------- |
| APZHUB web        | —           | 3300                    |
| APZHUB PostgreSQL | —           | 54334                   |
| Plane (legacy)    | 18085       | Internal reference only |

Do not modify legacy `apz-stack` Plane without owner approval.

---

## Production assumptions

- Plane CE self-hosted on internal network
- TLS termination at edge; adapter uses internal HTTP or mTLS
- API token from Vault (PCv2-04) — not plain env in production long-term
- One Plane workspace per platform tenant (provisioned OSS-101-04)
- No user-visible Plane hostname in DNS for standard users

---

## Verification (configuration only)

```bash
pnpm --filter @apzhub/config test plane-config-diagnostics
```

With integration enabled in `.env`, call platform configuration diagnostics API (operator):

`GET /api/platform/v1/operations/configuration` — includes registry entries for Plane keys (masked secrets).

Plane HTTP health probe: **OSS-101-04** (adapter foundation).

---

## Related

- [Plane Configuration Notes](./APZHUB-Plane-Configuration-Notes.md)
- [ENVIRONMENT.md](../../ENVIRONMENT.md)
- [Plane Deployment Notes](./APZHUB-Plane-Deployment-Notes.md)
