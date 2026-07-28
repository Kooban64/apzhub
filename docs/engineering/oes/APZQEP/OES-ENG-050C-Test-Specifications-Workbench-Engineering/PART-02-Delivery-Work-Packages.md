# APZQEP-OES-ENG-050C

# PART 2 — Delivery Work Packages

| Item     | Value               |
| -------- | ------------------- |
| Document | APZQEP-OES-ENG-050C |
| Part     | **2 of 5**          |
| Status   | **FILED**           |

---

## 1 Purpose

Define ordered work packages (WP) that map 1:1 to OES-ARCH-012 surfaces and quality obligations.

Implementation SHALL proceed by WP. Skipping WP acceptance criteria inside a PR is a defect.

---

## 2 Work package catalogue

| WP        | Title                            | Architecture trace    | Deliverable                                           |
| --------- | -------------------------------- | --------------------- | ----------------------------------------------------- |
| **WP-01** | Module registration & Sidebar IA | ARCH-012 Part 2 §3    | QEP Test Specifications nav entries; permission-gated |
| **WP-02** | Routes & deep links              | Part 2 §4             | Stable route tree per Appendix C                      |
| **WP-03** | API client & DTO binding         | ENG-050B REST         | Typed client; error envelope; correlation id          |
| **WP-04** | Explorer                         | Part 2 §6 · Part 3 §3 | Columns, filters, sort, pagination, selection         |
| **WP-05** | Inspector shell                  | Part 3 §4             | Regions, header, status, authoritative flag           |
| **WP-06** | Draft create / edit              | Part 3 §5             | Create + `updateDraft` forms                          |
| **WP-07** | Action bar & dialogs             | Part 3 §9–10          | All contract actions via `availableActions` only      |
| **WP-08** | Review queue                     | Part 2 §7 · Part 4 §5 | Filtered `under_review` surface                       |
| **WP-09** | Dashboard                        | Part 4 §6             | Counts / attention widgets from APIs                  |
| **WP-10** | Search UI                        | Part 2 §8             | Capability search + global result open                |
| **WP-11** | Relationships                    | Part 3 §6             | Viewer + add/remove gated                             |
| **WP-12** | Versions & Compare               | Part 3 §7             | Lineage + compare view                                |
| **WP-13** | History                          | Part 3 §8             | History panel / route                                 |
| **WP-14** | Cross-capability links           | Part 2 §9             | Governed unavailable slots                            |
| **WP-15** | Session / prefs                  | Part 2 §10 · 018      | Filter/selection restore + re-fetch                   |
| **WP-16** | A11y hardening                   | ARCH-012 Part 5 §3    | Keyboard, focus, axe                                  |
| **WP-17** | Playwright journeys              | Part 4 (this OES)     | E2E paths                                             |
| **WP-18** | Docs & evidence                  | OES-000 §10.3         | Product pack under `docs/products/.../workbench/`     |

---

## 3 Recommended delivery order

```text
WP-01 → WP-02 → WP-03
  → WP-04 → WP-05 → WP-06 → WP-07
  → WP-08 → WP-09 → WP-10
  → WP-11 → WP-12 → WP-13 → WP-14
  → WP-15 → WP-16 → WP-17 → WP-18
```

WP-03 MAY proceed in parallel with WP-01/02. WP-07 MUST follow WP-05. WP-16/17 MUST cover all prior UI WPs before Owner Acceptance of implementation.

---

## 4 Per-WP definition of done (minimum)

Each WP SHALL include:

1. Implementation conforming to OES-ARCH-012
2. Tests appropriate to the WP (see Part 4)
3. No new Domain/Infra business rules
4. Actions only from `availableActions` where applicable
5. Design System tokens only
6. Docs touch for non-trivial surfaces

---

## 5 Explicit exclusions from WPs

| Excluded                           | Reason                                        |
| ---------------------------------- | --------------------------------------------- |
| `returnToDraft` UI                 | ADR-0074 — not in contracts                   |
| Fake Test Case / Execution screens | ARCH-012 governed unavailable only            |
| Domain/migration changes           | ENG-050B closed; separate programme if needed |
| Certification programme            | Later Owner Instruction                       |

---

## END OF PART 2
