# Platform Admin — Step 1 acceptance & refinements backlog

| Field    | Value                                                         |
| -------- | ------------------------------------------------------------- |
| Owner    | **STEP 1 ACCEPTED** — 2026-08-17                              |
| Baseline | `/platform-admin` Overview vertical slice                     |
| Rule     | Do not further polish or expand Step 1 until Owner reopens it |

## Non-blocking visual refinements (later optimisation)

Recorded for backlog — **not** in Step 2 scope:

1. Status-bar / footer density and version display polish
2. Header search affordance when lookup is not configured (lighter empty state)
3. Notification bell idle state styling
4. Capability health row spacing / alignment with Tenants panel
5. Mobile narrow-viewport pass for Overview only
6. Clarify legacy `/ops` vs Platform Admin in mode switcher copy

## Authority note (carry forward)

`superadmin` remains a **legacy compatibility path**. Target authority model is explicit platform roles and permissions (`platform.nav.administration.view` and successors). Do not introduce new dependencies on the legacy role.
