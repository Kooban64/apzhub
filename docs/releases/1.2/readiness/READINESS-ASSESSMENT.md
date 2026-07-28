# APZHUB Release 1.2 — Readiness Assessment

> **Programme:** APZHUB-1.2-008  
> **Date:** 2026-07-20  
> **Classification:** DOCUMENTATION ONLY  
> **Evidence basis:** Repository only (programme packs · AI-MANIFEST · planning pack · ops risk register · KL · quality evidence)

---

## 1. Purpose

Determine whether Release **1.2** is ready to enter portfolio packaging and certification after completion of Owner-authorised P0 engineering programmes **APZHUB-1.2-002** through **APZHUB-1.2-007**, under the plan accepted in **APZHUB-1.2-001**.

---

## 2. Verification matrix

| Check                                     | Result              | Evidence                                                                                                                         |
| ----------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Release 1.1 compatibility maintained      | **PASS**            | All 002–007 packs hold Platform **1.1.0** SemVer; additive surfaces only                                                         |
| Architecture boundaries preserved         | **PASS**            | No Module→Connector; Search Architecture Freeze retained; GHA CI/CD Reference Adapter freeze retained; no redesign               |
| Public API compatibility                  | **PASS**            | Additive exports (`search-time`, `search-law`, `integration-gitlab-ci`, composition factories); no breaking removals asserted    |
| SemVer compatibility                      | **PASS**            | New packages **0.1.0**; platform-services **0.28.0** unchanged major; commercial product SemVer not bumped without certification |
| Quality evidence complete (authorised P0) | **PASS**            | See [QUALITY-SUMMARY.md](./QUALITY-SUMMARY.md)                                                                                   |
| Repository consistency                    | **PASS WITH NOTES** | Some COMPLETION-REPORT strings lag; this pack + AI-MANIFEST refresh are authoritative for readiness                              |
| Operational readiness (Theme A)           | **PASS WITH NOTES** | OPS-01…03 delivered; live Observe alert delivery still future (OPS-R-05 residual)                                                |
| Production readiness (P0 scope)           | **PASS WITH NOTES** | PRWL honesty required — see [PRODUCTION-READINESS.md](./PRODUCTION-READINESS.md)                                                 |
| Planned P0 engineering complete           | **PASS**            | Owner Decision: all approved P0 complete; 002–007 **ACCEPTED**                                                                   |
| STOP themes held                          | **PASS**            | Email SoR · FIN-001 · Workflow Execute · redesign not implemented                                                                |
| Themes D–E for exit                       | **WAIVED**          | Not in approved P0 set; Owner waiver for certification entry via Acceptance of this pack + KL update                             |

---

## 3. Programme-by-programme readiness

| Programme      | Acceptance | Quality                                            | Compatibility | Ops / notes                      | Ready for cert packaging |
| -------------- | ---------- | -------------------------------------------------- | ------------- | -------------------------------- | ------------------------ |
| APZHUB-1.2-001 | ACCEPTED   | N/A (planning)                                     | N/A           | Plan authoritative               | Yes (prerequisite)       |
| APZHUB-1.2-002 | ACCEPTED   | PASS                                               | Compatible    | Restore drill evidence           | Yes                      |
| APZHUB-1.2-003 | ACCEPTED   | PASS                                               | Compatible    | Alert policies; no live delivery | Yes                      |
| APZHUB-1.2-004 | ACCEPTED   | PASS                                               | Compatible    | Host coexistence controls        | Yes                      |
| APZHUB-1.2-005 | ACCEPTED   | PASS (adapter); frozen-wave pin drift pre-existing | Compatible    | Publisher only; no live drain    | Yes                      |
| APZHUB-1.2-006 | ACCEPTED   | PASS                                               | Compatible    | Publisher only; no live drain    | Yes                      |
| APZHUB-1.2-007 | ACCEPTED   | PASS                                               | Compatible    | Metadata/read-only GitLab CI     | Yes                      |

---

## 4. What “ready for certification” means (and does not)

**Means:**

- Authorised 1.2 P0 engineering outcomes may be packaged as Platform **1.2.0** (PRWL) under a named certification programme.
- Residual limitations are documented and travel with the release.
- No further P0 engineering of Themes A–C is required.
- Themes D–E / P1 are deferred unless separately approved.

**Does not mean:**

- Themes D–E (Postgres persistence honesty, Support webhook/attachments) are delivered.
- Search composition hooks / live Meilisearch drain are wired into product services.
- Observe live alert evaluation/delivery is production-automated.
- GitLab CI dispatch/rerun/cancel/download are supported.
- Workflow Execute, Email SoR, or FIN-001 are unlocked.
- Full monorepo Playwright / Docker rebuild was re-run under every 1.2 programme (R12-QA-01 remains P1; QA-002 held from prior baseline).

---

## 5. Documentation lag (non-blocking)

Historical status strings in some programme COMPLETION-REPORT files or planning notes may lag ACCEPTED. Certification packaging should refresh authoritative registers (this pack + AI-MANIFEST + Owner register). This is **documentation hygiene**, not additional Release 1.2 engineering.

---

## 6. Recommendation

# READY FOR RELEASE 1.2 CERTIFICATION
