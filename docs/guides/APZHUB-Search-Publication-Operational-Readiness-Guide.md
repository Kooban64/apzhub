# APZHUB Search Publication Operational Readiness Guide

> **Programme:** Search Publication (APZSEARCH-009–019)  
> **Wave status:** **Architecture Frozen** (APZSEARCH-019)  
> **Audience:** Operators, platform admins, release engineers  
> **Classification:** PRODUCTION_READY_WITH_LIMITATIONS  
> **Date:** 2026-07-18

---

## Deployment expectations

1. Apply PostgreSQL migrations **0058** and **0059** before enabling orchestration
2. Deploy apps/web with Search Publication packages at certified versions
3. Keep `APZHUB_SEARCH_ORCHESTRATION_ENABLED` unset/false until journal and Meilisearch adapter health are confirmed
4. Assign `search.publication.*` permissions explicitly (deny-by-default)
5. Verify `pnpm certify:search-publication` and `pnpm audit:search-publication-wave` in release lanes

---

## Bootstrap configuration

| Variable                              | Default       | Behaviour                           |
| ------------------------------------- | ------------- | ----------------------------------- |
| `APZHUB_SEARCH_ORCHESTRATION_ENABLED` | unset / false | Deny-by-default; safe no-op enqueue |

When disabled: composition hooks do not block product SoR writes; no Meilisearch traffic from the publication path.

---

## PostgreSQL requirements

| Artefact                                               | Purpose               |
| ------------------------------------------------------ | --------------------- |
| `0058_apz_platform_search_publication_journal.sql`     | Durable journal table |
| `0059_apz_platform_search_publication_journal_rls.sql` | Row-level security    |

Production orchestration requires PostgreSQL. Do not run enabled orchestration against an ephemeral in-memory journal in production.

---

## Publication operations

- Product mutations enqueue via composition hooks → journal
- Orchestrator drains batches through Search Integration → frozen Search Platform → Meilisearch
- Metadata-only — binaries and report bodies are out of scope
- Monitor backlog via Publication Ops Workbench or HTTP admin APIs

---

## Retry operations

| Action                                 | Permission                 | Notes                 |
| -------------------------------------- | -------------------------- | --------------------- |
| Single / selected / failed-batch retry | `search.publication.retry` | Audited               |
| Drain (`processBatch`)                 | `retry` or `admin`         | Controlled batch size |
| Clear completed retry acknowledgements | `admin`                    | Marker-based          |

Backoff is exponential per `DEFAULT_RETRY_POLICY`. Permanent failures move to dead-letter.

---

## Dead-letter operations

| Action                | Permission                      | Notes                       |
| --------------------- | ------------------------------- | --------------------------- |
| Inspect DLQ           | `search.publication.deadletter` | Journal rows retained       |
| Re-enqueue            | `deadletter`                    | Creates **new** journal row |
| Acknowledge / archive | `deadletter`                    | Markers; no hard-delete     |

---

## Diagnostics

Workbench `/workspace/search/publication` and HTTP diagnostics expose orchestrator / journal / retry / bootstrap / backlog health. Requires `search.publication.diagnostics`. Never expect provider credentials or raw engine payloads in diagnostics.

---

## Support guidance

1. Confirm bootstrap flag and migration state
2. Check diagnostics and queue summary
3. Classify failure (transient vs permanent) from journal entry
4. Retry or DLQ re-enqueue with audit
5. Escalate only if frozen Search Platform / Meilisearch adapter health is degraded

Related: [Retry Guide](./APZHUB-Search-Publication-Retry-Guide.md) · [Dead Letter Guide](./APZHUB-Search-Publication-Dead-Letter-Guide.md) · [Failure Recovery](./APZHUB-Search-Publication-Failure-Recovery-Guide.md).

---

## Upgrade guidance

- Treat publication package versions as frozen pins unless a new approved milestone bumps them
- Apply journal migrations before enabling orchestration on a new environment
- Re-run `pnpm audit:search-publication-wave` after KF or governance doc updates
- Do not alter frozen Search Platform packages (001–008) without ADR + owner approval

---

## Operational limitations

1. Admin markers / audit default to in-memory unless a durable store is composed
2. Journal admin lists aggregate via `listByStatus` (scale limit)
3. Playwright Publication Ops journey is LIMITED (mocked HTTP / webServer conflicts)
4. Composition hooks wrap at composition root (platform-services source unmodified by design)
5. DLQ lifecycle keeps original dead-letter rows terminal; retry = re-enqueue

---

## Certification commands

```bash
pnpm certify:search-publication
pnpm audit:search-publication-wave
```

---

## See also

- [Architecture Freeze Notice](../architecture/APZHUB-Search-Publication-Architecture-Freeze-Notice.md)
- [Reference Standard](../architecture/APZHUB-Search-Publication-Reference-Standard.md)
- [Certification Guide](./APZHUB-Search-Publication-Certification-Guide.md)
