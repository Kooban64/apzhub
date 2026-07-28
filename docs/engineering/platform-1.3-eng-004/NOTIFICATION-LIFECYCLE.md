# Notification Lifecycle

Intent statuses: requested → validated → suppressed|queued → processing → delivered|partially_delivered|retry_scheduled|permanent_failure|cancelled|expired.

Illegal transitions throw. In-app read/unread does not alter delivery status. Provider acceptance ≠ recipient delivery; unknown ≠ delivered.
