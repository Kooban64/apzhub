# OSS-101-10 Dependency Audit

**Generated:** 2026-07-10T17:34:52.183Z
**Verdict:** PASS
**Violations:** 0

## Dependency graph (package → imports)

```text
integration-plane
  → @apzhub/integration-sdk
  → @apzhub/integration-sdk/adapter
  → @apzhub/integration-sdk/auth
  → @apzhub/integration-sdk/client
  → @apzhub/integration-sdk/diagnostics
  → @apzhub/integration-sdk/errors
  → @apzhub/integration-sdk/observability
  → @apzhub/integration-sdk/resilience
  → @apzhub/platform-service-contracts
  → integration-plane:relative

platform-services
  → @apzhub/config
  → @apzhub/config/db
  → @apzhub/integration-plane
  → @apzhub/integration-sdk
  → @apzhub/integration-sdk/errors
  → @apzhub/platform-authorization
  → @apzhub/platform-service-contracts
  → platform-services:relative

platform-service-contracts
  → platform-service-contracts:relative

integration-sdk
  → integration-sdk:relative

platform-http-api
  → @apzhub/auth/server
  → @apzhub/integration-plane
  → @apzhub/platform-authorization
  → @apzhub/platform-security/headers
  → @apzhub/platform-security/traffic
  → @apzhub/platform-service-contracts
  → @apzhub/platform-services
  → platform-http-api:relative

```

## Rules checked

- `plane-no-platform-services`
- `plane-no-mapping-store`
- `no-plane-rest-client-outside-adapter`
- `no-plane-deep-imports`
- `http-no-direct-adapter`
- `http-no-plane-internal`
- `contracts-no-runtime-deps`

## Violations

None.
