# APZHUB-ENG-0008 — Remediation Evidence

> **Programme:** APZHUB-ENG-0008  
> **Group:** RG-A11Y-CONTRAST  
> **Date:** 2026-07-21

---

## STEP 1 — Selection

| Field         | Value                                                                          |
| ------------- | ------------------------------------------------------------------------------ |
| Plan order    | **4** (`ENGINEERING-PLAN.md`)                                                  |
| Prior groups  | RG-HEALTH-503 · RG-AUTH-SHELL · RG-LAW-DNS — **REMEDIATED**                    |
| Status before | **OPEN**                                                                       |
| Dependencies  | Satisfied (orders 1–3 closed; ENG-0007 Owner-**ACCEPTED** with this programme) |

---

## STEP 2 — Verification

| Field                       | Value                                                                                                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Remediation Group           | RG-A11Y-CONTRAST                                                                                                                                                      |
| Root Cause (inventory)      | Primary button contrast 2.66 (fg `#0f172a` on `#1d4ed8`)                                                                                                              |
| Root Cause (implementation) | Missing Tailwind emission of primary-foreground from `packages/ui` → inheritance of foreground; plus status-bar success `#16a34a` on white (3.29) after primary fixed |
| Affected Packages           | `@apzhub/theme`, `@apzhub/ui` (scan), `apps/web`                                                                                                                      |
| Affected Products           | APZHUB Platform (login + Support workbench chrome)                                                                                                                    |
| Affected Platform Services  | None                                                                                                                                                                  |
| Dependencies                | Satisfied                                                                                                                                                             |
| Acceptance Criteria         | Member axe tests pass; WCAG AA ≥ 4.5:1 on remediated tokens/surfaces                                                                                                  |
| Architecture Impact         | Presentation / Design System only                                                                                                                                     |
| SemVer Impact               | None                                                                                                                                                                  |
| Est. failure reduction      | **4**                                                                                                                                                                 |

---

## Changes

1. `packages/theme/src/styles.css` — primary button → `color: var(--color-primary-foreground)`
2. `apps/web/app/globals.css` — `@source "../../../packages/ui/src"`
3. `packages/theme/src/tokens.css` — success `#15803d`, warning `#b45309` (light); AA notes on primary pairs

---

## Member test closure

| ID       | Spec                            | Result   |
| -------- | ------------------------------- | -------- |
| QA-F-001 | `accessibility.spec.ts` — login | **PASS** |
| QA-F-025 | Support a11y — inbox            | **PASS** |
| QA-F-026 | Support a11y — search           | **PASS** |
| QA-F-027 | Support a11y — organizations    | **PASS** |

**Group remaining failures:** **0**  
**Group remaining flaky:** **0**

---

## Residual (other groups — not modified)

RG-MOCK-FETCH · RG-PW-API · RG-SELECTORS · RG-METRICS-WB · RG-TCMS-WB · RG-WORKFLOW-WB · RG-VISUAL · RG-AUTH-SHELL UI residuals (4)
