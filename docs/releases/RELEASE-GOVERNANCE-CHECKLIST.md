# APZHUB Release Governance Checklist

> **Programme:** APZHUB-RELEASES-001  
> **Classification:** DOCUMENTATION ONLY (this file)  
> **Applicability:** **Mandatory** for every future Product Release before Owner Acceptance  
> **Authority:** [RELEASE-MANAGEMENT-STANDARD](../operations/RELEASE-MANAGEMENT-STANDARD.md) · [PRODUCT-RELEASE-STANDARD](../products/PRODUCT-RELEASE-STANDARD.md) · [RELEASE-NAMING-STANDARD](./RELEASE-NAMING-STANDARD.md) · [DEFINITION-OF-DONE](../operations/DEFINITION-OF-DONE.md)  
> **Last updated:** 2026-07-19

---

## Purpose

Uniform gate checklist for Projects, Time, Support, and any future Production product.  
Owner Acceptance of a Product Release requires every applicable item **PASS** (or **N/A** with written rationale).

---

## A. Preconditions

| #   | Check                                                     | Evidence                                   |
| --- | --------------------------------------------------------- | ------------------------------------------ |
| A1  | Owner Approval recorded for the named release / programme | Approval artefact or CURRENT-MILESTONE     |
| A2  | Scope bound; out-of-scope explicit                        | Release Plan / Scope doc                   |
| A3  | Frozen architectures untouched (or ADR + Owner)           | Freeze list in AI-MANIFEST / CURRENT-STATE |
| A4  | No Module → Connector / Service → Backend bypass          | Boundary tests / audits                    |
| A5  | Engine branding not exposed to standard users             | UI / OpenAPI honesty checks                |

---

## B. SemVer & naming

| #   | Check                                                         | Evidence                                                         |
| --- | ------------------------------------------------------------- | ---------------------------------------------------------------- |
| B1  | Product SemVer assigned (`MAJOR.MINOR.PATCH`)                 | Release Notes · `RELEASES.md`                                    |
| B2  | Version matches evidence directory name                       | `docs/releases/{product}/{version}/`                             |
| B3  | Patch / Minor / Major next lines documented (naming only)     | Baseline Confirmation · `RELEASES.md`                            |
| B4  | No invented marketing version conflicting with disk packages  | Compatibility Statement                                          |
| B5  | Portfolio Release Register updated (or queued for Acceptance) | [PORTFOLIO-RELEASE-REGISTER.md](./PORTFOLIO-RELEASE-REGISTER.md) |

---

## C. Mandatory release artefacts

| #   | Artefact                                 | Typical path                                                            |
| --- | ---------------------------------------- | ----------------------------------------------------------------------- |
| C1  | Release Index                            | `docs/releases/{product}/README.md`                                     |
| C2  | Release Notes                            | `docs/releases/{product}/APZ-*-RELEASE-NOTES.md`                        |
| C3  | CHANGELOG entry                          | Root `CHANGELOG.md` section for the product release                     |
| C4  | Compatibility Statement                  | `docs/releases/{product}/APZ-*-COMPATIBILITY.md`                        |
| C5  | Known Limitations                        | `docs/products/{product}/KNOWN-LIMITATIONS.md` (updated if needed)      |
| C6  | Quality Evidence                         | `docs/releases/{product}/APZ-*-QUALITY-EVIDENCE.md`                     |
| C7  | Completion Report                        | `docs/sprint/APZ-*-completion-report.md`                                |
| C8  | Acceptance Report                        | `docs/foundation/completion-reports/APZ-*-release-acceptance-report.md` |
| C9  | Baseline Report                          | `docs/releases/{product}/{version}/BASELINE-CONFIRMATION.md`            |
| C10 | Version History                          | `docs/products/{product}/RELEASES.md`                                   |
| C11 | Release Directory                        | `docs/releases/{product}/{version}/` (+ evidence index README)          |
| C12 | SemVer history (Patch/Minor/Major lines) | Baseline + `RELEASES.md` + product release README                       |
| C13 | Owner Acceptance recorded                | Acceptance Report status **ACCEPTED / CLOSED**                          |

---

## D. Quality & certification

| #   | Check                                                                   | Evidence                      |
| --- | ----------------------------------------------------------------------- | ----------------------------- |
| D1  | Repository typecheck PASS (or Owner-accepted scoped exception)          | CI / local evidence           |
| D2  | Repository lint PASS                                                    | CI / local evidence           |
| D3  | Repository tests PASS for release scope                                 | Quality Evidence              |
| D4  | Product / API / UI certification PASS when user-facing                  | Playwright / cert reports     |
| D5  | Accessibility considered for UI releases                                | Quality Evidence / a11y notes |
| D6  | Repository remains **PRODUCTION READY** (QA-002) unless Owner exception | QA certification held         |

---

## E. Documentation & navigation

| #   | Check                                                   | Evidence                   |
| --- | ------------------------------------------------------- | -------------------------- |
| E1  | Cross-references resolve (no broken mandatory links)    | Consistency review         |
| E2  | AI-MANIFEST / CURRENT-STATE / CURRENT-MILESTONE updated | Status docs                |
| E3  | PROJECT-INDEX / DOCUMENT-MAP entry present              | Nav docs                   |
| E4  | Product Release Roadmap posture updated                 | PRODUCT-RELEASE-ROADMAP    |
| E5  | Portfolio Release Register row accurate                 | PORTFOLIO-RELEASE-REGISTER |

---

## F. STOP / honesty

| #   | Check                                                     | Evidence                          |
| --- | --------------------------------------------------------- | --------------------------------- |
| F1  | Limitations remain honest (not silently cleared)          | KNOWN-LIMITATIONS                 |
| F2  | Next release lines **not** authorised by Acceptance alone | Baseline Confirmation             |
| F3  | No unapproved adjacent product started                    | STOP section in Completion Report |

---

## Sign-off block (copy into Acceptance Report)

```
Release: APZ <Product> <version>
Checklist: docs/releases/RELEASE-GOVERNANCE-CHECKLIST.md
A–F results: PASS / N/A (list any N/A)
Technical Lead: _______________
Architect: _______________
Owner Acceptance: _______________ Date: _______________
```

---

## Related

| Document                    | Path                                                                           |
| --------------------------- | ------------------------------------------------------------------------------ |
| Portfolio Release Register  | [PORTFOLIO-RELEASE-REGISTER.md](./PORTFOLIO-RELEASE-REGISTER.md)               |
| Release Calendar            | [RELEASE-CALENDAR.md](./RELEASE-CALENDAR.md)                                   |
| Engineering Operating Model | [ENGINEERING-OPERATING-MODEL.md](../operations/ENGINEERING-OPERATING-MODEL.md) |
