# APZHUB Platform Document — Consumer Integration Guide (HTTP)

**Milestone:** APZDOCS-006 (certification update)  
**Status:** Guidance — Document Platform classified **PRODUCTION_READY_WITH_LIMITATIONS**  
**Architecture:** Frozen at APZDOCS-005 surface

## Shared interface

All products must consume Document Platform metadata through:

1. HTTP `/api/v1/documents` **or**
2. Typed `createHttpDocumentClient()` / `getDocumentClient()` **or**
3. Product-neutral Workbench `/workspace/documents` (operators)

Never import `@apzhub/document-core`, `@apzhub/document-persistence`, or `@apzhub/document-storage` from UI modules. Never call storage providers or binary APIs from presentation code.

## Certified path

```text
Workbench / Typed Client → HTTP → Gateway → RequestPipeline → Authz
  → Platform Document Services → Document Core → Persistence / Storage
```

## Future consumer onboarding (document only — not implemented)

| Product | Suggested first use | Notes |
| ------- | ------------------- | ----- |
| **Projects** | Spec / delivery artefact metadata refs | No Plane DTOs in UI |
| **Support** | Ticket attachment metadata refs | No Zammad DTOs in UI |
| **Reporting** | Evidence / control pack metadata | Coordinate with reporting; no binary SoR in reporting |
| **APZ TCMS** | Evidence metadata linkage | Uploads remain out of Document HTTP scope here |
| **Documents** | Operator Workbench (delivered) | Metadata only |
| **Workflow** | Approval artefact references | No Event Bus required for metadata reads |
| **Analytics** | Derived document counts/status | Derived indexes only; Document SoR remains engines/platform docs |

### Onboarding checklist

1. Call platform HTTP or `createHttpDocumentClient` only.
2. Map product permissions onto `document.*` (server authoritative).
3. Keep storage keys / paths out of UI models.
4. Add Vitest mocks against `/api/v1/documents` — no live providers in unit CI.
5. Pass boundary audit (no document-core/storage in client/handlers/UI).

## Related

- [Vertical Certification](../architecture/APZHUB-Platform-Document-Vertical-Certification.md)
- [HTTP API](../architecture/APZHUB-Platform-Document-HTTP-API.md)
- [Typed Client Guide](./APZHUB-Platform-Document-Typed-Client-Guide.md)
- [Workbench Developer Guide](./APZHUB-Platform-Document-Workbench-Developer-Guide.md)
- [Security Guide](../security/APZHUB-Platform-Document-HTTP-Security-Guide.md)
