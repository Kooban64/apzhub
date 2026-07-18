# ADR-0060: Meilisearch Reference Search Adapter

| Field         | Value                |
| ------------- | -------------------- |
| **Status**    | Accepted             |
| **Date**      | 2026-07-14           |
| **Milestone** | APZSEARCH-005        |
| **Deciders**  | Owner / Architecture |

---

## Context

APZSEARCH-001–004 delivered a vendor-neutral Search Platform and Search Integration SDK (`@apzhub/integration-search-sdk`). The platform must remain unbound to any single engine. A **reference adapter** is required to certify the SDK against a real Community Edition / self-hosted search engine without implying product exclusivity or requiring platform code changes for future engines.

## Decision drivers

- Self-hosted OSS CE first (APZHUB foundation)
- Simple, mockable HTTP API for certification without live CI engines initially
- Keyword search as the first certified execution plane
- Isolation of vendor code in `integrations/`
- Ability to add OpenSearch / others later without platform rewrites

## Options considered

| Engine             | Pros                                                                       | Cons for first reference                                                        |
| ------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Meilisearch**    | Simple HTTP API; strong keyword UX; OSS CE; low ops cost; easy mockability | Semantic/vector limited in CE without extras                                    |
| **OpenSearch**     | Mature; rich aggregations; strong enterprise ecosystem                     | Heavier ops footprint; better as a later certified engine                       |
| **Typesense**      | Similar niche to Meilisearch                                               | Smaller ecosystem footprint in APZHUB self-hosted matrix                        |
| **PostgreSQL FTS** | Already in platform PostgreSQL                                             | Not a dedicated search engine; poor fit as the first certified _engine_ adapter |

## Decision

1. Adopt **Meilisearch Community Edition (self-hosted)** as the **first reference search engine adapter** — package `@apzhub/integration-meilisearch` **0.1.0** under `integrations/meilisearch/`.
2. Implement against raw HTTP (`MeilisearchRestClient` + injectable `fetchFn`) — **no** official `meilisearch` npm client dependency.
3. Extend `SearchIntegrationAdapterBase`; keep Platform Services, PlatformServiceGateway, persistence, HTTP routes, and Workbench **unchanged** in this milestone.
4. Unsupported planes (semantic / vector / fuzzy / AI / OCR) return canonical **`NOT_SUPPORTED`**.
5. The Search Platform remains **vendor-neutral**. **OpenSearch remains an explicit supported future reference adapter** if enterprise requirements evolve.
6. Future engines implement the same Search Integration SDK contracts without modifying platform packages.

## Consequences

### Positive

- Certifies the Search Integration SDK against a real engine contract surface
- Keeps vendor code isolated; platform stays engine-agnostic
- Low operational cost for first reference certification (mock REST in CI)

### Negative / accepted

- Semantic/vector capabilities deferred
- Live Meilisearch integration tests deferred beyond mock REST certification
- Platform HTTP exposure remains a later milestone (APZSEARCH-007)

## Compliance

- Does not violate Module → Service → Connector layering (003/008/026)
- Secrets as references only
- No backend branding in user-facing surfaces this milestone (no Workbench/HTTP)

## Related

- [APZSEARCH-005 Completion Report](../sprint/APZSEARCH-005-completion-report.md)
- [Meilisearch Adapter Architecture](../architecture/APZHUB-Meilisearch-Adapter-Architecture.md)
- [Search Integration SDK Architecture](../architecture/APZHUB-Search-Integration-SDK-Architecture.md)
- [ADR-0005 — Integration SDK strategy](./ADR-0005-integration-sdk-strategy.md)
