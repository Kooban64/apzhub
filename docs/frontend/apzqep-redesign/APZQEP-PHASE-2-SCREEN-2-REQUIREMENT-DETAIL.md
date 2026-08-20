# APZQEP Phase 2 — Screen 2 visual authority (Requirement Detail)

**Record:** PHASE 2 / SCREEN 2 / REQUIREMENT DETAIL / VISUAL AUTHORITY  
**Status:** LOCKED — design direction only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-19  
**Authority image:** [visuals/phase-2/02-requirement-detail-authority.png](./visuals/phase-2/02-requirement-detail-authority.png)

This image is the **approved design direction** for the Requirement Detail screen. It is layout authority for the forthcoming Phase 2 implementation specification. It is **not** an instruction to implement, and **not** an instruction to reproduce sample data literally.

## Owner instruction (normative)

```text
# APZQEP PHASE 2 — VISUAL AUTHORITY
# SCREEN 2: REQUIREMENT DETAIL

Attached visual is the APPROVED DESIGN DIRECTION for the APZQEP Requirement Detail screen.

DO NOT IMPLEMENT YET.

Use this visual as the layout authority for the forthcoming Phase 2 implementation specification.

Important interpretation rules:

1. This is a PRODUCT UI specification, not an instruction to reproduce sample data literally.

2. Desktop light and desktop dark MUST have identical:
   - geometry
   - navigation
   - tabs
   - information hierarchy
   - panel positions
   - actions

   Theme changes appearance only — never layout.

3. Mobile is the responsive transformation of the SAME screen, not a separate product design.

4. Preserve the accepted Phase 1/1V APZQEP shell:
   APZ | APZQEP | Application selector | Search | Create | Notifications | User

5. Requirement Detail is an authoritative quality work surface, not a dashboard.

6. The intended hierarchy is:

   Requirement
      ├── Details
      ├── User Stories
      ├── Acceptance Criteria
      ├── Test Cases
      ├── Test Plans
      ├── Executions
      ├── Defects
      ├── Attachments / Evidence where supported
      └── History

7. The right-side Quick Overview is contextual information, not KPI decoration.

8. Traceability must use real QEP relationships only.

9. DO NOT invent the sample counts, statuses, owner, PRD reference, tags or traceability shown in the visual.

10. Existing backend truth still governs capability. In particular:
    - User Story is not yet a durable entity.
    - Acceptance Criteria are not yet independently addressable objects.
    - Test Case/domain reconciliation is still required.
    - Release is not yet an authoritative aggregate.

These visual elements express the TARGET Phase 2 experience; they do not authorise fake data or parallel stores.

11. DO NOT modify the existing UI yet.
DO NOT start Phase 2 implementation.
DO NOT create schemas.
DO NOT create User Stories or Acceptance Criteria.
DO NOT wrap old QEP screens underneath this design.

Record this visual as:

PHASE 2 / SCREEN 2 / REQUIREMENT DETAIL / VISUAL AUTHORITY

Await the remaining Phase 2 visual(s) and consolidated implementation instruction.
```

## Relationship to Screen 1

Screen 1 inspector **Open Requirement** lands here.  
This screen is the requirement **centre**. Do not collapse it back into the list inspector.

## Layout authority (for Screen 3 matching)

Desktop: Phase 1 QEP shell; breadcrumb `Requirements / {ID}`; title + status; type / priority badges; Edit + overflow + prev/next; description; object tabs; three columns on Details (metadata · description/business value/risk/tags · Quick Overview + Traceability).

Mobile: same hierarchy stacked; tabs may compress (Details, Stories, AC, Tests, More); sticky footer Edit Requirement.

Quick Overview counts and Traceability links are **structure**, not seed data. When implemented later, empty / Unavailable / not-yet-durable child types must be honest.

## Lock sequence (Owner)

```text
Screen 1 — Requirements                    LOCKED
Screen 2 — Requirement Detail              LOCKED (this document)
Screen 3 — User Story + Acceptance Criteria LOCKED
Domain / migration rules                   NOT DEFINED
Consolidated Phase 2 Cursor instruction    NOT AUTHORISED
```

## Next

Phase 2 visuals 1–3 are locked. Domain / migration rules are next. No implementation until one consolidated Cursor instruction.
