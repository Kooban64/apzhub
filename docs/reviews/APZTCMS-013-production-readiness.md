# APZTCMS-013 — Testing Production Readiness

**Milestone:** APZTCMS-013  
**Date:** 2026-07-12  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**  
**Authority:** [Vertical-Slice Certification](../architecture/APZHUB-APZ-TCMS-Vertical-Slice-Certification.md)

---

## Scope certified

Full product path Workbench → Typed Client → HTTP → Gateway → RequestPipeline → Authorization → Platform Services → Domain → Persistence → PostgreSQL.

## Readiness checklist

| Area | Status | Notes |
| ---- | ------ | ----- |
| Architecture boundaries | Ready | Zero forbidden-import violations |
| API + OpenAPI | Ready | `pnpm openapi:validate:platform` PASS |
| Domain quality | Ready | Typecheck/lint/tests PASS |
| Platform testing services | Ready | Vitest + boundary tests PASS |
| Security controls | Ready | Authn/authz/tenancy/correlation |
| Certification engine | Ready | Human approve only; advisory recs |
| Release readiness | Ready | `isDecision: false` |
| Workbench presentation | Ready | No UI business logic |
| Live Playwright on :3300 | Limitation | Specs present; runtime not available this session |
| apps/web V8 coverage | Limitation | Not in root coverage include |
| Cross-product typecheck debt | Limitation | Plane/Zammad harness noise |
| AI / Event Bus / runners / binary evidence | Excluded | By design |

## Production classification evidence

See [Vertical-Slice Certification](../architecture/APZHUB-APZ-TCMS-Vertical-Slice-Certification.md) and [Quality Report](./APZTCMS-013-quality-report.md).

## Ops re-run recommended before cutover

1. Start web app on coexistence port and run `apztcms-010` + `apztcms-012` Playwright suites.
2. Confirm `TESTING_SERVICE_ENABLED=true` and Postgres migrations through `0028` applied.
3. Spot-check dark/light themes and keyboard navigation in a browser.

## Next

**APZTCMS-014** only — owner approval required. No implementation in this milestone.
