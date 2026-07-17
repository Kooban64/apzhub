# APZHUB Identity HTTP API Architecture

**Milestone:** APZIDENTITY-003  
**Status:** Complete — Identity HTTP API & Production Typed Client

## Request path

```text
Future Identity Workbench
  → Identity Typed Client
  → /api/v1/identity/*
  → PlatformServiceGateway.identity.*
  → RequestPipeline → Production Authorization
  → Identity Platform Services → Identity Core → Persistence → PostgreSQL
```

## Principles

- HTTP is a thin transport layer — authenticate, validate, call gateway, return envelopes
- Handlers never import `identity-core`, `identity-persistence`, repositories, or PostgreSQL
- Business rules remain in Identity Core / Platform Services
- Metadata only — Authentication is a separate platform capability

## Enablement

`APZHUB_IDENTITY_ENABLED` deny-by-default. When disabled, handlers return controlled HTTP **503** (`IDENTITY_SERVICE_UNAVAILABLE`). No silent fallback.

## Surface

Base: `/api/v1/identity`

Facets: users, groups, roles, organisations, tenants, departments, positions, memberships, service-assignments, invitations, activation, deactivation, policies, audit, history, references, health, readiness, capabilities, management-capabilities.

## Explicit non-goals

Login, logout, password reset/change, sessions, OAuth/OIDC/SAML, SCIM, LDAP, MFA, tokens, provisioning, directory sync, Workbench, Event Bus, AI.
