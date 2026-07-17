# Notification API Security and Tenancy Guide (APZNOTIFY-003)

- Auth via `withPlatformApiAuth`; trusted `ServiceRequestContext` from session — never trust client roles/permissions/tenant.
- Authorization only in RequestPipeline + ProductionAuthorizationProvider + `notificationPlatformOps`.
- Tenant/org isolation enforced in Platform Services / Core / RLS — HTTP does not bypass.
- Protected resources: cross-tenant guessed IDs → governed 404 (not existence leak).
- `notification.delivery` remains reserved and unwired.
