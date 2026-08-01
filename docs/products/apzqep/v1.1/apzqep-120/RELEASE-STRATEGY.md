# Release Strategy — APZQEP-120

**Planning programme does not create releases or bump versions.**

---

## Recommendation

**Multiple incremental releases** within LIMITED_AVAILABILITY, plus **internal prereleases**, with **feature flags** for storage cutover and live Playwright.

Not recommended: single big-bang at programme end only (too much risk concentration).

---

## Release boundaries

### R0 — Security ACL band

| Field         | Value                                 |
| ------------- | ------------------------------------- |
| Slices        | S01, S02                              |
| Packages      | Evidence patch; TE patch as needed    |
| Compatibility | Narrowing-only                        |
| Certification | Security tests + L-EM-01 closed       |
| Freeze        | Short freeze on Evidence/TE ACL files |
| Deploy class  | LA patch (no unrestricted GA)         |
| Flags         | None required                         |

### R1 — Async operability

| Field         | Value                                |
| ------------- | ------------------------------------ |
| Slices        | S07–S10, S15 (OpenAPI may ship here) |
| Packages      | TE minor/patch; event manifests      |
| Certification | Worker drain + contract tests        |
| Flags         | Worker enable per env                |

### R2 — Evidence durability

| Field         | Value                                      |
| ------------- | ------------------------------------------ |
| Slices        | S03–S06 (+ S10 if needed)                  |
| Packages      | Evidence **minor** (durability capability) |
| Certification | Migration + storage + hash + audit         |
| Flags         | `EVIDENCE_DURABLE=1` cutover               |
| Freeze        | Evidence schema/storage freeze             |
| Risk          | Highest — canary tenant first              |

### R3 — Platform core UX foundations

| Field         | Value                                            |
| ------------- | ------------------------------------------------ |
| Slices        | S11–S14, S16 (flagged), S17–S18                  |
| Packages      | search-qep minor; TE if runner; web registration |
| Certification | Search ACL + notify smoke + health               |
| Flags         | Playwright live; notify email if D-004           |

### R4 — Programme certification

| Field         | Value                                                           |
| ------------- | --------------------------------------------------------------- |
| Slices        | S19, S20 (+ any waivers)                                        |
| Packages      | Align versions per Board                                        |
| Certification | Full 120 checklist                                              |
| Outcome       | LA “Enterprise Core hardened” recommendation — **not** GA (180) |

---

## Feature flags

| Flag                     | Default prod      | Slice   |
| ------------------------ | ----------------- | ------- |
| Evidence durable backend | OFF until R2 cert | S03–S04 |
| TE live Playwright       | OFF               | S16     |
| QEP email notifications  | OFF unless D-004  | S13     |

---

## Versioning policy (recommendation)

- Patch: security/operability without API shape change (R0, parts of R1).
- Minor: durable Evidence, search types, notify types.
- Major: only if Board approves breaking API (not planned).

Tags: follow existing `apzqep-evidence-v*` / TE tag patterns when Owner authorises release programmes.

---

## Availability

Remain **LIMITED_AVAILABILITY** through APZQEP-120 unless Board elevates. Unrestricted GA is **APZQEP-180** territory.
