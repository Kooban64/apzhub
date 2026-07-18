# PRH-002 — Completion Report

> **Story:** PRH-002 — CSP Audit & Progressive Enforcement  
> **Sprint:** PCv2-01  
> **Date:** 2026-07-08  
> **Verdict:** **COMPLETE**

---

## Summary

PRH-002 delivered an audit-first CSP programme: full source inventory, centralized policy builder, violation reporting endpoint, diagnostics counters, development Report-Only mode, and production enforced stable policy. No product functionality changes. PRH-003 not started.

---

## Phases

| Phase                       | Deliverable                                           | Status |
| --------------------------- | ----------------------------------------------------- | ------ |
| 1 — Audit                   | [PCv2-01 CSP Audit](../security/PCv2-01-CSP-Audit.md) | ✅     |
| 2 — Report-Only + reporting | Violation endpoint, diagnostics, dev Report-Only      | ✅     |
| 3 — Reduce exceptions       | `object-src 'none'`; no external CDN origins          | ✅     |
| 4 — Enforcement             | Production `Content-Security-Policy` stable policy    | ✅     |

---

## Implementation

| Component             | Location                                                             |
| --------------------- | -------------------------------------------------------------------- |
| `CspPolicyService`    | `packages/platform-security/src/csp-policy-service.ts`               |
| `CspViolationService` | `packages/platform-security/src/csp-violation-service.ts`            |
| CSP report handler    | `handlePostCspReport` in `api-handlers.ts`                           |
| Web route             | `apps/web/app/api/platform/v1/security/csp-report/route.ts`          |
| Law route             | `apps/law-platform/app/api/platform/v1/security/csp-report/route.ts` |
| App headers           | `apps/*/lib/security-headers.ts` via `@apzhub/platform-security/csp` |

### Policy modes

| Environment | CSP header  | Notes                                                                   |
| ----------- | ----------- | ----------------------------------------------------------------------- |
| Development | Report-Only | HMR `connect-src` includes ws/localhost                                 |
| Production  | Enforced    | Stable policy with `unsafe-inline` / `unsafe-eval` retained for Next.js |

---

## Documentation

| Document                        | Path                                       |
| ------------------------------- | ------------------------------------------ |
| CSP audit                       | `docs/security/PCv2-01-CSP-Audit.md`       |
| Violation reporting             | `docs/security/CSP-Violation-Reporting.md` |
| Security operations guide       | Updated CSP section                        |
| Security reference architecture | Updated header row                         |

---

## Architecture review

| Area                    | Assessment                                                     |
| ----------------------- | -------------------------------------------------------------- |
| Platform stability      | ✅ Dev remains Report-Only; prod policy tested                 |
| Framework compatibility | ✅ Next.js inline scripts accommodated                         |
| Per-app profiles        | ✅ `web` vs `law-platform` connect-src dev tuning              |
| Diagnostics             | ✅ Violation counters in security diagnostics                  |
| Zero Trust              | ✅ Violation endpoint size-limited; no auth required by design |

---

## Technical debt

| Item                                   | Status                      |
| -------------------------------------- | --------------------------- |
| OBS-PC01-03 CSP Report-Only            | ✅ **Closed** in production |
| Nonce-based CSP (remove unsafe-inline) | ⏳ Future milestone         |
| Redis-backed violation store           | ⏳ PCv2-07                  |

---

## Quality gates

| Gate                 | Result |
| -------------------- | ------ |
| `pnpm lint`          | ✅     |
| `pnpm typecheck`     | ✅     |
| `pnpm build`         | ✅     |
| `pnpm test`          | ✅     |
| `pnpm test:coverage` | ✅     |

New tests: `csp-policy-service.test.ts`, `csp-report-handler.test.ts`

---

## Recommendation for PRH-003

Proceed with **security headers hardening** (COOP/CORP evaluation) independently of CSP tightening. Do not remove `unsafe-inline` from script-src until nonce middleware is designed.

---

## Stop condition

PRH-002 complete. **Do not begin PRH-003** until owner approval.
