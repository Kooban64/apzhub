# OSS-102-04 Completion Report — Zammad Articles, Conversations & Attachment Metadata

> **Milestone:** OSS-102-04  
> **Status:** **COMPLETE**  
> **Package:** `@apzhub/integration-zammad` **v0.3.0**  
> **Contracts:** `@apzhub/platform-service-contracts` **v0.4.0**  
> **Date:** 2026-07-11  
> **Stop condition:** Met — await owner approval before **OSS-102-05**

---

## Executive summary

OSS-102-04 implements Support conversation articles inside the Zammad adapter on `adapter.core.articles`, with canonical `SupportArticle` DTOs (distinct from Projects `Comment`), internal notes, customer-visible replies, channel/visibility mapping, author/recipient mapping, and attachment **metadata** only. No PlatformService, HTTP, UI, binary transfer, sync, or webhooks.

---

## Milestone scope delivered

- Canonical Support article contracts (additive, vendor-neutral)
- `ZammadArticleService` via `adapter.core.articles`
- REST: list by ticket, get, create article
- Internal notes + customer replies with visibility safety
- Attachment metadata normalisation (no binaries)
- Capability promotion for `articles`
- Diagnostics extensions (secret-free)
- Mock API + comprehensive contract tests + architecture boundary checks
- Documentation + foundation closeout

---

## Architecture overview

```text
adapter.core.articles → ZammadArticleService → ZammadOperationRunner
  → ZammadRestClient → /api/v1/ticket_articles*
```

Reuses IntegrationAdapterBase, AdapterContext, logger, metrics, circuit breaker, diagnostics, error translation, existing auth.

---

## Canonical support-article design

`SupportArticle`, `SupportArticleAuthor`, `SupportArticleAttachment`, `SupportArticleChannel`, `SupportArticleVisibility`, `SupportArticleDeliveryStatus`, body formats, recipients — in `@apzhub/platform-service-contracts` v0.4.0.  
Provisional IDs: `sart_zammad_*`, `satt_zammad_*`.

---

## Supported / unsupported operations

**Supported:** list, get, createNote, createReply, create (routed).  
**Unsupported:** update, delete (CE public API); binary attachment transfer.

---

## Internal-note / customer-reply behaviour

- Notes: `internal=true`, channel `note`, never customer-visible by default.
- Replies: `internal=false`, channel email/web/…; recipients optional.
- Post-create visibility corruption detected and mapped as mapping errors.

---

## Channel / visibility / author / recipients

Documented in [ZAMMAD-ARTICLES.md](../../integrations/zammad/docs/ZAMMAD-ARTICLES.md). Unknown channels → `unknown`. Authors may be partial. Recipients not logged in diagnostics.

---

## Attachment metadata

Metadata only on articles. `attachments` capability remains placeholder for binary work. `binaryAttachmentSupport: false` in diagnostics.

---

## Capability & diagnostics changes

- `articles` promoted to implemented core capability with notes.
- Placeholders no longer include `articles`.
- Diagnostics: article flags, channels, metadata vs binary, unsupported mutations.

---

## Error translation

Extended vendor codes: `TICKET_NOT_FOUND`, `ARTICLE_NOT_FOUND`, `INVALID_ARTICLE_TYPE`, `INVALID_BODY`, `UNSUPPORTED_ARTICLE_MUTATION`, etc. No tokens/bodies/recipients in public errors.

---

## Files created / modified (primary)

**Created:** article service/mapper/docs/tests; Support article contracts; completion report.  
**Modified:** rest client, core services, capabilities, placeholders, adapter diagnostics, mock API, package versions, foundation docs, CHANGELOG.

---

## Package versions

| Package                              | Version   |
| ------------------------------------ | --------- |
| `@apzhub/integration-zammad`         | **0.3.0** |
| `@apzhub/platform-service-contracts` | **0.4.0** |

---

## Tests & coverage

| Suite                                 | Result                                        |
| ------------------------------------- | --------------------------------------------- |
| Zammad package                        | **57+ passed** (articles + core + foundation) |
| Plane + Zammad + contracts regression | **157+ passed**                               |
| `ZammadArticleService` lines          | **~94.5%** (functions 100%)                   |
| Article mapper functions              | **100%** (lines ~94%)                         |
| Package lines                         | **~90%**                                      |

---

## Quality gates

Lint · typecheck · Zammad tests · Plane regression · contracts tests — **Pass**.

---

## Backward compatibility

Existing support/org/group/user services unchanged. Contract additions additive. No platform-services / gateway / HTTP changes.

---

## Security & privacy

No article bodies/subjects/recipients in diagnostics or ordinary logs. Binary payloads stripped from canonical DTOs. No filesystem path acceptance.

---

## Zammad API assumptions

CE **6.3.0–6.5.x**; `/api/v1/ticket_articles` and `by_ticket`; Token auth.

---

## Technical debt

| ID          | Note                                                                |
| ----------- | ------------------------------------------------------------------- |
| TD-10204-01 | Article update/delete remain unsupported until CE API confirms      |
| TD-10204-02 | Binary attachment transfer deferred                                 |
| TD-10204-03 | List fetches up to 100 articles then client-filters (large tickets) |
| TD-10204-04 | Provisional IDs until MappingStore                                  |

---

## Reference Adapter comparison

Mirrors Plane comment service structure (runner + REST + mapper + mock) while using **SupportArticle** domain types — never Plane `Comment`.

---

## Recommendation for OSS-102-05

**OSS-102-05 — Zammad Search, History & Support Intelligence** (adapter-only unless owner expands). Do not start without approval.

---

## Stop condition

**Met.** Await explicit owner approval before OSS-102-05.
