# APZ TCMS — Validation Rules

**Milestone:** APZTCMS-004  
**Module:** `packages/testing-services/src/validation/`

## Categories

1. **Transitions** — status machines (see State Machines doc).
2. **Relationships** — no self-links; suite cannot parent itself; clone sets `parent*Id`.
3. **Approvals** — comments required on reject/rework; role assignment for author/reviewer/approver.
4. **Versions** — version numbers must increase; case snapshots required on version().
5. **Ownership** — owner/assignee/reviewer IDs must be non-empty when set.
6. **Evidence** — metadata only; `sizeBytes >= 0`; storageRef required.
7. **Execution steps** — results only while `in_progress` or `paused`.

Persistence continues to enforce tenant, revision, and enum membership. Domain validation adds workflow semantics on top.
