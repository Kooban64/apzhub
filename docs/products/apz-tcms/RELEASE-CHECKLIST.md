# APZ TCMS — Release 1.0 Checklist

> **Programme:** APZ-TCMS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Complements:** [RELEASE-GOVERNANCE-CHECKLIST](../../releases/RELEASE-GOVERNANCE-CHECKLIST.md)  
> **Date:** 2026-07-19

---

## A. Before packaging/certification programme

| #   | Check                                                    | Status now     |
| --- | -------------------------------------------------------- | -------------- |
| A1  | Release Definition Pack complete                         | **Done**       |
| A2  | Delivery path = Existing Platform → Commercial Packaging | **Documented** |
| A3  | Owner Acceptance of APZ-TCMS-001                         | Pending        |
| A4  | Kiwi / GitLab / AI exclusions explicit                   | **Documented** |
| A5  | Named Owner Approval for packaging programme             | **Open**       |
| A6  | Integration SDK **1.0.0** + GHA freeze held              | **Held**       |

---

## B. Before Release Candidate (packaging programme)

| #   | Check                                                         |
| --- | ------------------------------------------------------------- |
| B1  | Vertical / GHA audits still green                             |
| B2  | OpenAPI validate PASS for testing paths                       |
| B3  | Typecheck · lint · build as required by packaging scope       |
| B4  | Playwright Testing smoke revalidated (or limitation restated) |
| B5  | Known Limitations filed for SemVer **1.0.0**                  |
| B6  | No Kiwi brand as SoR; no Module → Connector bypass            |
| B7  | Secrets never in logs/UI/repos                                |

---

## C. Before Owner Acceptance of SemVer 1.0.0

| #   | Check                                             |
| --- | ------------------------------------------------- |
| C1  | `docs/releases/tcms/1.0.0/` complete              |
| C2  | Certification class + single recommendation filed |
| C3  | Portfolio / catalogue / CHANGELOG updated         |
| C4  | No unauthorised scope expansion                   |

---

## This programme

Documentation only — B/C not executed here.
