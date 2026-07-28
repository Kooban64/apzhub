# Engineering Plan (Advisory — Orders 1–6 — CLOSED)

> **Programme:** APZHUB-QA-RECERT-001  
> **Authority:** Historical. Orders 1–6 executed (ENG-0006…0015 **ACCEPTED**).  
> **Superseded for residual CERT-001 failures by:** [../residual-analysis/ENGINEERING-PLAN.md](../residual-analysis/ENGINEERING-PLAN.md) (APZHUB-QA-RECERT-002)

---

## Suggested engineering order (historical)

| Order | Group(s)                                                | Suggested programme shape                     | Failures addressed | Est. | Rationale                                              | Closure                                          |
| ----: | ------------------------------------------------------- | --------------------------------------------- | -----------------: | ---- | ------------------------------------------------------ | ------------------------------------------------ |
|     1 | RG-HEALTH-503                                           | Platform health/deps for Playwright webServer |                  6 | M    | Restores `/api/health` 200 bar used by SPR certs       | ENG-0006 **ACCEPTED**                            |
|     2 | RG-AUTH-SHELL                                           | Deterministic E2E auth seed + shell hydration |                 20 | M    | Unlocks navigation, palette, notify, activity          | ENG-0006 **ACCEPTED** (residual → QA-RECERT-002) |
|     3 | RG-LAW-DNS                                              | Keep `pg` server-only on Law Trust routes     |                  7 | M    | Removes Build Error overlay blocking all Law Trust E2E | ENG-0007 **ACCEPTED**                            |
|     4 | RG-A11Y-CONTRAST                                        | Design-token contrast on primary button       |                  4 | S    | WCAG AA honesty; clears login + Support axe            | ENG-0008 **ACCEPTED**                            |
|     5 | RG-MOCK-FETCH + RG-PW-API + RG-SELECTORS                | Playwright test hygiene batch                 |                 11 | S    | High pass-rate gain; no product redesign               | ENG-0009…0011 **ACCEPTED**                       |
|     6 | RG-METRICS-WB + RG-TCMS-WB + RG-WORKFLOW-WB + RG-VISUAL | Product workbench residuals + Support visuals |                  8 | M    | After shared shell/test fixes; re-cert first           | ENG-0012…0015 **ACCEPTED**                       |

---

## Estimated number of engineering programmes

**Six (6)** bounded remediation programmes — **all CLOSED**.

---

## Residual engineering

Do **not** extend this plan. Use [residual-analysis ENGINEERING-PLAN](../residual-analysis/ENGINEERING-PLAN.md) after Owner Review of APZHUB-QA-RECERT-002.

---

## Out of scope forever under this plan

- Email SoR · FIN-001 · Workflow Execute unlock · Release 1.3 mega-plan
- Platform redesign · Integration SDK unfreeze
