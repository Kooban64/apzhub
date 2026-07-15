# APZHUB Integration SDK — v1.0 Certification

> **Milestone:** OSS-100-10 — Integration SDK v1.0 Certification & Release Readiness  
> **Package:** `@apzhub/integration-sdk` **0.9.0** (not bumped to 1.0.0)  
> **Status:** Certified — **PRODUCTION_READY_WITH_LIMITATIONS**  
> **Date:** 2026-07-12  
> **Primary docs:** [packages/integration-sdk/docs/SDK-V1-CERTIFICATION.md](../../packages/integration-sdk/docs/SDK-V1-CERTIFICATION.md)

---

## Purpose

Short architecture index for the owner-approved **OSS-100-10** Integration SDK v1.0 certification gate. Formal findings live in the package certification documents; this file points agents and owners to the authoritative pack.

---

## Outcome

| Field             | Value                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------ |
| Programme outcome | `PRODUCTION_READY_WITH_LIMITATIONS`                                                        |
| Exit criteria     | **PRODUCTION READY** (documented limitations)                                              |
| Package version   | **0.9.0** — await owner for **1.0.0**                                                      |
| Hard blockers     | **None**                                                                                   |
| Recommendation    | Promote to v1.0.0 after owner accepts limitations and API freeze — **do not auto-promote** |

---

## Package certification documents

| Document             | Path                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------- |
| Master certification | [SDK-V1-CERTIFICATION.md](../../packages/integration-sdk/docs/SDK-V1-CERTIFICATION.md)   |
| Public API audit     | [SDK-API-AUDIT.md](../../packages/integration-sdk/docs/SDK-API-AUDIT.md)                 |
| Security audit       | [SDK-SECURITY-AUDIT.md](../../packages/integration-sdk/docs/SDK-SECURITY-AUDIT.md)       |
| Release readiness    | [SDK-RELEASE-READINESS.md](../../packages/integration-sdk/docs/SDK-RELEASE-READINESS.md) |
| Public API guide     | [SDK-PUBLIC-API.md](../../packages/integration-sdk/docs/SDK-PUBLIC-API.md)               |
| Compatibility        | [SDK-COMPATIBILITY.md](../../packages/integration-sdk/docs/SDK-COMPATIBILITY.md)         |

---

## Related

| Artefact            | Path                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------- |
| Audit working notes | [sdk-v1-audit-notes.md](./sdk-v1-audit-notes.md)                                         |
| Completion report   | [OSS-100-10-completion-report.md](../sprint/OSS-100-10-completion-report.md)             |
| ADR                 | [ADR-0058](../adr/ADR-0058-integration-sdk-v1-readiness-limitations.md)                  |
| Re-cert suite       | `testing/sdk-v1/integration-sdk-v1-recertification.test.ts`                              |
| Prior harness index | [APZHUB-Integration-SDK-Adapter-Harness.md](./APZHUB-Integration-SDK-Adapter-Harness.md) |

---

## Documented limitations

No Event Bus · no webhook ingress · no provisioning · no durable checkpoint/dedup stores · PlaceholderVault only · large root barrel (prefer subpaths) · package remains 0.9.0 until owner promotes.
