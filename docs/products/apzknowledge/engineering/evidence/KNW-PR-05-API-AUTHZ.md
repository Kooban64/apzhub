# KNW-PR-05 — API authz sweep

| Field  | Value         |
| ------ | ------------- |
| ID     | **KNW-PR-05** |
| Status | **Closed**    |

`requireKnowledgePermission` on organisational-memory handlers. Reads: `knowledge.view|admin`. Writes: `knowledge.admin|manage`. Tests: `require-knowledge-permission.test.ts`.
