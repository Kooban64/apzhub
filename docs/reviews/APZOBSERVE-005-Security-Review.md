# APZOBSERVE-005 — Security Review

| Control | Result |
| --- | --- |
| Deny-by-default authz | PASS — production mode + observePlatformOps |
| Granular permissions | PASS — health/metrics/logs/traces/alerts/diagnostics/manage/read |
| Tenant isolation | PASS — persistence assertTenant + list filter; RLS migration 0055 |
| Organisation context | PASS — ServiceRequestContext.organisationId carried |
| Trusted request context | PASS — gateway/pipeline construction |
| Mutation authorization | PASS — read cannot mutate |
| Secret exclusion | PASS — no credential columns; no secret editors; OpenAPI clean |
| Provider credential exclusion | PASS |
| Safe errors | PASS — OBSERVE_SERVICE_UNAVAILABLE; no stack traces to clients |
| Safe logging | PASS — no secrets in handlers/services |
| Diagnostics safety | PASS — provider execution always false/unavailable |
| Frozen Admin/Identity | PASS — untouched |

**Verdict:** Security posture suitable for **PRODUCTION_READY_WITH_LIMITATIONS** (metadata plane).
