# APZHUB Support Platform Service Architecture

**Milestone:** OSS-110-10  
**Status:** Canonical — Support domain wired into platform services (no HTTP/UI)  
**Packages:** `@apzhub/platform-service-contracts` v0.7.0 · `@apzhub/platform-services` v0.7.0  
**Authority:** [009](../009-platform-service-layer-integration-framework.md) · [REFERENCE-ADAPTER-STANDARD](./REFERENCE-ADAPTER-STANDARD.md) · [Platform Service Implementation Architecture](./APZHUB-Platform-Service-Implementation-Architecture.md)

---

## Purpose

Introduce Support as a first-class Platform domain, mirroring Projects, with Zammad as the certified Reference Adapter provider.

---

## Layering

```text
Application / future HTTP handlers
        ↓
PlatformServiceGateway (support*)
        ↓
RequestPipeline
        ↓
Support*ServiceImpl (mapping-aware)
        ↓
MappingOrchestrator + EntityMappingStore
        ↓
ProviderResolver → Zammad capability providers
        ↓
@apzhub/integration-zammad adapter.core
        ↓
Zammad CE
```

**Prohibited:** Module → Zammad; Service → Zammad REST (skip provider); exposing `*_zammad_*` IDs to consumers; Ticket ≠ Task; Article ≠ Comment.

---

## Capabilities

| Capability key | Provider interface | Service |
| --- | --- | --- |
| `support_request` | `SupportProvider` | `SupportService` |
| `support_organization` | `SupportOrganizationProvider` | `SupportOrganizationService` |
| `support_group` | `SupportGroupProvider` | `SupportGroupService` |
| `support_user` | `SupportUserProvider` | `SupportUserService` |
| `support_article` | `SupportArticleProvider` | `SupportArticleService` |
| `support_search` | `SupportSearchProvider` | `SupportSearchService` |
| `support_history` | `SupportHistoryProvider` | `SupportHistoryService` |
| `support_analytics` | `SupportAnalyticsProvider` | `SupportAnalyticsService` |
| `support_sync` | `SupportSyncProvider` | _(provider only)_ |
| `support_webhook` | `SupportWebhookProvider` | _(provider only)_ |

---

## Bootstrap

```typescript
import { createPlatformServicesWithZammad } from "@apzhub/platform-services";

const services = createPlatformServicesWithZammad(adapter.core);
const gateway = services.gateway;

const page = await gateway.support.listSupportRequests(ctx);
```

---

## Explicit exclusions (OSS-110-10 service layer)

HTTP / OpenAPI · UI · Event Bus · webhook ingress · notifications · realtime · binary attachments · OAuth · schedulers / workers · caching · Support dashboard

*(HTTP surface delivered separately in OSS-110-11 — see [Support HTTP API](./APZHUB-Support-HTTP-API.md).)*
