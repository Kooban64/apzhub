# Audit Generation Report — APZQEP-ENG-110E

`EvidenceSecurityAuditService` records:

- access granted / denied
- policy failures (`unavailable` / `indeterminate`)
- cross-tenant attempts
- privilege escalation attempts (`insufficient_permission`)

Writes via `EvidenceAuditRepository` + optional `AuditPort`. Persistence technology / event bus publication deferred.
