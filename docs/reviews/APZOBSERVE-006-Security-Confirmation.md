# APZOBSERVE-006 — Security Confirmation

**Date:** 2026-07-17  
**Programme:** Platform Observability (wave freeze)  
**Classification retained:** PRODUCTION_READY_WITH_LIMITATIONS

---

## Confirmation matrix

| Control | Result |
| --- | --- |
| Deny-by-default authorization (`observePlatformOps`) | Confirmed |
| Granular `observe.*` permission mapping | Confirmed |
| Tenant isolation (persistence + RLS 0055) | Confirmed |
| Organisation context on ServiceRequestContext | Confirmed |
| Metadata integrity (Core validation + lifecycle) | Confirmed |
| Provider-secret exclusion | Confirmed |
| Credential / API-key / bearer / webhook exclusion | Confirmed |
| Diagnostics safety (no provider probes / secrets) | Confirmed |
| HTTP safety (thin handlers; controlled 503) | Confirmed |
| Workbench safety (typed client only; no secret editors) | Confirmed |
| PostgreSQL required in production | Confirmed |
| RLS expectations (migration 0055) | Confirmed |
| Production bootstrap (no silent memory fallback) | Confirmed |
| Frozen Admin / Identity untouched | Confirmed |

## Architectural security blockers (certified scope)

**None known** within the declared metadata-governance scope.

## Residual (non-blocking)

- Live Playwright webServer LIMITED by external Testing slug conflict
- Live PostgreSQL integration evidence depends on deployment CI
- Intentional absence of provider security surfaces (providers not in scope)

## See also

- [APZOBSERVE-005 Security Review](./APZOBSERVE-005-Security-Review.md)
- [Observability Architecture Freeze Notice](../architecture/APZHUB-Observability-Architecture-Freeze-Notice.md)
