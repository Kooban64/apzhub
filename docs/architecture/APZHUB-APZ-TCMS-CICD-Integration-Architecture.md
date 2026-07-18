# APZHUB APZ TCMS — CI/CD Integration Architecture

**Milestone:** APZTCMS-015 — External CI/CD Integration Framework  
**Status:** Implemented (domain + persistence + gateway facet; no HTTP/UI; no live providers)  
**Authority:** [ADR-0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md) · Document 009 · Document 015

---

## Purpose

Introduce a **vendor-neutral CI/CD integration domain** inside APZ TCMS. External CI systems are **information providers**. APZ TCMS remains the **System of Record** for imported pipeline metadata, run results, artifact references, approvals, and cross-domain links.

This milestone does **not** execute pipelines, own runners, trigger builds, download binaries, or call live provider APIs.

---

## Architecture

```text
PlatformServiceGateway.testing.pipelines
        ↓
RequestPipeline + Production Authorization
        ↓
TestingPipelinesServiceImpl
        ↓
@apzhub/testing-services pipelines domain
  (registry · import · link · normalize · validate · generic_ci adapter)
        ↓
@apzhub/testing-persistence (Postgres production / in-memory tests)
        ↓
PostgreSQL (migrations 0031 / 0032)
```

External systems supply **payloads** (Generic CI JSON today). Adapters are **parse-only**. Import services persist canonical models. Release Governance may **consume** pipeline summaries via references — no deployment automation.

---

## Packages

| Package                              | Version    |
| ------------------------------------ | ---------- |
| `@apzhub/testing-contracts`          | **0.9.0**  |
| `@apzhub/testing-persistence`        | **0.9.0**  |
| `@apzhub/testing-services`           | **0.8.0**  |
| `@apzhub/platform-service-contracts` | **0.11.0** |
| `@apzhub/platform-services`          | **0.11.0** |

---

## Supported providers (design)

| Provider               | Status in APZTCMS-015                              |
| ---------------------- | -------------------------------------------------- |
| Generic CI             | **Implemented** (parse-only adapter)               |
| GitHub Actions         | Kind reserved — adapter deferred (**APZTCMS-016**) |
| GitLab CI              | Kind reserved — future                             |
| Azure DevOps Pipelines | Kind reserved — future                             |
| Jenkins                | Kind reserved — future                             |
| CircleCI               | Kind reserved — future                             |
| Buildkite              | Kind reserved — future                             |

---

## Persistence

Tables (tenant-scoped, RLS in **0032**):

- `testing_pipeline`
- `testing_pipeline_import`
- `testing_pipeline_run`
- `testing_pipeline_import_history`

Production: **PostgreSQL only**. In-memory repositories for unit tests.

---

## Gateway

Facet: `gateway.testing.pipelines` (`TestingPipelinesService`).

No REST/OpenAPI surface in this milestone. No Workbench UI.

---

## Explicit exclusions

Live GitHub / GitLab / Azure / Jenkins / CircleCI / Buildkite APIs · runners · pipeline execution · deployment · REST · Workbench UI · notifications · Platform Event Bus · realtime · AI · binary artifacts · artifact downloads · polling workers · schedulers.

---

## Related

[Canonical Pipeline Model](./APZHUB-APZ-TCMS-Canonical-Pipeline-Model.md) · [Provider Contract Guide](./APZHUB-APZ-TCMS-Provider-Contract-Guide.md) · [Pipeline Import Guide](./APZHUB-APZ-TCMS-Pipeline-Import-Guide.md) · [Artifact Metadata Guide](./APZHUB-APZ-TCMS-Artifact-Metadata-Guide.md) · [Developer Guide](./APZHUB-APZ-TCMS-CICD-Developer-Guide.md) · [APZTCMS-015 Completion Report](../sprint/APZTCMS-015-completion-report.md)
