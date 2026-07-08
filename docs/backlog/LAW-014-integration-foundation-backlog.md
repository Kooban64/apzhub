# LAW-014 — Integration Foundation Backlog

> **Milestone:** LAW-014 — Integration Foundation  
> **Mode:** Planning complete — **await owner approval before LAW-014-01 implementation**  
> **Authority:** [LAW-Integration-Reference-Architecture](../architecture/LAW-Integration-Reference-Architecture.md)  
> **Last updated:** 2026-07-06

---

## Effort scale

| Label | Estimate  |
| ----- | --------- |
| S     | 0.5–1 day |
| M     | 1–2 days  |
| L     | 2–4 days  |
| XL    | 4–8 days  |

---

## Story map

```text
LAW-014-01 API scaffold
    ↓
LAW-014-02 Tenant + auth middleware
    ↓
LAW-014-03 OpenAPI spec v1 (clients + matters)
    ↓
LAW-014-04 Client API
    ↓
LAW-014-05 Matter API
    ↓
LAW-014-06 Remaining entity APIs
    ↓
LAW-014-07 Search API
    ↓
LAW-014-08 Outbox worker
    ↓
LAW-014-09 Webhook infrastructure
    ↓
LAW-014-10 Background job infrastructure
    ↓
LAW-014-11 File storage service
    ↓
LAW-014-12 Email + SMS services
    ↓
LAW-014-13 API audit logging
    ↓
LAW-014-14 Rate limiting
    ↓
LAW-014-15 TypeScript SDK
```

---

## LAW-014-01 — API Route Scaffold

| Field            | Value                                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Objective**    | Establish `/api/law/v1/` route structure, shared middleware chain, and error envelope without business endpoints |
| **Scope**        | Next.js route group; health/ready endpoints; request ID middleware; error handler; response wrapper              |
| **Out of scope** | Entity endpoints; auth; OpenAPI file                                                                             |
| **Deliverables** | `apps/web/app/api/law/v1/` scaffold; `lib/api/middleware/`; health routes; architecture note                     |
| **Tests**        | Health endpoint returns 200; error envelope shape test; request ID header test                                   |
| **Dependencies** | LAW-013 closed; [LAW-API-Design-Standard](../specs/LAW-API-Design-Standard.md)                                   |
| **Effort**       | M                                                                                                                |

---

## LAW-014-02 — Tenant Resolution & API Authentication

| Field            | Value                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Objective**    | Wire BetterAuth session and API key authentication with tenant resolution into API middleware                                                                 |
| **Scope**        | `AuthContext` type; Bearer validation; API key table + hash verification; `TenantResolver`; `runWithLawPersistenceContext` integration; reject missing tenant |
| **Out of scope** | API key admin UI; OAuth providers                                                                                                                             |
| **Deliverables** | Auth middleware; `law_api_key` migration; tenant claim wiring (closes TD-P02); integration tests for 401/403                                                  |
| **Tests**        | Auth middleware unit tests; cross-tenant isolation test; API key rotation test                                                                                |
| **Dependencies** | LAW-014-01; [007 Identity](../007-identity-authentication-authorisation-rbac-architecture.md)                                                                 |
| **Effort**       | L                                                                                                                                                             |

---

## LAW-014-03 — OpenAPI Specification v1

| Field            | Value                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| **Objective**    | Publish OpenAPI 3.1 spec for Clients and Matters endpoints                                           |
| **Scope**        | `docs/openapi/legal-api-v1.yaml`; schemas for Client, Matter, Error, Pagination; Spectral lint rules |
| **Out of scope** | Code generation; remaining entity endpoints in spec                                                  |
| **Deliverables** | OpenAPI file; Spectral config; CI lint gate                                                          |
| **Tests**        | Spectral passes; schema examples validate against JSON Schema                                        |
| **Dependencies** | LAW-014-01; [LAW-OpenAPI-Planning](../specs/LAW-OpenAPI-Planning.md)                                 |
| **Effort**       | M                                                                                                    |

---

## LAW-014-04 — Client REST API

| Field            | Value                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| **Objective**    | Expose full Client CRUD via REST, delegating to `ClientWorkflowService`                                      |
| **Scope**        | GET/POST/PATCH/DELETE `/clients`; DTO mappers; permission gates; pagination + filters; idempotency on create |
| **Out of scope** | Related matters/invoices sub-resources (LAW-014-06)                                                          |
| **Deliverables** | Route handlers; `ClientV1` DTOs; contract tests; OpenAPI updated                                             |
| **Tests**        | CRUD integration tests; permission 403 tests; tenant isolation tests; validation error shape                 |
| **Dependencies** | LAW-014-02, LAW-014-03                                                                                       |
| **Effort**       | L                                                                                                            |

