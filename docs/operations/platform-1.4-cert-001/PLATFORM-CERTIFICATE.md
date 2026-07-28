# Platform Certificate — Platform 1.4

> **Programme:** Platform-1.4-CERT-001  
> **Baseline:** Platform 1.4  
> **Date:** 2026-07-23  
> **Classification:** **PRODUCTION READY WITH OPERATIONAL QUALIFICATIONS**

## Certificate statement

APZHUB Platform **1.4** has completed its authorised Architecture, ADR, Engineering (ENG-001A · ENG-001B-P0–P4), Operational Readiness, Remediation, and Build Validation programmes. Engineering is **CLOSED**. Architecture is **frozen**. Durable notification runtime is **implemented** with feature flag **default OFF** and process-local runtime **retained**. Migrations **0065–0067** are present on the certified environment. Quality gates pass under the certified packaging procedure, subject to recorded Operational Qualifications.

## Final classification

### PRODUCTION READY WITH OPERATIONAL QUALIFICATIONS

**Justification (objective):**

1. All prerequisite programmes **ARCH-001 → BLD-001** are Owner-**ACCEPTED** with evidence packs.
2. No outstanding Platform actions remain from OR/REM/BLD.
3. Quality gates **PASS** for typecheck, lint, format, packaging build (`env -u NODE_ENV`), affected Vitest, and sampled repository certification.
4. `pnpm build` under shell `NODE_ENV=development` **FAILS** — classified as **Operational Qualification** (OQ-BLD-001), not a Platform defect (BLD-001).
5. Durable runtime enablement remains intentionally gated (OQ-DUR-001).
6. Product Playwright residuals are reclassified off Platform (OQ-PW-001).

Therefore the platform is production-releasable for the Platform 1.4 baseline **with** the Operational Qualifications that operators must apply.

## Binding freezes (retained)

- Durable feature flag default **OFF**
- Process-local runtime retained until named enablement Approval
- Integration SDK 1.0.0 · Workflow Execute gated · Email SoR / SMTP deferred · FIN-001 STOP · WebSockets unauthorised
- No further Platform 1.4 engineering programmes authorised

## Maintenance mode

Upon Owner Certification Acceptance, Platform 1.4 enters **Maintenance Mode**. Platform 2.0 and further 1.4 implementation programmes require new Owner Approval.
