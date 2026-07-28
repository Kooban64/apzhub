# Analytics Workbench Module

> **Programme:** APZHUB-PLATFORM-ANALYTICS-006 — **ACCEPTED / CLOSED**  
> **Product packaging:** APZ Analytics **1.0.0** — APZ-ANALYTICS-002 **Awaiting Acceptance**

> **Surface:** `/workspace/analytics/*`  
> **HTTP dependency:** `/api/v1/analytics/*` (OpenAPI **1.11.0**)

## Documents

| Document          | Path                                                                                                                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Developer guide   | [DEVELOPER-GUIDE.md](./DEVELOPER-GUIDE.md)                                                                                                                                                           |
| Navigation        | [NAVIGATION.md](./NAVIGATION.md)                                                                                                                                                                     |
| Known limitations | [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)                                                                                                                                                       |
| Release notes     | [RELEASE-NOTES.md](./RELEASE-NOTES.md)                                                                                                                                                               |
| Completion        | [../../sprint/APZHUB-PLATFORM-ANALYTICS-006-completion-report.md](../../sprint/APZHUB-PLATFORM-ANALYTICS-006-completion-report.md)                                                                   |
| Acceptance        | [../../foundation/completion-reports/APZHUB-PLATFORM-ANALYTICS-006-programme-acceptance-report.md](../../foundation/completion-reports/APZHUB-PLATFORM-ANALYTICS-006-programme-acceptance-report.md) |

## Architecture

```
Workbench UI → /api/v1/analytics/* → withPlatformApiAuth → gateway.analytics.*
  → Analytics Platform Services → Metabase Integration (ops)
```

No Metabase / engine imports in Workbench components or `apps/web/lib/analytics`.

## Views

Analytics Home · Executive · Operational · Projects · Time · Support · Platform Health · Repository Metrics · Dashboard Details · Saved · Datasets · Reports · Search · Health · Diagnostics
