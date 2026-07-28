# Known Limitations — Platform 1.2.0 Freeze

> **Programme:** APZHUB-RELEASE-001  
> **Date:** 2026-07-22  
> **Authority:** [platform/1.2.0 KNOWN-LIMITATIONS](../platform/1.2.0/KNOWN-LIMITATIONS.md) · CERT-003/004 packs  
> **Honesty rule:** Do not market limited surfaces as complete.

## Binding PRWL limitations

| ID         | Limitation                                                                                                                                                                                                            | Severity                                                                                                                                                                                     |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PL12-KL-01 | Search composition hooks / live Meilisearch drain not wired for Time/Law                                                                                                                                              | **CLOSED** — [Platform-1.3-ENG-001](../engineering/platform-1.3-eng-001/README.md)                                                                                                           |
| PL12-KL-02 | Observe live alert evaluation / delivery not automated                                                                                                                                                                | **PARTIALLY REMEDIATED** — [Platform-1.3-ENG-002](../../engineering/platform-1.3-eng-002/README.md) Phase A (evaluation/lifecycle/events/hook); delivery providers remain ENG-004 / ADR-0071 |
| PL12-KL-03 | GitLab CI dispatch / rerun / cancel / download unsupported                                                                                                                                                            | Medium                                                                                                                                                                                       |
| PL12-KL-04 | Law client retains localStorage L1 cache with API dual-write (Postgres SoR closed)                                                                                                                                    | Low                                                                                                                                                                                          |
| PL12-KL-05 | Support attachment delete residual · realtime SUP-03 **PARTIALLY REMEDIATED** (SSE ENG-003)                                                                                                                           | Low–Medium                                                                                                                                                                                   |
| PL12-KL-06 | CERT-004 **ACCEPTED**; RELEASE-001 **ACCEPTED**; OPS-001 **ACCEPTED**; OPS-002 A1–A8 implemented — execute go-live checklist under Change ([OPS-002](../../operations/platform-1.2.0-production-readiness/README.md)) | Medium → mitigated                                                                                                                                                                           |
| PL12-KL-07 | No Email System of Record                                                                                                                                                                                             | High                                                                                                                                                                                         |
| PL12-KL-08 | FIN-001 not extracted                                                                                                                                                                                                 | Medium                                                                                                                                                                                       |
| PL12-KL-09 | Workflow / n8n Execute gated                                                                                                                                                                                          | High                                                                                                                                                                                         |
| PL12-KL-10 | Product AU-* / Analytics live embed / Documents binary residuals (Support realtime → ENG-003)                                                                                                                         | Medium                                                                                                                                                                                       |
| PL12-KL-11 | Root `0.1.0-foundation` ≠ platform SemVer **1.2.0**                                                                                                                                                                   | Low                                                                                                                                                                                          |
| PL12-KL-12 | Commercial product SemVer not advanced by 1.2 packaging                                                                                                                                                               | Low                                                                                                                                                                                          |
| PL12-KL-13 | Inherited Platform 1.1.0 PRWL residuals not fully closed by Themes A–C                                                                                                                                                | Medium                                                                                                                                                                                       |

## Flaky E2E residual (non-blocking)

CERT-003 recorded **6** flaky tests that passed on retry (notifications, TCMS, Support Soft performance). Not remediated under freeze — recommendations only.

## Platform 1.3 certification findings (CERT-001)

| ID             | Limitation                                                                              | Severity                        |
| -------------- | --------------------------------------------------------------------------------------- | ------------------------------- |
| P13-CERT-QF-01 | Web production build fails — ENG-004 inbox Button variant                               | **Critical** (blocking release) |
| P13-CERT-QF-02 | Repository typecheck fails — observe-core readonly suppressed* fields                   | **High** (blocking release)     |
| P13-CERT-QF-03 | realtime.test.ts OpenAPI version assertion stale (1.13 vs 1.14)                         | Low                             |
| P13-CERT-QF-04 | Integration SDK wave audit CURRENT-MILESTONE wording (mitigated if OSS-100-11 recorded) | Low                             |
| P13-CERT-QF-05 | Prettier format drift (large)                                                           | Low                             |

## Marketing constraint

Platform **1.2.0** is **Production Ready With Limitations**. It must **not** be described as Email SoR complete, FIN-001 complete, Workflow Execute unlocked, live Search indexing GA, or automated Observe alerting GA. Platform **1.3** certification recommendation is **NOT READY FOR PRODUCTION** until P13-CERT-QF-01/02 are remediated under an Owner-authorised programme.
