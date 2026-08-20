# APZQEP Phase 3 — Screen 2 visual authority (Test Case Designer)

**Record:** APZQEP REDESIGN / PHASE 3 / SCREEN 2 / TEST CASE DESIGNER / VISUAL AUTHORITY  
**Status:** **LOCKED** — design authority only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-19  
**Authority image:** [visuals/phase-3/02-test-case-designer-authority.png](./visuals/phase-3/02-test-case-designer-authority.png)

The attached visual is the **APPROVED DESIGN DIRECTION** for the APZQEP Test Case Designer. Implementation, when later authorised, must reproduce this geometry — not reinterpret it into the old Test Specification workbench, a dashboard, or an execution canvas.

This is the full work surface reached from Screen 1 via **Open Test Case** / **Edit**. It is **not** the Library, a Suite, a Test Plan, or an Execution.

This visual does **not** authorise a new Test Case backend. Phase 0 established a durable **Specification** capability that currently **lacks first-class Action → Expected Result steps**. Extending Specification vs inventing a parallel Test Case store belongs in the consolidated Phase 3 domain lock, after Screens 3–4.

Phase 2 remains **CLOSED**. Phase 3 implementation is **NOT AUTHORISED**.

```text
SCREEN 1 — Test Case Library        LOCKED
SCREEN 2 — Test Case Designer       LOCKED
SCREEN 3 — Test Suites              LOCKED
SCREEN 4 — Test Plans               LOCKED

DOMAIN RECONCILIATION               NEXT
PHASE 3 IMPLEMENTATION              NOT AUTHORISED
```

---

## 1. Purpose

The Test Case Designer is the detailed working screen for one reusable Test Case.

It answers:

```text
What is this Test Case?
What must be true before it runs?
What data does it use?
What numbered actions must be performed?
What is expected after each action?
Which Acceptance Criteria does it verify?
```

It is **not**:

- the Test Case Library (Screen 1)
- a Test Suite (Screen 3)
- a Test Plan / execution strategy (Screen 4)
- an Execution Run
- a Playwright / provider screen
- a CI dashboard

## 2. Visual authority

The attached image controls geometry, information hierarchy, density, tabs, the steps table, the right utility panel, Inspector-to-full-surface relationship, mobile transformation, and light/dark equivalence.

Desktop Light and Desktop Dark MUST have identical geometry.  
Mobile Light and Mobile Dark MUST have identical geometry.  
Theme changes presentation only.

Do not flatten this into a single scrolling form or the old specification page shell.

## 3. Shell

Preserve the accepted APZQEP shell:

`APZ | APZQEP | Application selector | Search QEP... | + Create | Bell | User`

Application context is `qep_application`. This Test Case belongs to the selected Application.

Breadcrumb in the visual: `Test Cases / TC-101`.

## 4. Master navigation

The visual continues the Screen 1 IA. **Test Cases** is active. Only real authorised surfaces should ultimately be linked. Do not manufacture Suites, Plans, Executions, or Admin pages from this screen.

## 5. Page header

Locked structure:

- Breadcrumb: Test Cases / {operator id}
- Title: `{TC-n} {title}` plus status badge
- Type / Priority / Automation badges
- One-line purpose / description
- Actions: **Edit** · **Actions** overflow · previous/next

The visual’s `TC-101 Login with valid credentials` and sample copy are **SAMPLE DATA ONLY**. Do not seed them.

## 6. Tabs

Desktop target tabs:

```text
Details
Preconditions
Test Data (count)
Steps (count)
Expected Results (count)
Attachments (count)
Links (count)
History
```

Counts must be derived. Unavailable / 0 / — are legitimate. Do not fake counts.

Mobile compresses to:

```text
Details
Preconditions
Steps (count)
More
```

with Preconditions, Test Data, Expected Results, Attachments, Links, History reachable from **More** or dedicated stacked panels as shown.

## 7. Details tab

Three-column desktop Details geometry:

**Identity / governance**

- Type
- Priority
- Status
- Automation (Manual / Automated)
- Owner
- Created
- Updated

**Definition / intended execution**

- ID (operator-facing `TC-n`; opaque id remains internal)
- Tags
- Test Suite (usage association — not Suite SoR)
- Execution Method
- Environment
- Target
- Reviewers

**Traceability / reuse**

- Summary
- Verifies Acceptance Criteria (real links only)
- Used By: Suites count · Test Plans count

Honesty: omit or show Unavailable if a field cannot be derived from authoritative data.

## 8. Action → Expected Result steps (mandatory product concept)

This is the core of Screen 2.

The visual’s steps table:

```text
#  | ACTION | TEST DATA | EXPECTED RESULT
```

Numbered, ordered, individually addressable steps. Controls: Expand All · Collapse All · **+ Add Step** · row overflow.

Each step conceptually holds:

```text
step number
action
test data (optional per step)
expected result
```

Phase 0: existing Specification has **no first-class steps**. Domain lock must extend that aggregate (or an equivalent single SoR) — **do not create a second Test Case store** to hold steps.

