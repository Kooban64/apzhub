# APZHUB CI/CD Reference Adapter Standard

> **Purpose:** Mandatory engineering standard for every future CI/CD provider adapter  
> **Audience:** Platform engineers, integration authors, AI agents, reviewers  
> **Status:** Mandatory — Wave closeout APZTCMS-020  
> **Last updated:** 2026-07-12  
> **Reference implementation:** `@apzhub/integration-github-actions` (GitHub Actions)  
> **Parent standard:** [REFERENCE-ADAPTER-STANDARD](./REFERENCE-ADAPTER-STANDARD.md) (Plane Wave 1) · [026](../026-integration-sdk-adapter-framework-integration-manifest-specification.md) · APZTCMS-015 canonical CI/CD contracts

---

## 1. Purpose

This document freezes the architecture proven by the **GitHub Actions** CI/CD programme (APZTCMS-015 … APZTCMS-020). Every future CI/CD adapter (GitLab CI, Azure DevOps, Jenkins, CircleCI, Buildkite, Generic CI extensions) **must** comply.

**GitHub Actions is the official APZHUB CI/CD Reference Adapter.** Copy the **standard**, not GitHub product semantics.

Deviations require an ADR and owner approval.

---

## 2. System of Record rules

| Concern | Owner |
| ------- | ----- |
| Pipeline **execution** | External CI provider |
| Quality, certification, release governance, traceability | **APZ TCMS** |
| Canonical pipeline metadata after import | **APZ TCMS** (SoR) |
| Live browse (optional) | Adapter → Provider → Platform Services (read-only) |

Adapters are **information providers**. They must not execute workflows, own runners, or download binaries unless a future milestone explicitly authorises it.

---

## 3. Layering (non-negotiable)

```text
Workbench / Typed Client
       ↓
HTTP API (/api/v1/testing/pipelines…)
       ↓
Gateway (gateway.testing.*)
       ↓
RequestPipeline + Authorization (pipeline.*)
       ↓
Platform Services (SoR + live facets)
       ↓
ProviderRegistry / ProviderResolver
       ↓
Vendor CI Adapter (@apzhub/integration-{provider})
       ↓
Internal REST client (package-private)
       ↓
Vendor CI API
```

| Layer | May depend on | Must not depend on |
| ----- | ------------- | ------------------ |
| Workbench / typed client | HTTP `/api/v1/testing/*` only | Platform services, providers, adapters, SDK |
| HTTP handlers | Gateway bootstrap, contracts, auth | Adapters, providers, testing-services, persistence |
| Platform Services | Adapter **public** API via providers | Adapter `internal/`, vendor DTOs |
| Adapter | Integration SDK, testing-contracts (canonical types) | `platform-services`, HTTP routes, MappingStore |
| Parse-only `PipelineResultAdapter` | testing-contracts | Live network (parse only) |

---

## 4. Package layout

```text
integrations/{provider}/
  integration.yaml
  package.json                 # @apzhub/integration-{provider}
  tsconfig.json
  docs/
    {PROVIDER}-ADAPTER.md
    {PROVIDER}-MAPPING.md
    {PROVIDER}-COMPATIBILITY.md
    {PROVIDER}-AUTHENTICATION.md
    {PROVIDER}-DEVELOPER.md
  src/
    index.ts                   # Public exports only
    {provider}-adapter.ts      # extends IntegrationAdapterBase
    {provider}-factory.ts
    {provider}-bootstrap.ts
    {provider}-config.ts
    {provider}-error-mapper.ts
    pipeline-result-adapter.ts # optional parse-only PipelineResultAdapter
    capabilities/
    services/                  # adapter.core.*
    mappers/                   # SDK Mapping Provider Framework
    models/                    # canonical metadata (no vendor DTO exports)
    internal/                  # REST client + vendor DTOs — never public
    operations/                # health, diagnostics, compatibility
    testing/                   # mock fetch + fixtures
```

---

## 5. Lifecycle

