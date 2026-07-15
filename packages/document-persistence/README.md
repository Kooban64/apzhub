# @apzhub/document-persistence

Canonical Document Platform metadata + version persistence (APZDOCS-002).

- PostgreSQL repositories (production)
- In-memory repositories (tests; explicit opt-in)
- Factories: `createDocumentPersistenceForProduction` / `ForTest`

Migrations **0037–0040** live in `@apzhub/config`. No binary columns.

Version **0.2.0**.
