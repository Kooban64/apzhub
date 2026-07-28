# Testing

## Unit tests

| Area                    | File                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------- |
| Generic engine          | `packages/lifecycle-engine/src/lifecycle-engine.test.ts`                              |
| Requirement policy      | `packages/qep-requirements/src/domain/lifecycle/requirement-lifecycle-policy.test.ts` |
| Application lifecycle   | `packages/qep-requirements/src/application/requirement-application-service.test.ts`   |
| Architecture boundaries | `packages/qep-requirements/src/architecture-boundaries.test.ts`                       |
| Platform QEP            | `packages/platform-services/src/services/qep/qep-platform-services.test.ts`           |
| HTTP handlers           | `apps/web/lib/api/v1/handlers/qep.test.ts`                                            |

## Scenarios covered

- Happy-path transition chain through all states
- Reject reason validation
- Invalid archive from draft
- Revision conflict on transition
- Permission catalogue registration
- Domain may depend on `@apzhub/lifecycle-engine`

## Run

```bash
pnpm exec vitest run --config vitest.config.ts packages/lifecycle-engine packages/qep-requirements packages/platform-services/src/services/qep
```
