# APZ TCMS — Authorization Guide (Persistence)

**Milestone:** APZTCMS-003

---

## Platform updates

`CANONICAL_PERMISSION_NAMESPACES` now includes:

`testing`, `certification`, `evidence`, `traceability`, `automation`, `reporting`, `approval`, `dashboard`

Default authorization seed registers wildcards:

`testing.*`, `certification.*`, `evidence.*`, `traceability.*`, `automation.*`, `reporting.*`, `approval.*`, `dashboard.*`

---

## Repository asserts

`assertPermission(ctx, aggregateKind, operation)` evaluates **specific** required keys against `ctx.permissions` using `permissionPatternMatches`.

Examples:

| Aggregate       | Create requires (any match)                                              |
| --------------- | ------------------------------------------------------------------------ |
| `test_plan`     | `testing.plans.create` or `testing.admin` (or granted `testing.*` / `*`) |
| `evidence`      | `evidence.register` or `evidence.admin`                                  |
| `configuration` | `testing.admin` or `administration.testing`                              |

There is **no** repository allow-all mode. Platform admin `*` works only because `permissionPatternMatches("*", key)` is true — still evaluated as a granted pattern.

---

## Seeding TCMS keys

```ts
import { seedTestingPermissions } from "@apzhub/testing-persistence";

seedTestingPermissions(authorizationService);
```

Registers wildcards plus every key from `APZ_TCMS_PERMISSIONS`.
