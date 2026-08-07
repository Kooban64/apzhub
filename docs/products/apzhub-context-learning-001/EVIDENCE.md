# Evidence — APZHUB-CONTEXT-LEARNING-001

| Artefact              | Path                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------ |
| Event store schema    | `packages/config/drizzle/0097_apz_platform_product_learning.sql`                     |
| Contracts             | `packages/platform-service-contracts/src/services/product-learning-service.ts`       |
| Summariser + store    | `packages/platform-services/src/services/product-learning/`                          |
| HTTP                  | `apps/web/app/api/v1/context/learning/`                                              |
| Panel instrumentation | `apps/web/components/projects/enterprise-context-panel.tsx`                          |
| Product Board view    | `apps/web/components/administration/context-learning-summary-view.tsx`               |
| Unit tests            | `product-learning.test.ts`, `context-learning.test.ts`, `learning-telemetry.test.ts` |

## Privacy review

| Check                                 | Result |
| ------------------------------------- | ------ |
| No user id in event properties        | PASS   |
| No document/project contents          | PASS   |
| Comment length capped                 | PASS   |
| Fire-and-forget client (non-blocking) | PASS   |
