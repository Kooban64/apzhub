# Attempt Model

Each dispatch attempt **requires** a durable `delivery try` record (0065 `platform_notification_delivery_try`).

## Fields (logical)

- attempt_number
- started_at / finished_at
- provider_id
- receipt_level
- failure_class / failure_code
- note (redacted)
- provider_reference (future external providers; optional)

## Rules

- Increment `attempt_count` on delivery when try starts.
- Persist try **before** or atomically with provider call boundary as ENG designs — architecture requires durable try existence for every dispatch.
- Provider response metadata stored with redaction; no secrets.
