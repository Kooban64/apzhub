# APZHUB Integration SDK quick reference

Derived lookup for [026](./026-integration-sdk-adapter-framework-integration-manifest-specification.md).

> **Document Version:** 1.0 · **Developer Specification · Mandatory**  
> Service Connector architecture: [008](./008-module-plugin-connector-architecture.md). Platform SDK: [024](./024-apzhub-platform-sdk-development-framework.md). Modules: [025](./025-module-sdk-module-manifest-module-development-standard.md).

## Terminology

**Integration / Integration Adapter** (026) = **Service Connector** (008) = **Adapter Layer** (003). Internal names may reference vendors; **UI never does** (002).

## Core rule

Integrations communicate with **external systems only** — no business logic · no UI · no platform permission enforcement.

## Mandatory path

```
Module → Platform Service → Integration SDK → Integration Adapter → External System
```

Modules never call integrations directly (025, 009, 010)

## Core principles

Replaceable · independently testable · stateless where practical · hide implementation · manifest exposes capabilities · never expose backend APIs to users · OSS CE/self-hosted first (008)

## Integration types

OSS app · REST · GraphQL · database · filesystem · webhooks · queue · identity · AI · payment · email · telephony · storage · monitoring — extensible without SDK redesign

## Integration responsibilities

Auth · connection · request/response translation · retry · rate limit · version compatibility · health · error translation · capability discovery — **no business rules**

## Manifest

`integration.yaml` **before implementation** — contract between APZHUB and integration (024)

## Example manifest fields

`integration` (id, name, version, type) · metadata (vendor, selfHosted, communityEdition) · authentication · capabilities · health · versioning · permissions.managedByPlatform · tests

## Registration (auto)

ID · name · version · capabilities · auth method · health · config schema · platform version · docs · tests (011, 024)

## Capability discovery

Declare capabilities (e.g. Plane: projects/issues; Paperless: documents/OCR; Metabase: dashboards) — **Platform Service decides usage**

## Authentication

API key · OAuth2 · JWT · basic · mTLS · service accounts — secrets in platform secret mgmt · never hardcoded (007 SSO per engine, 013, 011)

## Configuration (validated before activation)

Base URL · auth · timeouts · retry · SSL · proxy · feature flags — declarative (024)

## Health (014)

Status · latency · last success · auth status · version · retry count · error state — admin workspace; no raw backend dashboards for standard users

## Error translation (010)

Auth failed · validation · unavailable · timeout · rate limited · config error — **no backend messages to users**

## Retry

Configurable · exponential backoff · circuit breaker · DLQ where appropriate — idempotent; no duplicate business ops (012, 010)

## Version compatibility

Supported/min/max tested/deprecated versions — auto checks on startup/upgrade (015)

## Security

Encrypt · validate certs (unless trusted internal) · no secrets in code · audit events · credential rotation — integrations don't enforce user RBAC (007, 013)

## Observability (014)

Metrics · logs · traces · health · config status · performance — correlation IDs (010); self-hosted OSS stack

## Events (012)

Connected/disconnected · sync started/completed/failed · version changed · auth failed — Platform Event Framework

## Testing (015)

Unit · mock · integration · compatibility · failure · performance · regression — automated tests against supported external versions where practical

## Directory (`integrations/plane/`)

`integration.yaml` · README · CHANGELOG · `src/` (client, auth, mapper, health, config, capabilities, events, types) · `tests/` · `docs/` — align with `/adapters` in 004 at implementation

## Cursor workflow (10 steps)

Read 026 → `integration.yaml` → client → auth → mapping → health → register capabilities → tests → docs → validate compatibility — **no business logic in integrations · phase gate applies**

## Acceptance highlights

Common contract · auto-discoverable · services independent of implementation · replaceable backends · admin-visible health/config/capabilities · testable & version-aware · OSS CE first · **no service bypass · no vendor errors/terms in UI**
