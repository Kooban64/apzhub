# APZ Time — Implementation Readiness Reassessment

> **Programme:** APZHUB-TIME-READINESS-001  
> **Product:** APZ Time  
> **Classification:** DOCUMENTATION ONLY — no production code · no package changes · no architecture changes  
> **Authority:** AI-MANIFEST · Definition Pack · certification reports · disk inventory · Operating Model · Reference Implementation  
> **Prior planning:** [APZ-TIME-1.0-READINESS-ASSESSMENT.md](./APZ-TIME-1.0-READINESS-ASSESSMENT.md) (**ACCEPTED**, Not IR)  
> **Related:** [Gaps](./APZ-TIME-IMPLEMENTATION-GAPS.md) · [Phase 1](./APZ-TIME-PHASE-1-RECOMMENDATION.md) · [Risk Review](./APZ-TIME-RISK-REVIEW.md)  
> **Date:** 2026-07-19

---

## Executive verdict

| Question                                                               | Answer                                                                                            |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Can APZ Time be promoted from **Planning** → **Implementation Ready**? | **No**                                                                                            |
| Maturity remains                                                       | **Planning**                                                                                      |
| Stack progress since prior planning assessment                         | **Material** — Kimai foundation, Time Platform Services, Time HTTP now on disk and Owner-accepted |
| Product implementation authorised by this programme?                   | **No**                                                                                            |

**APZ Time is not Implementation Ready.** Critical dependency gaps remain relative to the Projects IR precedent and the product’s own Definition of Ready.

---

## What changed since the 1.0 planning assessment

| Layer                  | Planning assessment (prior) | Repository now                                                                      | Owner status                 |
| ---------------------- | --------------------------- | ----------------------------------------------------------------------------------- | ---------------------------- |
| Kimai Integration      | Absent                      | `@apzhub/integration-kimai` **0.1.0** — CERTIFIED_FOUNDATION (ops/auth/health only) | **ACCEPTED / CLOSED**        |
| Time Platform Services | Absent                      | contracts **0.17.0** · services **0.26.0** — CERTIFIED_WITH_LIMITATIONS             | **ACCEPTED / CLOSED**        |
| Time HTTP API          | Absent                      | OpenAPI **1.10.0** `/api/v1/time/*` — CERTIFIED_WITH_LIMITATIONS                    | **ACCEPTED / CLOSED**        |
| Workbench / module UI  | Absent                      | Still absent                                                                        | Not authorised               |
| Kimai domain CRUD      | N/A                         | Still absent — HTTP domain → **501** on Kimai path                                  | Blocks real product SoR path |

---

## Review summary (repository evidence)

| Artefact                        | Outcome                                                                                                                                      |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Product Definition Pack         | Complete (PRODUCTS-002); maturity still **Planning**; several pack docs were stale vs disk — refreshed by this programme’s companion updates |
| Implementation Readiness (pack) | Remains **Planning** after reassessment                                                                                                      |
| Kimai Integration               | Foundation complete; **not** domain-capable                                                                                                  |
| Time Platform Services          | Canonical services exist; Kimai-limited domain                                                                                               |
| Time HTTP API                   | Canonical external HTTP exists; Kimai domain → 501                                                                                           |
| Engineering Operating Model     | ACTIVE — DoR still requires dependencies available + IR mark + Owner Approval                                                                |
| Product Release Roadmap         | Time posture remains Planning / not scheduled for 1.0 until IR                                                                               |
| Reference Implementation        | Projects IR required domain-capable adapter + HTTP; Workbench deferred — Time fails domain-capable adapter gate                              |
| Known Limitations               | Updated honesty: stack layers exist with certified limitations; product UI absent                                                            |
| Risk Assessment                 | Updated in [APZ-TIME-RISK-REVIEW.md](./APZ-TIME-RISK-REVIEW.md)                                                                              |

---

## Dimension assessment

