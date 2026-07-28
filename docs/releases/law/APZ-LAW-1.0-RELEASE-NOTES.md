# APZ Law Platform 1.0.0 — Release Notes

> **Product:** APZ Law Platform  
> **Version:** **1.0.0**  
> **Status:** Certification filed — **ACCEPTED / CLOSED** (APZ-LAW-002)  
> **Certification class:** PRODUCTION_READY_WITH_LIMITATIONS  
> **Date:** 2026-07-19

---

## Summary

First production commercial **APZ Law Platform** product release. Packages the existing native legal practice vertical (LAW-001…015) as SemVer **1.0.0** — Matters, Clients, Documents, Tasks, Time, Billing, Calendar, Trust Accounting, Search, Dashboard/Reports/Administration — under APZHUB branding. No platform rebuild. No new legal functionality. No Financial Engine extraction. No Email System of Record.

## Packaged (existing platform — not newly implemented)

| Layer                  | Delivery                                                                                                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application            | `@apzhub/law-platform` **1.0.0** (`apps/law-platform`, port **3301**)                                                                                                      |
| Domain package         | `@apzhub/legal-business-core` **1.0.0**                                                                                                                                    |
| Service manifests      | `services/legal-platform` **1.0.0** · law-* modules (matters, clients, documents, tasks, time, billing, calendar, trust, search, dashboard, reports, administration, root) |
| API specification      | `docs/specs/LAW-OpenAPI-v1.yaml` **1.0.0** + Bruno/Postman collections                                                                                                     |
| Trust Accounting       | LAW-015 closed · trust UI + lib + postgres/in-memory repositories                                                                                                          |
| Engineering programmes | LAW-001…015 closed                                                                                                                                                         |
| Commercial planning    | APZ-LAW-001 **ACCEPTED** (Owner Decision with this programme)                                                                                                              |
| Readiness review       | APPROVED FOR PRODUCT VALIDATION (historical)                                                                                                                               |

## Consumed platform capabilities

| Capability               | Release 1.0.0 posture                                                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Identity / AuthZ         | BetterAuth + `@apzhub/platform-identity` / `platform-authorization` — OBS-LAW-01 closed by **APZHUB-1.1-001** (see Release 1.1 evidence) |
| Workbench                | Dedicated Law app Workbench surfaces                                                                                                     |
| Search                   | In-app legal search / Knowledge Discovery — no separate `@apzhub/search-law` package                                                     |
| Workflow                 | In-product matter/document/task/invoice/trust lifecycles; APZ Workflow (n8n) product **boundary only**                                   |
| Documents                | Native Law Documents; APZ Documents product cross-link **boundary / optional**                                                           |
| Analytics                | Law reports/dashboard; APZ Analytics (Metabase) **boundary only** — no Metabase branding                                                 |
| Notifications / Activity | Platform ENF / Activity frameworks — OBS-LAW-02 closed by **APZHUB-1.1-002** (durable session stores)                                    |
| Calendar                 | In-app Law calendar (present)                                                                                                            |
| Email                    | **Not included** — no Law Email SoR                                                                                                      |

## Not included (Release 1.0)

Financial Engine extraction (FIN-001) · Email SoR · court e-filing · external DMS/accounting adapters · practice-area specialty SKUs · Law Platform redesign · new legal domains

## Known limitations

See [KNOWN-LIMITATIONS.md](../../products/apz-law/KNOWN-LIMITATIONS.md). Owner-retained: Placeholder UX · FIN-001 deferred · No Email SoR. **OBS-LAW-01** closed under [APZHUB-1.1-001](../1.1/APZHUB-1.1-001/README.md) (**ACCEPTED**). **OBS-LAW-02** closed under [APZHUB-1.1-002](../1.1/APZHUB-1.1-002/README.md) (Awaiting Acceptance).

## CHANGELOG

Root [CHANGELOG.md](../../../CHANGELOG.md) — section **[APZ-LAW-002]**.
