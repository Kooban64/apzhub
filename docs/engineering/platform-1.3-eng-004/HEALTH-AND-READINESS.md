# Health and Readiness

GET `/api/v1/notifications/delivery-health`. Disabled → status `disabled` / reason `disabled_by_configuration`. SMTP deferred does not fail in-app readiness. Unknown ≠ healthy.
