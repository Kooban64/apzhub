# ADR-0095: Paperless-ngx as optional Documents DMS provider

## Status

**Proposed — awaiting Owner ADR acceptance** — 2026-08-15

## Context

APZHUB Documents is a **native platform SoR** (APZDOCS programme frozen). The OSS catalogue still lists Paperless-ngx as a possible Documents DMS engine ([OSS Product Integration Catalog](../architecture/APZHUB-OSS-Product-Integration-Catalog.md)). No `integrations/paperless` package exists on disk. [OWNER-ENGINES-OUTSIDE-HUB](../decisions/OWNER-ENGINES-OUTSIDE-HUB.md) reserves host port **19082** for an APZHUB-owned Paperless CE instance and forbids inventing an adapter without ADR + Owner.

Native Documents must remain the product SoR unless Owner explicitly accepts a dual-path or migration model ([011](../011-platform-data-architecture-system-of-record-standards.md)).

## Decision (proposed)

1. **Optional DMS engine:** Paperless-ngx CE (self-hosted) may become a Documents **engine** behind a future `DocumentAdapter` / `integrations/paperless` — never a module-direct dependency ([008](../008-module-connector-integration-architecture.md)).
2. **Native SoR first:** Platform Documents metadata and product APIs remain APZHUB-owned. Paperless holds binary/OCR content only if Owner chooses engine-backed storage; platform IDs stay global ([011](../011-platform-data-architecture-system-of-record-standards.md)).
3. **Integration form:** Future `@apzhub/integration-paperless` via Integration SDK — `integration.yaml` before code ([026](../026-integration-sdk-adapter-framework-integration-manifest-specification.md)); CE/self-hosted first; no Enterprise-only APIs.
4. **AuthN:** BetterAuth only for APZHUB users. Paperless API tokens stay server-side. No Authentik remote-user on the APZHUB-owned LTS stack.
5. **UX:** Standard users never see Paperless branding or login for normal Documents work.
6. **Infrastructure now ≠ adapter authorisation:** Bringing up `apzhub-paperless-lts` on `19082` is ops topology only. **This ADR does not authorise adapter implementation** until Owner sets status to **Accepted** and names a sprint.

## Consequences

- Unblocks honest host topology (Paperless LTS listening) without violating Documents freeze.
- Blocks Documents env retarget and `integrations/paperless` until Acceptance.
- Clarifies dual-path risk: Owner must choose native-only vs engine-backed binary before adapter coding.

## Non-goals

Implementing `integrations/paperless` · Migrating native Documents blobs · Stopping legacy `apz-paperless` · Authentik SSO into Paperless for APZHUB users.

## Related

- [OWNER-ENGINES-OUTSIDE-HUB](../decisions/OWNER-ENGINES-OUTSIDE-HUB.md)
- [SPR-OPS-LTS-PAPERLESS-001](../sprint/SPR-OPS-LTS-PAPERLESS-001-apzhub-owned-paperless-bring-up.md)
- [ADR-0067 Metabase provider](./ADR-0067-metabase-analytics-provider.md) (pattern)
- [APZHUB Product Portfolio — Documents](../products/APZHUB-PRODUCT-PORTFOLIO.md)
