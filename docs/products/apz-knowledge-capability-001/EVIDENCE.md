# Evidence — APZ-KNOWLEDGE-CAPABILITY-001

| Artefact                 | Path                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| Schema                   | `packages/config/drizzle/0107_apz_platform_knowledge_memory.sql`                              |
| RLS                      | `packages/config/drizzle/0108_apz_platform_knowledge_memory_rls.sql`                          |
| Drizzle                  | `packages/config/src/db/platform-knowledge-memory-schema.ts`                                  |
| Domain                   | `packages/platform-service-contracts/src/domain/organisational-memory.ts`                     |
| Inputs                   | `packages/platform-service-contracts/src/inputs/index.ts`                                     |
| Service                  | `packages/platform-services/src/services/organisational-memory/`                              |
| API handlers             | `apps/web/lib/api/v1/handlers/organisational-memory.ts`                                       |
| API routes               | `apps/web/app/api/v1/knowledge/{objects,lessons,library,decision-knowledge,quality}/`         |
| Client                   | `apps/web/lib/knowledge/organisational-memory-api.ts`                                         |
| UI                       | `apps/web/components/knowledge/knowledge-organisational-memory-views.tsx`                     |
| Tests                    | `packages/platform-services/src/services/organisational-memory/organisational-memory.test.ts` |
| Route / permission tests | `apps/web/lib/knowledge/routes.test.ts` · `permissions.test.ts`                               |
