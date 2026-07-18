# APZHUB Support Vertical Slice — Master Certification Report

**Certification ID:** OSS-110-12 (API vertical) · UI certified OSS-110-14  
**Date:** 2026-07-11 (API) · UI update 2026-07-11  
**API Outcome:** **CERTIFIED_WITH_LIMITATIONS**  
**UI Outcome:** **PRODUCTION_READY_WITH_LIMITATIONS** (OSS-110-14)  
**Issued by:** APZHUB Engineering (automated certification suite)

---

## Executive summary

The APZHUB Support Vertical Slice — comprising the Support HTTP API layer (`apps/web/app/api/v1/support-*`), support handlers and schemas, platform services support layer, and Zammad provider bridge — remains **CERTIFIED_WITH_LIMITATIONS** (OSS-110-12).

The Support Module UI (OSS-110-13 delivery + OSS-110-14 certification) is separately **PRODUCTION_READY_WITH_LIMITATIONS**. Full UI→`/api/v1`→gateway→services→mapping→provider→adapter chain certified under mocked API (no live Zammad). See [SUPPORT-UI-CERTIFICATION.md](./SUPPORT-UI-CERTIFICATION.md).

The Support Vertical delivers a production-ready, architecturally compliant REST API for support request management backed by a mocked/real Zammad instance. All mandatory architectural boundaries are respected. All platform ID contracts are upheld. The full test pyramid (unit → service → HTTP integration → E2E stack → certification assertions → performance baseline) passes for the API vertical; UI certification evidence is in OSS-110-14 companions.

---

## Certification outcomes

| Layer                                                    | Outcome                               | Milestone  |
| -------------------------------------------------------- | ------------------------------------- | ---------- |
| HTTP → Gateway → Services → Mapping → Provider → Adapter | **CERTIFIED_WITH_LIMITATIONS**        | OSS-110-12 |
| Support Module UI (workbench)                            | **PRODUCTION_READY_WITH_LIMITATIONS** | OSS-110-14 |

### Justification for API `CERTIFIED_WITH_LIMITATIONS` (not defects)

The following limitations are **accepted constraints** documented at design time, not defects requiring remediation before API certification:

| Limitation                                                                   | Category                             | Status                                                             |
| ---------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------ |
| **No Platform Event Bus publication** — notifications/events not wired       | Infrastructure dependency            | Unchanged                                                          |
| **No webhook HTTP ingress** — Zammad webhook delivery not consumed           | Infrastructure dependency            | Unchanged                                                          |
| **No binary attachment transfer** — attachment upload/download deferred      | Adapter limitation (from OSS-102-08) | Unchanged                                                          |
| **Durable idempotency deferred** — persistent sync state uses in-memory only | Deployment concern                   | Unchanged                                                          |
| **Next.js `/_global-error` build caveat** — known App Router behaviour       | Framework quirk                      | Unchanged                                                          |
| **Support UI**                                                               | Was pending UI cert                  | **Resolved OSS-110-14** — UI **PRODUCTION_READY_WITH_LIMITATIONS** |

### Justification for UI `PRODUCTION_READY_WITH_LIMITATIONS`

See [SUPPORT-UI-CERTIFICATION.md](./SUPPORT-UI-CERTIFICATION.md): architecture/dependency PASS; Playwright 23; Vitest 72; coverage ~94.9% lines; remaining Event Bus / webhook / notifications / realtime / binary / permission-wildcard / heuristic overdue / mocked visual baselines / `/_global-error` caveats.

---

## Scope

### What IS certified (API — OSS-110-12)

| Layer             | Component                                                                           | Status       |
| ----------------- | ----------------------------------------------------------------------------------- | ------------ |
| HTTP API          | 21 support endpoints across 6 resource families                                     | ✅ CERTIFIED |
| Handlers          | `apps/web/lib/api/v1/handlers/support.ts` (771 lines)                               | ✅ CERTIFIED |
| Schemas           | `apps/web/lib/api/v1/schemas/support.ts` (298 lines)                                | ✅ CERTIFIED |
| Platform Services | `support-service-impls.ts` (1,239 lines) + `support-mapping-helpers.ts` (103 lines) | ✅ CERTIFIED |
| Providers         | 11 Zammad provider files under `packages/platform-services/src/providers/zammad/`   | ✅ CERTIFIED |
| Mapping           | Entity mapping: `sreq_`, `sorg_`, `sgrp_`, `suser_`, `sart_` platform IDs           | ✅ CERTIFIED |
| Authorization     | 23+ support.* permissions in catalogue; all operations mapped                       | ✅ CERTIFIED |
| OpenAPI           | APZHUB-Platform-OpenAPI-v1.yaml contains all support paths                          | ✅ CERTIFIED |

