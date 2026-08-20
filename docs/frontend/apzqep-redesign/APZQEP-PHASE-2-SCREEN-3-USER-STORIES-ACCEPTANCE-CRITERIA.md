# APZQEP Phase 2 — Screen 3 visual authority (User Stories + Acceptance Criteria)

**Record:** APZQEP REDESIGN / PHASE 2 / SCREEN 3 / USER STORIES + ACCEPTANCE CRITERIA / VISUAL AUTHORITY  
**Status:** LOCKED — design authority only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-19  
**Authority image:** [visuals/phase-2/03-user-stories-acceptance-criteria-authority.png](./visuals/phase-2/03-user-stories-acceptance-criteria-authority.png)

This image is the **approved design direction** for the User Stories workspace **within Requirement Detail**. It must be retained as Phase 2 visual authority and reconciled with the final consolidated Phase 2 implementation instruction.

It is **not** authorisation to create schemas, promote Acceptance Criteria, migrate `acceptance_criteria` / `acceptance_criteria_json`, change Requirements APIs, invent coverage, generate AI stories, or modify the existing UI.

## Owner instruction (normative)

```text
# APZQEP PHASE 2 — VISUAL AUTHORITY
# SCREEN 3: USER STORIES + ACCEPTANCE CRITERIA

Attached visual is the APPROVED DESIGN DIRECTION for the User Stories
workspace within Requirement Detail.

DO NOT IMPLEMENT YET.

This visual must be retained as a Phase 2 visual authority and reconciled
with the final consolidated Phase 2 implementation instruction.

============================================================
1. PURPOSE OF THIS SCREEN
============================================================

This screen answers:

"What user behaviour must satisfy this Requirement?"

The hierarchy is:

Application
  ↓
Requirement
  ↓
User Story
  ↓
Acceptance Criteria
  ↓
Test Cases
  ↓
Test Plans / Execution
  ↓
Evidence / Defects

Requirement remains the parent quality requirement.

User Story describes a user/business behaviour required to satisfy it.

Acceptance Criteria define the individually verifiable conditions under
which the Story is considered satisfied.

Do not flatten these into one generic requirements record.


============================================================
2. VISUAL AUTHORITY
============================================================

The attached visual controls:

- screen geometry
- information hierarchy
- tabs
- table composition
- Inspector behaviour
- Quick Overview placement
- responsive behaviour
- light/dark equivalence

Light and dark MUST have identical layout.

Theme changes presentation only.

Mobile is the responsive transformation of the same workspace.


============================================================
3. ACCEPTED APZQEP SHELL
============================================================

Preserve the accepted shell:

APZ | APZQEP | Application: {application} | Search QEP... | + Create | Bell | User

The Application selector uses the authoritative qep_application context
established in Phase 1E.

Do not restore the old flattened QEP catalogue navigation.


============================================================
4. REQUIREMENT CONTEXT
============================================================

The screen remains inside Requirement Detail.

Example visual hierarchy:

Requirements / REQ-021 / User Stories

User Authentication                    Approved

Functional   High   Priority 1

[Details] [User Stories] [Acceptance Criteria] [Test Cases]
[Test Plans] [Executions] [Defects] [Attachments] [History]

The visual contains sample values only.

DO NOT seed:

REQ-021
User Authentication
Approved
Functional
High
Priority 1

unless those records actually exist.


============================================================
5. USER STORIES TAB
============================================================

User Stories should be a proper work surface.

Toolbar:

Search user stories...

Status: All
Type: All
Priority: All
Filters

+ Add User Story

Table:

ID
Title
Type
Status
Priority
Estimate
Updated
Owner
Actions

Keep the presentation dense and professional.

Do not turn every Story into a large card.


============================================================
6. USER STORY MODEL — TARGET
============================================================

Phase 0 established that User Story is currently NOT a durable QEP entity.

Phase 2 will therefore require a proper durable User Story object.

Conceptually it needs:

id
applicationId
requirementId
storyKey / human-readable identifier
title
description
type
status
priority
estimate where supported
owner
createdBy
createdAt
updatedAt

Do not use this visual instruction to create the schema yet.

The final Phase 2 implementation instruction will authorise the domain work.


============================================================
7. USER STORY CONTENT
============================================================

A Story should support conventional behaviour such as:

As a [actor/persona]
I want [capability]
So that [outcome]

However:

Do not force the database into three strings merely because this format
is common.

The authoritative object should support a useful title and description.

AI-generated Stories later use the same object.

No separate AI Story store.


============================================================
8. USER STORY SELECTION
============================================================

Selecting a Story row should open the accepted contextual Inspector.

The Inspector provides rapid review without leaving Requirement context.

Example:

US-184

User Login                       Approved

Feature   High

As a registered user, I want to log in so that I can access my account.

Details | Acceptance Criteria | Tests | More


DETAILS

Status          Approved
Type            Feature
Priority        High
Estimate        5 SP
Owner           Jane Smith
Created         3 days ago
Updated         2 hrs ago

[ Edit ] [...]

Opening the Story explicitly may use a full work surface.

Do not make the Inspector a second independent editing application.


============================================================
9. ACCEPTANCE CRITERIA
============================================================

Acceptance Criteria are NOT merely decorative bullets.

Phase 0 established that existing QEP Requirements currently contain:

acceptance_criteria: string[]

That is insufficient for the target experience.

Phase 2 must promote Acceptance Criteria into individually addressable,
traceable quality objects.

Target hierarchy:

REQ-021
   ↓
US-184
   ↓
AC-001
AC-002
AC-003


Each Acceptance Criterion must eventually be independently:

- identifiable
- reviewable
- traceable
- testable
- linkable to Test Cases
- status-aware where appropriate


============================================================
10. ACCEPTANCE CRITERIA EXPERIENCE
============================================================

When the selected Story opens Acceptance Criteria, the work surface should
support something conceptually like:

ACCEPTANCE CRITERIA

ID       CRITERION                                  COVERAGE
AC-001   Valid credentials authenticate user        3 Tests
AC-002   Invalid password is rejected               2 Tests
AC-003   Locked account cannot authenticate          1 Test

+ Add Acceptance Criterion

Do not invent coverage numbers.

Coverage comes only from actual trace relationships.


============================================================
11. EXISTING ACCEPTANCE CRITERIA MIGRATION
============================================================

Do NOT discard existing Requirement acceptance_criteria string[] data.

During Phase 2 domain reconciliation, determine how existing criteria can be
promoted safely.

Where deterministic:

existing acceptance criterion string
→ durable Acceptance Criterion

Preserve:

- original text
- provenance
- parent Requirement

Do not manufacture a User Story parent for old criteria if none exists.

Therefore Acceptance Criterion must be capable of being associated directly
with a Requirement where necessary for legacy compatibility.

Target model should support:

Requirement
   └── Acceptance Criterion

and:

Requirement
   └── User Story
          └── Acceptance Criterion

Do not lose historical information merely to enforce the new hierarchy.


============================================================
12. TEST TRACEABILITY
============================================================

Acceptance Criteria become the important bridge between Definition and
Verification.

Target:

Requirement
   ↓
Story
   ↓
Acceptance Criterion
   ↓
Test Case
   ↓
Execution
   ↓
Evidence / Defect

This enables APZQEP eventually to answer:

Which requirements are tested?

Which stories are tested?

Which acceptance criteria have no tests?

Which criteria failed?

Which defects block an acceptance criterion?

Do not calculate fake coverage percentages.


============================================================
13. QUICK OVERVIEW
============================================================

The right panel shown in the visual is contextual information, NOT a KPI
dashboard.

It may show real counts such as:

User Stories
Acceptance Criteria
Test Cases
Test Plans
Executions
Defects

Only show a number where an authoritative relationship/read model supports it.

Otherwise:

Unavailable

or:

—

Do not use fake green health indicators.


============================================================
14. TRACEABILITY PANEL
============================================================

The visual contains a compact Traceability section.

Its purpose is orientation.

Example:

Upstream
REQ-021

Downstream
Acceptance Criteria (12)

View in Traceability

This must use real trace relationships.

Do not infer relationships from matching names or filenames.


============================================================
15. CREATE USER STORY
============================================================

The + Add User Story action eventually opens a deliberate creation workflow.

Minimum target:

Parent Requirement
Title
Description
Type
Priority
Owner
Estimate where supported
Acceptance Criteria

Do not create a giant modal.

Use the established APZQEP work-surface/drawer pattern appropriate to the
amount of information being captured.


============================================================
16. AI DIRECTION — NOT YET IMPLEMENTATION
============================================================

Design the domain so that future APZQEP AI can propose Stories and Acceptance
Criteria without creating parallel objects.

Future concept:

Requirement
+ PRD/specification
+ authorised Source context
       ↓
APZQEP AI
       ↓
Suggested User Stories
Suggested Acceptance Criteria
       ↓
Human Review
       ↓
Accept / Modify / Reject
       ↓
normal authoritative QEP records

AI provenance must eventually be retained.

But:

DO NOT implement AI in this Phase 2 visual pass.

DO NOT silently generate authoritative Stories.


============================================================
17. APPLICATION CONTEXT
============================================================

Every new Story belongs within the authoritative Application context.

Application context comes from qep_application.

Do not use arbitrary legacy project strings for newly created Stories.

Server-side AuthZ and tenant isolation remain mandatory.


============================================================
18. PERMISSIONS
============================================================

Do not use the visual concept "QEP Master" as an IAM shortcut.

Existing PermissionService remains authoritative until the QEP product-role
phase deliberately extends it.

Read/write actions must be server enforced.

UI visibility alone is not security.


============================================================
19. SOURCE RELATIONSHIP
============================================================

Source remains independently permissioned.

A Story or Acceptance Criterion may eventually link to relevant source
context.

But:

QEP Story access != source.read

and:

QEP Story edit != source.write

Do not introduce source-write capability through this screen.


============================================================
20. MOBILE
============================================================

The attached mobile design is authoritative for responsive direction.

Mobile should prioritise:

Requirement context
Story tabs
Story list
Story selection
Story Inspector
Acceptance Criteria
Primary action

Do not squeeze the complete desktop table into the viewport.

The bottom/primary action may become:

+ Add User Story

where authorised.


============================================================
21. HONESTY STANDARD
============================================================

Do not invent:

- Story counts
- Acceptance Criteria counts
- test coverage
- execution counts
- owners
- estimates
- statuses
- trace links
- defects
- quality health

Use real data or the accepted honest states.


============================================================
22. WHAT THIS VISUAL DOES NOT AUTHORISE
============================================================

DO NOT IMPLEMENT YET.

Specifically do not yet:

- create User Story tables
- promote Acceptance Criteria
- migrate acceptance_criteria_json
- change Requirements APIs
- create Test Case models
- redesign Test Plans
- redesign Execution
- implement AI generation
- enable Source write
- implement SSH execution
- implement Terminal
- start Phase 3

This is DESIGN AUTHORITY ONLY.


============================================================
23. RECORD
============================================================

Record the supplied visual as:

APZQEP REDESIGN
PHASE 2
SCREEN 3
USER STORIES + ACCEPTANCE CRITERIA
VISUAL AUTHORITY

The Phase 2 visual set now consists of:

SCREEN 1 — Requirements
SCREEN 2 — Requirement Detail
SCREEN 3 — User Stories + Acceptance Criteria

Await the consolidated Phase 2 domain and implementation instruction.

DO NOT IMPLEMENT PHASE 2 YET.
```

