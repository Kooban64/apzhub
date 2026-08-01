# APZQEP-120-S01 — Engineering Notes

| Field             | Value                                     |
| ----------------- | ----------------------------------------- |
| Slice             | APZQEP-120-S01 Evidence List / Search ACL |
| Limitation closed | **L-EM-01**                               |
| Date              | 2026-08-01                                |

## Design (implemented)

1. Keep operation-level authorize for `listEvidence` / `searchEvidence` (`qep.evidence.read`).
2. Load candidate rows for the caller tenant (structural filters; unpaged).
3. Apply **enumeration ACL** using the same visibility rules as `getEvidence` (owner, ACL grant, or `qep.evidence.admin`).
4. Sort (`createdAt` default desc; also `updatedAt`, `title`, `id`, `status`).
5. Paginate **after** ACL so `total` / pages cannot leak unauthorized IDs.

Primary module: `packages/qep-evidence/src/application/security/enumeration-acl.ts`  
Wiring: `secure-services.ts` secured query facade.

## API compatibility

Response envelope unchanged. Unauthorized callers may see **fewer** rows (security-correct narrowing). Optional query params wired: `workspaceId`, `sort`, `order` (plus existing `text`).

## Explicit non-goals (later slices)

Durable storage · TE EvidenceAccessPort (S02) · platform search index ACL (S12) · uploads/versioning/retention.

## Tests

- `enumeration-acl.test.ts`
- `security.enforcement.test.ts` (S01 cases: list ACL, search ACL+pagination+sort, cross-tenant, deny audit)

## Rollback

Revert the engineering commit; list returns to pre-S01 enumeration behaviour (less secure).