---

## LAW-014-05 — Matter REST API

| Field            | Value                                                                    |
| ---------------- | ------------------------------------------------------------------------ |
| **Objective**    | Expose Matter CRUD + workspace snapshot endpoint                         |
| **Scope**        | CRUD `/matters`; GET `/matters/{id}/workspace`; DTO mappers; permissions |
| **Out of scope** | Matter team management beyond existing domain                            |
| **Deliverables** | Route handlers; `MatterV1` DTOs; workspace aggregator endpoint           |
| **Tests**        | CRUD + workspace integration tests; archive semantics                    |
| **Dependencies** | LAW-014-04                                                               |
| **Effort**       | L                                                                        |

---

## LAW-014-06 — Remaining Entity APIs

| Field            | Value                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| **Objective**    | Expose Document, Task, Calendar, Time, and Invoice APIs                                              |
| **Scope**        | CRUD for all five entities; invoice line items; action endpoints (`mark-paid`, `cancel`, `complete`) |
| **Out of scope** | File upload (LAW-014-11); PDF generation                                                             |
| **Deliverables** | Route handlers; DTOs; OpenAPI completion for all entity groups                                       |
| **Tests**        | Per-entity integration tests; invoice line item tests                                                |
| **Dependencies** | LAW-014-05                                                                                           |
| **Effort**       | XL                                                                                                   |

---

## LAW-014-07 — Search API

| Field            | Value                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------- |
| **Objective**    | Expose unified search via REST                                                         |
| **Scope**        | GET `/search`; query + filter params; result DTOs aligned with `LegalSearchResultView` |
| **Out of scope** | Semantic/AI search; search index worker (depends on LAW-014-08)                        |
| **Deliverables** | Search route; `SearchResultV1` DTO; OpenAPI search group                               |
| **Tests**        | Search integration tests; empty query handling; permission test                        |
| **Dependencies** | LAW-014-06                                                                             |
| **Effort**       | M                                                                                      |

---

## LAW-014-08 — Outbox Worker

| Field            | Value                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| **Objective**    | Implement durable outbox consumer that claims and processes `law_outbox_event` rows                   |
| **Scope**        | Worker process; `SKIP LOCKED` poll; retry; dead letter; dispatch to job queue                         |
| **Out of scope** | Webhook delivery (LAW-014-09); search index                                                           |
| **Deliverables** | Worker package; `law_outbox_event` claim logic; observability; runbook                                |
| **Tests**        | Integration test with postgres; idempotency test; retry test                                          |
| **Dependencies** | LAW-012 outbox; [LAW-Background-Job-Architecture](../architecture/LAW-Background-Job-Architecture.md) |
| **Effort**       | L                                                                                                     |

---

## LAW-014-09 — Webhook Infrastructure

| Field            | Value                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Objective**    | Implement webhook subscriptions, signed delivery, and retry                                                               |
| **Scope**        | `law_webhook_subscription`, `law_webhook_delivery`, `law_webhook_dead_letter` tables; dispatcher; admin API; HMAC signing |
| **Out of scope** | Inbound webhooks from third parties                                                                                       |
| **Deliverables** | Migrations; dispatcher job; subscription CRUD API; delivery dashboard (admin)                                             |
| **Tests**        | Signature verification test; retry test; SSRF URL validation test; tenant isolation                                       |
| **Dependencies** | LAW-014-08; [LAW-Webhook-Architecture](../architecture/LAW-Webhook-Architecture.md)                                       |
| **Effort**       | L                                                                                                                         |

---

## LAW-014-10 — Background Job Infrastructure

| Field            | Value                                                                           |
| ---------------- | ------------------------------------------------------------------------------- |
| **Objective**    | Implement `law_job` queue, worker process, scheduling, and dead-letter handling |
| **Scope**        | Job table; worker runner; retry/backoff; scheduler; health endpoint             |
| **Out of scope** | Domain-specific handlers (split across 08, 09, 11, 12)                          |
| **Deliverables** | `law_job` migration; worker CLI; job enqueue API (internal)                     |
| **Tests**        | Job claim test; retry test; dead letter test                                    |
| **Dependencies** | LAW-014-08                                                                      |
| **Effort**       | L                                                                               |