## Phase 2 visual set (complete)

| Screen                               | Authority                                                                                        | Status |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ | ------ |
| 1 Requirements                       | [APZQEP-PHASE-2-SCREEN-1-REQUIREMENTS.md](./APZQEP-PHASE-2-SCREEN-1-REQUIREMENTS.md)             | LOCKED |
| 2 Requirement Detail                 | [APZQEP-PHASE-2-SCREEN-2-REQUIREMENT-DETAIL.md](./APZQEP-PHASE-2-SCREEN-2-REQUIREMENT-DETAIL.md) | LOCKED |
| 3 User Stories + Acceptance Criteria | this document                                                                                    | LOCKED |

## Next gate (not started)

```text
Screen 1 — Requirements                    LOCKED
Screen 2 — Requirement Detail              LOCKED
Screen 3 — User Stories + AC               LOCKED
Domain / migration rules                   NOT DEFINED  ← next
Consolidated Phase 2 Cursor instruction    NOT AUTHORISED
Implementation                             NOT STARTED
```

Do not invent the domain model from this visual. The next authorised step is a careful Phase 2 domain and migration definition (durable User Story; addressable Acceptance Criteria; legacy `acceptance_criteria` string[] promotion without manufactured Story parents; `qep_application` for new records). Only after that lock should one Cursor implementation instruction be issued.
