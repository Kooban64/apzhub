# IMPLEMENTATION-ROADMAP — APZQEP-165-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-000   |
| Timestamp | 20260804T054651Z |

## Gate

No engineering until:

1. **PBR-APZQEP-165-000** architecture approval
2. Separate **Owner Authorisation** for APZQEP-165 engineering

## Suggested engineering slices (IDs deferred to Owner Auth)

| Slice (indicative) | Scope                                                           |
| ------------------ | --------------------------------------------------------------- |
| S1                 | `@apzhub/platform-orchestration` skeleton + Capability Registry |
| S2                 | Quality Flow registry + run state machine + audit               |
| S3                 | Trigger router + SCM event bindings                             |
| S4                 | Selection policy engine + Automation contract invoke            |
| S5                 | Gate orchestration + QI/Evidence inputs                         |
| S6                 | Approval coordinator + permissions                              |
| S7                 | Release recommendation/decision APIs + QKI projection           |
| S8                 | Notifications + Command touchpoints                             |
| S9                 | APZQEP composition (`qep-*`) + dashboard consumers              |
| S10                | Hardening: DLQ/replay, observability, a11y for approval UX      |

Exact slice IDs remain **OUTSTANDING / FUTURE** until engineering Owner Auth.

## Post-165 V1.1 path

```text
165 eng → 165R ops readiness → PBR-165 certification
→ optional 163A/B/C (separate)
→ 166 only if required (not authorised)
```

## Non-goals for engineering under later auth (reminders)

- No redesign of Waves 1–4
- No external AI unless 163A/B/C authorised
- No autonomous unmanaged production GO
- No additional V1.1 foundational architecture programmes
