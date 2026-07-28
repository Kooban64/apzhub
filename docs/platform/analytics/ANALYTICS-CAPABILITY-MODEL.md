# Analytics Platform — Capability Model

> **Programme:** APZHUB-PLATFORM-ANALYTICS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19

---

## Capability catalogue

| Capability                | Description                                                       | Foundation MVP        | Notes                                              |
| ------------------------- | ----------------------------------------------------------------- | --------------------- | -------------------------------------------------- |
| **Dashboard Registry**    | Platform metadata for dashboards (id, title, provider ref, roles) | Required              | Not Metabase as SoR for registry                   |
| **Dashboard catalogue**   | Permission-filtered list for Workbench                            | Required              |                                                    |
| **Role-based dashboards** | Default sets per persona (exec / ops / PO)                        | Required              |                                                    |
| **Saved dashboards**      | User/org saved selections & filter presets                        | Required              | Prefs / SavedViewService                           |
| **Embedding**             | Signed embed into Workbench shell                                 | Required              | Adapter capability                                 |
| **Filtering**             | Pass governed filters into embed context                          | Desired MVP           | Provider-dependent                                 |
| **Sharing**               | Share dashboard refs within tenant under AuthZ                    | Later / limited       | No public anonymous shares in MVP                  |
| **Caching**               | Catalogue + embed token cache (Redis)                             | Required              | Short TTL                                          |
| **Health**                | Platform + adapter health                                         | Required              |                                                    |
| **Diagnostics**           | Adapter diagnostics (version, connectivity)                       | Required              | Mask secrets                                       |
| **Audit**                 | View/manage/embed issuance audited                                | Required              | Central audit                                      |
| **Search publication**    | Index title/description                                           | Post-MVP ok           | Search Publication frozen — register provider only |
| **Notifications hooks**   | Threshold → Attention Engine                                      | Out of foundation MVP | Product exclusion adjacency                        |

---

## Permission keys (illustrative — finalise at contracts phase)

| Key                | Intent                             |
| ------------------ | ---------------------------------- |
| `analytics.view`   | See catalogue / open embeds        |
| `analytics.manage` | Manage registry / role defaults    |
| `analytics.admin`  | Provider admin ops (rare; audited) |

Server AuthZ is authoritative; Workbench only hides chrome.

---

## Capability vs frozen planes

| If you need…                       | Use                    |
| ---------------------------------- | ---------------------- |
| KPI metadata lifecycle             | Metrics SoR            |
| Ops telemetry metadata             | Observability SoR      |
| Report placeholders / TCMS reports | Reporting              |
| Suite BI dashboards                | **Analytics Platform** |

---

## Related

- [ANALYTICS-PLATFORM.md](./ANALYTICS-PLATFORM.md)
- [APZ Analytics Release 1.0 definition](../../products/apz-analytics/RELEASE-1.0-DEFINITION.md)
