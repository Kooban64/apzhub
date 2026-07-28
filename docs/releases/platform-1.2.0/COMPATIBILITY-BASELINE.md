# Compatibility Baseline — Platform 1.2.0

> **Programme:** APZHUB-RELEASE-001  
> **Date:** 2026-07-22  
> **CERT-003 compatibility verification:** **PASS**

## SemVer / packaging

| Item                       | Baseline                                                            |
| -------------------------- | ------------------------------------------------------------------- |
| Platform product SemVer    | **1.2.0**                                                           |
| Root engineering version   | `0.1.0-foundation` (distinct — PL12-KL-11)                          |
| Commercial product SemVers | Not advanced by this freeze (Projects **1.1.0** · others **1.0.0**) |
| Integration SDK            | **1.0.0** frozen                                                    |
| Platform OpenAPI           | **1.12.0**                                                          |

## Contract compatibility

| Contract surface                                                          | Version                         |
| ------------------------------------------------------------------------- | ------------------------------- |
| `@apzhub/platform-service-contracts`                                      | **0.18.0**                      |
| `@apzhub/workflow-contracts`                                              | **0.4.2**                       |
| `@apzhub/analytics-contracts`                                             | **0.1.1**                       |
| `@apzhub/testing-contracts`                                               | **0.11.0**                      |
| Domain SoR contracts (admin/config/identity/metrics/observe/notification) | **0.2.0** family as inventoried |

## Host coexistence

Legacy `apz-stack` coexistence constraints remain in force ([ENVIRONMENT.md](../../../ENVIRONMENT.md)). Portfolio path hygiene (PL12-KL-06) retains `ops:portfolio-recert` as the re-cert path.

## Compatibility freeze

No intentional breaking contract or OpenAPI changes under this programme. Future breaks require named Owner Approval after Release Acceptance.
