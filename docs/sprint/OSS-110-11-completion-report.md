# OSS-110-11 Completion Report — Support HTTP API Surface

**Status:** Complete  
**Date:** 2026-07-11  
**Scope:** OSS-110-11 only — no Support UI, Event Bus, webhook ingress, binary attachments, or OSS-110-12

---

## Executive summary

Exposed the completed Support Platform Services (OSS-110-10) through the existing `/api/v1` HTTP surface. Thin Next.js App Router handlers validate with Zod, build trusted `ServiceRequestContext`, and invoke `PlatformServiceGateway.support*` only. Authorisation remains in `RequestPipeline` / production policies. OpenAPI 3.1 extended and validated. No Support business logic; no Zammad identifiers in responses.

**Stop condition met.** Recommended next: **OSS-110-12 — Support Vertical-Slice Certification & API Closeout** (owner approval required).

---

## Milestone scope delivered

| Area | Status |
|------|--------|
| Support request CRUD + commands | ✅ |
| Nested articles (notes / replies) | ✅ |
| Organisations / groups / users | ✅ |
| Search / history / analytics | ✅ |
| Trusted auth context + Zod | ✅ |
| Gateway-only handlers | ✅ |
| OpenAPI 3.1 Support paths | ✅ |
| Tests + architecture boundaries | ✅ |
| Zammad bootstrap flag | ✅ |
| HTTP/UI/Event Bus/ingress/binary | ❌ excluded |

---

## Architecture overview

```text
HTTP /api/v1/support-*
  → withPlatformApiAuth + Zod
  → PlatformServiceGateway.support*
  → RequestPipeline + ProductionAuthorizationProvider
  → Support*ServiceImpl
  → MappingOrchestrator
  → ProviderResolver → Zammad providers
  → @apzhub/integration-zammad adapter.core
```

---

## Routes implemented

| Method | Path | Gateway |
|--------|------|---------|
| GET/POST | `/api/v1/support-requests` | list / create |
| GET/PATCH/DELETE | `/api/v1/support-requests/{id}` | get / update / **close** |
| POST | `.../close`, `.../reopen`, `.../state`, `.../priority` | commands |
| POST/DELETE | `.../owner` | assign / clear owner |
| POST | `.../customer` | `updateSupportRequest({ requesterId })` |
| GET | `.../articles` | list |
| POST | `.../articles/notes`, `.../articles/replies` | createNote / createReply |
| GET | `.../articles/{articleId}` | get |
| GET | `.../history` | timeline |
| GET/POST | `/api/v1/support-organizations` | list / create |
| GET/PATCH/DELETE | `/api/v1/support-organizations/{id}` | get / update / archive |
| GET/POST | `/api/v1/support-groups` | list / create |
| GET/PATCH | `/api/v1/support-groups/{id}` | get / update |
| GET | `/api/v1/support-users`, `.../{userId}` | list/lookup/search / get |
| GET | `/api/v1/support-search` | unified search |
| GET | `/api/v1/support-analytics` | intelligence snapshot |

---

## Routes intentionally excluded

`support-sync` · `support-webhooks` · webhook ingress · article update/delete · binary attachment upload/download · `/tickets` · Support UI · Event Bus · notifications

---

## Canonical Support resource naming

Primary public resource: **`support-requests`**. Global ID prefixes: `sreq_`, `sorg_`, `sgrp_`, `suser_`, `sart_`. Never expose provisional `*_zammad_*` IDs.

---

## Request / response standards

Existing API v1 envelopes unchanged (`data`+`meta`, collection `page`, `error`+`meta`).

---

## Global-ID behaviour

Path/query/body IDs validated with `globalIdWithPrefix`. Wrong entity-type prefixes rejected with `400` before gateway invocation.

---

## Authentication / authorisation / tenancy

- Session → `buildServiceRequestContext` (trusted server-side only)
- Permissions: existing OSS-110-10 catalogue (`support.requests.transition` for close/reopen/state, etc.)
- Cross-tenant denials surface as governed `404` / `MAPPING_NOT_FOUND`; provider not invoked after denial (asserted in tests)

---

## Gateway bootstrap

`ZAMMAD_INTEGRATION_ENABLED=true` → `createZammadAdapter` + `registerZammadProviders`. Plane bootstrap unchanged.

---

## Validation / pagination / filtering

Strict Zod schemas; unknown query/body keys rejected; page-size capped by existing API constants.

---

## Internal notes / customer replies / attachments

- Notes always internal; replies always public-channel; separate routes
- Attachment metadata only; no binary

---

## Support user vs platform identity

Support user routes expose provider-domain users (`suser_*`). No create/update/delete of APZHUB platform identities.

---

## Analytics caveats

Overdue and similar fields are derived/heuristic — not authoritative SLA.

---

## HTTP error mapping

Existing translator: validation `400`, auth `401`, permission `403`, not found `404`, conflicts `409`, unsupported `501`, provider/store unavailable `503`, unexpected `500`.

