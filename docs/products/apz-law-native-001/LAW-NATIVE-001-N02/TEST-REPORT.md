# Test Report — APZ-LAW-NATIVE-001-N02

| Field     | Value            |
| --------- | ---------------- |
| Slice     | N-02             |
| Timestamp | 20260805T192000Z |
| Result    | **PASS**         |

## Coverage

| Area                                             | Evidence                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------- |
| Permission helpers                               | `apps/law-platform/lib/law/permissions.test.ts`                     |
| Tenant Member vs practice                        | `packages/platform-authorization/src/authorization-service.test.ts` |
| Parent inheritance (still works when configured) | Same file — custom child of Law Practice Operator                   |

## Assertions

- `law.view` does **not** imply practice surfaces
- Tenant Member does **not** inherit `law-operator`
- Tenant Member cannot `legal.client.view` / `legal.trust.view` / `law.admin`
- `law.admin` / `legal.*` open practice surfaces
