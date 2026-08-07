# Evidence — APZ-PROJECTS-CAPABILITY-001

| Artefact     | Path                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------- |
| Schema       | `packages/config/drizzle/0101_apz_platform_projects_delivery.sql`                                                   |
| RLS          | `packages/config/drizzle/0102_apz_platform_projects_delivery_rls.sql`                                               |
| Drizzle      | `packages/config/src/db/platform-projects-delivery-schema.ts`                                                       |
| Domain       | `packages/platform-service-contracts/src/domain/project-delivery.ts`                                                |
| Service      | `packages/platform-services/src/services/projects-delivery/`                                                        |
| API handlers | `apps/web/lib/api/v1/handlers/projects-delivery.ts`                                                                 |
| API routes   | `apps/web/app/api/v1/projects/[projectId]/{milestones,risks,decisions,actions,delivery-dashboard,delivery-health}/` |
| Client       | `apps/web/lib/projects/projects-api.ts`                                                                             |
| UI           | `apps/web/components/projects/project-delivery-panels.tsx` · detail tabs in `project-detail-view.tsx`               |
| Tests        | `packages/platform-services/src/services/projects-delivery/projects-delivery.test.ts`                               |
