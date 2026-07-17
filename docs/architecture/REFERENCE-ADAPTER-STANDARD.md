# APZHUB Reference Adapter Standard

> **Purpose:** Mandatory engineering standard for every future OSS / vendor integration adapter  
> **Audience:** Platform engineers, integration authors, AI agents, reviewers  
> **Authoritative references:** [026 — Integration SDK](../026-integration-sdk-adapter-framework-integration-manifest-specification.md) · [008 — Modules & Connectors](../008-module-platform-service-connector-architecture.md) · [009 — Platform Service Layer](../009-platform-service-layer-business-logic-orchestration-standard.md) · [Base Adapter Pattern](./APZHUB-Base-Adapter-Pattern.md) · [Adapter Boundary Pattern](./APZHUB-Adapter-Boundary-Pattern.md)  
> **Status:** Mandatory — Wave 1 certified (OSS-101-10)  
> **Last updated:** 2026-07-10  
> **Reference implementation:** `@apzhub/integration-plane` (Plane) — vendor-specific; this document is vendor-neutral  
> **CI/CD reference:** `@apzhub/integration-github-actions` — see [CI/CD Reference Adapter Standard](./APZHUB-CICD-Reference-Adapter-Standard.md) (APZTCMS-020)  
> **Workflow Engine reference:** `@apzhub/integration-n8n` — see [Workflow Engine Reference Adapter Standard](./APZHUB-Workflow-Engine-Reference-Adapter-Standard.md) (APZWORKFLOW-011)

---

## 1. Purpose

This standard freezes the architecture proven by the Plane Wave 1 programme. Every future adapter (Zammad, Kimai, Paperless, Metabase, etc.) **must** comply. Deviations require an ADR and owner approval.

**Plane is the certified Reference Adapter.** Patterns below are extracted from Plane without embedding Plane product semantics.

---

## 2. Layering (non-negotiable)

```text
Client / HTTP API
       ↓
Platform Gateway (apps/web — bootstrap only)
       ↓
Platform Services (@apzhub/platform-services)
       ↓
Provider interface (contracts / registry)
       ↓
Vendor Adapter (@apzhub/integration-{vendor})
       ↓
Internal vendor REST client (package-private)
       ↓
Vendor engine API
```

| Layer             | May depend on                                              | Must not depend on                                             |
| ----------------- | ---------------------------------------------------------- | -------------------------------------------------------------- |
| HTTP handlers     | Platform Services, contracts, authz                        | Adapter packages, vendor clients                               |
| Platform Services | Contracts, Integration SDK, adapters via provider registry | Vendor REST internals, MappingStore inside adapters            |
| Adapter           | Integration SDK, contracts (types only)                    | `platform-services` implementations, MappingStore, HTTP routes |
| Vendor client     | SDK HTTP/client primitives                                 | Platform Services, HTTP, MappingStore                          |
| Contracts         | Nothing runtime                                            | SDK, services, adapters                                        |

---

## 3. Directory structure

```text
integrations/{vendor}/
  integration.yaml          # Manifest first (026)
  package.json              # @apzhub/integration-{vendor}
  tsconfig.json
  docs/
    {VENDOR}-ADAPTER.md
    {VENDOR}-OPERATIONS.md  # when ops/certification exists
    …capability guides…
  src/
    index.ts                # Public exports only
    {vendor}-adapter.ts     # Extends IntegrationAdapterBase
    {vendor}-factory.ts
    {vendor}-bootstrap.ts
    {vendor}-config.ts
    {vendor}-error-mapper.ts
    capabilities/
    services/               # Domain service facades (core.*)
    mappers/                # Vendor DTO ↔ canonical DTO
    models/                 # Canonical + input types
    internal/               # REST client — never exported publicly
    operations/             # Certification, readiness, health (optional until ops milestone)
    events/                 # Event translation (optional)
    testing/                # Mock vendor API + fixtures
    validation/
```

---

## 4. Package structure & ownership

| Package                              | Owns                                                                          |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| `@apzhub/integration-sdk`            | AdapterBase, auth, connection, resilience, diagnostics, errors, observability |
| `@apzhub/platform-service-contracts` | Interfaces + DTOs only                                                        |
| `@apzhub/platform-services`          | Business rules, mapping store, providers, gateway orchestration               |
| `@apzhub/integration-{vendor}`       | Vendor translation only                                                       |
| `apps/web` HTTP `/api/v1`            | Auth, validation, envelope — no business logic                                |

