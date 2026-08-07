# Test Report — APZ-WORKFLOW-NATIVE-001-N02

| Field     | Value            |
| --------- | ---------------- |
| Slice     | N-02             |
| Timestamp | 20260805T164500Z |

## Coverage

| Area                       | Evidence                                                   |
| -------------------------- | ---------------------------------------------------------- |
| Permission helpers         | `apps/web/lib/workflow/permissions.test.ts`                |
| Navigation / engine gating | `apps/web/components/workflow/workflow-navigation.test.ts` |
| Session hook               | `use-workflow-permissions.ts` (Documents N-02 pattern)     |

## Assertions added

- `workflow.view` does **not** imply runs / schedules / engine / health / capabilities
- `workflow.admin` opens operator surfaces
- Engine Activity Bar requires `workflow.admin`
- Runs sidebar child requires `workflow.admin`
