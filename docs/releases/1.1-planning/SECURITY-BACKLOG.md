# APZHUB Release 1.1 — Security Backlog

> **Programme:** APZHUB-RELEASE-001  
> **Date:** 2026-07-19  
> **Authority:** Document 013 · product OBS items · Risk Register

| ID     | Item                                                   | Classification                      | 1.1 candidate?                                         | Evidence                  |
| ------ | ------------------------------------------------------ | ----------------------------------- | ------------------------------------------------------ | ------------------------- |
| SEC-01 | OBS-LAW-01 PermissionService / legal permission wiring | Security Improvement · Deferred 1.0 | **Implemented** — APZHUB-1.1-001 (Awaiting Acceptance) | OBS-LAW-01                |
| SEC-02 | Auth tenant claim residual honesty / hardening         | Security · Compliance               | **Yes**                                                | Law readiness · KL-LAW-05 |
| SEC-03 | Secrets-as-refs audits across connectors               | Security Improvement · Operational  | **Yes** (audit/docs + gaps)                            | R-03 · 013                |
| SEC-04 | Superadmin audit path reviews                          | Security Improvement                | **Yes**                                                | 007 / 013                 |
| SEC-05 | Engine admin UI exposure risk (masking)                | Security · UX                       | **Ongoing**                                            | R-06                      |
| SEC-06 | OAuth placeholder debt (QA)                            | Security · Technical Debt           | **Selective**                                          | PL-KL-13                  |
| SEC-07 | Workflow credential reference enforcement              | Security Improvement                | **Maintain/verify**                                    | Workflow KL               |

Zero Trust posture remains mandatory. No security item authorises bypass of AuthZ.