---

## LAW-014-11 — File Storage Service

| Field            | Value                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| **Objective**    | Implement `FileStorageService` with S3 adapter and document upload API                                |
| **Scope**        | Interface package; S3 adapter; `POST /documents/{id}/upload-url`; finalize job; local dev adapter     |
| **Out of scope** | OCR; virus scanning                                                                                   |
| **Deliverables** | `packages/legal-integrations/`; upload URL endpoint; `job.file.finalize`                              |
| **Tests**        | Adapter unit tests; upload flow integration test; stub adapter for CI                                 |
| **Dependencies** | LAW-014-10; [LAW-External-Service-Abstractions](../architecture/LAW-External-Service-Abstractions.md) |
| **Effort**       | L                                                                                                     |

---

## LAW-014-12 — Email & SMS Services

| Field            | Value                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| **Objective**    | Implement `EmailService` and `SmsService` with logging adapters for CI                           |
| **Scope**        | Interface implementations; `job.email.send`, `job.sms.send`; invoice sent template (placeholder) |
| **Out of scope** | Template editor UI; marketing email                                                              |
| **Deliverables** | Adapters; job handlers; tenant integration config                                                |
| **Tests**        | Idempotency test; logging adapter captures payload in CI                                         |
| **Dependencies** | LAW-014-10                                                                                       |
| **Effort**       | M                                                                                                |

---

## LAW-014-13 — API Audit Logging

| Field            | Value                                                                               |
| ---------------- | ----------------------------------------------------------------------------------- |
| **Objective**    | Persist API access and mutation audit records                                       |
| **Scope**        | `law_audit_event` migration; API middleware audit; mutation correlation with outbox |
| **Out of scope** | Audit UI; export                                                                    |
| **Deliverables** | Audit middleware; table; retention policy doc                                       |
| **Tests**        | Audit record created on mutation; tenant scoped query                               |
| **Dependencies** | LAW-014-04                                                                          |
| **Effort**       | M                                                                                   |

---

## LAW-014-14 — Rate Limiting

| Field            | Value                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------- |
| **Objective**    | Enforce per-API-key and per-tenant rate limits                                            |
| **Scope**        | Rate limit middleware; Redis or in-memory backend; 429 responses; `X-RateLimit-*` headers |
| **Out of scope** | DDoS protection at CDN layer                                                              |
| **Deliverables** | Middleware; configuration per key tier                                                    |
| **Tests**        | Limit exceeded returns 429; header values correct                                         |
| **Dependencies** | LAW-014-02                                                                                |
| **Effort**       | M                                                                                         |

---

## LAW-014-15 — TypeScript SDK

| Field            | Value                                                                               |
| ---------------- | ----------------------------------------------------------------------------------- |
| **Objective**    | Generate and publish `@apzhub/legal-api-client` from OpenAPI spec                   |
| **Scope**        | openapi-generator setup; typed client; error classes; correlation ID helper; README |
| **Out of scope** | Python/C# SDKs                                                                      |
| **Deliverables** | `packages/legal-api-client/`; publish pipeline                                      |
| **Tests**        | SDK compiles; smoke test against mock server                                        |
| **Dependencies** | LAW-014-06; LAW-014-03                                                              |
| **Effort**       | M                                                                                   |

---

## Deferred (post LAW-014-15)

| Story      | Title                         | Notes                                             |
| ---------- | ----------------------------- | ------------------------------------------------- |
| LAW-014-16 | PDF generation service        | Invoice PDF via `PdfGenerationService`            |
| LAW-014-17 | Client relationship endpoints | `/clients/{id}/matters`, `/clients/{id}/invoices` |
| LAW-014-18 | API key admin UI              | Law Administration module                         |
| LAW-014-19 | Partner sandbox tenant        | Demo API environment                              |
| LAW-014-20 | OCR service                   | Document text extraction                          |

---

## Summary

| Stories                    | Count                     |
| -------------------------- | ------------------------- |
| LAW-014-01 through 015     | 15 implementation stories |
| Deferred                   | 5                         |
| **Total estimated effort** | ~35–45 engineering days   |

---

## Related documents

| Document                                                                                            | Purpose             |
| --------------------------------------------------------------------------------------------------- | ------------------- |
| [LAW-014 Readiness Review](../reviews/LAW-014-integration-readiness-review.md)                      | Go/no-go assessment |
| [LAW-Integration-Reference-Architecture](../architecture/LAW-Integration-Reference-Architecture.md) | Architecture        |
