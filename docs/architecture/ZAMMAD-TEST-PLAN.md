# Zammad Test Plan (OSS-102)

> **Purpose:** Testing & certification strategy for `@apzhub/integration-zammad` — **design only**  
> **Audience:** Engineers, QA, AI agents  
> **Authoritative references:** [REFERENCE-ADAPTER-STANDARD](./REFERENCE-ADAPTER-STANDARD.md) · [015 — Quality](../015-software-quality-testing-qa-cicd-release-management-framework.md) · [ZAMMAD-IMPLEMENTATION-PLAN](./ZAMMAD-IMPLEMENTATION-PLAN.md)  
> **Status:** Discovery — **no tests implemented in OSS-102-01**  
> **Last updated:** 2026-07-10  
> **Milestone:** OSS-102-01

---

## 1. Principles

1. **Mock-first** — Wave certification must not require a live Zammad instance.
2. Mirror Plane Wave 1 pyramid: unit → adapter contract → platform provider → HTTP E2E (when HTTP exists) → certification.
3. No secrets in fixtures; synthetic IDs only.
4. Dependency audit extended for Zammad boundaries before Wave 2 closeout.

---

## 2. Mock server

| Component        | Location (planned)                 | Behaviour                                                                                            |
| ---------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `MockZammadApi`  | `integrations/zammad/src/testing/` | In-memory REST fixture implementing tickets, articles, users, orgs, groups, tags, states, priorities |
| Fixture data     | `testing/mock-zammad-data.ts`      | Deterministic seed                                                                                   |
| Error injection  | Toggle 401/403/404/422/429/500     | Resilience tests                                                                                     |
| Webhook payloads | Sample JSON + HMAC fixtures        | Event translator tests                                                                               |

Export mock helpers for platform-services and HTTP certification suites (same pattern as Plane).

---

## 3. Contract tests

| Suite                   | Asserts                                     |
| ----------------------- | ------------------------------------------- |
| Config validation       | Required base URL, token present, TLS rules |
| Error mapper            | Status → typed errors; no raw body leakage  |
| Mappers                 | Zammad DTO ↔ canonical Support DTOs         |
| Capability registration | Declared capabilities match matrix          |
| Auth header formatting  | `Token token=` / Bearer                     |

---

## 4. Integration tests (mocked)

| Area               | Scenarios                                                          |
| ------------------ | ------------------------------------------------------------------ |
| Ticket lifecycle   | create → update → status change → list/get                         |
| Articles           | public comment, internal note, attachment create/download metadata |
| Org / group / user | list/get; mapping hooks with fake MappingStore at platform layer   |
| Tags               | add/remove                                                         |
| Sync               | full + incremental cursor; idempotent re-run                       |
| Events             | webhook payload → canonical envelope                               |
| Resilience         | retry, circuit breaker open, rate limit                            |
| Operations         | readiness, health levels, compatibility (late milestone)           |

---

## 5. Platform / regression

When SupportService + providers exist:

- Provider resolution + mapping store integration (postgres test or in-memory store)
- Authorisation deny/allow matrix
- Gateway orchestration
- Combined regression with Integration SDK + contracts
- Extend Wave1-style `testing/wave2/` stack tests: HTTP → Gateway → SupportService → Provider → Zammad → Mock

---

## 6. Performance tests

Measure mocked baselines only (no optimisation mandate):

- ticket.list / ticket.create / ticket.update
- article.list / article.create
- org.list / group.list
- provider resolution + mapping lookup
- gateway list (when HTTP exists)

Record in certification report; do not set SLAs in OSS-102-01.

---

## 7. Certification gates (Wave 2 closeout)

| Gate                        | Requirement                                       |
| --------------------------- | ------------------------------------------------- |
| Lint / typecheck / build    | Pass                                              |
| Adapter unit + contract     | Pass                                              |
| Platform Support regression | Pass                                              |
| OpenAPI (if HTTP shipped)   | Validate                                          |
| Dependency audit            | 0 violations (or justified exceptions)            |
| Capability matrix           | Implemented / Tested / Documented / Certified     |
| Coverage                    | Report vs 80% targets; highlight gaps             |
| Live Zammad                 | Optional soak — never mandatory for certification |

---

## 8. Explicit exclusions (OSS-102-01)

- No test files created in this milestone
- No CI job changes required yet
- No Playwright Support UI tests (no UI)

---

## Related

- [ZAMMAD-CAPABILITY-MATRIX.md](./ZAMMAD-CAPABILITY-MATRIX.md)
- [OSS-101-10 Wave 1 Certification](../sprint/OSS-101-10-Wave1-Certification.md) (pattern to mirror)
