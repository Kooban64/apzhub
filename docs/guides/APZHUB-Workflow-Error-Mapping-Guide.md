# APZHUB — Workflow Error Mapping Guide

**Milestone:** APZWORKFLOW-002  
**Date:** 2026-07-15

---

## Rule

Thin platform-service impls translate `WorkflowDomainError` → `PlatformServiceError`. PostgreSQL / Drizzle errors are never returned raw to callers.

| Domain code | Category | Code |
| ----------- | -------- | ---- |
| `validation_error`, `reference_error`, `missing_repos` | `validation` | `VALIDATION_FAILED` |
| `not_found` | `not_found` | `NOT_FOUND` |
| `duplicate`, `conflict` | `conflict` | `CONFLICT` |
| `invalid_lifecycle_transition` | `business_rule` | `BUSINESS_RULE_VIOLATION` |
| `forbidden` | `authorization` | `FORBIDDEN` |
| pg / drizzle / connection patterns | `integration` | `PROVIDER_UNAVAILABLE` |
| other | `internal` | `INTERNAL_ERROR` |

Helper: `mapWorkflowDomainError` exported from `@apzhub/platform-services`.
