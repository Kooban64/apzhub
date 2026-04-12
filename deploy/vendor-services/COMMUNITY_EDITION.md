# Community / OSS posture (vendor stack)

High-level reference for **self-hosted, no paid licenses** deployments. This is **not** legal or licensing advice—verify against each upstream’s current terms and the exact image digests in [`image-pins.env`](image-pins.env).

| Product | What we run | Practical notes |
|--------|-------------|------------------|
| **Plane** | Community / self-hosted images (`APZ_IMAGE_PLANE_*`) | CE-style self-hosting; cloud-only commercial extras are simply absent. Scale and ops (Postgres, MinIO, workers) are on you. |
| **Zammad** | CE stack (`ghcr.io/zammad/zammad` pin) | AGPL self-host; Elasticsearch sizing and backups are operational concerns, not license tiers. |
| **Kimai** | OSS + custom image from vendored Dockerfile | Feature set follows Kimai OSS and your bundled plugins. |
| **Kiwi TCMS** | Public image pin | Open-source edition; behavior follows upstream releases. |
| **Paperless-ngx** | OSS (`ghcr.io/paperless-ngx` pin) | AGPL-style OSS stack; no “enterprise unlock” for core document features. |
| **n8n** | Self-hosted (`APZ_IMAGE_N8N` pin) | **Fair-code**: self-hosting the open core is free; **some features** (e.g. certain enterprise SSO, advanced security, or scale add-ons per upstream roadmap) may require a **paid n8n Enterprise license**. Treat anything beyond core workflow editing as “verify against [n8n docs](https://docs.n8n.io) for your pinned version.” |
| **Metabase** | OSS image pin | Metabase has paid tiers for embedding and some governance features; the OSS image covers a large analytics baseline—confirm before relying on embedding or SSO extras. |

## APZHUB portal

- Identity is **first-party** (`users` + local password, or optional OIDC you configure). There is **no requirement** to use a third-party IdP for the vendor apps.
- The import script ([`scripts/import-legacy-vendor-users-to-portal.ts`](../../scripts/import-legacy-vendor-users-to-portal.ts)) only reads vendor databases to seed **portal** users and **admin matrix** overrides; it does not change upstream license class.

### Superadmin semantics (product)

- **Launcher / workspace:** `superadmin` may see **all tenant-allowed** workspace services as launcher tiles and may launch them with a **synthetic provisioned posture** so operations are not blocked by per-user matrix gaps. This is **portal RBAC only**; it does not grant database superuser rights inside each vendor product.
- **Vendor apps:** Treat each product’s own admin account or supported API as the source of truth for in-app administration unless you add explicit provisioning connectors.

### Capability matrix (login, launch, provision)

Use this when planning first-party SSO or automation. “Portal matrix” = APZHUB access bundles/overrides; “Vendor native” = app’s own users.

| Product | Typical login | Launch from portal | Portal matrix → vendor RBAC |
|--------|----------------|---------------------|-----------------------------|
| **Plane** | Vendor native / optional OIDC (verify upstream) | URL or OIDC/JWT handoff (per deploy) | Legacy import + optional future connector |
| **Zammad** | Vendor native | URL / session handoff | Legacy import + optional connector |
| **Kimai** | Vendor native | URL / session handoff | Legacy import + optional connector |
| **Kiwi** | Vendor native | URL / session handoff | Legacy import + optional connector |
| **Paperless-ngx** | Remote-user header (trusted reverse proxy) or native | Header SSO path (see `upstream-from-apzportal/paperless.yml`) | Legacy import + optional connector |
| **n8n** | Vendor native (enterprise SSO features may be paid) | URL / session handoff | Legacy import + optional connector |
| **Metabase** | Vendor native | URL handoff | Not in default portal matrix |
| **Google-shaped workspace** (mail/calendar/…) | OAuth / mock in dev | OIDC/JWT per launch profile | Directory-style (mock/real adapters) |

### Provisioning dry-run profile

Set `APZHUB_PROVISIONING_CONNECTOR_PROFILE=vendor_dry_run` so the worker uses **idempotent mock connectors** per vendor service id (`plane`, `paperless`, …) in addition to mail/calendar—useful for exercising jobs without real vendor APIs.

## When you need “more” than CE/OSS

Prefer **operational** answers first (backups, HA, separate Postgres, monitoring) before assuming a paid license: many limits are scale or support, not hard code blocks. If a feature is explicitly labeled Enterprise in upstream docs, plan either to live without it or to budget for that product’s commercial offering.
