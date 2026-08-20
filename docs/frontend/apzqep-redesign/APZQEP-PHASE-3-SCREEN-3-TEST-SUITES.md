# APZQEP Phase 3 — Screen 3 visual authority (Test Suites)

**Record:** APZQEP REDESIGN / PHASE 3 / SCREEN 3 / TEST SUITES / VISUAL AUTHORITY  
**Status:** **LOCKED** — design authority only. **DO NOT IMPLEMENT.**  
**Date:** 2026-08-19  
**Authority image:** [visuals/phase-3/03-test-suites-authority.png](./visuals/phase-3/03-test-suites-authority.png)

The attached visual is the **APPROVED DESIGN DIRECTION** for the APZQEP Test Suites catalogue and suite membership surface. Implementation, when later authorised, must reproduce this geometry — not reinterpret it into folders, a dashboard, a Test Plan, or an Execution.

A Suite is a **reusable grouping of Test Cases**. It is not a Plan, not a Run, and not a folder pretending to be a Suite.

Phase 0 already has a first-class Suite aggregate (`@apzhub/qep-suites`). **Do not create a second Suite store.** That package currently treats Test Cases as out of scope; membership of Test Cases in Suites is a domain-lock concern, not a licence to invent a parallel product.

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

The Test Suites workspace answers:

```text
What reusable collections of Test Cases exist for this Application?
What is in each Suite?
Who owns it, and is it fit to reuse in Plans?
```

It is **not**:

- the Test Case Library or Designer
- a Test Plan (what / where / how / tools / environment)
- an Execution
- an automation-provider screen

## 2. Visual authority

The image controls geometry, hierarchy, density, tabs, filters, table, Suites Overview, suite detail, contained Test Case list, mobile transformation, and light/dark equivalence.

Desktop Light and Desktop Dark MUST have identical geometry.  
Mobile Light and Mobile Dark MUST have identical geometry.  
Theme changes presentation only.

Do not squeeze the desktop table onto mobile. Overview becomes a separate panel/sheet as shown.

## 3. Shell

Preserve the accepted APZQEP shell:

`APZ | APZQEP | Application selector | Search QEP... | + Create | Bell | User`

Application context is `qep_application`. New Suites belong to the selected Application. Do not fabricate application binding for unresolved legacy records.

## 4. Master navigation

**Test Suites** is active. Only real authorised destinations should be linked. Do not manufacture Admin, Execution, or Plan functionality from this visual.

## 5. Catalogue page

Title: **Test Suites**  
Supporting copy: organise and manage reusable collections of test cases.

Tabs (views over the **same** Suite SoR):

```text
All Suites
My Suites
By Status
By Type
By Tag
```

Filter / action bar:

```text
Search suites...
Type · Status · Tag · Filters
+ Add Suite
```

Compact filters. No dashboard filter cards.

## 6. Table

Desktop target columns:

```text
ID
Name
Description
Type
Test Cases   (count)
Status
Owner
Updated
Tags
```

The visual also shows a **Recently Updated Suites** strip. That is activity over the same Suite SoR, not a second list store.

Rows such as `TS-001 Authentication Suite` and counts `18 / 24 / 86` are **SAMPLE DATA ONLY**. Do not seed them.

## 7. Operator IDs — collision to carry

The visual uses **TS-001 … TS-008** as Suite keys.

Existing Test Specification operator numbers are also **TS-…**. Product Test Cases use **TC-…** on Screens 1–2.

Domain lock must choose Suite keys that do not collide (for example a distinct `SU-` / `SUITE-` prefix, or another scoped scheme). **Do not implement TS- as Suite primary identity from this visual alone.** Opaque database ids remain internal.

## 8. Suite vs Test Case vs Plan

```text
Test Case   reusable definition
    ↑ membership (many)
Suite       reusable collection
    ↑ inclusion (many)
Test Plan   execution strategy (Screen 4)
```

Do not duplicate a Test Case because it is in more than one Suite.  
Do not turn a Suite into a Plan by adding environment / tool / schedule here.  
Do not execute from this screen.

## 9. Type, status, tags

The visual illustrates types such as Functional, API, Security, Performance and statuses Draft / In Review / Approved.

Existing Suite kinds are `standard | shared | reusable | template | reference`. Existing lifecycle includes `draft | review | approved | published | deprecated | archived | retired | deleted`.

These communicate product experience. Domain lock must reconcile one coherent Suite type and lifecycle model. Do not blindly create a second enum set from the visual. Do not confuse Suite type with Test Case type or Defect severity.

## 10. Suites Overview

Right-side compact summary:

- Total Suites
- Approved / In Review / Draft / (other lifecycle buckets the domain actually supports)
- Top Suite Types
- Top Tags

Values must be **derived**. Do not seed the visual’s example totals. Unavailable or omit if not derivable. This is not a quality score.

Mobile: Overview is a separate full-screen / sheet. It must not permanently consume the list viewport.

## 11. Suite detail (mobile / inspector path)

Selecting a Suite opens contextual inspection, then a work surface as shown:

```text
TS-001  Authentication Suite
Details | Test Cases (count) | Activity | More
Edit
```

**Test Cases** tab lists member cases (`TC-n`, title, status) — membership of existing Test Cases, not copies.

Count on the tab must be real. Empty membership is legitimate.

Do not open the Test Case Designer merely by listing a row; a deliberate open action may navigate to Screen 2.

## 12. Existing Suite capability

Reuse/extend `@apzhub/qep-suites`:

- first-class hierarchy, clone, move, lifecycle already exist
- `application` is currently a label; Phase 1E Application binding must be used for **new** Suites
- Test Case membership is **absent** in that package today

Domain lock (after Screen 4) must add membership against the reconciled Test Case / Specification SoR — not a new Suite product.

## 13. Traceability / coverage

A Suite does not itself verify an Acceptance Criterion. Coverage remains:

```text
AC  →  Test Case  →  (Suite membership is grouping only)
```

Do not invent Suite-level coverage percentages. Do not infer Test Case links from Suite name or tags.

## 14. Source / AI / tools / execution

Unchanged:

- QEP Suite access ≠ `source.read`; edit ≠ `source.write`
- No Terminal, no SSH
- No AI generation
- No Playwright / ZAP / provider names as primary Suite navigation
- No execution from this screen

## 15. Honesty

**DO NOT seed:**

- TS-001 … TS-008
- Authentication Suite / API Core Suite / sample descriptions
- Jane Smith or other owners
- 18 / 24 / 86 Test Case counts
- Overview totals
- tags, timestamps, types, statuses

Use real data or honest empty / Unavailable / —.

## 16. Do not implement yet

This visual does **not** authorise:

- Suite schema changes
- Test Case membership APIs
- a new Suite backend
- Test Plans
- Execution redesign
- tool / environment SoR
- AI
- Source write
- Phase 3 implementation

Record only.

## 17. Record

```text
APZQEP REDESIGN
PHASE 3
SCREEN 3
TEST SUITES
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
