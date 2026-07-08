# APZHUB — Commercial Readiness Assessment

> **Milestone:** M16 — Platform Stabilisation & Engineering Review  
> **Date:** 2026-07-08  
> **Type:** Analysis only — no implementation

---

## 1. Purpose

Assess readiness for internal deployment, pilot customer, production, and commercial GA across platform and product layers.

**Rating scale:** Not Ready · Validation Only · Pilot Ready · Production Ready · GA Ready

---

## 2. Deployment tier definitions

| Tier                    | Description                          |
| ----------------------- | ------------------------------------ |
| **Internal deployment** | Engineering team demo environment    |
| **Pilot customer**      | Single firm, supervised, limited SLA |
| **Production**          | Multi-firm, operational SLA, support |
| **Commercial GA**       | General availability, sales-ready    |

---

## 3. Area assessments

### Platform (M1–M7 frameworks)

| Tier       | Rating                 | Blockers                   |
| ---------- | ---------------------- | -------------------------- |
| Internal   | **Validation Only** ✅ | Usable today for demos     |
| Pilot      | **Not Ready**          | RBAC, tenant claim, CI E2E |
| Production | **Not Ready**          | M8, workers, monitoring    |
| GA         | **Not Ready**          | M8–M10 complete            |

**Rating: Validation Only**

---

### Law Platform

| Tier       | Rating              | Blockers                          |
| ---------- | ------------------- | --------------------------------- |
| Internal   | **Pilot Ready** ✅  | Full domain demo capable          |
| Pilot      | **Validation Only** | TD-P02, RBAC, outbox workers      |
| Production | **Not Ready**       | Payment entity, billing saga, ops |
| GA         | **Not Ready**       | Trust commercial, integrations    |

**Rating: Validation Only** (Pilot Ready for supervised single-firm demo)

---

### Trust Accounting

| Tier       | Rating                 | Blockers                             |
| ---------- | ---------------------- | ------------------------------------ |
| Internal   | **Validation Only** ✅ | Engine + API + workbench             |
| Pilot      | **Not Ready**          | Bank feeds, RBAC, bundle unification |
| Production | **Not Ready**          | Three-way reconciliation, workers    |
| GA         | **Not Ready**          | Regulatory certification, audit      |

**Rating: Validation Only**

---

### APIs

| Tier       | Rating              | Blockers                             |
| ---------- | ------------------- | ------------------------------------ |
| Internal   | **Pilot Ready** ✅  | REST surface complete                |
| Pilot      | **Validation Only** | Tenant claim, rate limiting          |
| Production | **Not Ready**       | OpenAPI complete, API keys, webhooks |
| GA         | **Not Ready**       | SLA, versioning policy, deprecation  |

**Rating: Validation Only**

---

### Persistence

| Tier       | Rating              | Blockers                      |
| ---------- | ------------------- | ----------------------------- |
| Internal   | **Pilot Ready** ✅  | Postgres + RLS + migrations   |
| Pilot      | **Validation Only** | Workers, tenant auth wiring   |
| Production | **Not Ready**       | Backup/restore, HA, FK policy |
| GA         | **Not Ready**       | Multi-region, DR              |

**Rating: Validation Only**

---

### Workbench

| Tier       | Rating              | Blockers                           |
| ---------- | ------------------- | ---------------------------------- |
| Internal   | **Pilot Ready** ✅  | Full shell + Law modules           |
| Pilot      | **Validation Only** | Real RBAC hiding, permission UI    |
| Production | **Not Ready**       | Session HA, preference persistence |
| GA         | **Not Ready**       | White-label, multi-workspace       |

**Rating: Validation Only**

---

### Developer Experience

| Tier       | Rating              | Blockers                               |
| ---------- | ------------------- | -------------------------------------- |
| Internal   | **Pilot Ready** ✅  | Docs, tests, local dev                 |
| Pilot      | **Validation Only** | CI automation, OpenAPI complete        |
| Production | **Not Ready**       | Deployment guide, runbooks             |
| GA         | **Not Ready**       | SDK packages published, support portal |

**Rating: Validation Only**

---

## 4. Summary matrix

| Area                 | Internal        | Pilot           | Production | GA        |
| -------------------- | --------------- | --------------- | ---------- | --------- |
| Platform             | Validation Only | Not Ready       | Not Ready  | Not Ready |
| Law Platform         | Pilot Ready     | Validation Only | Not Ready  | Not Ready |
| Trust Accounting     | Validation Only | Not Ready       | Not Ready  | Not Ready |
| APIs                 | Pilot Ready     | Validation Only | Not Ready  | Not Ready |
| Persistence          | Pilot Ready     | Validation Only | Not Ready  | Not Ready |
| Workbench            | Pilot Ready     | Validation Only | Not Ready  | Not Ready |
| Developer Experience | Pilot Ready     | Validation Only | Not Ready  | Not Ready |

---

## 5. Critical path to pilot

1. M8 RBAC seed (`TD-M8-RBAC`)
2. Auth tenant claim (`TD-P02`)
3. Outbox workers (`TD-P18`)
4. GitHub Actions CI (`TD-M16-M02`)
5. Client bundle hardening (`TD-T03`)
6. Operator deployment guide

**Estimated:** 2–3 sprints after M8 approval

---

## 6. Critical path to production

Pilot items plus:

1. Payment entity and billing saga
2. Rate limiting and API keys
3. Backup/restore and monitoring
4. Trust bank integration (if trust in scope)
5. Load testing baseline
6. Security penetration test

**Estimated:** 6+ sprints post-pilot

---

## 7. Critical path to commercial GA

Production items plus:

1. Multi-firm operational provenance
2. Administration Workspace (014)
3. External event bus (M10)
4. Search index at scale (020)
5. Commercial support and SLA
6. Regulatory trust certification (jurisdiction-specific)

**Estimated:** 12+ months from pilot

---

## 8. Verdict

**APZHUB is ready for internal demonstration and supervised single-firm validation.**

**APZHUB is not ready for unsupervised pilot, production, or commercial GA** without M8, workers, and security hardening.

This is **intentional and appropriate** for the product validation phase.

---

_Related: [v6.0 Architecture Review](./APZHUB-v6.0-Architecture-Review.md) · [Security Review](../architecture/APZHUB-Platform-Security-Review.md)_