**Public adapter surface:** factory, adapter type, config helpers, canonical models, testing mocks.  
**Never export:** REST client classes, raw vendor DTOs as API contracts, secrets.

---

## 5. Dependency rules

Automated audit (`scripts/wave1-dependency-audit.mjs` — extend per vendor):

1. No circular package dependencies.
2. Adapter must not import `@apzhub/platform-services`.
3. Adapter must not import MappingStore.
4. Vendor REST client must not be imported outside the adapter package.
5. No deep imports into `integrations/{vendor}/src/` from outside (tests/certification suites may be excepted).
6. HTTP route handlers must not import adapters directly.
7. Gateway bootstrap may dynamically import the adapter package behind a feature flag.
8. Contracts must not import runtime packages.

Violations: **fix** or document with technical justification in the certification report.

---

## 6. Provider implementation

1. Define provider interfaces in contracts (or service-local ports aligned to contracts).
2. Implement provider in `platform-services` that calls adapter public services only.
3. Register provider in the provider registry with tenant/capability resolution.
4. Platform Services never call vendor HTTP directly.
5. Adapters never call Platform Services.

---

## 7. Mapping

| Concern                          | Owner                                     |
| -------------------------------- | ----------------------------------------- |
| Platform global IDs ↔ vendor IDs | `EntityMappingStore` in platform-services |
| Vendor payload ↔ canonical DTO   | Adapter mappers                           |
| Backend role names               | Never exposed in UI (007)                 |

Adapters must not persist platform mappings. Mapping lookups happen in Platform Services / gateway orchestration.

---

## 7a. Webhook & polling (SDK contracts — OSS-100-08)

| Concern | Owner |
| ------- | ----- |
| Webhook registration CRUD | Adapter implements / wraps `WebhookManager` (`@apzhub/integration-sdk/events`) |
| Payload → `IntegrationSourceEvent` | Adapter translator + optional SDK pipeline |
| Polling pages / sync | Adapter implements / wraps `PollingSource` |
| Signature verification / replay / dedup helpers | SDK contracts; adapter supplies vendor specifics |
| HTTP webhook ingress | **Platform future — not adapter** |
| Workers / schedulers / Event Bus publish | **Platform future — not adapter / not SDK** |

Adapters expose management and poll/translate APIs only. Do not implement ingress receivers, bus publish, or background schedulers in the adapter package.

See [APZHUB-Integration-SDK-Webhook-Polling.md](./APZHUB-Integration-SDK-Webhook-Polling.md).

---

## 8. Gateway integration

1. HTTP → auth → authz → validation → Platform Service → provider → adapter.
2. Standard response envelope; typed errors; no vendor error leakage.
3. Correlation IDs end-to-end.
4. Bootstrap wires providers when integration feature flag is enabled.

---

## 9. Diagnostics, metrics, logging

Required on every adapter:

- Health provider (SDK)
- Diagnostics snapshot **without secrets**
- Metrics via operation runner / SDK observability
- Structured logs with correlation ID
- Circuit breaker / retry via SDK resilience

Operational certification (reference pattern from Plane OSS-101-09):

- Capability self-assessment matrix
- Compatibility matrix (min/max engine version, edition)
- Readiness checks (required vs optional)
- Health levels: `HEALTHY` | `DEGRADED` | `LIMITED` | `UNAVAILABLE`
- Feature detection for optional endpoints
- Aggregated operational report

**SDK certification engine (OSS-100-09):** `@apzhub/integration-sdk/harness` is the **standard shared certification engine** for Architecture→QualityGates categories, Reference Adapter Standard compliance, contract suites, boundary validation, quality reports, and CI helpers. Adapter-owned operations APIs remain complementary for engine-specific capability/readiness matrices — see [ADR-0057](../adr/ADR-0057-sdk-harness-vs-adapter-operations-certification.md) and [ADAPTER-HARNESS.md](../../packages/integration-sdk/docs/ADAPTER-HARNESS.md).

**OSS-100-10 re-certification:** Plane and Zammad were re-certified via the SDK harness suite `testing/sdk-v1/integration-sdk-v1-recertification.test.ts` (Plane **15** capabilities / **0** architecture fails; Zammad **11** / **0**). See [SDK-V1-CERTIFICATION.md](../../packages/integration-sdk/docs/SDK-V1-CERTIFICATION.md) and [ADR-0058](../adr/ADR-0058-integration-sdk-v1-readiness-limitations.md).

