# APZHUB-QA-CERT-004 — Owner Acceptance

> **Programme:** APZHUB-QA-CERT-004  
> **Title:** Platform 1.2.0 Visual Certification Review  
> **Baseline:** Platform **1.2.0**  
> **Date:** 2026-07-21  
> **Status:** **ACCEPTED** (Owner Decision — APZHUB-RELEASE-001 bootstrap)

---

## Finding

The CERT-003 hard failure on Support Analytics visual was caused by an **incorrect committed baseline** (Home placeholder), not a Support Analytics product regression.

## Action recorded

Playwright baseline `support-analytics-chromium-linux.png` updated to the correct Analytics capture. Visual suite **3/3 PASS**.

## Recommendation

**READY FOR OWNER VISUAL ACCEPTANCE**

Acceptance authorises treating the visual residual as closed for certification purposes. Full Platform 1.2.0 portfolio re-certification (if required) remains a separate Owner-authorised certification programme.

## Stop

Await explicit Owner Acceptance. No engineering without a new named programme.

## Owner Decision

**ACCEPTED** — recorded under APZHUB-RELEASE-001 Owner Programme Approval (2026-07-22).
