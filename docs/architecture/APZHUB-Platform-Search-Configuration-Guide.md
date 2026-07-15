# APZHUB Platform Search — Configuration Guide

> **Milestone:** APZSEARCH-002

## Platform configuration

Stored in `platform_search_configuration` with version history:

- `defaultPageSize` / `maxPageSize` / `maxKeywordLength`
- `allowedProviderKinds`
- Isolation flags forced `true` (tenant, organisation, permission)

Use `putConfiguration` / `getConfiguration` on the thin platform services. Each put appends a `SearchConfigurationVersion` snapshot.

## Provider configuration

`SearchProviderConfiguration` supports:

- provider identifier + kind + version
- endpoint metadata (URL/path/region)
- authentication **references** only (`credentialRef`, TLS cert refs)
- TLS, timeouts, connection settings
- feature flags + capability declarations

## Secrets

Use the existing APZHUB secret abstraction (`credentialRef` / `*Ref`).

- Persist references only
- Never persist credentials
- Never expose secrets in diagnostics

`validateSearchProviderConfiguration` rejects inline secret-like material and forbids semantic/vector/fuzzy capability flags.
