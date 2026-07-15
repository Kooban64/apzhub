# Search Security and Tenancy Guide

> **Milestone:** APZSEARCH-003

## Authorisation

`ProductionAuthorizationProvider` + explicit operation→permission map. Deny by default. Client-supplied roles/permissions are not trusted for grants.

## Tenancy

Enforce tenant + organisation isolation at platform-service inputs, repositories, provider registration, configuration, collections, sources, scopes, profiles, diagnostics, health, audit, and statistics.

## Impersonation

Existing platform impersonation controls apply. Audit original + effective actor on provider/configuration/activation changes. No impersonation UI.
