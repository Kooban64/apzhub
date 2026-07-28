# Audit — Requirements

> **Programme:** APZQEP-ENG-020B

## Domain mutation audit

Every create / update / archive appends to `qep_requirement_audit` with:

- `action` — `qep.requirement.created` | `updated` | `archived`
- `actor_user_id`, `correlation_id`, `tenant_id`, `requirement_id`
- `details_json`, `created_at`

## Authorization audit

RequestPipeline authorization evaluation continues to emit platform authorization audit events for allow/deny decisions.

No custom audit framework was introduced.
