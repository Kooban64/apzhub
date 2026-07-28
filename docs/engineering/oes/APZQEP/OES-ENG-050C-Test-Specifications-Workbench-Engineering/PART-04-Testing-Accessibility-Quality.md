# APZQEP-OES-ENG-050C

# PART 4 — Testing, Accessibility & Quality

| Item     | Value               |
| -------- | ------------------- |
| Document | APZQEP-OES-ENG-050C |
| Part     | **4 of 5**          |
| Status   | **FILED**           |

---

## 1 Quality bar (015)

CI MUST pass: lint · types · build · unit/component · Playwright (scoped) · security checks as platform requires.

Failing quality gates MUST NOT merge to main.

---

## 2 Test pyramid

| Layer          | Scope                                                      |
| -------------- | ---------------------------------------------------------- |
| Unit           | Action visibility helpers, filter URL codecs, pure mappers |
| Component      | Explorer row, Inspector regions, dialogs (Testing Library) |
| Integration    | API client against mocked Route Handlers / MSW             |
| E2E Playwright | Journeys below                                             |
| A11y           | axe on primary surfaces                                    |

---

## 3 Mandatory Playwright journeys

| ID     | Journey                                              |
| ------ | ---------------------------------------------------- |
| E2E-01 | Create Draft → edit → save (`updateDraft`)           |
| E2E-02 | Submit for review → appears in Review queue          |
| E2E-03 | Approve from Inspector                               |
| E2E-04 | Reject with rationale required                       |
| E2E-05 | Supersede Approved → navigate successor              |
| E2E-06 | Deep link `/specifications/{id}` opens Inspector     |
| E2E-07 | Action absent from `availableActions` not clickable  |
| E2E-08 | Forbidden / not-found governed states                |
| E2E-09 | Compare two versions                                 |
| E2E-10 | Keyboard path: Explorer → Inspector → primary action |

---

## 4 Accessibility gates

| Gate    | Criterion                                                                                            |
| ------- | ---------------------------------------------------------------------------------------------------- |
| A11Y-01 | axe clean (serious/critical = 0) on Dashboard, Explorer, Inspector, Review, Compare, primary dialogs |
| A11Y-02 | Full keyboard operability for E2E-10                                                                 |
| A11Y-03 | Focus trap in dialogs; restore on close                                                              |
| A11Y-04 | Status not colour-only                                                                               |
| A11Y-05 | `prefers-reduced-motion` respected                                                                   |

---

## 5 Performance checks (engineering evidence)

| Check                       | Target (from ARCH-012)       |
| --------------------------- | ---------------------------- |
| Explorer interactive (warm) | ≤ 2s perceived               |
| Inspector after DTO         | ≤ 500ms client bind          |
| No unbounded list DOM       | Pagination or virtualisation |

Evidence MAY be qualitative in Completion Report if formal perf harness absent; regressions MUST NOT ignore obvious jank.

---

## 6 Review gates (OES-002)

| Gate               | When                               |
| ------------------ | ---------------------------------- |
| Engineering Review | During / end of implementation WPs |
| Workbench Review   | After WP-01…17 complete            |
| Owner Acceptance   | After Workbench Review PASS        |

---

## END OF PART 4
