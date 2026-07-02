# APZHUB Module & Connector quick reference

One-page lookup derived from [008](./008-module-plugin-connector-architecture.md), [025](./025-module-sdk-module-manifest-module-development-standard.md), and [026](./026-integration-sdk-adapter-framework-integration-manifest-specification.md). **008** = three-layer architecture. **025** = Module SDK. **026** = Integration SDK / Service Connector.

## Three concepts — never combine

```
Platform Module  →  Platform Service  →  Service Connector  →  Backend Engine
     (user)            (business API)         (integration)        (OSS engine)
```

**Connector** = Adapter Layer (003). **Module** names are business terms (002), not engine names.

## Platform modules (examples)

Projects · Support · Documents · Time Tracking · Automation · Analytics · Testing · Compliance · Monitoring · Security · Administration

Own: nav, workspace, views, commands, permission **declarations**, UI, workflows, search, notifications, docs, tests.

Do **not** own: auth, backend comms.

## Service connectors (internal only)

Plane · Kimai · Paperless · Zammad · Kiwi · Metabase · n8n · (+ future security/ops engines)

Own: API client, auth/SSO bridge, request/response mapping, retry, version compat, error translation, health, capability discovery, tests.

**No business logic** in connectors.

## Platform services (module ↔ connector contract)

ProjectService · DocumentService · TestingService · AutomationService · SupportService · AnalyticsService

Modules call **services only** — never connectors or backends.

**Platform Service Layer (009)** is the mandatory orchestration boundary between modules and connectors — interface-first, centralised audit/search/notify/events.

## Dependency rules (mandatory)

| Allowed                                | Forbidden          |
| -------------------------------------- | ------------------ |
| Module → Service → Connector → Backend | Module → Backend   |
|                                        | Module → Connector |
|                                        | Module → Module    |
|                                        | Connector → Module |

Cross-module needs → **shared Platform Services** (Identity, Permissions, Search, Notifications, Audit, …).

## Registration

**Module:** name, display name, nav, permissions, routes, icons, search, commands, notifications, settings, version, health — manifest-driven; permissions filter shell (005).

**Connector:** backend, version, features, roles, auth method, health, provisioning, API version, capabilities — dynamic discovery (007).

## Lifecycles

**Module:** installed · enabled · disabled · maintenance · deprecated · removed

**Connector:** configured · connected · synchronising · healthy · warning · degraded · offline · failed

## Module manifest

Identity · dependencies · permissions · routes · nav · commands · services · config · docs · tests · health checks

## Connector manifest

Backend · API version · auth · capabilities · rate limits · provisioning · health endpoints · config schema · error codes

## Feature registration (extends Desktop shell)

Commands · search · nav · context menus · workspace tabs · notifications · shortcuts · widgets · dashboards

## Self-hosted first (008 §23)

- Target **Community Edition / self-hosted OSS** APIs and extension points.
- **Never require** Enterprise Edition for core platform function.
- Optional enterprise connector enhancements OK — not mandatory dependencies.

## Version isolation

Engine upgrades → connector changes only; modules unchanged if service contract stable.

## Testing

**Module:** unit · component · integration · Playwright · docs

**Connector:** API · compatibility · mock · health · provisioning · regression · SSO/auth

Independent testability required.

## Build / classify new work

Is it a **Module**, **Platform Service**, **Shared Service**, **Connector**, or **Desktop Extension**? One role per artifact.

## Acceptance

Users see modules only · stable service contracts · connectors swap engines · OSS CE supported · core unchanged when adding modules/connectors · scales to many modules.
