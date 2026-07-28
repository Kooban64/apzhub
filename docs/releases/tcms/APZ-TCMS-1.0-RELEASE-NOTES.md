# APZ TCMS 1.0.0 — Release Notes

> **Product:** APZ TCMS  
> **Version:** **1.0.0**  
> **Status:** Certification filed — **Awaiting Acceptance** (APZ-TCMS-002)  
> **Certification class:** PRODUCTION_READY_WITH_LIMITATIONS  
> **Date:** 2026-07-19

---

## Summary

First production commercial **APZ TCMS** product release. Packages the existing native Test & Certification Management System (APZTCMS-001…024) as SemVer **1.0.0** — Testing Workbench, `/api/v1/testing/*`, certification/approvals, GHA CI metadata (read-only certified path), Engineering Intelligence, and Search publication — under APZHUB branding. No platform rebuild. No Kiwi TCMS. No GitLab. No AI Assist.

## Packaged (existing platform — not newly implemented)

| Layer                                           | Delivery                                                                         |
| ----------------------------------------------- | -------------------------------------------------------------------------------- |
| Architecture                                    | ADR-0059 native SoR · Kiwi superseded                                            |
| Contracts                                       | `@apzhub/testing-contracts` **0.11.0**                                           |
| Foundation                                      | `@apzhub/testing-foundation` **0.1.0**                                           |
| Persistence                                     | `@apzhub/testing-persistence` **0.11.0**                                         |
| Services                                        | `@apzhub/testing-services` **0.11.0** · `gateway.testing.*`                      |
| HTTP APIs                                       | `/api/v1/testing/*`                                                              |
| Workbench                                       | Testing module (`testing`) · Certification views                                 |
| GHA adapter                                     | `@apzhub/integration-github-actions` **0.1.0** · frozen · PRWL (APZTCMS-019/020) |
| Search publication                              | `@apzhub/search-testing` **0.1.1**                                               |
| EI / Executive dashboards / Reporting adjacency | APZTCMS-021…024                                                                  |
| Commercial planning                             | APZ-TCMS-001 **ACCEPTED**                                                        |

## Consumed platform capabilities

| Capability       | Release 1.0.0 posture                                                         |
| ---------------- | ----------------------------------------------------------------------------- |
| Identity / AuthZ | BetterAuth + testing/certification permissions (server authoritative)         |
| Search           | search-testing publication — no standalone TCMS search engine                 |
| Workflow         | Boundary only — no execute-plane dependency for packaging                     |
| Analytics        | Boundary only — EI/dashboards inside TCMS; no Metabase embed                  |
| Documents        | Evidence/document adjacency patterns; Documents product separate              |
| Notifications    | Via Platform Notification Framework only if authorised — no TCMS-owned notify |

## Not included (Release 1.0)

Kiwi TCMS · GitLab CI adapter · AI Assist / auto-certification · becoming Vitest/Playwright/Jest · GHA workflow dispatch/rerun as product features · platform redesign

## Known limitations

See [KNOWN-LIMITATIONS.md](../../products/apz-tcms/KNOWN-LIMITATIONS.md).

## CHANGELOG

Root [CHANGELOG.md](../../../CHANGELOG.md) — section **[APZ-TCMS-002]**.
