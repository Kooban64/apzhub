# APZHUB Plane Deployment Notes

**Milestone:** OSS-101-02  
**Status:** Planning — no Plane deployment in APZHUB monorepo yet

---

## Deployment model

Plane CE runs as a **self-hosted engine** behind the adapter boundary. It is **not** part of the APZHUB user-facing edge.

```text
Users → APZHUB Gateway → ProjectService → PlaneAdapter → Plane CE (internal)
```

---

## Local development

| Approach                                        | Status                                             |
| ----------------------------------------------- | -------------------------------------------------- |
| Reference legacy `apz-stack` Plane (port 18085) | Available on host — see ENVIRONMENT.md             |
| APZHUB-dedicated Plane Compose                  | Planned when OSS-101-04 begins — not in OSS-101-02 |

### Docker Compose expectations (future)

When added, Plane stack should include:

- Plane API / web services (CE)
- Dedicated PostgreSQL (not platform PostgreSQL)
- Redis / MQ / MinIO per Plane CE requirements
- Internal network only — no APZHUB Caddy route for user traffic

Pin image tags — no `latest`.

---

## Production assumptions

| Topic    | Assumption                                                 |
| -------- | ---------------------------------------------------------- |
| Edition  | Plane Community Edition (CE) only unless owner approves EE |
| Network  | Internal VPC / Docker network; adapter-only access         |
| TLS      | Edge TLS at Caddy; internal HTTP or service mesh mTLS      |
| Scaling  | Single Plane instance per deployment phase; HA deferred    |
| Tenancy  | One Plane workspace per APZHUB platform tenant             |
| Identity | Service account tokens — not user Plane logins             |

---

## Backup and restore

| Component                    | Owner      | Strategy                                  |
| ---------------------------- | ---------- | ----------------------------------------- |
| Plane PostgreSQL             | Engine ops | Plane DR runbook — pg_dump per Plane docs |
| Plane object storage (MinIO) | Engine ops | Bucket backup if attachments used         |
| Platform entity mappings     | Platform   | Platform PostgreSQL backup (OSS-101-04+)  |
| API tokens                   | Platform   | Vault backup (PCv2-04)                    |

**RPO/RTO:** Document per environment in ops runbook (OSS-101-09).

Restore order: Plane DB → verify adapter health → reconcile mappings.

---

## Upgrade strategy

1. Pin Plane CE version in deployment manifest
2. Run adapter contract tests against target version
3. Upgrade adapter first (if API changes), then Plane
4. Staged rollout: dev → staging → tenant batches
5. Rollback: revert Plane image + adapter version pin

Version compatibility range: `0.23.0` – `0.24.x` (initial — confirm at pin time).

---

## Secret handling

| Secret                 | Storage (current)        | Storage (target)    |
| ---------------------- | ------------------------ | ------------------- |
| `PLANE_API_TOKEN`      | Environment variable     | Vault ref (PCv2-04) |
| `PLANE_WEBHOOK_SECRET` | Environment variable     | Vault ref           |
| Connection URLs        | Environment (non-secret) | Config provider     |

- Never commit tokens to repo
- Mask in diagnostics and logs (`credential` / `secret` classification)
- Rotate on compromise — adapter reconnect without user impact

---

## Legacy coexistence

Host runs legacy Plane at `apzprojects.apzportal.apzor.com` (port 18085). APZHUB development may **reference** this instance for adapter testing — do not reconfigure legacy stack in OSS-101-02.

APZHUB production Plane should be a **separate** deployment when Wave 1 goes live.

---

## Related

- [Plane Environment Guide](./APZHUB-Plane-Environment-Guide.md)
- [Plane Configuration Notes](./APZHUB-Plane-Configuration-Notes.md)
- [OSS-101 Backlog](../backlog/OSS-101-Plane-Integration-Backlog.md)
