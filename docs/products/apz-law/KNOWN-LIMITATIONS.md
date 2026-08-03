# APZ Law Platform — Known Limitations (Release 1.0.0)

> **Product:** APZ Law Platform  
> **SemVer:** **1.0.0**  
> **Programme:** APZ-LAW-002  
> **Certification class:** PRODUCTION_READY_WITH_LIMITATIONS  
> **Date:** 2026-07-19  
> **Authority:** Owner Approval · Definition Pack · QA-001 · readiness review · disk

---

## Owner-retained Release 1.0 limitations

| ID        | Limitation                                     | Commercial impact                                  |
| --------- | ---------------------------------------------- | -------------------------------------------------- |
| KL-LAW-01 | Placeholder UX surfaces remain in places       | Do not claim polish completeness                   |
| KL-LAW-02 | Financial Engine extraction deferred (FIN-001) | Billing remains in-Law; no shared Financial Engine |
| KL-LAW-07 | No Email System of Record                      | No Email edition / inbox claims                    |

---

## Additional documented limitations

| ID        | Limitation                                                                                                                                                                            | Notes                                                                                                                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| KL-LAW-05 | Tenant resolution residual when session lacks tenant                                                                                                                                  | **Narrowed APZHUB-LAW-ADOPT-003 EAB-04** — `resolveLawApiTenant` prefers `auth_session`; header/`x-tenant-id` and dev fallback apply only when session tenant absent. Not a session-enrichment placeholder. |
| KL-LAW-08 | Practice-area specialty SKUs not productised                                                                                                                                          | No specialty practice packs in 1.0 claims                                                                                                                                                                   |
| KL-LAW-09 | External court e-filing / external DMS / accounting                                                                                                                                   | Post-1.0 unless separately approved                                                                                                                                                                         |
| KL-LAW-10 | Historical planning docs may describe “no code” while app exists                                                                                                                      | Prefer disk + closed LAW milestones                                                                                                                                                                         |
| KL-LAW-11 | `@apzhub/search-law` **0.1.0** present (R12-SEARCH-02); **Platform-1.3-ENG-001** wires Law workflow composition → journal → live drain (enable `APZHUB_SEARCH_ORCHESTRATION_ENABLED`) | In-app legal search / Knowledge Discovery still used; financial/trust entities never published                                                                                                              |

---

## Resolved by this packaging programme

| ID        | Was                                      | Now                                             |
| --------- | ---------------------------------------- | ----------------------------------------------- |
| KL-LAW-06 | Commercial SemVer evidence folder absent | **Resolved** — `docs/releases/law/1.0.0/` filed |

---

## Resolved by Release 1.1

| ID                     | Was                                                                                  | Now                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| KL-LAW-03 / OBS-LAW-01 | PermissionService / legal permission wiring residual (dev allow-all / `*` injection) | **Resolved** — APZHUB-1.1-001 (**ACCEPTED**)                                                                                     |
| KL-LAW-04 / OBS-LAW-02 | Persistent activity/notification stores deferred (session-only UX)                   | **Resolved** — platform-owned durable ENF/ATF session stores scoped by tenant/user; evidence `docs/releases/1.1/APZHUB-1.1-002/` |

---

## Honesty rule

Limitations must remain visible in certification and product docs. Do not silently treat limited surfaces as complete.