### What IS certified (UI — OSS-110-14)

| Layer                             | Component                                        | Status                               |
| --------------------------------- | ------------------------------------------------ | ------------------------------------ |
| Workbench UI                      | Manifests, router, views, typed `/api/v1` client | ✅ PRODUCTION_READY_WITH_LIMITATIONS |
| A11y / responsive / visual / perf | Playwright certification suite                   | ✅ Certified (mocked)                |

### What is NOT certified / not delivered

| Feature                         | Why not in scope                                |
| ------------------------------- | ----------------------------------------------- |
| Event Bus integration           | Requires platform Event Bus (future sprint)     |
| Webhook ingress                 | Requires webhook infrastructure (future sprint) |
| Binary attachment API           | Adapter limitation documented in OSS-102-08     |
| Notifications / realtime        | Explicit exclusions                             |
| Persistent sync / durable state | Deployment config; in-memory used in testing    |
| Live Zammad UI E2E              | UI cert uses mocked `/api/v1`                   |

---

## Architecture compliance

All checks from `docs/sprint/OSS-110-12-architecture-audit.md` pass (API). UI architecture: `docs/sprint/OSS-110-14-architecture-audit.md` **PASS**.

| Principle                                                            | Verdict              |
| -------------------------------------------------------------------- | -------------------- |
| Layered architecture (003) — no layer bypass                         | ✅ PASS              |
| Module → Platform Service → Connector → Engine (008)                 | ✅ PASS              |
| Platform ID contract: platform IDs to clients, provider IDs internal | ✅ PASS              |
| Security: auth + authz + validation on every route (013)             | ✅ PASS              |
| Zero Trust: no implicit trust at any layer                           | ✅ PASS              |
| No module-to-module coupling                                         | ✅ PASS              |
| No integration-zammad in HTTP handler layer                          | ✅ PASS              |
| OpenAPI documentation complete                                       | ✅ PASS              |
| UI → `/api/v1` only (no gateway/provider in presentation)            | ✅ PASS (OSS-110-14) |

---

## Test results summary

### API vertical (verified 2026-07-11 — OSS-110-12)

| Test suite                                      | Tests                     | Result      |
| ----------------------------------------------- | ------------------------- | ----------- |
| `platform-api.support.v1.test.ts`               | 48 HTTP API tests         | ✅ PASS     |
| `support-platform-services.test.ts`             | 20 platform service tests | ✅ PASS     |
| `support-vertical-stack.e2e.test.ts`            | 17 full stack tests       | ✅ PASS     |
| `support-vertical-certification.test.ts`        | 59 assertion tests        | ✅ PASS     |
| `support-vertical-performance.baseline.test.ts` | 2 performance tests       | ✅ PASS     |
| **Total**                                       | **146 tests**             | **✅ PASS** |
| Dependency audit script                         | 0 violations              | ✅ PASS     |

### UI certification (verified 2026-07-11 — OSS-110-14)

| Suite                                | Result                       |
| ------------------------------------ | ---------------------------- |
| Playwright `oss-110-14-support*`     | **23 passed**                |
| Vitest Support UI                    | **72 passed** (~94.9% lines) |
| `support-ui-certification-audit.mjs` | PASS 17/17                   |
| Vertical dependency (still)          | PASS 0/36                    |

---

## Dependency & boundary audit

**API Script:** `scripts/support-vertical-dependency-audit.mjs`  
**Verdict:** PASS (0 violations)

**UI Script:** `scripts/support-ui-certification-audit.mjs`  
**Verdict:** PASS (17/17)

Rules verified (API):