Implement via Integration SDK `IntegrationAdapterBase`:

1. `onValidateConfiguration`
2. `onInitialise`
3. `onConnect` (connectivity / auth probe)
4. `onPerformHealthChecks`
5. `onCollectDiagnostics` (secret-free)
6. `onDispose`

Factory: `create{Provider}Adapter()` / `dispose{Provider}Adapter()`.

---

## 6. Authentication

| Requirement | Rule |
| ----------- | ---- |
| Primary mode | Document clearly (e.g. PAT) |
| Placeholders | GitHub App / OAuth-style modes may be config placeholders only until approved |
| Secrets | SecretProvider refs only; never in diagnostics, logs, or reports |
| Headers | Via Shared HTTP Transport — no bespoke `fetch` outside transport |

---

## 7. Diagnostics & health

Diagnostics must report (secret-free): connectivity, authentication status, API version, rate-limit status, capability status, feature detection, compatibility.

Health levels (mandatory):

`HEALTHY` | `DEGRADED` | `LIMITED` | `UNAVAILABLE`

Map to SDK health statuses as in Plane/Zammad/GitHub Actions.

---

## 8. Compatibility & capability registration

- Document supported vendor API versions.
- Degrade gracefully on optional features (e.g. approvals 404 → empty).
- Register SDK capabilities + extended CI/CD capability catalogue.
- Service capability discovery must declare implemented vs unsupported operations.

---

## 9. Mapping & transport

- **Mapping:** SDK Mapping Provider Framework only — no bespoke mapping stores in adapters.
- **Transport:** SDK Shared HTTP Transport (`createHttpIntegrationClient`) only.
- **Canonical models:** Map to `@apzhub/testing-contracts` CI/CD models (APZTCMS-015). Never export vendor DTOs from `index.ts`.

---

## 10. Platform integration (when authorised)

Follow GitHub Actions programme pattern:

1. Provider interfaces + `PlatformProviderCapability` keys (`pipeline_*`)
2. `register{Provider}Providers({ registry, core })`
3. Live gateway facets via RequestPipeline
4. SoR `gateway.testing.pipelines` for import/link
5. Permissions: reuse `pipeline.*` — no new namespaces without ADR

HTTP/Workbench are separate milestones — adapter closeout does not require them, but the reference programme includes them.

---

## 11. Testing (mandatory)

| Requirement | Bar |
| ----------- | --- |
| Mocked contract tests | No live vendor account / network |
| Coverage | ≥95% lines and functions on adapter `src/` (excl. tests) |
| Scenarios | auth, list/get workflows & runs, jobs/steps, artifacts metadata, diagnostics, health, errors, rate limits, compatibility, capability discovery |
| Boundary | Public surface never exports REST client / vendor DTOs |

---

## 12. Documentation (mandatory before merge)

Adapter, Mapping, Compatibility, Authentication, Developer guides under `integrations/{provider}/docs/`, plus programme architecture docs when platform/HTTP/UI exist.

---

## 13. Certification & quality gates

Before declaring a CI/CD adapter production-ready:

1. Architecture / dependency / boundary audits — **0 violations**
2. typecheck, lint, tests, coverage
3. OpenAPI valid (if HTTP shipped)
4. Security review (authn/authz/secrets/redaction/tenancy)
5. Performance baseline (measure only)
6. Explicit production classification

Quality gates must pass before merge to main.

---

## 14. Explicit non-goals (default)

Unless a future owner-approved milestone says otherwise:

- Workflow dispatch / rerun / cancel / execution  
- Binary artifact or log body download  
- Repository management, Issues, PRs  
- Event Bus, notifications, realtime, AI  
- Adapter → Platform Services reverse dependency  

---

## 15. Reference declaration

**Official CI/CD Reference Adapter:** `@apzhub/integration-github-actions`  
**Programme:** APZTCMS-015 … APZTCMS-020  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**

Next provider recommended for implementation only after owner approval: **GitLab CI** (APZTCMS-021).
