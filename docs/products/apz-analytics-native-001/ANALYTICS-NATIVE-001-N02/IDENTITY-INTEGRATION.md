# Identity Integration — APZ-ANALYTICS-NATIVE-001-N02

| Field     | Value                                                                    |
| --------- | ------------------------------------------------------------------------ |
| Slice     | APZ-ANALYTICS-NATIVE-001-N02                                             |
| Status    | **COMPLETE**                                                             |
| Timestamp | 20260805T181500Z                                                         |
| Board     | [../PRODUCT-BOARD-DECISION-ENTRY.md](../PRODUCT-BOARD-DECISION-ENTRY.md) |

## Model

| Concern        | Owner                                                 |
| -------------- | ----------------------------------------------------- |
| Authentication | APZHUB Identity (Better Auth session)                 |
| Session        | APZHUB only — hydrated server-side in platform layout |
| Authorisation  | APZHUB PermissionService / platform-authorization     |
| Product UI     | APZ Analytics consumes grants — never owns identity   |
| BI engine      | Below product boundary — never a product identity     |

## Flow

```text
Validated APZHUB session
        ↓
resolveSessionAuthorization (platform-authorization)
        ↓
SessionAuthorizationProvider + WorkbenchProvider
        ↓
useAnalyticsPermissions() → AnalyticsWorkspaceRouter
```

## Rules enforced

1. No second login
2. No BI engine identities exposed as product identity
3. No engine roles exposed
4. Default identity uses **decision-entry** grants (`analytics.view`, KPI, saved)
5. Presentation assets (datasets / reports) and operator surfaces require `analytics.admin` (or explicit elevated keys)
6. Identity decisions reinforce: users enter through questions and decisions; dashboards are answers

## Design objective (Product Board)

> Identity around **questions and decisions**.  
> The first thing users should see is the question they need answered—not the dashboard that happens to contain the answer.

## Code anchors

- `apps/web/lib/analytics/use-analytics-permissions.ts`
- `apps/web/lib/analytics/permissions.ts`
- `apps/web/components/analytics/analytics-workspace-router.tsx`
- `apps/web/components/analytics/analytics-ui.tsx` (`ANALYTICS_PRODUCT_NAME`)
- `services/analytics/manifests/analytics/module.yaml`
