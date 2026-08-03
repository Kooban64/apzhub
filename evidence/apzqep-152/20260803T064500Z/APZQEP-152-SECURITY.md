# APZQEP-152 Security Evidence

Timestamp: 20260803T064500Z  
Baseline (pre-152): `49b391a9`

## Remediation delivered

1. Cap A–F HTTP `actorFromContext` elevation **removed** (six handlers).
2. `withPlatformApiAuth` resolves `resolveSessionAuthorization` → `serviceContext.permissions`.
3. Cap roles: `qep-operator`, `qep-reader` (tenant-member has **no** Cap grants by default).
4. Opt-in only: `APZQEP_QEP_AUTO_ASSIGN_OPERATOR=true`.
5. Cap F HR-001 `system-reporting` actor **removed** (repository-derived facts).
6. `runWithTenantContext` + `applyPostgresTenantSession` on Cap TX path.

## Tests

```text
testing/apzqep-152 — 10 passed
testing/apzqep-151 — passed (regression)
testing/apzqep-150 enterprise-product-chain — passed
```

## After programme

Do **not** declare production GO. Re-run APZQEP-150. Product Board Go/No-Go.
