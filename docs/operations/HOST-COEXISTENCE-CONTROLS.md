# APZHUB Host Coexistence Capacity Controls

> **Programme:** APZHUB-1.2-004  
> **Backlog:** **R12-OPS-03**  
> **Risk:** OPS-R-01  
> **Date:** 2026-07-20  
> **Host evidence:** [ENVIRONMENT.md](../../ENVIRONMENT.md)

---

## Purpose

Keep APZHUB and legacy `apz-stack` co-resident without port or capacity collisions. Controls are **guards + audits**, not legacy remapping.

## Reserved APZHUB host ports

Authoritative catalogue: `@apzhub/platform-operations` → `APZHUB_RESERVED_HOST_PORTS`.

| Service          | Host port             |
| ---------------- | --------------------- |
| `@apzhub/web`    | 3300                  |
| Storybook        | 6006                  |
| PostgreSQL       | **54334** (not 54333) |
| Redis            | **6380**              |
| Caddy HTTP/HTTPS | **3080** / **3443**   |

Compose: `infrastructure/docker/docker-compose.dev.yml`

## Forbidden for APZHUB compose

Includes legacy `apzpg` **54333**, gateway **8080**, engine debug **18081–18088**, and other ENVIRONMENT.md listeners. Full set: `FORBIDDEN_LEGACY_HOST_PORTS`.

## Capacity thresholds

Encoded in `HOST_CAPACITY_THRESHOLDS` (disk %, port conflicts, PG/Redis pressure signals). Planning narrative: [CAPACITY-PLANNING.md](./CAPACITY-PLANNING.md).

## Audit

```bash
pnpm ops:host-coexistence-audit
```

Optional live conflict scan (read-only docker port inspection):

```bash
pnpm ops:host-coexistence-audit -- --live
```

## Change rules

1. Do **not** bind APZHUB services onto forbidden legacy ports.
2. Adding a new APZHUB host port requires simultaneous updates to ENVIRONMENT.md + reserved catalogue + compose.
3. Host-wide Changes that may disrupt `apz-stack` require Owner Approval.
4. Never “fix” coexistence by redesigning the platform or killing legacy engines without Approval.

## Evidence

[evidence/host-coexistence/](./evidence/host-coexistence/README.md)