---

## 10. Testing & mock infrastructure

| Layer              | Expectation                                                           |
| ------------------ | --------------------------------------------------------------------- |
| Unit               | Mappers, config, error translation                                    |
| Adapter contract   | Services against mock vendor API                                      |
| Platform           | Providers + mapping + authz with mocked adapter                       |
| HTTP               | Handlers with mocked gateway                                          |
| Wave certification | Mocked E2E: HTTP → Gateway → Services → Provider → Adapter → Mock API |
| Live engine        | Optional; never required for certification                            |

Mock vendor API lives under `src/testing/` and is exportable for platform/HTTP certification tests.

**No live vendor instance** for Wave certification gates.

---

## 11. Versioning

| Artifact                   | Rule                                                                       |
| -------------------------- | -------------------------------------------------------------------------- |
| `integration.yaml` version | Matches package version                                                    |
| Package semver             | Patch = fixes; minor = additive capabilities; major = breaking adapter API |
| Engine compatibility       | Document min/max CE versions; Community Edition first                      |
| Optional capabilities      | Degrade without failing startup                                            |

---

## 12. Documentation (mandatory before merge)

- `integration.yaml` (before code)
- Adapter guide (`docs/{VENDOR}-ADAPTER.md`)
- Capability docs for each major surface
- Operations/certification guide when ops milestone completes
- Sprint completion / certification report
- Foundation updates: AI-CONTEXT, CURRENT-STATE, CURRENT-MILESTONE, ACTIVE-BACKLOG, CHANGELOG, catalogues

---

## 13. Quality gates

Every adapter milestone must pass:

| Gate                    | Command / artefact                                                              |
| ----------------------- | ------------------------------------------------------------------------------- |
| Format                  | `pnpm format:check`                                                             |
| Lint                    | `pnpm lint`                                                                     |
| Typecheck               | `pnpm typecheck`                                                                |
| Build                   | `pnpm build` (note env: do not force `NODE_ENV=development`)                    |
| Unit / contract tests   | Package + platform regression                                                   |
| OpenAPI                 | `pnpm openapi:validate:platform` when HTTP touched                              |
| Dependency audit        | Extended static boundary script                                                 |
| Coverage                | Report package metrics; highlight below 80% lines/branches/functions/statements |
| Architecture validation | Layering + this standard                                                        |

---

## 14. Certification process

1. Architecture & dependency audit
2. Capability matrix (Implemented / Tested / Documented / Certified / Coverage / Limitations / Min version / Optional / Dependencies)
3. Mocked end-to-end verification
4. Full Wave regression suite
5. Coverage certification
6. Performance baseline (measure only)
7. Documentation audit
8. Wave certification report
9. Owner acceptance → architecture freeze for that Wave

**Stop** after certification. Do not start the next vendor Wave without owner approval.

---

## 15. Lessons learned (Plane Wave 1)

1. **Manifest and contracts first** — prevents UI/HTTP from inventing shapes.
2. **Keep MappingStore out of the adapter** — platform owns identity mapping.
3. **Gateway bootstrap is the only HTTP→adapter seam** — handlers stay vendor-agnostic.
4. **Mock vendor API early** — enables full-stack certification without live engines.
5. **Optional capabilities must degrade** — analytics/webhooks must not block readiness.
6. **Operations certification is separate from features** — health/readiness/reports without new business APIs.
7. **HTTP global IDs need strict Zod shapes** — provisional vendor-prefixed IDs fail at the boundary.
8. **Performance baselines are documentation, not optimisation tickets.**
9. **Dependency audits catch architectural drift faster than code review alone.**
10. **Freeze the reference pattern before Wave 2** — Zammad and later adapters copy this standard, not Plane internals.

---

## 16. Explicit non-goals (adapter package)

Adapters must not implement: UI, Platform Event Bus ownership, webhook HTTP ingress, workers/schedulers, caching SoR, notifications delivery, search indexing, or business authorisation policy. Those remain Platform Services / platform frameworks.

---

## Related

- [OSS-101-10 Wave 1 Certification](../sprint/OSS-101-10-Wave1-Certification.md)
- [Plane Operations](../../integrations/plane/docs/PLANE-OPERATIONS.md)
- [OSS Integration Master Architecture](./APZHUB-OSS-Integration-Master-Architecture.md)
