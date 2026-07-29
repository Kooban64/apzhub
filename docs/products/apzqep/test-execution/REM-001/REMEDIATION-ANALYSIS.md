# REMEDIATION-ANALYSIS — APZQEP-REM-001 (L-02)

| Field     | Value          |
| --------- | -------------- |
| Programme | APZQEP-REM-001 |
| Date      | 2026-07-29     |
| Status    | Complete       |

## Finding (CERT-001 / ECR)

**L-02 / SEC-01 / TD-03:** `EvidenceAccessPort` permitted access through **default-allow** when the accessibility check was not injected.

## Exact default-allow path (pre-remediation)

1. **Adapter** — `packages/qep-test-execution/src/infrastructure/adapters/evidence-access-port.ts`  
   Previous behaviour: if `check` was omitted, `assertAccessible` returned without throwing (`if (!check) return`).

2. **Command orchestration** — `execution-command-service.ts` `associateEvidence`  
   Previous behaviour: `if (deps.evidenceAccess) { await assertAccessible... }` — skipping the port entirely when missing.

3. **Production bootstrap** — `apps/web/lib/api/v1/gateway/bootstrap.ts`  
   Previous behaviour: `createQepPlatformServicesForProduction` did **not** pass `execution.evidenceCheck`, so factories constructed the port with no check → default-allow.

## Surfaces inspected

| Surface                         | Finding                                                               |
| ------------------------------- | --------------------------------------------------------------------- |
| EvidenceAccessPort contract     | Boolean/void assert only; no typed decision                           |
| Implementations / adapters      | Single production adapter + test allow fake                           |
| Call sites                      | `associateEvidence` only (OES PART-04 accessibility before associate) |
| Evidence read / download / blob | ADR-0080 — references only; no blob SoR / download in this package    |
| List / metadata                 | Via execution query + tenant + read permission                        |
| Workbench                       | `availableActions` / UI only — not a security boundary                |
| API routes                      | `POST .../evidence-references` → platform → application               |
| Permission / RBAC               | `PermissionPort.assertAny` for execute/admin before associate         |
| Audit                           | Success path audited via mutation; denials not previously recorded    |
| Tenant / ownership              | Repository keyed by `tenantId`; cross-tenant get → null               |
| Existing tests                  | No fail-closed / unconfigured-check cases                             |
| RA-02                           | Binding until verified + Owner acceptance                             |

## Root cause

Optional wiring + silent allow when unconfigured violated **NO EXPLICIT AUTHORISATION = NO ACCESS**.

## Remediation approach (selected)

1. Typed `EvidenceAccessDecision` outcomes; only `allowed` grants access.
2. Unconfigured check → **deny**.
3. Indeterminate / undefined / null / error → **deny** (or unavailable mapped to deny on assert).
4. Require `evidenceAccess` on application command deps.
5. Affirmative production policy via `createBaselineEvidenceAccessCheck()` (explicit, not missing-check fallback).
6. Wire baseline check in factories and gateway bootstrap.
7. Audit `evidence_access_denied` on associate denial.

## Migration

**None required** — enforcement is in-process policy evaluation; existing schema sufficient.
