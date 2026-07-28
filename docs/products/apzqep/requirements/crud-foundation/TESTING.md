# Testing — Requirements CRUD Foundation

> **Programme:** APZQEP-ENG-020B

## Suites

| Suite                    | Location                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------- |
| Domain / VO / boundaries | `packages/qep-requirements/src/**/*.test.ts`                                            |
| Application CRUD         | `packages/qep-requirements/src/application/requirement-application-service.test.ts`     |
| Repository contracts     | `packages/qep-requirements/src/infrastructure/repositories/repository-contract.test.ts` |
| Platform services        | `packages/platform-services/src/services/qep/qep-platform-services.test.ts`             |
| HTTP handlers            | `apps/web/lib/api/v1/handlers/qep.test.ts`                                              |
| Search adapter           | `packages/search-qep/src/search-qep.test.ts`                                            |

## Coverage focus

CRUD · permission mapping · audit append · soft archive · search · architecture boundaries

## Commands

```bash
pnpm test:qep
pnpm typecheck:qep
pnpm audit:qep-requirements-crud
```
