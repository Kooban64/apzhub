# Continuous Certification

> **Programme:** APZHUB-PRODUCT-LIFECYCLE-001  
> **Related:** [PRODUCT-CERTIFICATION-STANDARD](../products/PRODUCT-CERTIFICATION-STANDARD.md) · Platform 1.2.0 certification pack · QA-002 held baseline

---

## Model

Certification is **continuous**, not only a mega-programme at train end.

```text
Work item quality gates (always)
      ↓
Periodic certification evidence refresh (train / quarterly)
      ↓
Promotion certification (SemVer advance)
      ↓
Optional re-cert / PIR after major change
```

## Always-on (every work item)

- Architecture compliance
- Authn/authz/validation/audit/correlation where APIs change
- Tests for changed surfaces
- KL honesty updates
- No STOP breach

## Train / promotion certification

Minimum evidence for Owner Promotion:

1. Scope inventory of Accepted work items
2. Aggregated quality evidence
3. Compatibility / SemVer statement
4. Updated Known Limitations & risks
5. Ops readiness notes when ops surfaces change
6. Recommendation class (e.g. PRODUCTION_READY_WITH_LIMITATIONS when residuals remain)

## Continuous vs mega-planning

Portfolio Packaging programmes (like APZHUB-1.2-009) remain available for **major** baseline promotions. Routine PATCH/MINOR trains may use a lighter promotion pack that still satisfies the checklist above — Owner chooses pack depth in the train charter.

## QA-002 / portfolio CI

**R12-QA-01** (APZHUB-ENG-0005 **ACCEPTED**) established the named portfolio Playwright/Docker re-cert path (`pnpm ops:portfolio-recert`) with durable evidence under `docs/operations/evidence/portfolio-recert/`. Ordinary CI continues to run `pnpm test:e2e`.

**APZHUB-QA-RECERT-001** classifies the 55 failures + 1 flaky into an Owner-ready remediation plan ([docs/quality/playwright-remediation/](../quality/playwright-remediation/README.md)). Repository-wide **green** QA re-certification remains **HELD** until approved remediation programmes land and re-cert evidence is PASS. Path honesty ≠ silent GA.
