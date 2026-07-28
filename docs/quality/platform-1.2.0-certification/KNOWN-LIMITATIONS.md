# APZHUB-QA-CERT-003 — Known Limitations (Certification Snapshot)

> **Programme:** APZHUB-QA-CERT-003  
> **Baseline:** Platform **1.2.0**  
> **Date:** 2026-07-21

---

## Platform Known Limitations (unchanged)

See [Platform 1.2.0 Known Limitations](../../releases/platform/1.2.0/KNOWN-LIMITATIONS.md) — PL12-KL-01…13 remain in force unless separately closed by Owner-accepted programmes.

## Certification-specific notes

| Note                         | Detail                                                                                                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Portfolio green not achieved | QA-CERT-003 result is **CERTIFICATION FAILED**                                                                                                        |
| Hard residual (CERT-003)     | Support visual `support-analytics.png` — reviewed under [CERT-004](../platform-1.2.0-visual-review/README.md) as incorrect baseline; snapshot updated |
| Flaky load                   | 6 Playwright cases required retry to pass                                                                                                             |
| Integration script           | `pnpm test:integration` not defined; Vitest is the approved gate                                                                                      |
| Engineering                  | No fixes authorised or performed under CERT-003                                                                                                       |
| PL12-KL-06                   | Updated to record QA-CERT-003 final certification **FAIL**                                                                                            |
