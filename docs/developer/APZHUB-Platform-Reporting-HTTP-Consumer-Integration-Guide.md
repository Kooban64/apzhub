# APZHUB Platform Reporting — Consumer Integration Guide (HTTP)

**Milestone:** APZREPORT-003 (certification update)  
**Status:** Guidance — APZ TCMS is the certified first production consumer.  
**Platform classification:** **PRODUCTION_READY_WITH_LIMITATIONS**

## Shared interface

All products must consume the Reporting Platform through:

1. HTTP `/api/v1/reporting` **or**
2. Typed `createHttpReportingClient()`

Never import `@apzhub/reporting-core` from UI modules. Never call product engines for report rendering.

## Certified consumer — APZ TCMS

| Concern                                                     | Status                           |
| ----------------------------------------------------------- | -------------------------------- |
| `listReportPlaceholders` via platform reporting client      | Compatible                       |
| Permission gating `report.view` (+ legacy `reporting.view`) | Compatible                       |
| Server-side `gateway.testing.reporting` facet               | Retained for TCMS domain callers |
| Behavioural regressions in this milestone                   | None (certification only)        |

## Future consumer onboarding (document only — not implemented)

| Product       | Suggested first use                    | Onboarding steps                                                                                   |
| ------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Projects**  | Portfolio / delivery summary templates | Own `module` templates → call `/api/v1/reporting` via typed client → register `report.*` for roles |
| **Support**   | SLA / quality packs                    | Product parameters from Support services only; no Zammad DTOs in templates                         |
| **Documents** | Control / evidence packs               | Coordinate with future Document Management (APZDOCS); no binary SoR in reporting                   |
| **Analytics** | Export / pack summaries                | Do not reimplement analytics engines; reporting formats only                                       |
| **Workflow**  | Run / approval summaries               | Scheduling remains out of scope until a later approved milestone                                   |

### Onboarding checklist (any future product)

1. Define product-owned templates (manifest/data) — do not fork reporting-core.
2. Call platform HTTP or `createHttpReportingClient` only.
3. Map product permissions onto `report.*` (no new namespaces unless approved).
4. Keep metadata references in platform envelopes; do not store binaries in reporting.
5. Add Vitest + Playwright mocks against `/api/v1/reporting` — no live engine deps.
6. Pass boundary audit (UI must not import reporting-core/contracts/gateway).

## Related

- [Vertical Certification](../architecture/APZHUB-Platform-Reporting-Vertical-Certification.md)
- [Typed Client Guide](./APZHUB-Platform-Reporting-Typed-Client-Guide.md)
- [HTTP API](../architecture/APZHUB-Platform-Reporting-HTTP-API.md)
- [Security Guide](../security/APZHUB-Platform-Reporting-Security-Guide.md)
