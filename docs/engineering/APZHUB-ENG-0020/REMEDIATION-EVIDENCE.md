# APZHUB-ENG-0020 — Remediation Evidence

> **Programme:** APZHUB-ENG-0020  
> **Groups:** RG-SUPPORT-CERT · RG-OBSERVE-WB · RG-VISUAL-INBOX  
> **Order:** ENGINEERING-PLAN Step 5  
> **Date:** 2026-07-21

---

## STEP 1 — Selection

| Field         | Value                                                         |
| ------------- | ------------------------------------------------------------- |
| Plan order    | **5** — `RG-SUPPORT-CERT + RG-VISUAL-INBOX + RG-OBSERVE-WB`   |
| Prior         | RG-AUTH-SHELL-RESIDUAL **REMEDIATED** (ENG-0019 **ACCEPTED**) |
| Status before | **OPEN** · Repository Approved · next in order                |
| Dependencies  | Satisfied (batch authorised; Visual after Support UI)         |

---

## Member closure

| Group           | IDs           | Result         |
| --------------- | ------------- | -------------- |
| RG-SUPPORT-CERT | QA2-F-009…014 | **PASS** (6/6) |
| RG-OBSERVE-WB   | QA2-F-001     | **PASS** (1/1) |
| RG-VISUAL-INBOX | QA2-F-015     | **PASS** (1/1) |

---

## Root causes addressed

| RCA    | Summary                                                                                                                      | Fix                                                                                                |
| ------ | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| RCA-06 | Terminal Support errors retried → `support-error` late; Tab lost in shell chrome; lifecycle remount after article invalidate | Non-retryable Support codes; focus inside Support; articles-only invalidation + inbox nav for cert |
| RCA-08 | Observe strict-mode duplicate text (`hc_pw`/`md_pw`)                                                                         | Cell role locators                                                                                 |
| RCA-09 | Inbox fullPage height drift 800→928                                                                                          | Snapshot refresh                                                                                   |

---

## Remaining OPEN (Wave 2)

1. RG-TESTING-ARCH (ENG-0021 — not authorised)
