# Observability Diagnostics Guide

**Milestone:** APZOBSERVE-001

## PlatformDiagnostic

Metadata describing a diagnostic check: key, name, optional service key, health status, detail text, provider refs.

## HealthSummary

Aggregated counts for a scope key after evaluation. Stored as metadata — evaluation orchestration is deferred to later milestones.

## Credentials

`assertNoCredentialPayload` rejects metadata keys resembling secrets (`apiKey`, `password`, `token`, etc.).
