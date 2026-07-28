# APZHUB Infrastructure Catalogue (Enterprise Architecture)

> **Programme:** APZHUB-ARCHITECTURE-001  
> **Classification:** DOCUMENTATION ONLY  
> **Authority:** [ENVIRONMENT.md](../../ENVIRONMENT.md) · `infrastructure/docker/` · `.github/workflows/`  
> **Date:** 2026-07-19

---

## Purpose

EA inventory of **development / host / runtime infrastructure** for APZHUB. Does not redefine legacy apz-stack ownership.

---

## Inventory

| Component                   | Role                                                    | Evidence                                                     | Status                                                        |
| --------------------------- | ------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| **Development Environment** | Monorepo path `/home/ubuntu/apz-portal`; pnpm workspace | ENVIRONMENT.md · root package.json                           | **In Development** host; product slices Production            |
| **Production Environment**  | Target deploy topology (self-hosted)                    | Ops / PRH guides                                             | **Planning / ops docs** — follow coexistence rules            |
| **Docker**                  | Dev compose for platform deps                           | `infrastructure/docker/docker-compose.dev.yml`               | **Operational** (dev)                                         |
| **PostgreSQL**              | Platform metadata SoR                                   | APZHUB port **54334** (coexist with legacy **54333**)        | **Operational** (dev)                                         |
| **Redis**                   | Cache / sessions / queues (platform)                    | APZHUB port **6380**                                         | **Operational** (dev)                                         |
| **Caddy**                   | Edge TLS / reverse proxy (primary per 004)              | Ports **3080 / 3443**                                        | **Operational** (dev)                                         |
| **Next.js apps**            | `apps/web` (and law-platform)                           | Dev port **3300** (web)                                      | **Operational**                                               |
| **AWS**                     | Possible host/cloud (ops docs)                          | Governance / DR overviews                                    | **Concept / ops** — no mandatory cloud coupling in foundation |
| **CI/CD**                   | GitHub Actions                                          | `.github/workflows/ci.yml` · GHA Reference Adapter **0.1.0** | **Operational** (CI) + frozen reference adapter               |
| **Object storage**          | S3-compatible (platform files)                          | Stack standard 004                                           | **Planned / as configured**                                   |
| **Host nginx**              | Legacy edge **80/443**                                  | ENVIRONMENT.md                                               | **Legacy** — do not disrupt                                   |

---

## Coexistence rule

APZHUB ports are chosen to avoid conflicts with legacy `apz-stack`. Changes that disrupt running host services require Owner Approval ([ENVIRONMENT.md](../../ENVIRONMENT.md)).

---

## Related

- [ENTERPRISE-ARCHITECTURE-CATALOGUE.md](./ENTERPRISE-ARCHITECTURE-CATALOGUE.md)
- [OBSERVABILITY-CATALOGUE.md](./OBSERVABILITY-CATALOGUE.md)
