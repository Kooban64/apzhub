# APZHUB Platform 1.0.0 — Deployment Overview

> **Programme:** APZHUB-PORTFOLIO-001 (Platform Release 1.0)  
> **Date:** 2026-07-19  
> **Posture:** Self-hosted first (004)

---

## Typical topology

| Component             | Role                                                                   |
| --------------------- | ---------------------------------------------------------------------- |
| Edge proxy            | Caddy (primary) / Nginx — TLS                                          |
| apps/web              | Primary Workbench + Platform HTTP                                      |
| apps/law-platform     | Law vertical app (port **3301** coexistence)                           |
| PostgreSQL            | Platform metadata + native product schemas                             |
| Redis                 | Sessions / cache as configured                                         |
| S3-compatible storage | Evidence / document blobs where used                                   |
| OSS engines           | Plane · Kimai · Zammad · Metabase · n8n (refs/secrets — never in repo) |
| Workers               | Outbox / event relay as configured                                     |

## Coexistence

Legacy `apz-stack` may share the host — see [ENVIRONMENT.md](../../../../ENVIRONMENT.md). Portfolio certification does not change ports or compose files.

## Ops entry

[OPERATIONAL-READINESS.md](./OPERATIONAL-READINESS.md) · [Operations Handbook](../guides/OPERATIONS-HANDBOOK.md)
