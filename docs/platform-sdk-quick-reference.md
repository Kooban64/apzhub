# APZHUB Platform SDK quick reference

Derived lookup for [024](./024-apzhub-platform-sdk-development-framework.md).

> **Document Version:** 1.0 · **Developer Specification · Mandatory**  
> Stack & repo: [004](./004-technology-stack-repository-standards-development-environment.md). Modules/connectors: [008](./008-module-plugin-connector-architecture.md). Module manifest: [025](./025-module-sdk-module-manifest-module-development-standard.md). Integration manifest: [026](./026-integration-sdk-adapter-framework-integration-manifest-specification.md). Platform Service manifest: [027](./027-platform-service-sdk-business-service-framework-service-manifest-specification.md). UI Component manifest: [028](./028-ui-component-sdk-design-system-sdk-component-manifest-specification.md). Platform Event manifest: [029](./029-platform-event-sdk-event-bus-event-manifest-specification.md). Quality lifecycle: [015](./015-software-quality-testing-qa-cicd-release-management-framework.md).

## Core rule

**No code joins APZHUB without SDK compliance.** Developers extend the **platform**, not arbitrary code paths.

## Philosophy

Every contribution feels native · part of one ecosystem

## SDK principles

Consistency · replaceability · discoverability · testability · maintainability · security · extensibility · documentation — **same lifecycle for every extension**

## Platform layers (no bypass)

```
Desktop Shell → Platform SDK → Platform Services → Shared Services → Module SDK → Connector SDK → Backend Engine
```

(003)

## SDK categories

Platform · Module · Connector · Platform Service · Component (006) · Event · Testing · Documentation

## Development lifecycle (mandatory, no skipping SDK)

Requirements → architecture → **SDK contract** → implementation → testing → documentation → review → release (015)

## Platform registration (auto-discovery)

Identity · version · capabilities · dependencies · permissions · routes · health · documentation · tests (003, 008)

## Manifest first

Manifest = platform contract; implementation secondary — platform understands extension **before** execution (nav, commands, search, permissions, health)

## Coding principles

Modular · stateless where practical · strongly typed · DI · interface-first · reusable · loosely coupled · observable · auditable (004 strict TS, 009 interfaces)

## Business logic placement

**Platform Services only** — modules = presentation · connectors = integration · **no business logic in UI** (003, 008, 009)

## Platform metadata (drives platform)

Navigation · commands · permissions · search providers · notifications · health · documentation · settings — settings = platform prefs consumed by modules (011, 023)

## Auto-discovery (no manual registration)

Modules · services · connectors · commands · themes · widgets · dashboards · providers — never hardcode workspaces (005, 017, 022)

## Versioning

ID · version · compatibility · dependencies · migration · supported platform version — validated automatically (015)

## Dependency rules

Depend only on **published SDKs** · never on another module directly · shared logic → Platform Services (008)

## Configuration (declarative)

Schema · defaults · validation · env vars · documentation — connector config refs not plain secrets (011, 013)

## Events

Publish events · subscribe via Event Framework · no direct coupling (012) — modules don't notify/audit/search directly (009)

## Search SDK

Register Search Providers · platform-owned search only (020)

## Notifications

Publish events only · Notification Framework delivers — **never send notifications directly** (021)

## Security (inherited from platform)

Auth · permission validation · audit · logging · input validation · secure config (007, 013) — permission-driven UI (005)

## Observability (every extension)

Health · metrics · logs · tracing · performance · version (014) — correlation IDs (010)

## Testing (SDK contract)

Unit · integration · Playwright (where applicable) · a11y · performance · regression — permission tests for nav/commands/search (015, 017, 019, 020)

## Documentation (mandatory per extension)

Overview · architecture · configuration · permissions · events · search · commands · testing · limitations — must not contradict 001–023

## Packaging

Independently buildable · install · upgrade · remove · migrate · rollback — monorepo `/modules`, `/services`, `/adapters`, `/packages` (004)

## Self-hosted first

SDK assumes self-hosted deploy · OSS integrations first · commercial via connectors optional (008)

## AI / Cursor development

Consume SDK contracts before code — architecture · manifest · interfaces · standards · testing · docs — reduces ambiguity; **phase gate: no implementation until owner authorises** (001)

## Cursor build rules

Read SDK first · interfaces before impl · manifest before code · dynamic registration · never bypass Platform Services · isolated modules · reusable abstractions · tests with code · docs with every change

## Acceptance highlights

Common lifecycle · automatic discovery · consistent architecture · replaceable modules · mandatory docs/tests · AI can generate compliant extensions · teams extend via SDK alone · **no service bypass / direct notify / standalone search** · **manifest + tests + docs before merge**
