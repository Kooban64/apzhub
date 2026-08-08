# SUP-P1-02 — Honest limitation disclosure

| Field  | Value            |
| ------ | ---------------- |
| ID     | **SUP-P1-02**    |
| Slice  | **APZSUP-102**   |
| Status | **Closed**       |
| Date   | 20260808T172500Z |

## Acceptance

User-visible honesty for open residuals; no pretend-complete surfaces.

## Evidence

| Surface              | Behaviour                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Help                 | `SupportHelpView` section `support-help-limitations` — live updates not enabled in v1.0; attachments 1 MiB; no delete |
| Realtime provider    | Error/connecting states disclose “Live updates unavailable — refresh still works normally.”                           |
| Attachment composers | Limit copy on customer reply + internal note (see SUP-P1-04)                                                          |

## Paths

- `apps/web/components/support/support-help-view.tsx`
- `apps/web/components/support/support-realtime-provider.tsx`
- Input catalogue: [../../../support/KNOWN-LIMITATIONS.md](../../../support/KNOWN-LIMITATIONS.md)

Realtime transport disposition remains **SUP-PR-03** (ship vs formal “none”).
