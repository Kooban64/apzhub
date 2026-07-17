# APZNOTIFY-005 — Typed Client Certification

**Result:** PASS

## Factory

`createHttpNotificationClient()` is the production entry. Mock client exists for tests only.

## Surface certified

list/get/create/update/archive/restore/transition · mark-read/acknowledge/dismiss · templates · preferences · categories · channels · recipients · references · audit · capabilities/health/readiness/diagnostics

## Absent

`sendNotification`, `deliverNotification`, `resendNotification`, `scheduleNotification`

## Query keys

Canonical keys under `apps/web/lib/notifications/query-keys.ts` (notifications, templates, preferences, categories, channels, recipients, references, audit, diagnostics, health, capabilities, readiness).

## Boundaries

No Gateway / platform-services / core / persistence imports. Client targets `/api/v1/notifications*` only.
