# Observability Metadata Guide

**Milestone:** APZOBSERVE-002

Platform Services manage metadata for:

- Health / readiness / liveness checks and aggregates
- Metric definitions and sample *references*
- Alert definitions and alert states
- Dashboard registration metadata
- Log source registration
- Trace definitions and span *references*
- Incident references and maintenance windows
- Platform diagnostics metadata
- Generic observability metadata bags

Credential-like metadata keys are rejected (`assertNoCredentialPayload`).

Provider execution (scrapes, queries, exporters) is out of scope.
