# RBAC Mapping — APZ-KNOWLEDGE-NATIVE-001-N02

| Field     | Value            |
| --------- | ---------------- |
| Status    | **COMPLETE**     |
| Timestamp | 20260806T073000Z |

| Surface                      | Permission        |
| ---------------------------- | ----------------- |
| Activity Bar — APZ Knowledge | `knowledge.view`  |
| Home / Memory / Help         | `knowledge.view`  |
| Future operator surfaces     | `knowledge.admin` |

## Tenant Member

Seeded with **`knowledge.view` only** — not `knowledge.*`.

## Mapping rule

Never map backend/engine roles into Knowledge product identity.  
Server AuthorizationService remains authoritative.
