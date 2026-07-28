# Platform-1.4-BLD-001 — Platform 1.4 Build & Release Validation

> **Status:** **IMPLEMENTED / AWAITING OWNER ACCEPTANCE**  
> **Classification:** BUILD VALIDATION  
> **Baseline:** Platform 1.4  
> **Reference:** Platform-1.4-REM-001 · Platform-1.4-OR-001 · ADR-0073  
> **Date:** 2026-07-23  
> **Rule:** Validate build/packaging only — no features · no architecture redesign · flag remains OFF

## Pack

| Document         | Path                                           |
| ---------------- | ---------------------------------------------- |
| Root cause       | [BUILD-ROOT-CAUSE.md](./BUILD-ROOT-CAUSE.md)   |
| Validation       | [BUILD-VALIDATION.md](./BUILD-VALIDATION.md)   |
| Remediation      | [BUILD-REMEDIATION.md](./BUILD-REMEDIATION.md) |
| Quality gates    | [QUALITY-GATES.md](./QUALITY-GATES.md)         |
| Completion       | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md) |
| Owner acceptance | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)   |

## Verdict

| Field                        | Value                                                                  |
| ---------------------------- | ---------------------------------------------------------------------- |
| Root cause                   | Shell `NODE_ENV=development` breaks Next.js 16 `/_global-error` export |
| Ownership                    | **Environment** (primary) · **Framework** (contributing)               |
| Platform-owned?              | **No**                                                                 |
| Platform code changes        | **None**                                                               |
| Clean build (correct env)    | **PASS** (`env -u NODE_ENV pnpm build`)                                |
| Clean build (polluted shell) | **FAIL** (`NODE_ENV=development pnpm build`)                           |

## STOP

Await Owner Build Acceptance. Do **not** begin CERT-001. Do **not** enable durable runtime.
