# Attempt Persistence

Every dispatch creates a durable `NotificationDeliveryTry`:

- delivery id, attempt number, worker id
- started / finished timestamps
- provider id (`in_app`), receipt level
- failure class/code (redacted), optional provider reference (in-app item id)
- note for uncertain results

Inserted before channel I/O; finished fields updated in completion TX.
