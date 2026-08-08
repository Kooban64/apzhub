# QX-P1-01 — Cap shell navigation permission filtering

| Field        | Value                                                                |
| ------------ | -------------------------------------------------------------------- |
| Timestamp    | 20260808T054600Z                                                     |
| Disposition  | **CLOSE**                                                            |
| Residual     | PRODUCT-STATUS KI-001 / TD-001                                       |
| Suite        | `testing/apzqep-qx-p1-01/cap-shell-nav-permission-filter.test.ts`    |
| Runtime path | `apps/web/lib/workbench-hydration.ts` → `filterWorkbenchRegistryDto` |

---

## Decision

**Closed — implemented and evidenced.**

Cap Activity Bar / Sidebar entries and Cap views are filtered by PermissionService before hydration. Users without Cap permissions do not receive those nav items (no pre-API false affordance).

---

## Evidence

| Check                                                           | Result |
| --------------------------------------------------------------- | ------ |
| User with only `platform.nav.home.view` sees zero Cap nav/views | PASS   |
| User with Cap read permissions sees only granted Cap entries    | PASS   |
| Partial Cap grant does not expose ungranted Cap sidebar items   | PASS   |
| Vitest suite (3 tests)                                          | PASS   |

Runtime wiring: `loadWorkbenchRegistryDto` builds an auth-backed permission adapter and applies `filterWorkbenchRegistryDto` on every shell load.

---

## Acceptance criteria (from inventory)

| Criterion                                                            | Met |
| -------------------------------------------------------------------- | --- |
| Cap Activity Bar / Sidebar entries hidden when user lacks permission | Yes |
| No pre-API false affordance for Cap routes in hydrated registry      | Yes |

KI-001 / TD-001 cleared for V1.1 Production Ready baseline.
