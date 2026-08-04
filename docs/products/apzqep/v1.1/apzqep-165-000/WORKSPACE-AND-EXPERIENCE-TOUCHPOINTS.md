# WORKSPACE-AND-EXPERIENCE-TOUCHPOINTS — APZQEP-165-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-000   |
| Timestamp | 20260804T054651Z |

## Rule

Presentation surfaces **consume and initiate via Platform Services**. They never own workflow policy, gate thresholds, or release GO authority.

## Dashboard / Visualization

| Surface                     | Allowed                                    | Forbidden                       |
| --------------------------- | ------------------------------------------ | ------------------------------- |
| Operations dashboard        | Show flow runs, failures, queues           | Mutate policies inline silently |
| Release readiness dashboard | Show gates, approvals, recommendations     | Record GO without service path  |
| Compliance dashboard        | Show decisions, waivers, audit projections | Alter audit history             |

Widgets use Dashboard/Visualization platforms; data via orchestration/read projections.

## Command Palette

Commands such as start flow, approve, reject, inspect run, cancel — each maps to Platform Service operations; permission-filtered (019).

## Notifications

Attention Engine delivers approval requests and failure alerts (021). Actions return through Platform Services. Modules do not send notifications directly.

## Operator UX constraints

- Load preferences before shell render (023)
- Permission-driven visibility
- WCAG AA for approval-critical flows
- No hard-coded suite/gate constants in components
