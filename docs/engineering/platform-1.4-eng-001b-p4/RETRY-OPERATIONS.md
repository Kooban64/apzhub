# Retry Operations — Platform-1.4-ENG-001B-P4

## Manual retry

Re-schedules an eligible durable delivery for another attempt without inventing a new delivery identity (contrast: replay).

## Constraints

- Permission: `notifications.admin` + `notifications.retry` (or manage)
- Tenant / organisation isolation
- Lifecycle transition validation via `assertNotificationDeliveryTransition`
- Audit: `manual_retry`
- Does not enable durable runtime or providers

## Listing

`listRetries` returns `retry_scheduled` deliveries for the caller's tenant/org scope.
