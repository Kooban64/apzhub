# APZQEP-120-S02 — Engineering Notes

| Field         | Value                                                     |
| ------------- | --------------------------------------------------------- |
| Slice         | APZQEP-120-S02 Evidence Query Service & Permission Engine |
| Reference     | L-EM-02                                                   |
| Process       | APZHUB-ENG-001 · ADR-0092                                 |
| Date          | 2026-08-01                                                |
| Depends on    | APZQEP-120-S01 (L-EM-01 CLOSED)                           |
| Product Board | **CERTIFIED** (2026-08-01) — 10/10                        |

---

## Architecture (implemented)

```text
HTTP Handler (thin)
  → Platform Evidence Service
    → Secured EvidenceQueryService
      → EvidenceEnumerationService          (S02)
          → EvidencePermissionEngine        (wraps SecurityGate / AccessPolicy)
          → EvidenceQueryBuilder            (validate + merge + sort + page)
          → Inner EvidenceQueryService
              → EvidenceRepository (memory today)
```

Repositories do **not** evaluate permissions. Controllers do **not** build ACL filters.

## Modules

| Component           | Path                                                                          |
| ------------------- | ----------------------------------------------------------------------------- |
| Permission Engine   | `packages/qep-evidence/src/application/query/permission-engine.ts`            |
| Query Builder       | `packages/qep-evidence/src/application/query/query-builder.ts`                |
| Enumeration Service | `packages/qep-evidence/src/application/query/evidence-enumeration-service.ts` |
| Factory wiring      | `create-application-services.ts`                                              |
| S01 compat          | `enumeration-acl.ts` (delegates to S02 components)                            |

## Permission model

**No second framework.** Engine delegates to ENG-110E / S01 rules: platform permission → owner → ACL grant → admin (tenant-scoped). Default deny.

## Query validation

Rejects: unsafe identifiers, unknown sort fields, invalid order, limit > 100, negative/huge offset, empty/oversized text. Invalid attempts audited (`invalid_query`).

## API compatibility

List/search HTTP and platform contracts unchanged. Unauthorized callers still see fewer rows (security-correct narrowing).

## Performance

Current LA memory path evaluates read visibility per candidate after load (S01 behaviour). **Future (S03+):** push ACL constraints into SQL via `effectiveConstraints()` — documented opportunity, not implemented here.

## Deferred (explicit)

- TE `EvidenceAccessPort` → Evidence ACL (former catalogue S02) — needs separate Owner instruction
- PostgreSQL SoR / SQL QueryBuilder push-down — S03/S04
- Platform search-index ACL — S12

## Tests

- `query-builder.test.ts`
- `evidence-enumeration.service.test.ts`
- S01 `security.enforcement.test.ts` + `enumeration-acl.test.ts` (regression)

## Rollback

Revert engineering commit; secured facade falls back to S01 `applyEnumerationAcl` path if enumeration wiring removed.
