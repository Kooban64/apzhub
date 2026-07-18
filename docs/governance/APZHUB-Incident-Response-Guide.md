# APZHUB Incident Response Guide (M8-06)

## Severity levels

| Level | Example                                     | Response             |
| ----- | ------------------------------------------- | -------------------- |
| P1    | Platform unreachable; auth down             | Immediate; all hands |
| P2    | Readiness failing; degraded DB/Redis        | Within 1 hour        |
| P3    | Environment warn; single framework degraded | Next business day    |
| P4    | CSP report-only findings                    | Backlog              |

## Detection

- `/api/platform/v1/system/health` returns 503
- Operations Console **Resilience** shows critical recovery guidance
- `/api/health` unhealthy for load balancers

## Response workflow

1. **Identify** — check consolidated diagnostics (`/api/platform/v1/security/diagnostics` or Operations → Diagnostics).
2. **Contain** — disable dev registration in prod; block abusive clients via rate limit keys if needed.
3. **Recover** — follow recovery guidance items (database, Redis, runtime, environment).
4. **Verify** — readiness and health return 200; audit for unauthorized access.
5. **Document** — post-incident note in platform audit trail.

## Communication

- Internal: Platform Administration workspace
- External: product status page (future — not in M8-06 scope)

## Out of scope

SOC/SIEM playbooks, automated paging, forensic tooling — deferred.
