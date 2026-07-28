# APZHUB Incident Management

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20  
> **Complements:** [INCIDENT-MANAGEMENT-STANDARD.md](./INCIDENT-MANAGEMENT-STANDARD.md)

---

## Definition

An **incident** is an unplanned interruption or degradation of a catalogue service or commercial product in an environment (especially Production).

## Severity

| Severity | Definition                                  | Example                                       |
| -------- | ------------------------------------------- | --------------------------------------------- |
| P1       | Tier A down or major data/security incident | Identity/Gateway unavailable; credential leak |
| P2       | Tier B product path blocked for many users  | Support/Projects API failing                  |
| P3       | Partial degradation; workaround exists      | Attention toasts delayed; Search stale        |
| P4       | Minor / cosmetic / single user              | UI polish defect                              |

## Lifecycle

```text
Detect → Log → Classify → Contain → Diagnose → Resolve → Communicate → Close → Problem?
```

1. **Detect** — monitoring, user report, health endpoint, CI smoke
2. **Log** — unique incident ID, correlation ID if API-related, severity, service
3. **Classify** — map to SERVICE-CATALOGUE entry
4. **Contain** — stop blast radius (disable feature flag, drain, revoke key)
5. **Diagnose** — logs/traces/health; never expose engine errors to users
6. **Resolve** — fix or rollback per Change Management
7. **Communicate** — status to stakeholders; mask engine brands
8. **Close** — confirm recovery; link Problem if recurring

## Correlation

Preserve gateway `correlationId` end-to-end (Document **010** / **014**).

## Security incidents

Follow [SECURITY-OPERATIONS.md](./SECURITY-OPERATIONS.md). Do not discuss secrets in public channels.
