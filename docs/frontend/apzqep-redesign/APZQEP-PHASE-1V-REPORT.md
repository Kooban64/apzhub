# APZQEP REDESIGN — PHASE 1V (Visual Acceptance)

Date: 2026-08-19  
Authority: Owner Phase 1V visual instruction  
Evidence: [evidence/phase-1/](./evidence/phase-1/)

Phase 2 was **not started**.

This pass was UI composition only. No new domain capability, no new APIs for screenshots, no fake Application/Release selectors, no Source permission changes.

---

```
PHASE 1V VISUAL STATUS:
READY FOR OWNER REVIEW

COMMAND CENTRE:
CONFORMS

MY WORK:
CONFORMS

INSPECTOR:
CONFORMS

MOBILE:
CONFORMS

HEADER:
CONFORMS

EMPTY STATES:
CONFORMS

AUDIT NOISE:
RESOLVED

SOURCE INDEPENDENCE:
PASS

PHASE 2:
NOT STARTED
```

---

## Evidence

| #   | File                                         | Notes                                                                    |
| --- | -------------------------------------------- | ------------------------------------------------------------------------ |
| 01  | `01-qep-command-centre-desktop-light.png`    | Attention \| Quality Context, My Work table, subordinate activity        |
| 02  | `02-qep-command-centre-desktop-dark.png`     | Same composition, dark theme                                             |
| 03  | `03-qep-command-centre-laptop.png`           | 1280×800                                                                 |
| 04  | `04-qep-command-centre-mobile.png`           | Attention → My Work → Recent Activity; Home \| Work \| Defects \| More   |
| 05  | `05-qep-master-navigation.png`               | Master IA; Insights / Administration exist below the 900px fold          |
| 06  | `06-qep-my-work-desktop.png`                 | Dense table, underlined tabs, compact filters                            |
| 07  | `07-qep-my-work-inspector.png`               | Selected row + right Inspector (`def-msz9e5wx-1`)                        |
| 08  | `08-qep-my-work-mobile.png`                  | Table + bottom nav; no desktop sidebar                                   |
| 09  | **Not produced** — see `09-NOT-PRODUCED.txt` | No QEP-entitled + Source-denied demo persona. Finance was not used.      |
| 10  | `10-qep-source-visible-read-access.png`      | QEP shell with Source under Engineering for `org_member` (`source.read`) |

## Honest residuals (repository truth)

- Defect identities are generated (`def-msz…`), not `DEF-901`.
- Application shows `—` because portfolio has no selected application. No fake Application or Release control.
- Recent Quality Activity is empty after infrastructure events were omitted. Underlying audit records were not modified.
- Evidence gaps remain **Unavailable** (no gap API).
- Two sanctioned assigned defects exist from visual seeding; they are real records, not hard-coded UI fixtures.

## Empty states

Zero-metric cards were removed. When there is no attention or assigned work, the surfaces use:

- “No quality items currently require your attention.” with factual None / None detected / Unavailable lines.
- “No quality work is currently assigned to you.” plus the assignment explanation.

“None detected” is used only when coverage actually returns zero uncovered checks.

## 09

A QEP-entitled user with Source independently unavailable does not exist in `DEMO_PERSONAS`. Source permissions were not changed to manufacture that screenshot.