- No `@apzhub/integration-zammad` in HTTP handler/route/schema layer
- No `EntityMappingStore` in HTTP layer
- No database clients in HTTP layer
- No direct provider imports in HTTP layer
- No Zammad REST types in HTTP layer
- No Next.js imports in Zammad providers
- No `apps/web` imports in Zammad providers
- No `@apzhub/integration-zammad` in support service impls

---

## Known limitations register

1. **Support UI certified with limitations** — OSS-110-14 outcome **PRODUCTION_READY_WITH_LIMITATIONS**. See [SUPPORT-UI-CERTIFICATION.md](./SUPPORT-UI-CERTIFICATION.md). API vertical remains **CERTIFIED_WITH_LIMITATIONS**.

2. **No Event Bus** — Support operations do not publish platform events. Audit, search indexing, and notification flows that depend on the Event Bus are deferred pending Event Bus infrastructure. UI does not subscribe to bus-driven refresh.

3. **No webhook ingress** — Zammad webhook delivery (inbound HTTP callbacks from Zammad to APZHUB) is not implemented. The adapter's webhook service is present but not wired to HTTP ingress.

4. **No binary attachments** — File upload/download for ticket attachments is deferred. The UI shows attachment metadata only (“Binary access not available”).

5. **No notifications / realtime** — No Attention Engine wiring; no WS/SSE Support channels.

6. **UI permission wildcard** — UI helpers may default to `support.*`; HTTP authz remains authoritative.

7. **Overdue heuristic** — Analytics overdue is not an SLA clock.

8. **Durable idempotency deferred** — Sync state persistence uses `InMemoryEntityMappingStore` in test environments. Production deployment requires PostgreSQL mapping store configuration.

9. **Next.js `/_global-error` build caveat** — A known Next.js App Router build note about `/_global-error` is not related to the Support vertical and does not affect runtime behaviour.

10. **Visual baselines mocked** — Chromium snapshots against mocked API fixtures (OSS-110-14).

---

## Recommended next milestone

**Do not invent OSS-110-15 Support UI expansion by default.**

Await **owner approval** for the next APZHUB domain or platform milestone on the ratified roadmap, for example:

- **OSS-100-06** — Integration SDK webhook & polling contracts
- **PCv2-02** / Platform Core production work
- **QE-001** — Quality Engineering start
- Or another owner-approved domain

Any Event Bus, webhook HTTP ingress, notifications, realtime, or binary attachment work for Support requires a **separately approved** milestone.

Architecture reference: [APZHUB-Support-Module-UI.md](./APZHUB-Support-Module-UI.md) · UI cert: [SUPPORT-UI-CERTIFICATION.md](./SUPPORT-UI-CERTIFICATION.md) · Completion: [OSS-110-14-completion-report.md](../sprint/OSS-110-14-completion-report.md)

---

## Companion documents

| Document                          | Location                                              |
| --------------------------------- | ----------------------------------------------------- |
| Architecture audit (API)          | `docs/sprint/OSS-110-12-architecture-audit.md`        |
| Dependency audit (API)            | `docs/sprint/OSS-110-12-dependency-audit.md`          |
| Support API certification         | `docs/sprint/OSS-110-12-Support-API-Certification.md` |
| Performance baseline (API)        | `docs/sprint/OSS-110-12-performance-baseline.md`      |
| Test summary (API)                | `docs/sprint/OSS-110-12-test-summary.md`              |
| Support Module UI architecture    | `docs/architecture/APZHUB-Support-Module-UI.md`       |
| Support UI Certification (master) | `docs/architecture/SUPPORT-UI-CERTIFICATION.md`       |
| OSS-110-13 completion             | `docs/sprint/OSS-110-13-completion-report.md`         |
| OSS-110-14 completion             | `docs/sprint/OSS-110-14-completion-report.md`         |
| OSS-110-14 architecture audit     | `docs/sprint/OSS-110-14-architecture-audit.md`        |
| OSS-110-14 dependency audit       | `docs/sprint/OSS-110-14-dependency-audit.md`          |
| Wave Index                        | `docs/sprint/OSS-110-12-Wave-Index.md`                |
| Wave 2 certification (base)       | `docs/sprint/OSS-102-08-Wave2-Certification.md`       |
