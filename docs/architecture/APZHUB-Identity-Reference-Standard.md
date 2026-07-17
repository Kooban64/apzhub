# APZHUB Identity Administration Reference Standard

**Status:** Official APZHUB Platform Identity Administration Reference Standard  
**Declared:** APZIDENTITY-006 (2026-07-17)  
**Classification:** PRODUCTION_READY_WITH_LIMITATIONS (metadata administration plane)

---

## Purpose

This document declares the certified Platform Identity Administration System of Record as the **canonical System of Record for identity metadata** within APZHUB.

Identity Administration owns identity **metadata and lifecycle administration**. It does **not** own authentication, credential storage, directory synchronisation, or provisioning into external engines.

## Ownership (canonical)

Identity Administration owns:

- users (metadata)
- groups
- roles (Identity role metadata — not Production Authorization redesign)
- organisations
- tenants
- departments
- positions
- memberships
- service assignments (metadata links only)
- invitations (metadata only)
- lifecycle metadata (activation / deactivation)
- administrative policies (metadata)
- audit metadata
- history metadata

## Non-ownership (permanent unless ADR)

Identity Administration does **not** own:

- authentication
- passwords / password hashes
- sessions / session tokens
- MFA secrets
- OAuth / OIDC / SAML
- SCIM / LDAP
- Microsoft Entra ID / Active Directory / Google Workspace directory synchronisation
- provisioning / external account creation
- credential distribution / secrets management

These boundaries are permanent unless superseded by an approved ADR.

## Certified lifecycle (mandatory)

Future identity-adjacent programmes should follow the same lifecycle unless an approved ADR authorises a deviation:

```text
Foundation
→ Platform Services (Gateway + RequestPipeline + Authorization)
→ HTTP API + OpenAPI + Production Typed Client
→ Workbench (manifest-driven)
→ Vertical Certification
→ Wave Certification & Architecture Freeze
```

## Certified architecture shape

```text
Workbench → Typed Client → HTTP → Gateway → RequestPipeline → Authz
→ Platform Services → Domain Core → Persistence → PostgreSQL
```

Rules:

- Presentation never bypasses Platform Services
- Typed clients call `/api/v1/identity/*` only
- HTTP handlers call `gateway.identity.*` only
- Business rules live in Identity Core
- Persistence is adapter-only behind repository ports
- Production Authorization is deny-by-default (`identityPlatformOps`)
- Identity never couples into frozen Administration architecture for its business surface
- Service assignments never call provider APIs or create external credentials

## Permissions catalogue (frozen)

`identity.*` · `identity.read` · `identity.manage` · `identity.user` · `identity.group` · `identity.role` · `identity.organization` · `identity.tenant` · `identity.assignment` · `identity.audit`

## Deviations

Any deviation from this Reference Standard requires an approved ADR and owner authorisation.

## See also

- [Architecture Freeze Notice](./APZHUB-Identity-Architecture-Freeze-Notice.md)
- [Future Identity Platform Guide](../developer/APZHUB-Future-Identity-Platform-Guide.md)
