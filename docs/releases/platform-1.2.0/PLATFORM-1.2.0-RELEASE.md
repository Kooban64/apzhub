# Platform 1.2.0 — Official Release Baseline

> **Programme:** APZHUB-RELEASE-001  
> **Date:** 2026-07-22

## Identity

| Field                   | Value                                                          |
| ----------------------- | -------------------------------------------------------------- |
| Platform product SemVer | **1.2.0**                                                      |
| Repository root version | `0.1.0-foundation`                                             |
| Classification          | **PRODUCTION READY WITH LIMITATIONS**                          |
| Architecture            | **Frozen**                                                     |
| Integration SDK         | **1.0.0** frozen (OSS-100-11)                                  |
| Predecessor packaging   | APZHUB-1.2-009 ([platform/1.2.0](../platform/1.2.0/README.md)) |
| Certification train     | ENG-0001…0022 · QA-CERT-001…004                                |

## What is frozen

| Domain                 | Freeze statement                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------- |
| Engineering baseline   | No further engineering without a new named Owner programme                         |
| Certification baseline | CERT-004 **ACCEPTED**; Support visual residual closed as incorrect baseline        |
| Architecture           | Layered Module → Platform Service → Connector → Engine retained                    |
| Contracts              | `platform-service-contracts` **0.18.0** · workflow **0.4.2** · analytics **0.1.1** |
| Package versions       | Inventory in [PACKAGE-VERSIONS.md](./PACKAGE-VERSIONS.md)                          |
| OpenAPI                | Platform API **1.12.0** (frozen at freeze date)                                    |
| Documentation          | This pack + prior 1.2.0 packaging evidence                                         |

## Release readiness decision

# PRODUCTION READY WITH LIMITATIONS

Evidence: completed Waves 1–2 and remediation; lint/typecheck/Vitest/OpenAPI PASS under CERT-003; visual residual closed under CERT-004; binding PRWL limitations remain (Email SoR, FIN-001, Workflow Execute, Search/Observe live residuals). See [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md).
