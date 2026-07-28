# Persistence

Additive migration `0065_apz_platform_notification_delivery.sql`:

- platform_notification_intent
- platform_notification_delivery_record
- platform_notification_delivery_try
- platform_notification_in_app_item

Phase A runtime store is process-local with schema ready for PostgreSQL. No provider credentials, mailbox, or full source events stored.

Retention category: operational delivery evidence (default 90 days via `APZHUB_NOTIFICATION_RETENTION_DAYS`).
