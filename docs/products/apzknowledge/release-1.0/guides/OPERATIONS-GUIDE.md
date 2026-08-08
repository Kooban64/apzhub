# APZ Knowledge — Operations Guide (v1.0)

## Health / failure modes

| Symptom                         | Action                                                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Knowledge API 503 / unavailable | [knowledge-memory-store-unhealthy.md](../../../../operations/runbooks/knowledge-memory-store-unhealthy.md) |
| Authz denials                   | Confirm `knowledge.view` / `knowledge.admin` on session                                                    |

## Flags

| Flag                            | Production                              |
| ------------------------------- | --------------------------------------- |
| `APZHUB_KNOWLEDGE_MEMORY_STORE` | Omit or non-`memory`; Postgres required |

## Backup

Platform Postgres — table `platform_knowledge_object` (+ RLS migration 0108).

## Migrations

- `0107_apz_platform_knowledge_memory`
- `0108_apz_platform_knowledge_memory_rls`