---

## OpenAPI status

`docs/specs/APZHUB-Platform-OpenAPI-v1.yaml` — 21 Support paths, 8 tags. Validated: `pnpm openapi:validate:platform` ✅

---

## Files created

| Path | Role |
|------|------|
| `apps/web/lib/api/v1/schemas/support.ts` | Zod validation |
| `apps/web/lib/api/v1/handlers/support.ts` | Gateway-only handlers |
| `apps/web/app/api/v1/support-*/**/route.ts` | 21 App Router modules |
| `apps/web/lib/api/v1/platform-api.support.v1.test.ts` | Support API tests |
| `docs/architecture/APZHUB-Support-HTTP-API.md` | Architecture |
| `docs/sprint/OSS-110-11-completion-report.md` | This report |

## Files modified

| Path | Change |
|------|--------|
| `apps/web/lib/api/v1/gateway/bootstrap.ts` | Zammad registration |
| `apps/web/lib/api/v1/testing/fixtures.ts` | Support mocks/builders |
| `apps/web/lib/api/v1/wave1-stack.e2e.test.ts` | Session typing fix (typecheck) |
| `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml` | Support paths/schemas |
| `docs/architecture/APZHUB-Platform-HTTP-API.md` | Route catalogue |
| `apps/web/package.json` | `@apzhub/integration-zammad` dep |
| `tsconfig.base.json` | path alias |
| Foundation docs / CHANGELOG / docs/README | Closeout |

---

## Package versions

| Package | Version | Notes |
|---------|---------|-------|
| `@apzhub/web` | `0.0.0` | unchanged (app scaffold) |
| `@apzhub/platform-services` | `0.7.0` | unchanged |
| `@apzhub/platform-service-contracts` | `0.7.0` | unchanged |
| `@apzhub/integration-zammad` | `0.6.0` | unchanged |

---

## Tests

| Suite | Result |
|-------|--------|
| `platform-api.support.v1.test.ts` | **48 passed** |
| API v1 + tasks + wave1 + platform-services + contracts | **253 passed** |
| Areas | CRUD, commands, articles visibility, orgs/groups/users, search kinds, history, analytics, validation, authz, tenancy, errors, OpenAPI, no-Zammad import boundary |

---

## Coverage

Support handlers/schemas exercised by 48 dedicated tests (list/get/create/update/commands/articles/orgs/groups/users/search/history/analytics/validation/authz/tenancy/errors/OpenAPI/boundaries). Global vitest coverage include does not attribute `apps/web` lines in the shared summary — treat test depth as the coverage evidence for this milestone.

---

## Quality gates

| Gate | Result |
|------|--------|
| OpenAPI validate | ✅ |
| ESLint (Support API surface) | ✅ |
| Typecheck `@apzhub/web` | ✅ |
| API + platform regression | **253 passed** |
| `pnpm build` (apps/web) | **FAIL** — pre-existing Next.js `/_global-error` prerender (`useContext` null); unrelated to `/api/v1/support-*` |

---

## Build status

`pnpm --filter @apzhub/web build` fails on prerender of `/_global-error`:

```text
Error occurred prerendering page "/_global-error"
TypeError: Cannot read properties of null (reading 'useContext')
```

This defect is **pre-existing** (also reported in OSS-110-09/10). It is unrelated to Support HTTP handlers under `apps/web/app/api/v1/support-*` or `lib/api/v1/handlers/support.ts`. API route modules are Node.js runtime handlers and are not involved in that prerender path.

---

## Backward compatibility

Additive HTTP surface only. Existing task/project/workspace routes unchanged. Plane bootstrap unchanged.

---

## Deployment considerations

Set `ZAMMAD_INTEGRATION_ENABLED=true` plus Zammad connection env vars for live Support providers. Without the flag, Support routes return controlled unsupported/unavailable errors.

---

## Security and privacy

No article bodies/tokens in logs (existing API logging rules). Strict schemas. Cache-control on authenticated responses (existing). No secret leakage in errors.

---

## Technical debt

1. Durable idempotency store still deferred (header sanitised only if present).
2. Customer assignment composed via `updateSupportRequest` (no dedicated service method).
3. Sync/webhook admin HTTP deferred.
4. Full vertical-slice certification deferred to OSS-110-12.

---

## Risks

- Support availability depends on Zammad bootstrap health when enabled.
- Heuristic analytics fields may be misread as SLA if consumers ignore caveats.

---

## Recommendation for next milestone

**OSS-110-12 — Support Vertical-Slice Certification & API Closeout**

- Mocked HTTP → Gateway → Support services → providers → Zammad E2E
- OpenAPI-to-runtime verification
- Architecture / dependency / authz / tenancy / security audits
- Coverage certification + performance baseline
- Documentation audit + readiness before any Support UI

**Do not start OSS-110-12 without explicit owner approval.**
