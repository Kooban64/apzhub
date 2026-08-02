# APZQEP-120-S05 — Engineering Notes

| Field      | Value                                           |
| ---------- | ----------------------------------------------- |
| Slice      | APZQEP-120-S05 Evidence Catalogue Platform      |
| Process    | APZHUB-ENG-001 · ADR-0092 · ADR-0093 · ADR-0094 |
| Date       | 2026-08-02                                      |
| Depends on | S01 · S02 · S03 · S04 (certified)               |

---

## Capability statement

S05 delivers the **Evidence Catalogue Platform** — logical system of record for evidence metadata, ownership, relationships, state, storage references, and integrity linkage.

PostgreSQL is the first durable persistence implementation. The catalogue is not equated with PostgreSQL.

## Architecture confirmation

```text
EvidenceCatalogueService
  → secured commands/queries (ACL S01 / enumeration S02)
      → EvidenceRepository (Catalogue Repository Port — existing)
          → PostgresEvidenceRepository | InMemoryEvidenceRepository
```

No second catalogue repository. Handlers do not access the repository port directly.

## Modules

| Component              | Path                                                         |
| ---------------------- | ------------------------------------------------------------ |
| Catalogue service      | `application/catalogue/evidence-catalogue-service.ts`        |
| Catalogue state        | `domain/evidence/catalogue-state.ts`                         |
| PG evidence repository | `infrastructure/postgres/evidence-repository.ts`             |
| PG UoW                 | `infrastructure/postgres/unit-of-work.ts`                    |
| Schema                 | `packages/config/src/db/qep-evidence-schema.ts`              |
| Migrations             | `0089_apz_qep_evidence.sql`, `0090_apz_qep_evidence_rls.sql` |
| Runtime factory        | `infrastructure/persistence/create-evidence-persistence.ts`  |
| Platform wiring        | `create-qep-evidence-platform-services.ts`                   |

## Migration strategy

Additive only. Fresh install creates empty catalogue tables. Upgrade adds tables without rewriting evidence ids, content, or digests. Existing memory-mode evidence remains listable via memory catalogue. No uncontrolled production backfill.

## Security

- Tenant-scoped queries and FORCE RLS policies
- ACL reuse for all catalogue facade operations
- Parameterised Drizzle queries
- No SQL/schema leakage in public errors
- Storage locators opaque; no local FS paths in contracts

## Performance observations

- List loads versions in one batched query (no N+1)
- Indexes on tenant+project, status, catalogue_state, owner, classification, updated_at, storage_locator
- Relationship unique index and target indexes present
- Catalogue list does not read evidence bytes

## Deferred

- S06 retention / audit durability productisation
- S07 platform event-bus publication
- Cloud storage providers
- TE EvidenceAccessPort wiring
- Package promotion / release / deployment

## Status markers

- `QEP_EVIDENCE_APPLICATION_STATUS = catalogue-platform-s05`
- `QEP_EVIDENCE_INFRASTRUCTURE_STATUS = catalogue-platform-s05`