The six sample steps (navigate to `/login`, enter username, …) are **SAMPLE DATA ONLY**.

Mobile presents steps as numbered cards: Action · Test Data · Expected Result. Do not squeeze the desktop table.

Expected Results may also appear as a dedicated mobile list as shown; it is the same step expected-result data, not a second SoR.

## 9. Preconditions and Test Data

Dedicated tabs exist in the visual.

- **Preconditions** — conditions that must be true before execution
- **Test Data** — data the case needs (count on the tab)

Do not treat these as unaddressable notes if the domain later supports durable items. Do not invent records to fill the tabs.

## 10. Traceability (carried from Phase 2)

Required conceptual relationship:

```text
Acceptance Criterion
        ↓
    Test Case
```

The visual shows:

```text
Verifies Acceptance Criteria
  AC-001  Valid credentials authenticate user
  AC-004  User is redirected to dashboard
+ Add Link
```

Show only real trace relationships. Do not infer from names, titles, tags, filenames, or source paths.

Coverage vs result remains:

```text
Linked AC  →  the AC has verification coverage
Execution  →  result (pass / fail / …)
```

A Test Case existing does not mean PASS. Last Result on this screen is execution-derived, not a definition field.

## 11. Reuse — Used By

The visual shows Suites (2) and Test Plans (3).

A Test Case is a reusable definition. Do not duplicate it because it appears in multiple Suites or Plans. Counts must be real or Unavailable. Suite and Plan surfaces remain Screens 3 and 4.

## 12. Right utility panel

Desktop right column (locked composition):

**Test Case Health** — derived completeness of Preconditions, Steps, Expected Results, Test Data, Attachments, Links. Not a quality score. Do not invent checks.

**Last Result (Latest Execution)** — latest known execution outcome, when, who, **View Executions**. Honest empty if no execution join exists yet (Phase 0 dual execution model is unresolved until later).

**Attachments** — real attachments only.

**Notes** — notes, not a parallel specification.

This panel must not permanently consume the mobile list; mobile stacks or sheets as shown.

## 13. Execution Method / Environment / Target on this screen

The visual places on the Test Case:

```text
Execution Method   Playwright
Environment        QA
Target             Web (Chrome)
```

Screen 1 locked that **tools, environment, and execution target belong to Test Plan / execution strategy**, not the Library.

Record both facts. Domain lock (after Screens 3–4) must decide whether these fields on the Designer are:

- intended defaults / hints on the Test Case, or
- Plan-only facts shown here as read-through, or
- visual overflow to be moved to Screen 4

**Do not implement Playwright, QA, or Chrome as Test Case SoR from this visual alone.**  
**Do not make provider names primary navigation.**

## 14. Automation

`Automated` / `Manual` is execution intent, not an embedded Playwright script. Automation assets and mappings already exist and must be reconciled later.

## 15. Type, priority, status

Same rule as Screen 1: the visual communicates product experience (Functional, High, Approved, …). Reconcile with existing Specification types/lifecycle and do not confuse test priority with defect severity. Do not add a competing lifecycle from this visual alone.

## 16. Attachments, Links, History

- Attachments: files on this Test Case
- Links: includes AC verification links; may include other real relationships
- History: reuse existing audit capability; do not create `qep_definition_audit_v2` or a new Test Case audit store

## 17. Source / AI / tools

Unchanged from Screen 1:

- QEP Test Case access ≠ `source.read`; edit ≠ `source.write`
- No Terminal, no SSH
- No AI generation in Phase 3 visuals
- Future AI proposals must use the same Test Case domain after human accept
- No Playwright/ZAP/Semgrep/Nuclei as primary IA

## 18. Honesty

The image contains illustrative data. **DO NOT seed:**

- TC-101 / sample steps / sample ACs
- Jane Smith, Mary Brown, Alex Lee
- Authentication Suite
- Playwright 1.4.3, QA, Web (Chrome)
- Health checkmarks
- Last Result Passed / 1 day ago
- Attachment `login-flow-diagram.png`
- Suites 2 / Plans 3

Use real data or honest empty / Unavailable / —.

## 19. Do not implement yet

This visual does **not** authorise:

- Test Case schema changes
- Specification step migration
- Test Case APIs
- Test Suites
- Test Plans
- Execution redesign
- tool / environment / target SoR
- AI generation
- Source write
- Phase 3 implementation

Record only.

## 20. Record

```text
APZQEP REDESIGN
PHASE 3
SCREEN 2
TEST CASE DESIGNER
VISUAL AUTHORITY
```

```text
SCREEN 1 — Test Case Library        LOCKED
SCREEN 2 — Test Case Designer       LOCKED
SCREEN 3 — Test Suites              LOCKED
SCREEN 4 — Test Plans               LOCKED

DOMAIN RECONCILIATION               NEXT
PHASE 3 IMPLEMENTATION              NOT AUTHORISED
```

STOP.

Await domain reconciliation (not implementation).
