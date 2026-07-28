# Engineering Plan — Residual Certification Remediation

> **Programme:** APZHUB-QA-RECERT-002 (analysis)  
> **Baseline:** Platform **1.2.0**  
> **Status:** **ACCEPTED** — Engineering Wave 2 authorised  
> **Historical Orders 1–6:** Remain closed; do not reopen as engineering authority

## Objective

Produce a repository-approved, root-cause-ordered engineering sequence that clears residual CERT-001 failures so a subsequent re-certification programme can target **CERTIFICATION PASS**.

## Constraints

- Engineering programmes require explicit Owner Approval per step.
- Do not implement Email SoR, FIN-001, Workflow Execute, or Release 1.3 under this plan.
- Group by engineering root cause (see [REMEDIATION-GROUPS.md](./REMEDIATION-GROUPS.md)).

## Recommended engineering order

| Step | Suggested programme | Remediation groups                                | Primary gate impact                | Status                                                                                   |
| ---: | ------------------- | ------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------- |
|    1 | APZHUB-ENG-0016     | RG-LAW-SUITE-SCOPE + RG-LAW-HOST-QUALITY          | −7 PW hard; clear lint + typecheck | **ACCEPTED**                                                                             |
|    2 | APZHUB-ENG-0017     | RG-CERT-PIN-DRIFT                                 | −**50** Vitest                     | **ACCEPTED**                                                                             |
|    3 | APZHUB-ENG-0018     | RG-LAW-API-AUTHZ + RG-LAW-SEARCH-INT              | −**31** Vitest                     | **ACCEPTED**                                                                             |
|    4 | APZHUB-ENG-0019     | RG-AUTH-SHELL-RESIDUAL                            | −4 PW hard; −30 flaky              | **ACCEPTED** ([pack](../../engineering/APZHUB-ENG-0019/README.md))                       |
|    5 | APZHUB-ENG-0020     | RG-SUPPORT-CERT + RG-VISUAL-INBOX + RG-OBSERVE-WB | −8 PW hard                         | **ACCEPTED** ([pack](../../engineering/APZHUB-ENG-0020/README.md))                       |
|    6 | APZHUB-ENG-0021     | RG-TESTING-ARCH                                   | −1 Vitest                          | **ACCEPTED** ([pack](../../engineering/APZHUB-ENG-0021/README.md)) — Wave 2 **COMPLETE** |

**Estimated engineering programmes:** **6**

## Estimated certification improvement

| Gate                  | CERT-001 residual | After full plan (target)                     |
| --------------------- | ----------------- | -------------------------------------------- |
| Playwright hard       | 19                | **0** (all residual hard assigned)           |
| Playwright flaky      | 30                | **0** (same auth/shell root cause)           |
| Lint                  | 1                 | **0**                                        |
| TypeScript            | 1                 | **0**                                        |
| Vitest                | 82                | **0** (all residual Vitest assigned)         |
| Full portfolio recert | FAIL              | **PASS** (contingent on execution + re-cert) |

Confidence: **High** for scope/pin/host groups; **Medium** for auth/shell (known chronic flake).

## Dependencies between programmes

```
ENG-0016 (Law suite + host quality)
    │
    ├─► ENG-0017 (cert pins) ── independent, may parallel after Owner allow
    │
    └─► ENG-0018 (Law authz + search)
ENG-0019 (auth/shell) ── independent
ENG-0020 (Support/Observe/visual) ── independent; inbox after Support if UI changes
ENG-0021 (testing arch) ── independent
```

## Exit criteria for the residual engineering train

1. Every inventory ID in [FAILURE-INVENTORY.md](./FAILURE-INVENTORY.md) resolved or reclassified with Owner-approved Known Limitation.
2. Lint, typecheck, Vitest, Playwright hard gates green on portfolio path.
3. Flaky count driven to Owner-accepted threshold (target 0 residual from QA2-FL set).
4. New certification programme (e.g. APZHUB-QA-CERT-002) executed — outside this plan.

## Pointers

- Groups: [REMEDIATION-GROUPS.md](./REMEDIATION-GROUPS.md)
- RCA: [ROOT-CAUSE-ANALYSIS.md](./ROOT-CAUSE-ANALYSIS.md)
- Prior closed plan: [../playwright-remediation/ENGINEERING-PLAN.md](../playwright-remediation/ENGINEERING-PLAN.md)
