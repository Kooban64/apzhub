# Session Propagation — APZ-ANALYTICS-NATIVE-001-N02

| Field     | Value            |
| --------- | ---------------- |
| Slice     | N-02             |
| Status    | **COMPLETE**     |
| Timestamp | 20260805T181500Z |

## Behaviour

| Plane         | Router                     | Session hook              | Default grant |
| ------------- | -------------------------- | ------------------------- | ------------- |
| APZ Analytics | `AnalyticsWorkspaceRouter` | `useAnalyticsPermissions` | **None**      |

Overrides remain for tests only. Production mounts pass no override — session grants only.

## Closed gaps

- **G-07 / G-08** — Session identity end-to-end; removed hard-coded `analytics.*` UI default
- Primary product permission is `analytics.view` (decision entry), not `analytics.dashboard.view`
