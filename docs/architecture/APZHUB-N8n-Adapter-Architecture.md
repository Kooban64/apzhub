# APZHUB n8n Adapter Architecture

**Milestone:** APZWORKFLOW-006  
**Package:** `@apzhub/integration-n8n` **0.1.0**  
**Role:** Official Workflow Engine Reference Adapter (read-only metadata)

## Layering

```text
Workflow Platform (frozen — not called from this package)
        ↓ (future APZWORKFLOW-007+)
Integration SDK
        ↓
N8nAdapter (IntegrationAdapterBase)
        ↓
N8nRestClient (injected fetch)
        ↓
n8n Public API
```

## Scope

- Connection, authentication (API key / PAT / Basic; OAuth placeholder)
- Capability discovery, health, diagnostics, compatibility
- Read-only list/get/validate/metadata for workflows and related catalogues
- Canonical metadata mapping — no raw n8n types outside the adapter

## Explicit non-goals

Platform Services · Gateway · HTTP · Workbench · execute · activate · schedules · webhooks · Event Bus · workers · credential secret resolution beyond Auth SecretProvider · AI

## Related

- [Mapping Guide](../guides/APZHUB-N8n-Mapping-Guide.md)
- [Capability Guide](../guides/APZHUB-N8n-Capability-Guide.md)
- [Security Guide](../guides/APZHUB-N8n-Security-Guide.md)
- [Developer Guide](../developer/APZHUB-N8n-Developer-Guide.md)
