# Notification Lifecycle API Guide (APZNOTIFY-003)

Lifecycle mutations use `gateway.notification.notifications.transition` (and archive/restore). Convenience routes `mark-read`, `acknowledge`, `dismiss` call transition only.

Domain vocabulary may include `queued` / `delivered`; delivery plane is **not** implemented — do not treat those states as provider confirmation. HTTP does not implement lifecycle rules.
