# Root Cause Analysis

> **Programme:** APZHUB-QA-RECERT-001  
> **Date:** 2026-07-20

---

## Executive summary

The portfolio Playwright suite **executed successfully** as a path (APZHUB-ENG-0005) but did **not** certify green. Failures cluster into a small number of systemic causes rather than 55 independent product regressions.

**Largest root cause (by failure count):** **RG-AUTH-SHELL** — authenticated desktop-shell / framework hydration cascade (**20** failures), strongly coupled to **RG-HEALTH-503** (**6** direct health failures) and Better Auth seed instability (`Invalid password` warnings in webServer logs).

**Second systemic cause:** **RG-LAW-DNS** — Law Trust E2E blocked by Next.js **Build Error** `Can't resolve 'dns'` when `pg` is pulled into the client graph (**7** failures).

**Third high-leverage cluster:** test-only defects — **RG-MOCK-FETCH** / **RG-PW-API** / **RG-SELECTORS** **REMEDIATED** (ENG-0009…0011). Order **5** hygiene batch complete.

**Order 6 residuals:** All Order 6 groups **REMEDIATED** and **ACCEPTED** (ENG-0012…0015). Playwright Remediation engineering **CLOSED**. Portfolio full re-cert (QA-CERT-001) **ACCEPTED** with result **FAIL** — 84 pass · 19 fail · 30 flaky. Residual root-cause analysis: [../residual-analysis/ROOT-CAUSE-ANALYSIS.md](../residual-analysis/ROOT-CAUSE-ANALYSIS.md) (APZHUB-QA-RECERT-002).

**Design-system residual:** **RG-A11Y-CONTRAST** — **REMEDIATED** (APZHUB-ENG-0008) — primary-foreground application + success/warning AA tokens; **4/4** PASS.

---

## Causal chain (platform shell)

```text
Playwright webServer (pnpm --filter @apzhub/web dev)
        ↓
GET /api/health → 503  (RG-HEALTH-503)
        ↓
Login/register using DEV_EMAIL/DEV_PASSWORD unstable (Invalid password)
        ↓
Activity bar / sidebar / command palette / notifications / activity hooks missing
        ↓
SPR-003…007 + dependent workbench journeys fail (RG-AUTH-SHELL)
```

Unblocking **health dependencies + deterministic E2E auth seed** is the highest-value remediation before product-specific workbench fixes.

---

## Causal chain (Law Trust)

```text
Law Trust route import graph includes server `pg` client
        ↓
Turbopack/Next client compile: Module not found: Can't resolve 'dns'
        ↓
Build Error overlay replaces /login
        ↓
All law-015-trust-workflow tests timeout on email input (RG-LAW-DNS)
```

---

## Evidence quality

| Source                            | Used                                                    |
| --------------------------------- | ------------------------------------------------------- |
| FAIL JSON verdict                 | Yes                                                     |
| `test-results/*/error-context.md` | Yes (all 55 + flaky)                                    |
| Retry traces                      | Present under `test-results/*-retry1` (not re-executed) |
| Screenshots                       | Visual failures recorded; Support baselines mismatched  |
| WebServer logs                    | Better Auth Invalid password · Error: aborted           |

---

## Honesty

- Classification uses repository artefacts only.
- No production defect is “fixed” by this programme.
- Some workbench failures (**RG-METRICS-WB**, **RG-TCMS-WB**, **RG-WORKFLOW-WB**) may partially clear after auth/health remediation — re-cert required after each programme.
