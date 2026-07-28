# Remediation Groups — Post CERT-001 Residual Plan

> **Programme:** APZHUB-QA-RECERT-002  
> **Status:** **ACCEPTED** · Engineering Wave 2 in progress  
> **Rule:** Group by **engineering root cause** only — not by product  
> **Prior Orders 1–6:** CLOSED (do not reopen as engineering authority)

## Group index

| Order | Identifier             | Title                                                    | Complexity | Est. reduction       | Status                                 |
| ----: | ---------------------- | -------------------------------------------------------- | ---------- | -------------------- | -------------------------------------- |
|     1 | RG-LAW-SUITE-SCOPE     | Exclude Law Trust from main E2E / run under Law config   | S          | 7 PW hard            | **REMEDIATED** (ENG-0016)              |
|     2 | RG-CERT-PIN-DRIFT      | Refresh frozen SemVer + OpenAPI certification pins       | M          | **50** Vitest        | **REMEDIATED** (ENG-0017 **ACCEPTED**) |
|     3 | RG-LAW-HOST-QUALITY    | Law lint + TypeScript boundary hygiene                   | S          | 1 lint + 1 TS        | **REMEDIATED** (ENG-0016)              |
|     4 | RG-LAW-API-AUTHZ       | Align Law API authz test fixtures with PermissionService | M–L        | **24** Vitest        | **REMEDIATED** (ENG-0018)              |
|     5 | RG-AUTH-SHELL-RESIDUAL | Stabilise Better Auth / shell session for E2E            | L          | 4 PW hard + 30 flaky | **REMEDIATED** (ENG-0019 **ACCEPTED**) |
|     6 | RG-SUPPORT-CERT        | Support error-map / a11y / request lifecycle residual    | M          | 6 PW hard            | **REMEDIATED** (ENG-0020 **ACCEPTED**) |
|     7 | RG-LAW-SEARCH-INT      | Law search/index integration fixtures                    | M          | **7** Vitest         | **REMEDIATED** (ENG-0018)              |
|     8 | RG-OBSERVE-WB          | Observe workbench manifest journey                       | S–M        | 1 PW hard            | **REMEDIATED** (ENG-0020 **ACCEPTED**) |
|     9 | RG-VISUAL-INBOX        | Refresh Support inbox visual baseline                    | S          | 1 PW hard            | **REMEDIATED** (ENG-0020 **ACCEPTED**) |
|    10 | RG-TESTING-ARCH        | Remove CI SDK/HTTP imports from Testing services layer   | M          | 1 Vitest             | **REMEDIATED** (ENG-0021 **ACCEPTED**) |

---

## RG-LAW-SUITE-SCOPE

| Field                           | Value                                                   |
| ------------------------------- | ------------------------------------------------------- |
| Identifier                      | RG-LAW-SUITE-SCOPE                                      |
| Title                           | Law Trust suite scope correction                        |
| Root cause                      | RCA-01 — law-015 under main E2E with Law origin helpers |
| Included failures               | QA2-F-002…008                                           |
| Estimated engineering reduction | **7** Playwright hard failures                          |
| Dependencies                    | None                                                    |
| Engineering complexity          | S                                                       |
| Suggested programme order       | **1** (first — high leverage, low risk)                 |
| Status                          | **REMEDIATED** — APZHUB-ENG-0016 **ACCEPTED**           |

---

## RG-CERT-PIN-DRIFT

| Field                           | Value                                                   |
| ------------------------------- | ------------------------------------------------------- |
| Identifier                      | RG-CERT-PIN-DRIFT                                       |
| Title                           | Certification SemVer / OpenAPI pin refresh              |
| Root cause                      | RCA-02 — frozen pins lag Platform 1.2.0                 |
| Included failures               | QA2-V-001…050                                           |
| Estimated engineering reduction | **50** Vitest failures                                  |
| Dependencies                    | None (policy: pins track catalogue after Owner approve) |
| Engineering complexity          | M                                                       |
| Suggested programme order       | **2**                                                   |
| Status                          | **REMEDIATED** — APZHUB-ENG-0017 **ACCEPTED**           |

---

## RG-LAW-HOST-QUALITY

| Field                           | Value                                               |
| ------------------------------- | --------------------------------------------------- |
| Identifier                      | RG-LAW-HOST-QUALITY                                 |
| Title                           | Law host lint and TypeScript hygiene                |
| Root cause                      | RCA-03                                              |
| Included failures               | QA2-L-001, QA2-T-001                                |
| Estimated engineering reduction | **1** lint + **1** typecheck                        |
| Dependencies                    | None                                                |
| Engineering complexity          | S                                                   |
| Suggested programme order       | **3** (can batch with Order 1 in one ENG programme) |
| Status                          | **REMEDIATED** — APZHUB-ENG-0016 **ACCEPTED**       |

---

## RG-LAW-API-AUTHZ

