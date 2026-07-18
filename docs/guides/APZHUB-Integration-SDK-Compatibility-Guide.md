# APZHUB Integration SDK Compatibility Guide

> **SDK:** `@apzhub/integration-sdk` **1.0.0**  
> **Milestone:** OSS-100-11  
> **Date:** 2026-07-18

---

## Version alignment

| Component                 | Version       | Notes                                      |
| ------------------------- | ------------- | ------------------------------------------ |
| `@apzhub/integration-sdk` | **1.0.0**     | Architecture Frozen                        |
| `INTEGRATION_SDK_VERSION` | **1.0.0**     | Must match package.json                    |
| Provider packages         | `workspace:*` | No forced version bump for 1.0.0 promotion |

---

## Certified providers (compatibility validated)

| Provider               | Package                              | Version   | Pattern                           |
| ---------------------- | ------------------------------------ | --------- | --------------------------------- |
| Plane (Projects)       | `@apzhub/integration-plane`          | **0.6.0** | Official Reference Adapter        |
| Zammad (Support)       | `@apzhub/integration-zammad`         | **0.6.0** | Official Reference Adapter        |
| Meilisearch (Search)   | `@apzhub/integration-meilisearch`    | **0.1.0** | Search Reference Adapter          |
| n8n (Workflow)         | `@apzhub/integration-n8n`            | **0.1.0** | Workflow Engine Reference Adapter |
| GitHub Actions (CI/CD) | `@apzhub/integration-github-actions` | **0.1.0** | CI/CD Reference Adapter           |

Search publication consumers (not vendor adapters, but SDK-adjacent certified stack):

| Package                          | Version   |
| -------------------------------- | --------- |
| `@apzhub/search-integration`     | **0.2.0** |
| `@apzhub/search-orchestrator`    | **0.1.0** |
| `@apzhub/integration-search-sdk` | **0.1.0** |

---

## Future providers (contracts only — no implementation in OSS-100-11)

Compatibility expectations for future adapters (roadmap):

| Future provider             | APZHUB name           | Expectation                                                                       |
| --------------------------- | --------------------- | --------------------------------------------------------------------------------- |
| Zammad                      | Support               | Already certified — retained                                                      |
| Kimai                       | Time Tracking         | Must use Integration SDK 1.x contracts                                            |
| Paperless-ngx               | Documents             | Must use Integration SDK 1.x contracts                                            |
| Grafana / Prometheus / Loki | Observability engines | Adapter-only; Observability SoR remains separate                                  |
| Metabase                    | Analytics             | Adapter-only                                                                      |
| Kiwi TCMS                   | Testing (legacy path) | Superseded as product SoR by APZ TCMS; engine adapters still SDK-based if revived |
| n8n                         | Automation / Workflow | Already certified Reference Adapter                                               |

No implementation of new providers in this milestone.

---

## Compatibility contracts

- Capability discovery remains stable
- Auth / connection / diagnostics / health / version ports remain stable for 1.x
- Breaking changes require MAJOR + ADR + owner approval
- Adapters built against 0.9.0 APIs remain compatible with 1.0.0 (no breaking changes)

---

## Interop rules

1. SDK must not import vendor packages
2. Products must not import vendor SDKs
3. Harness certification complements — does not replace — adapter operations certification (ADR-0057)
