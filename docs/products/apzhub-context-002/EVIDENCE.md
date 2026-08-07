# Evidence — APZHUB-CONTEXT-002

| Artefact         | Path                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| Contracts        | `packages/platform-service-contracts/src/services/enterprise-context-composition-service.ts`      |
| Composer         | `packages/platform-services/src/services/enterprise-context/compose-enterprise-context.ts`        |
| Providers        | `packages/platform-services/src/services/enterprise-context/providers.ts`                         |
| Gateway compose  | `packages/platform-services/src/services/enterprise-context/create-enterprise-context-service.ts` |
| API handler      | `apps/web/lib/api/v1/handlers/context.ts`                                                         |
| Client           | `apps/web/lib/context/context-api.ts`                                                             |
| Shared panel     | `apps/web/components/context/enterprise-context-panel.tsx`                                        |
| Workflow mounts  | `workflow-task-detail-view.tsx` · `workflow-business-process-views.tsx`                           |
| Support mount    | `support-request-detail-view.tsx`                                                                 |
| Knowledge mounts | `knowledge-memory-detail-view.tsx` · managed object detail                                        |
| Tests            | `enterprise-context-composition.test.ts` · `context.test.ts` · panel test                         |

## Principles upheld

- Composition only · `ownsBusinessState: false`
- Every fragment carries owning product label
- No Context database SoR
