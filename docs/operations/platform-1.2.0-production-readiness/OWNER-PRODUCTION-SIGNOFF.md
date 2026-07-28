# Owner Production Sign-off — Platform 1.2.0

> **Programme:** APZHUB-OPS-002 · **Action:** A8  
> **Status:** **ACCEPTED** (Owner Decision — APZHUB-PLAN-001 bootstrap · Platform 1.2 Programme CLOSED)

## Go-live recommendation

**READY FOR OWNER PRODUCTION ACCEPTANCE**

Platform **1.2.0** operational actions **A1–A8** are implemented in-repository. Cutover may proceed after executing the [GO-LIVE-CHECKLIST.md](./GO-LIVE-CHECKLIST.md) on the target host under Change Management.

## Outstanding limitations (accepted under PRWL)

| ID                  | Limitation                                                             |
| ------------------- | ---------------------------------------------------------------------- |
| PL12-KL-02          | Observe live alert evaluation/delivery not automated — manual on-call  |
| PL12-KL-07          | No Email System of Record                                              |
| PL12-KL-08          | FIN-001 not extracted                                                  |
| PL12-KL-09          | **Workflow Execute remains gated**                                     |
| PL12-KL-01/03/05/10 | Search drain / GitLab mutations / Support realtime / product residuals |

## Accepted operational risks

| Risk                                     | Acceptance                                                |
| ---------------------------------------- | --------------------------------------------------------- |
| Shared-host coexistence SPOF             | Accepted with port catalogue + audits + Owner Change gate |
| Manual triage monitoring                 | Accepted (PL12-KL-02)                                     |
| No CD pipeline yet                       | Accepted — manual `docker:build:prod` / `docker:up:prod`  |
| Public ACME certs not pre-issued in repo | Accepted — internal TLS or host nginx                     |

## Deferred roadmap (not authorised here)

- Platform **1.3**
- Email SoR
- FIN-001
- Workflow Execute unlock
- Live Observe delivery programme
- CD / CVE automation (post-cutover B-items from OPS-001)

## Owner confirmation

By accepting, Owner confirms:

1. A1–A8 artefacts are accepted for production use.
2. Go-live checklist will be executed under Change before traffic.
3. PRWL marketing constraints remain binding.
4. Workflow Execute stays gated; Email SoR / FIN-001 / 1.3 remain blocked.

## Owner Decision

**ACCEPTED** — Platform 1.2 Programme **CLOSED**. Recorded under APZHUB-PLAN-001 (2026-07-22).
