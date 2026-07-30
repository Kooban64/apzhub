# Configuration Guide — Evidence Management

| Variable             | Effect                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| `APZHUB_QEP_ENABLED` | When `false` / `0` / `off`, QEP platform services (including Evidence) are unavailable → REST **503** |
| `DATABASE_URL`       | Required for QEP gateway enablement in production bootstrap (shared with other QEP capabilities)      |

## Evidence-specific flags

None. No `APZHUB_QEP_EVIDENCE_*` feature flag is defined.

## Runtime modes

| Factory                                          | Persistence                  |
| ------------------------------------------------ | ---------------------------- |
| `createQepEvidencePlatformServicesForTest`       | memory                       |
| `createQepEvidencePlatformServicesForProduction` | memory (explicit — ADR-0088) |

## Permissions

Platform catalogue keys `qep.evidence.*` (see `EVIDENCE_PERMISSIONS` / `QEP_EVIDENCE_PERMISSIONS`). Principals must hold required permissions; L-02 still applies after pipeline authz.
