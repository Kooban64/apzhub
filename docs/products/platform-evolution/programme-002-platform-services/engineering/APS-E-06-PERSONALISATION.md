# APS-E-06 — Personalisation consolidate

| Field     | Value                              |
| --------- | ---------------------------------- |
| Status    | **COMPLETE**                       |
| Timestamp | 20260808T233500Z                   |
| Canonical | **APS-Personalisation** (APS-S-05) |

---

## Consolidated surface

| Concern              | Owner                                | API                                                 |
| -------------------- | ------------------------------------ | --------------------------------------------------- |
| Preferences          | APS-Personalisation                  | `/api/platform/v1/preferences`                      |
| Favorites            | APS-Personalisation                  | `/api/platform/v1/favorites`                        |
| Recent items         | APS-Personalisation                  | `/api/platform/v1/recent`                           |
| Workbench layout     | APS-Personalisation                  | `/api/platform/v1/personalisation/workbench-layout` |
| Configuration engine | Platform **machinery** (not APS row) | `/api/v1/configuration/**`                          |
| Feature flags        | Platform **machinery** (APE-Flags)   | `/api/platform/v1/feature-flags`                    |

Prefs never grant permissions. Products must not invent parallel shell-preference SoRs.

---

## Stage 3 note (Candidate Law 7)

Canonical personalisation contract lives in `@apzhub/platform-personalisation`. Configuration/flags remain separate machinery — not alternate Personalisation APIs.
