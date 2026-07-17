# APZHUB Administration HTTP Consumer Guide

**Audience:** Administration Workbench (APZADMIN-004) and platform consumers
**Milestone:** APZADMIN-003

## How to consume

1. Prefer `apps/web/lib/administration` typed client over raw `fetch`
2. Use TanStack Query keys from `administrationQueryKeys`
3. Treat `management-capabilities` / health / readiness as management-plane diagnostics only
4. Expect `503 ADMINISTRATION_SERVICE_UNAVAILABLE` when the service flag is off

## Do not

- Call admin-core or persistence from the UI
- Call `getPlatformServiceGateway` from client code
- Bypass the typed client from Workbench UI (APZADMIN-004 consumes facades only)