| Dimension                   | Status                    | Evidence                                                                                                                                |
| --------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Business readiness          | **PASS**                  | Vision / CAPABILITIES pack clear                                                                                                        |
| Architecture readiness      | **PARTIAL**               | Pack architecture correct; delivery architecture incomplete (no module contract; Kimai domain path undefined)                           |
| Integration readiness       | **PARTIAL**               | Kimai **0.1.0** foundation **PASS**; domain CE CRUD **FAIL**                                                                            |
| Platform Services readiness | **PASS (limited)**        | Time services ACCEPTED; domain via Kimai unsupported                                                                                    |
| HTTP readiness              | **PASS (limited)**        | Time HTTP ACCEPTED; Kimai domain → 501                                                                                                  |
| Workbench readiness         | **FAIL**                  | No `modules/time`, `apps/web/lib/time`, or Time Workbench — **not required for IR** per Projects pattern, but product UX remains future |
| Authentication              | **PASS (platform)**       | BetterAuth available; Kimai SSO/provisioning product wiring incomplete                                                                  |
| Authorization               | **PARTIAL**               | `time.*` permissions exist in platform-services catalogue; product module registration / nav gates absent                               |
| Provisioning                | **PARTIAL**               | Platform provisioning **0.1.0** exists; Time product enablement flow not productised                                                    |
| Search                      | **PARTIAL**               | HTTP foundation search composition only; no Platform Search SoR provider for Time                                                       |
| Navigation                  | **FAIL**                  | No Time module Activity Bar / workspace registration                                                                                    |
| Diagnostics                 | **PASS (platform plane)** | HTTP `/time/diagnostics` + service diagnostics                                                                                          |
| Health                      | **PASS (platform plane)** | HTTP `/time/health` + Kimai ops health                                                                                                  |
| Audit                       | **PARTIAL**               | Platform pipeline/audit patterns available; Time product audit surfaces / events not delivered                                          |
| Testing readiness           | **PARTIAL**               | Integration/service/HTTP tests exist for foundation layers; no product Playwright / Workbench cert                                      |
| Certification readiness     | **PARTIAL**               | Layers certified with limitations; no APZ Time product certification                                                                    |
| Operational readiness       | **PARTIAL**               | Ops/health for Kimai foundation; no product ops console / runbooks for APZ Time                                                         |

---

## Implementation Ready gate (Operating Model + PRODUCTS-003 + Reference Implementation)

| Criterion                                                | Status                                                                               |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Definition Pack complete                                 | **PASS**                                                                             |
| Architecture Owner-approved for product delivery         | **PARTIAL** — pack yes; Kimai **domain** approach not delivered                      |
| Dependencies on disk (adapter + service + HTTP)          | **PARTIAL** — present but adapter **not domain-capable** (unlike Plane for Projects) |
| Marked Implementation Ready in pack / portfolio          | **FAIL** — remains Planning                                                          |
| Owner Approval of named product implementation programme | **FAIL** — not given                                                                 |
| CURRENT-MILESTONE authorises product implementation      | **FAIL**                                                                             |

**Projects IR precedent:** Plane **0.6.0** provided working domain APIs consumed by platform services and HTTP. Time’s Kimai **0.1.0** does not. Declaring IR now would contradict repository honesty and the reference pattern.

---

## Conclusion

Promote **stack layers** as complete for their authorised programmes. Do **not** promote the **APZ Time product** to Implementation Ready.

Primary blocker: **Kimai domain expansion** (timesheets/activities/customers/projects/tags against CE APIs) so Platform Services and HTTP can serve a real SoR path without in-memory-only or 501 behaviour.

Secondary blockers for product IR honesty: module manifest + permissions/nav registration; pack/matrix IR declaration; Owner Approval of a named product programme (after IR).

See [APZ-TIME-IMPLEMENTATION-GAPS.md](./APZ-TIME-IMPLEMENTATION-GAPS.md).
