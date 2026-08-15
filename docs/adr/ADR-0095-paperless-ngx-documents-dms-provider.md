# ADR-0095: Paperless-ngx as optional Documents DMS provider

## Status

**Accepted** — Owner — 2026-08-15

## Context

APZHUB Documents is a **native platform SoR** (APZDOCS programme frozen). The OSS catalogue still lists Paperless-ngx as a possible Documents DMS engine ([OSS Product Integration Catalog](../architecture/APZHUB-OSS-Product-Integration-Catalog.md)). [OWNER-ENGINES-OUTSIDE-HUB](../decisions/OWNER-ENGINES-OUTSIDE-HUB.md) reserves host port **19082** for an APZHUB-owned Paperless CE instance. Owner accepted this ADR after LTS infra bring-up ([SPR-OPS-LTS-PAPERLESS-001](../sprint/SPR-OPS-LTS-PAPERLESS-001-apzhub-owned-paperless-bring-up.md)).

Native Documents must remain the product SoR unless Owner explicitly accepts a dual-path or migration model ([011](../011-platform-data-architecture-system-of-record-standards.md)).

## Decision

1. **Optional DMS engine:** Paperless-ngx CE (self-hosted) is an optional Documents **engine** behind `@apzhub/integration-paperless` / Platform Documents DMS services — never a module-direct dependency ([008](../008-module-connector-integration-architecture.md)).
2. **Native SoR first:** Platform Documents metadata and product APIs remain APZHUB-owned. Paperless is an engine for DMS health/list (and later binary/OCR) — not a replacement of native `/api/v1/documents` in the foundation slice. Platform IDs stay global ([011](../011-platform-data-architecture-system-of-record-standards.md)).
3. **Integration form:** `@apzhub/integration-paperless` via Integration SDK — `integration.yaml` before code ([026](../026-integration-sdk-adapter-framework-integration-manifest-specification.md)); CE/self-hosted first; no Enterprise-only APIs.
4. **AuthN:** BetterAuth only for APZHUB users. Paperless API tokens stay server-side. No Authentik remote-user on the APZHUB-owned LTS stack.
5. **UX:** Standard users never see Paperless branding or login for normal Documents work.
6. **Implementation sprint:** [SPR-OPS-PAPERLESS-002](../sprint/SPR-OPS-PAPERLESS-002-documents-dms-paperless-foundation.md) — foundation adapter + `/api/v1/documents/dms/*` health/list against LTS `19082`. Do not touch legacy `apz-paperless` / `18082`.

## Consequences

- Unblocks `integrations/paperless` and LTS env retarget for Documents DMS.
- Does **not** migrate native Documents blobs or stop legacy Paperless.
- Dual-path binary storage remains a later Owner decision.

## Non-goals (foundation slice)

Migrating native Documents blobs · Stopping legacy `apz-paperless` · Authentik SSO into Paperless · Upload/OCR/viewer/webhooks · Replacing native SoR.

## Related

- [OWNER-ENGINES-OUTSIDE-HUB](../decisions/OWNER-ENGINES-OUTSIDE-HUB.md)
- [SPR-OPS-LTS-PAPERLESS-001](../sprint/SPR-OPS-LTS-PAPERLESS-001-apzhub-owned-paperless-bring-up.md)
- [ADR-0067 Metabase provider](./ADR-0067-metabase-analytics-provider.md) (pattern)
- [APZHUB Product Portfolio — Documents](../products/APZHUB-PRODUCT-PORTFOLIO.md)
