# APZQEP Phase 2 — Domain lock

**Status:** LOCKED  
**Date:** 2026-08-19  
**Authority:** Owner domain freeze + Phase 2 implementation instruction

This document is the **domain authority** for Phase 2. Presentation authority remains the locked Screen 1–3 visuals. Do not invent a parallel Requirement store. Do not start Phase 3.

## Hierarchy

```text
qep_application
       └── Requirement (EXISTING)
                ├── AcceptanceCriterion (NEW)   requirement_id REQUIRED, user_story_id OPTIONAL
                └── UserStory (NEW)
                       └── AcceptanceCriterion (NEW)
```

```text
NEW OBJECTS          UserStory, AcceptanceCriterion
NOT NEW              Requirement, Application, Test, Execution, Evidence, Defect, Traceability, IAM, Audit
```

## Rules

1. **Requirement remains SoR.** Reuse `qep_requirement`. New Requirements bind to `qep_application.id` (stored as existing `projectId` for certified API compatibility). Do not create Requirement v2.

2. **User Story** is a durable aggregate under one Application and one Requirement. No orphan Stories. A Story is not another Requirement type and does not replace Requirement.

3. **Acceptance Criterion** is independently addressable. `requirementId` is required. `userStoryId` is optional so legacy criteria can sit directly on the Requirement.

4. **Legacy `acceptance_criteria` / `acceptance_criteria_json` promotion** is additive and idempotent. Preserve exact text, parent Requirement, provenance, and order. **Do not invent a User Story parent.**

5. **Post-migration authority.** Durable AC records are the operating model. READ: durable first; fallback to legacy JSON only for unmigrated history. WRITE: durable AC only. Legacy JSON is compatibility/archive, not a second writable SoR.

6. **Human-readable keys** (`US-184`, `AC-041`) are unique within tenant + application scope. Database UUID/opaque id remains the primary key.

7. **Application is mandatory for new Phase 2 objects.** Legacy unbound Requirements remain Unbound; do not fabricate mappings.

8. **No Release** fields or selectors.

9. **Statuses (restrained).** Stories: `draft | active | in_review | approved | archived` (reconciled with existing QEP vocabulary; no sprint/dev/QA delivery states). AC lifecycle: `active | archived`. Verification state is **derived**.

10. **Coverage is derived**, never stored as a mutable percentage. Coverage ≠ result. Covered + failed execution is still Covered / Fail.

11. **Requirement coverage** includes direct ACs plus Story ACs. Present `n covered / m gaps` (and Full / Partial / Gap / —). Do not invent quality scores.

12. **Traceability.** Reuse existing QEP traceability where possible. Do not duplicate parent FKs as extra trace links. Phase 2 adds AC → verification-asset linking to the existing Specification aggregate. Do not create a Test Case backend.

13. **Re-parent AC** (Requirement → Story) keeps AC identity and verification/evidence links. **Story re-parent** to another Requirement is forbidden once downstream ACs or verification exist (explicit audited move later).

14. **Archive, do not cascade-delete** linked quality history.

15. **Provenance** fields (`origin_type`, `origin_reference`, `accepted_by`, `accepted_at`) exist so later AI proposal-accept is possible. AI does not write authoritative records in Phase 2. Do not abuse `draft` as an AI scratch store.

16. **Audit** reuses `qep_requirement_audit`. No `qep_definition_audit_v2`.

17. **Permissions** remain PermissionService. QEP Master is UX composition. No nine product roles.

18. **Source independence** is unchanged. Story/AC access does not imply `source.read` / `source.write`.