| Field                           | Value                                         |
| ------------------------------- | --------------------------------------------- |
| Identifier                      | RG-LAW-API-AUTHZ                              |
| Title                           | Law API permission fixture alignment          |
| Root cause                      | RCA-04                                        |
| Included failures               | QA2-V-051…074                                 |
| Estimated engineering reduction | **24** Vitest                                 |
| Dependencies                    | Prefer after RG-LAW-HOST-QUALITY              |
| Engineering complexity          | M–L                                           |
| Suggested programme order       | **4**                                         |
| Status                          | **REMEDIATED** — APZHUB-ENG-0018 **ACCEPTED** |

---

## RG-AUTH-SHELL-RESIDUAL

| Field                           | Value                                                  |
| ------------------------------- | ------------------------------------------------------ |
| Identifier                      | RG-AUTH-SHELL-RESIDUAL                                 |
| Title                           | Auth and shell E2E residual stabilisation              |
| Root cause                      | RCA-05                                                 |
| Included failures               | QA2-F-016…019, QA2-FL-001…030                          |
| Estimated engineering reduction | **4** hard + **30** flaky                              |
| Dependencies                    | Independent of Law/Support groups; high value for cert |
| Engineering complexity          | L                                                      |
| Suggested programme order       | **5**                                                  |
| Status                          | **REMEDIATED** — APZHUB-ENG-0019 **ACCEPTED**          |

---

## RG-SUPPORT-CERT

| Field                           | Value                                                         |
| ------------------------------- | ------------------------------------------------------------- |
| Identifier                      | RG-SUPPORT-CERT                                               |
| Title                           | Support certification residual (error map / a11y / lifecycle) |
| Root cause                      | RCA-06                                                        |
| Included failures               | QA2-F-009…014                                                 |
| Estimated engineering reduction | **6** Playwright hard                                         |
| Dependencies                    | Independent of Law groups                                     |
| Engineering complexity          | M                                                             |
| Suggested programme order       | **6**                                                         |
| Status                          | **REMEDIATED** — APZHUB-ENG-0020 **ACCEPTED**                 |

---

## RG-LAW-SEARCH-INT

| Field                           | Value                                         |
| ------------------------------- | --------------------------------------------- |
| Identifier                      | RG-LAW-SEARCH-INT                             |
| Title                           | Law search and integration test fixtures      |
| Root cause                      | RCA-07                                        |
| Included failures               | QA2-V-075…081                                 |
| Estimated engineering reduction | **7** Vitest                                  |
| Dependencies                    | Prefer after RG-LAW-API-AUTHZ                 |
| Engineering complexity          | M                                             |
| Suggested programme order       | **7**                                         |
| Status                          | **REMEDIATED** — APZHUB-ENG-0018 **ACCEPTED** |

---

## RG-OBSERVE-WB

| Field                           | Value                                         |
| ------------------------------- | --------------------------------------------- |
| Identifier                      | RG-OBSERVE-WB                                 |
| Title                           | Observe workbench journey hardening           |
| Root cause                      | RCA-08                                        |
| Included failures               | QA2-F-001                                     |
| Estimated engineering reduction | **1** Playwright hard                         |
| Dependencies                    | None                                          |
| Engineering complexity          | S–M                                           |
| Suggested programme order       | **8**                                         |
| Status                          | **REMEDIATED** — APZHUB-ENG-0020 **ACCEPTED** |

---

## RG-VISUAL-INBOX

| Field                           | Value                                         |
| ------------------------------- | --------------------------------------------- |
| Identifier                      | RG-VISUAL-INBOX                               |
| Title                           | Support inbox visual baseline refresh         |
| Root cause                      | RCA-09                                        |
| Included failures               | QA2-F-015                                     |
| Estimated engineering reduction | **1** Playwright hard                         |
| Dependencies                    | Prefer after RG-SUPPORT-CERT if UI changes    |
| Engineering complexity          | S                                             |
| Suggested programme order       | **9**                                         |
| Status                          | **REMEDIATED** — APZHUB-ENG-0020 **ACCEPTED** |

---

## RG-TESTING-ARCH

| Field                           | Value                                         |
| ------------------------------- | --------------------------------------------- |
| Identifier                      | RG-TESTING-ARCH                               |
| Title                           | Testing services CI SDK boundary compliance   |
| Root cause                      | RCA-10                                        |
| Included failures               | QA2-V-082                                     |
| Estimated engineering reduction | **1** Vitest                                  |
| Dependencies                    | None                                          |
| Engineering complexity          | M                                             |
| Suggested programme order       | **10**                                        |
| Status                          | **REMEDIATED** — APZHUB-ENG-0021 **ACCEPTED** |

**Authority:** Engineering Wave 2 **COMPLETE**. All repository-approved remediation groups remediated. Final portfolio re-cert: [APZHUB-QA-CERT-002](../final-certification/README.md) (**CERTIFICATION FAILED**).
