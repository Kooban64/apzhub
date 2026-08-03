# IMPLEMENTATION-ROADMAP — APZQEP-164-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-164-000   |
| Timestamp | 20260803T191002Z |

## Lifecycle (mandatory)

```text
APZQEP-164-000 Architecture (this pack)
        ↓
PBR-APZQEP-164-000 Architecture Approval
        ↓
Owner Auth → APZQEP-164 Engineering
        ↓
Operational readiness (as required)
        ↓
PBR-APZQEP-164 Engineering Certification
        ↓
Wave 5 eligibility (APZQEP-165)
```

Do **not** shortcut to implementation.

## Suggested engineering slices (post-approval — not authorised now)

| Slice | Intent                                                   |
| ----- | -------------------------------------------------------- |
| 164-A | `@apzhub/platform-dashboard` scaffold + registry         |
| 164-B | `@apzhub/platform-visualization` core charts/timelines   |
| 164-C | APZQEP Dashboard Workspace shell + Executive/QA landings |
| 164-D | Evidence viewers integration                             |
| 164-E | QI visualisation + recommendation panels                 |
| 164-F | Release readiness dashboard                              |
| 164-G | Saved views, performance projections, a11y hardening     |

Exact IDs deferred to Owner Auth for APZQEP-164.

## Dependencies

Waves 1–3 platforms must remain SoR/source for data. Wave 4 consumes; does not redesign.

## Out of roadmap for 164

External AI providers · Continuous Quality automation (Wave 5) · Ecosystem marketplace (Wave 6)
