# SPR-APZQEP-200 — Competitive full swing (Release Control · Providers · Governed Assist · GA)

> **Status:** **AUTHORISED · IN PROGRESS** — 2026-08-14 (Owner)  
> **Depends on:** APZQEP V1.1 **PRODUCTION READY · CLOSED**; APZPEN CE **COMPLETE** (SPR-APZPEN-014)  
> **Pillar:** [APZQEP Enterprise Quality Engineering Platform](../strategy/APZQEP-ENTERPRISE-QUALITY-ENGINEERING-PLATFORM.md)  
> **Product status:** [PRODUCT-STATUS](../products/apzqep/PRODUCT-STATUS.md) — V1.1 frozen; this programme is **V1.2 / Wave-6-class**  
> **Does not reopen:** QO kernels, Cap A–F certifications, or V1.1 SoR redesign  
> **Active sprint:** [SPR-APZQEP-201](./SPR-APZQEP-201-release-control-centre.md)

## Product promise (Owner comfort)

APZQEP is not “another test management tool.” It is the **Quality Engineering operating system** that makes release confidence **reliable, simplified, and heavily automated** — with the governance bells and whistles enterprises actually need.

| Promise              | What we ship                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Reliable**         | Evidence-first gates, immutable human certify, audit trail, APZHUB IAM — not spreadsheet theatre                                |
| **Simplified**       | One question surface: _Can we release?_ — Home / Release Control / Certification, not 12 disconnected tools                     |
| **Automated**        | Continuous quality orchestration, provider ingest (Playwright · CI · SCM), packs, waiting work — humans decide; machines gather |
| **Bells & whistles** | Quality Graph, explain-why domains, APZPEN security into gates, governed AI assist (never auto-certifies), self-hosted SaaS     |
| **Hard to catch**    | Competitors sell TCMS + CI plugs; we own the **release decision system** on an integrated platform spine                        |

V1.1 already froze the orchestration kernel. This programme **productises** that advantage into a market-facing experience buyers feel in the first five minutes.

## Portfolio shift

| Track      | Posture                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------- |
| **APZPEN** | CE complete; [enterprise later options](../strategy/APZPEN-ENTERPRISE-LATER-OPTIONS.md) **parked** |
| **APZQEP** | **Active full swing** — make release confidence hard to compete with                               |

## Competitive thesis (locked)

APZQEP must **not** win as “another TestRail.” It wins as the system that answers:

> **Can we release with confidence?**

Differentiators competitors struggle to combine:

1. **Evidence-first certification** — attributable evidence → human YES / NO / CONDITIONAL (AI never certifies).
2. **Quality Graph + Continuous Orchestration** — requirement ↔ change ↔ test ↔ evidence ↔ defect ↔ release (V1.1 kernel already exists).
3. **APZHUB spine** — same IAM, audit, workbench, Projects/Support/Time adjacency.
4. **Governed AI / MCP** — assist with audit; never auto-certify.
5. **Self-hosted, provider-neutral quality OS** + **APZPEN security evidence** into release gates.

## Problem to solve now

V1.1 architecture is mature; buyers still feel:

- Stub surfaces (Home, Release Readiness, Search, Integrations, AI Workspace).
- Thin day-to-day provider intimacy (Playwright/CI/SCM as first-class quality objects).
- External AI not authorised for demos.
- GA/trust narrative gaps (Evidence durable storage, catalogue LA vs PRODUCTION READY).

## Programme shape (four shippable sprints)

Execute in order unless Owner reorders. Each sprint needs its own detailed execution guide before code.

### SPR-APZQEP-201 — Release Control Centre & surface completion — **IN PROGRESS**

**Outcome:** Operator can answer “Can we release?” in one place.

| Ship                    | Notes                                              |
| ----------------------- | -------------------------------------------------- |
| Home Command Centre     | Un-stub `qep-home`; posture, open gates, blockers  |
| Release Readiness       | Un-stub release-readiness over orchestration gates |
| Certification RC UX     | Productise existing certification/RC APIs          |
| APZPEN security domains | Show security evidence / position on gate views    |
| Kill stub gap           | Home + Release Readiness no longer `status: stub`  |

### SPR-APZQEP-202 — Provider wave (Playwright · CI · SCM intimacy)

**Outcome:** Real engineering tools flow evidence into APZQEP without leaving the workbench.

| Ship                       | Notes                                                         |
| -------------------------- | ------------------------------------------------------------- |
| Playwright production path | Ingest + explore on live runners (`apzqep-testing`)           |
| Primary SCM quality object | GitHub PR (or GitLab MR) as quality object + CI result ingest |
| Result adapters            | ≥2 of JUnit / Allure / axe (a11y)                             |
| Integration Centre MVP     | Un-stub integrations enough to configure providers            |

### SPR-APZQEP-203 — Governed Quality Assist (Owner-gated AI)

**Outcome:** Assistants that accelerate QE without ever certifying.

| Ship                | Notes                                                       |
| ------------------- | ----------------------------------------------------------- |
| Owner authorisation | Explicit allow for bounded external and/or local AI         |
| Assist modes        | Coverage gaps, suite recommend, failure explain, test draft |
| AI Workspace        | Un-stub enough for audited assist sessions                  |
| Hard rule           | **AI never certifies**; all suggestions human-approved      |

### SPR-APZQEP-204 — Enterprise GA hardening

**Outcome:** Trust story matches PRODUCTION READY posture.

| Ship                     | Notes                                                        |
| ------------------------ | ------------------------------------------------------------ |
| Evidence durable storage | Close ADR-0088 / LA → GA for Evidence                        |
| Search                   | QEP entity search across requirements/tests/evidence/defects |
| OpenAPI + project ACL    | Completeness + deferred 1.2 membership ACL                   |
| Catalogue truth          | Align PRODUCT-CATALOGUE LA flags with GA                     |
| Dogfood                  | Close ADOPT-001 friction items that block internal use       |

## Minimum viable competitive bar

If capacity forces a cut:

1. **Must ship:** 201 + 202
2. **Differentiation:** 203 when demos need AI parity
3. **Regulated / enterprise sales:** 204 before large deals

## Non-goals

- Redesigning V1.1 orchestration SoR
- Becoming a Jira plugin
- Device cloud / commercial browser farm
- Auto-certification by AI
- Parallel APZPEN enterprise mega-build (see parked options)

## Definition of programme success

- A prospect can complete a guided demo: change → verification → evidence → gate → **human certify** without leaving APZQEP.
- Playwright + SCM evidence appear in Release Control without spreadsheet glue.
- Stub modules that block “release confidence” are gone.
- Catalogue and Evidence posture are honest GA.
- Competitors look like TCMS + CI bolt-ons; APZQEP looks like the **release decision system**.

## Authorisation

**Owner authorised 2026-08-14.** Implementation proceeds under SPR-APZQEP-201 first; 202–204 require their own guides before code.

---

## Immediate next steps (active)

1. ~~Author detailed SPR-APZQEP-201~~ — see [SPR-APZQEP-201](./SPR-APZQEP-201-release-control-centre.md).
2. ~~Inventory stub modules vs live APIs~~ — Home/Release Readiness compose Quality Flows + Certification.
3. Ship Home + Release Readiness surfaces; then APZPEN domains on gate views; then 202.
