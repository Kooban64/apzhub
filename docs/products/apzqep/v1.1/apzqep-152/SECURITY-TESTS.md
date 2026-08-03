# Security Tests — APZQEP-152

| Field     | Value                                         |
| --------- | --------------------------------------------- |
| Programme | APZQEP-152                                    |
| Artefact  | SECURITY-TESTS                                |
| Timestamp | 20260803T064000Z                              |
| Suite     | `testing/apzqep-152/rbac-fail-closed.test.ts` |

---

## Suite scope

Vitest fail-closed Cap RBAC checks. **No load / penetration / cross-tenant HTTP suite is claimed here.**

## Cases

| Case                 | Assertion                                                                                                                                            |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default provision    | Without `APZQEP_QEP_AUTO_ASSIGN_OPERATOR`, `tenant-member` does **not** receive `qep.suites.read` / `qep.suites.create`                              |
| Operator assignment  | Assigning `qep-operator` yields all `QEP_OPERATOR_PERMISSIONS`                                                                                       |
| Domain deny          | Suite create with `permissions: []` throws permission error                                                                                          |
| Domain allow         | Suite create with Cap create/read permissions succeeds                                                                                               |
| Handler static check | All six Cap HTTP handlers contain fail-closed comments, pass `serviceContext.permissions`, and do **not** contain elevation pattern `base.includes(` |

## Handlers covered by static check

- `qep-suites.ts`
- `qep-execution-plans.ts`
- `qep-execution-workspace.ts`
- `qep-defects.ts`
- `qep-enterprise-requirements.ts`
- `qep-enterprise-reporting.ts`

## Evidence note

This document describes the authored suite and intended assertions. It does **not** record a specific CI/run pass timestamp or invent test results. Execute:

```bash
pnpm exec vitest run testing/apzqep-152/rbac-fail-closed.test.ts
```

(or the monorepo’s equivalent Vitest entry) and attach evidence under a future certification pack if required.
