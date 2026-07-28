# Event Integration

Reused existing notification delivery event IDs (fail-soft after commit):

- `notification.delivery.started`
- `notification.delivery.delivered`
- `notification.delivery.retry_scheduled`
- `notification.delivery.failed`
- `notification.in_app.created`

Event Bus is not the SoR. Publish failure does not reverse committed delivery state. No new event.yaml required (additive reuse).
