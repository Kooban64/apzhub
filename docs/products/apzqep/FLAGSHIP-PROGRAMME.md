# APZQEP Flagship Programme — path to the Quality Operating System

| Field        | Value                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| Status       | **ACCEPTED — F0–F11 + F3 DEEPEN**; **F12–F16 IMPLEMENTED**; Operating Loop blueprint; Knowledge KNW-H6 parallel   |
| Product role | **APZHUB flagship** — operating platform for engineering quality                                                  |
| Blueprint    | [QUALITY-ECOSYSTEM-MAP.md](./QUALITY-ECOSYSTEM-MAP.md) · [QUALITY-OPERATING-LOOP.md](./QUALITY-OPERATING-LOOP.md) |
| Philosophy   | [PRODUCT-PHILOSOPHY.md](./PRODUCT-PHILOSOPHY.md)                                                                  |
| Method       | One phase at a time · enhance-only · strict TypeScript · proof before next phase                                  |

---

## Destination (100% intent)

APZQEP is finished when an enterprise can run **release-candidate quality** from inside APZHUB without ten dashboards:

```text
Commit / PR (GitHub)
        ↓
   Quality Graph updated
        ↓
Providers contribute evidence
(Playwright · Vitest · Security · A11y · Perf · Reviews · Manual)
        ↓
   Certification Engine
        ↓
Release Candidate Quality Score + explanation
        ↓
Human GO / NO-GO
```

**Done means:** Quality OS behaviour — not “a rich TCMS.” Testing remains one capability inside Verification.

**Non-negotiables**

- APZQEP owns the quality model and SoR; providers are best-of-breed.
- Everything that claims quality becomes **governed evidence**.
- **Quality Graph** connects req → code → verification → evidence → defect → cert → release.
- AI **assists**; humans **certify**; AI never auto-certifies.
- Engine brands masked from standard users.
- Enhance-only: no mass deletion of stubs/packages.

---

## How we got off-focus (and what stays)

| Keep                            | Reframe                                       |
| ------------------------------- | --------------------------------------------- |
| Cap A–F / V1.1 kernel           | Not the product ceiling                       |
| Tranche 2 Q0–Q6 useful spine    | Renamed **Phase F0 — Foundation** (complete)  |
| Playwright live path            | First automation _provider_, not the identity |
| Evidence StoragePort            | Kernel of “everything becomes evidence”       |
| Old “Tranche 4 TCMS++” language | Replaced by Phases **F1–F16** below           |

Knowledge (Memory Companion) stays a **parallel platform product**, not inside F1–F16, unless Owner inserts it between phases.

---

## Programme phases (reframed)

```mermaid
flowchart LR
  F0[F0_Foundation]
  F1[F1_GitHub_Heartbeat]
  F2[F2_Graph_and_Impact]
  F3[F3_Provider_Evidence_Matrix]
  F4[F4_Certification_Engine]
  F5[F5_Release_Candidate_OS]
  F6[F6_Quality_Intelligence]
  F7[F7_Test_Design_Assist]
  F8[F8_Change_Quality_Journey]
  F9[F9_Auto_Verification_Trigger]
  F10[F10_Verification_Dispatch]
  F11[F11_Security_PenTest_Dispatch]
  F12[F12_Professional_Report_Pack]
  F13[F13_Developer_Early_Check]
  F14[F14_PM_Project_Hub]
  F15[F15_QA_Gate_Loop]
  F16[F16_ALM_Fix_Work_Items]
  F0 --> F1 --> F2 --> F3 --> F4 --> F5 --> F6 --> F7 --> F8 --> F9 --> F10 --> F11 --> F12 --> F13 --> F14 --> F15 --> F16
```

**Modes:** **Early Check (F13)** ≠ **QA Gate / Certification (F4–F8, F15)**. Same evidence spine; different personas and outcomes. See [QUALITY-OPERATING-LOOP.md](./QUALITY-OPERATING-LOOP.md).

Each phase has: **intent · scope · done-when · explicit out · proof**.

### F0 — Foundation (COMPLETE)

**Intent:** Native durable quality kernel on Postgres.

| Included                                      | Status |
| --------------------------------------------- | ------ |
| Postgres SoR for Cap A–F + siblings           | Done   |
| Plan → execute → defect → evidence            | Done   |
| Evidence durable storage + automation publish | Done   |
| Playwright live (narrow)                      | Done   |
| Shell honesty (no stub → Requirements lie)    | Done   |

**Out:** GitHub depth, multi-provider matrix, Certification product, QI.

---

### F1 — GitHub Heartbeat _(OPEN)_

**Intent:** Engineering change becomes a first-class quality event — no manual entry for core metadata.

| Work                              | Done when                                       |
| --------------------------------- | ----------------------------------------------- |
| Repo directory (link orgs/repos)  | Operator can catalogue repos in QEP SCM         |
| Credentials from `.secrets/` only | No tokens in git / no browser PAT               |
| Webhook and/or poll ingest        | Commit + PR events durable with correlation IDs |
| Activity in QEP                   | Change visible in SCM surfaces                  |

**Implementation notes (enhance-only):**

- Secrets → `getQepScmRuntime` / handlers (`APZHUB_SCM_GITHUB_TOKEN`)
- Public HMAC ingress: `POST /api/v1/qep/scm/ingress/github`
- Durable SoR: `qep_scm_change_event` + sync/webhook writers
- UI: repository “Durable change heartbeat” panel
- Poll path = Sync heartbeat (on-demand); scheduled poller deferred

**Out:** Full regression packs, Sonar/ZAP, certification scores, AI, Quality Graph edges (F2).

**Proof:** Register repo → Sync or signed webhook → `listChangeEvents` / UI shows SHA/PR/author/files.

---

### F2 — Quality Graph & Impact

**Intent:** Nodes and edges that make impact analysis real.

| Work                | Done when                                                                |
| ------------------- | ------------------------------------------------------------------------ |
| Graph edges         | PR/commit/files link to requirements, verifications, defects where known |
| Impact view         | Opening a change or requirement shows connected quality nodes            |
| Regression proposal | Changed paths → proposed suite/spec pack (human accept)                  |

**Implementation notes (enhance-only):**

- Pure inference: `packages/platform-scm/src/impact/infer-edges.ts` (REQ/DEF text + `path:` suite tags / `customMetadata.pathPrefixes`)
- Projection: `apps/web/lib/qep/scm-impact.ts` — `buildChangeImpact` / `proposeRegressionPack` / `acceptRegressionProposal`
- APIs: `GET …/changes/{id}/impact`, `POST …/regression-proposal`, `POST …/regression-proposal/accept`
- UI: SCM repo change rows — Impact / Propose / Accept pack (draft plan only)
- Optional seed into QO-005 `ImpactCorrelationEngine` when available

**Out:** Auto-execute without accept; full cert score; multi-security providers.

**Proof (local 2026-08-09):** Signed push with `packages/platform-scm/…` + `REQ-F2-GRAPH` → impact risk=medium, suite path match + requirement edges → propose pack → accept → draft `eplan-*` + SCM `execution_plan` link.

---

### F3 — Provider Evidence Matrix

**Intent:** Best-of-breed tools feed the Evidence Engine (provider-neutral).

Order (one provider family at a time — Owner may reorder):

1. **CI / unit** — GitHub Actions + Vitest (or JUnit JSON) result ingestion
2. **Deepen Playwright** — richer live/CI artifact → evidence (already started in F0)
3. **Code quality** — SonarQube or CodeQL summary → evidence
4. **Security** — one of ZAP / Snyk / Trivy / Dependabot
5. **Accessibility** — axe-core
6. **Performance** — k6 or Lighthouse

| Work                                       | Done when                                                  |
| ------------------------------------------ | ---------------------------------------------------------- |
| Provider adapter contract                  | Standard: run → normalize → evidence + graph edge          |
| At least CI + Playwright + one more domain | Evidence appears under RC without leaving QEP              |
| Placeholders retained                      | Unused providers stay honest stubs — enhance, don’t delete |

**Implementation notes (enhance-only, first slice):**

- Active providers: `playwright` + **`vitest`** (CI ingest) + **`accessibility`** (axe summary ingest)
- Normalize helpers in `packages/platform-automation/src/providers/{vitest,accessibility}/`
- Publish bridge tags `domain:ci|automation|a11y` + `change:{changeEventId}`; ingest uses `sourceKind=external_ingestion`
- Graph edge: `linkEvidenceToChange` → SCM `evidence` traceability link (failed runs with artifacts also publish)
- UI: Automation home — changeEventId + Vitest/axe JSON ingest panels
- Placeholders retained: selenium, cypress, appium, rest, k6, visual

**Out:** Replacing those tools; exposing their UIs as the product.

**F3 deepen (local 2026-08-09 — handover matrix):**

- All 11 providers **active** (no placeholders): Playwright live + report ingest for Vitest, accessibility, security, codequality, k6, selenium, cypress, appium, rest, visual
- Cert gates add security + performance + code quality; RC tiles driven by evidence (no hardcoded empties)
- Evidence catalogue postgres IDs use UUIDs (fix restart collision on sequential `ev-N`)
- UI Automation home: ingest panels for security / code quality / performance / Cypress

**Proof (local 2026-08-09 deepen):** Same change → multi-domain ingest → evaluate → **READY 100%** · domains requirements/automation/security/performance/accessibility/coverage/code_quality pass · risk info · certification awaiting human · provider brands masked · 0 placeholders.

---

### F4 — Certification Engine

**Intent:** The unique differentiator — evidence-based readiness, human GO/NO-GO.

| Work                | Done when                                                  |
| ------------------- | ---------------------------------------------------------- |
| Gate model          | Configurable gates (req coverage, automation, security, …) |
| Readiness package   | RC object with gate results + evidence refs                |
| Human certification | Explicit certify / reject with audit                       |
| No auto-certify     | AI/providers cannot flip certification state               |

**Implementation notes (enhance-only):**

- Projection: `apps/web/lib/qep/certification-runtime.ts` over orchestration QO-007/008
- Gates: `gate_f4_automation`, `gate_f4_ci`, `gate_f4_a11y_or_regression` (a11y **or** F2 regression plan)
- Template: `release_candidate` composition `all`; score = satisfied/total; readiness READY|BLOCKED (**advisory**)
- Human GO/NO-GO via ApprovalEngine (`quality_certifier` / `tpl_f4_change_rc`); immutable once recorded; system/QI actors rejected
- APIs: `POST /api/v1/qep/certification/evaluations`, `GET …/{id}`, `POST …/{id}/decision`, `GET …/by-change/{changeEventId}`
- UI: `/workspace/qep/certification` (+ Certify link from SCM changes)
- Permissions: `qep.certification.read` / `qep.certification.decide`

**Out:** Full QI narratives; every provider in the world. F5 RC OS polish face.

**Proof (local 2026-08-09):** F3 change → evaluate READY 100% (automation+ci+a11y) → human GO with rationale → re-decision 409 immutable.

---

### F5 — Release Candidate Quality OS (flagship face)

**Intent:** The single screen that proves the vision.

```text
Release Candidate x.y.z
Requirements ✓  Automation ✓  Security ✓  Performance ✓
Accessibility ✓  Coverage ✓  Risk  Certification READY|BLOCKED
```

| Work             | Done when                                                  |
| ---------------- | ---------------------------------------------------------- |
| RC workbench     | One composition: score + domains + drill to evidence       |
| Explain-why      | Every number links to evidence / graph nodes               |
| Masked providers | User sees domains, not tool logos (admin may see adapters) |

**Implementation notes (enhance-only):**

- Face over F4 evaluation: `domains[]` + `title` + `impactSummary` in `certification-runtime.ts`
- UI: `/workspace/qep/rc` (alias) and `/workspace/qep/certification` — domain strip, explain-why, evidence drill, human GO/NO-GO
- Nav: M13 `qep-certification` module **active** as “Release Candidate”; SCM “Open RC”
- Security / Performance / Code quality tiles are evidence-driven after F3 deepen (no hardcoded empties)

**Proof (local 2026-08-09):** Evaluate F3 change → `Release Candidate f2b1786` READY 100% · full domain strip after deepen (see F3 deepen proof).

---

### F6 — Quality Intelligence (advisory)

**Intent:** Engineering intelligence — not chatbot theatre.

| Work                                     | Done when                    |
| ---------------------------------------- | ---------------------------- |
| Gap / risk / regression / blocker advice | Grounded in graph + evidence |
| Failure explanation                      | Links to artifacts           |
| Never mutates SoR/cert without human     | Policy tests prove it        |

**Out:** Autonomous agents; silent certification.

**Implementation notes (enhance-only):**

- Projector: `apps/web/lib/qep/qi-change-advice.ts` (`composeChangeAdvice` / `adviseChange`) over F2 impact + F3 evidence + F4/F5 cert
- API: `GET /api/v1/qep/quality-intelligence/by-change/[changeEventId]` — read-only
- UI: QI home “Advise this change”; RC link via `QEP_QI_ROUTES.byChange`
- Policy: source must not call cert mutation APIs; `qi:` actors rejected from human GO/NO-GO
- `dummy_ai` / demo observation seed demoted — not the F6 path

**Proof (local 2026-08-09):** Advise F3/F5 change `…f2b1786…` → advisory bundle (honest security/performance gaps + artifact refs) · cert evaluations byte-equal before/after · human GO on prior evaluation unchanged · unit policy tests pass.

---

### F7 — Test Design Assist

**Intent:** Close the blank-page problem for QA — advise **what** to design from change impact + domain gaps; humans accept into native Spec SoR. Best-of-breed tools remain the verification engines (F3); APZQEP stays sovereign for design governance and GO/NO-GO.

| Work                   | Done when                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------- |
| Rule-based design pack | From F2 impact + F6-style domain gaps → advisory draft specs                        |
| Human accept           | Creates **draft** specs + optional suite/trace links; never auto-run / auto-certify |
| QI bridge              | Deep-link “Propose test design” from change advice                                  |
| Tooling stance         | Tools prove domains; RC still refuses READY without evidence                        |

**Out:** LLM free-text case chat; auto-execute; auto GO/NO-GO; Tuskr/Kiwi as SoR; replacing F2 suite→execution-plan accept.

**Implementation notes (enhance-only):**

- Propose: `apps/web/lib/qep/test-design-assist.ts` (`composeTestDesignPack` / `proposeTestDesignPack`)
- API: `GET|POST …/scm/changes/[changeEventId]/design-proposal` + `…/accept`
- Accept → `gateway.qep.specifications.create` (draft) + optional `requirement_specified_by` (`origin: ai_suggestion`) + suite relationship; metadata `sourceChangeEventId`
- UI: SCM repository “Propose design” / review / Accept; QI deep-link via `QEP_SCM_ROUTES.designAssist`
- Policy: must not call certification mutation APIs

**Proof (local 2026-08-09):** Unit compose (REQ + domain gaps) · API propose → accept on `…f2b1786…` → draft `F7-…` / `tsp_…` with `sourceChangeEventId` · cert still needs tool evidence for READY (see `engineering/evidence/F7-TEST-DESIGN-ASSIST.md`).

---

### F8 — Change Quality Journey (adoption face)

**Intent:** One guided path so teams adapt to the Quality OS without bouncing across five apps.

```text
Impact → Propose design → Evidence domains → RC evaluate → Human GO/NO-GO
```

| Work              | Done when                                            |
| ----------------- | ---------------------------------------------------- |
| Journey projector | Read-only compose over F2/F3/F4/F5/F7 for one change |
| GET API           | `…/quality-journey/by-change/{id}` — never mutates   |
| UI workbench      | Stepper + deep links into existing mutation surfaces |
| Nav               | Active “Quality Journey” under QEP workspace         |

**Out:** New SoR tables; auto-evaluate; auto GO/NO-GO; replacing F5 RC or F7 design accept; quality-flow engine rewrite.

**Implementation notes (enhance-only):**

- Projector: `apps/web/lib/qep/change-quality-journey.ts`
- API: `GET /api/v1/qep/quality-journey/by-change/[changeEventId]`
- UI: `/workspace/qep/quality-journey` · module `qep-quality-journey`
- Deep-links from SCM / QI / RC
- Policy: source must not call cert decision or design/regression accept

**Proof (local 2026-08-09):** Unit compose (5 steps + policy) · API journey on `…f2b1786…` (READY 100% + human GO, 6 evidence domains) · UI `/workspace/qep/quality-journey` · see `engineering/evidence/F8-CHANGE-QUALITY-JOURNEY.md`.

---

### F9 — Auto verification on durable change

**Intent:** Non-technical QA should not manually spin tools after every push. When a GitHub change becomes durable, APZQEP **starts default verification** and links evidence to the change. Humans still certify.

| Work               | Done when                                                                           |
| ------------------ | ----------------------------------------------------------------------------------- |
| Post-persist hook  | After `upsertChangeEvents` (webhook + sync)                                         |
| Opt-in trigger     | `APZHUB_AUTOMATION_ON_CHANGE=true` → Playwright smoke with `changeEventId` metadata |
| Evidence link      | Existing F3 `onEvidencePublished` path                                              |
| Never auto-certify | No evaluate / GO / design accept from this path                                     |

**Out:** Spinning every scanner in-process; inventing CI report bodies; auto GO/NO-GO; forcing live Chromium without `APZHUB_AUTOMATION_LIVE`.

**Honest split:** Playwright can auto-run (dry-run by default; live when LIVE flag on). Vitest/security/a11y/perf/… still **CI posts ingest** — F9 does not fabricate those reports.

**Implementation notes:**

- Hook: `onChangeEventsPersisted` on `ScmEngine` → `triggerAutomationForPersistedChanges`
- Module: `apps/web/lib/qep/automation-on-change.ts`
- Dedupe: skip if execution already has `assistOrigin=f9_on_change` for that change
- Soft-fail: never break webhook 202

**Proof (local 2026-08-09):** Unit select/dedupe/policy · webhook → Playwright `f9_on_change` completed with `changeEventId` · see `engineering/evidence/F9-AUTO-VERIFICATION-ON-CHANGE.md`.

---

### F10 — Verification dispatch (Option B)

**Intent:** Best coverage without running every engine inside APZQEP. On durable change, **dispatch** GitHub Actions / webhook jobs for Vitest, a11y, security, code quality, k6, …. Runners execute elsewhere and **POST reports** to automation ingest. Humans still GO/NO-GO.

| Work               | Done when                                                      |
| ------------------ | -------------------------------------------------------------- |
| Opt-in dispatch    | `APZHUB_VERIFICATION_DISPATCH=true` after change persist       |
| Channels           | GitHub `workflow_dispatch` and/or generic webhook              |
| Ledger             | Lightweight dispatch records + `GET …/verification-dispatches` |
| Journey UI         | Shows dispatch status for the change                           |
| Never auto-certify | Policy tests                                                   |

**Out of F10:** Greenbone / Faraday / Kali / full pen-test suites — **same pattern later** (dispatch → external run → ingest SARIF/findings). No in-process Vitest/ZAP on the portal host.

**Config:** `APZHUB_VERIFICATION_DISPATCH_*` (owner/repo/workflow/domains/webhook); `MODE=record_only` for local proof without Actions write.

**Proof (local 2026-08-09):** Unit record_only ledger · webhook → dispatch row for vitest/a11y/security/codequality/k6 · see `engineering/evidence/F10-VERIFICATION-DISPATCH.md`.

---

### F11 — Security / pen-test dispatch

**Intent:** Pen-test capability in QEP’s **security domain** via best-of-breed OSS engines — same F10 pattern — **not** “Kali inside APZQEP.”

Order: CI security (Trivy/Semgrep) → Nuclei/ZAP DAST → optional Greenbone VA → Faraday later → Kali as runner image only.

| Work                   | Done when                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| Security pack dispatch | `APZHUB_SECURITY_DISPATCH` → domains `trivy,semgrep,nuclei,zap` (+ optional `greenbone`) |
| Coexists with F10      | Per-pack dedupe; quality + security rows on same change                                  |
| Dual Docker clusters   | Testing vs pen-test inventories under `infrastructure/docker/clusters/`                  |
| Never auto-certify     | Policy tests                                                                             |

**Out:** Faraday product integration; live Greenbone compose bring-up; Kali UI module; scanners in the Next.js process.

**Proof:** Unit co-existence with F10 · record_only security ledger · cluster docs present.

---

### F12 — Professional Quality/Security Report Pack

**Intent:** Produce audit/pentest-style **professional documents** (PDF) from governed evidence linked to a change / certification context. Closes the enterprise gap after scanners run: a draft **Security Bill of Health** humans can review, residual-risk, and sign. **Never auto-certify.**

| Work             | Done when                                                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| ReportPack model | `changeEventId` → tools (trivy/semgrep/nuclei/zap/greenbone) + severity rollup + evidence/execution summaries                |
| Export           | JSON + markdown proof; Typst template → PDF when binary available                                                            |
| Human fields     | Residual-risk placeholder + unsigned sign-off by default; **publish** records signed residual-risk + decision (not GO/NO-GO) |
| API              | `GET` draft/export · `POST` publish `/api/v1/qep/report-packs/by-change/{changeEventId}`                                     |
| Journey          | Draft + publish form; **Run quality + security packs** self-serve force dispatch                                             |

**Out:** Auto GO/NO-GO from findings; auto-publish; Faraday product; Kali UI module; Metabase/Grafana chrome; treating draft/published PDF as certification.

**Live GHA:** `.github/workflows/verify.yml` + `security.yml` stubs — unset `APZHUB_*_DISPATCH_MODE=record_only` and use PAT `actions:write`. See `engineering/evidence/F12-PUBLISH-AND-RUN-PACKS.md`.

**Implementation notes:**

- Library: `apps/web/lib/qep/report-pack.ts` (injectable deps for tests)
- Publish registry: `apps/web/lib/qep/report-pack-publish.ts`
- Run packs: `apps/web/lib/qep/run-verification-packs.ts`
- Template: `apps/web/lib/qep/report-templates/security-bill-of-health.typ`
- Typst: `APZHUB_TYPST_BIN` or `tooling/bin/typst` — PDF stubbed with TODO if missing
- Maps to RPT-009

**Proof:** see `engineering/evidence/F12-REPORT-PACK.md` + `F12-PUBLISH-AND-RUN-PACKS.md`.

---

### F13 — Developer Early Check + AI Fix Pack

**Intent:** First-class **Developer Early Check** — spot quality + security (+ Playwright when enabled) for a change, then export a structured **AI Fix Pack** for Cursor / other AI tools. Cheap and frequent. **Never certification.**

| Work                | Done when                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------- |
| Early Check surface | `/workspace/qep/early-check` — Run Early Check → force F10+F11 (+ F9 Playwright when on) |
| AI Fix Pack         | `GET /api/v1/qep/ai-fix-packs/by-change/{id}` → JSON + Cursor-ready markdown             |
| Policy              | `advisory: true`, `autoCertified: false`; no cert mutation                               |
| Operating Loop      | [QUALITY-OPERATING-LOOP.md](./QUALITY-OPERATING-LOOP.md)                                 |

**Out:** Portfolio UI (F14); Plane/Zammad tickets (F16); treating Early Check as RC GO; Kiwi/Tuskr.

**Proof:** `engineering/evidence/F13-DEVELOPER-EARLY-CHECK.md` — **LOCAL IMPLEMENTED** 2026-08-10.

---

### F14 — PM Project Quality Hub

**Intent:** Activate Portfolio — PM registers quality project, attaches GitHub repo(s), sees project QEP insight. PAT remains server-side (health indicator only).

| Work            | Done when                                                                        |
| --------------- | -------------------------------------------------------------------------------- |
| Quality project | Create/list in-memory project with `repositoryIds[]`                             |
| Attach repos    | Link existing SCM `repositoryId`s (validate tenant)                              |
| Token health    | configured/missing from server secrets — never browser PAT                       |
| Insight         | Changes, dispatches, soft defect counts, latest cert + Early Check/Journey links |
| Module          | `qep-portfolio` active · `/workspace/qep/portfolio`                              |

**Out:** Browser PAT; Plane project SoR sync; Postgres durability (later harden).

**Proof:** `engineering/evidence/F14-PM-PROJECT-QUALITY-HUB.md` — **LOCAL IMPLEMENTED** 2026-08-10.

---

### F15 — QA Gate Loop

**Intent:** Package Specs/Journey/Cert into an explicit **QA Gate**: required packs (including **pen-test / security**) → evaluate → human confirm findings → Fix Direction Pack for Dev. Separate human GO/NO-GO on RC.

| Work               | Done when                                                                  |
| ------------------ | -------------------------------------------------------------------------- |
| Checklist          | Journey QA Gate panel with run/confirm/fix/RC steps                        |
| Pen-test for QA    | `POST …/qa-gate/…/run-packs` defaults `includePenTest: true` (F11 domains) |
| Confirm            | Human confirm finding ids; optional QEP defect create                      |
| Fix Direction Pack | JSON + markdown (confirmed findings preferred)                             |
| Never auto-certify | Policy tests; RC remains GO/NO-GO surface                                  |

**Out:** Kiwi/Tuskr; auto GO; LLM writing production specs without accept; Plane tickets (F16).

**Proof:** `engineering/evidence/F15-QA-GATE-LOOP.md` — **LOCAL IMPLEMENTED** 2026-08-10.

---

### F16 — Fix work items via APZ Projects / Support

**Intent:** From confirmed QEP defects, create Plane tasks (APZ Projects) and/or Zammad tickets (APZ Support) through **Platform Services** only; store external refs on the defect. Soft-fail; default `record_only`.

| Work           | Done when                                                              |
| -------------- | ---------------------------------------------------------------------- |
| Produce bridge | `produceAlmWorkItemsFromDefect` → TaskService / SupportService         |
| Modes          | `APZHUB_ALM_PRODUCE_MODE=record_only\|live`                            |
| APIs           | `POST …/defects/{id}/alm-produce` · batch from QA Gate                 |
| Journey        | **Produce fix work items (F16)**                                       |
| Soft-fail      | Live connector errors → ledger `failed`; never blocks defect lifecycle |

**Out:** QEP duplicating project/ticket SoR; Kimai; auto GO; treating produce as certification.

**Proof:** `engineering/evidence/F16-ALM-PRODUCE.md` — **LOCAL IMPLEMENTED** 2026-08-10.

**Hardening (same day):** file-backed ledgers + sidebar/cross-link UI — `engineering/evidence/HARDENING-F13-F16-LEDGERS-UI.md`.

---

## Parallel track (not inside F1–F16)

| Track                                       | When                                                                                                                |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Knowledge** Memory Companion harden       | **KNW-H6 LOCAL PROOF** 2026-08-09 — steward grants, Wave A nav, live memory, find; consumer overlays still deferred |
| **Platform** Search/Notify/Meili hardening  | As needed for QEP discoverability                                                                                   |
| **Other APZHUB engines** (Plane, Zammad, …) | Only as _optional_ quality-linked systems of record later — not required for flagship Quality OS                    |

---

## Definition of “APZQEP 100%”

Owner may declare flagship **COMPLETE** when **F0–F5** are accepted (F6 may ship as “COMPLETE WITH INTELLIGENCE” separately):

1. GitHub heartbeat live
2. Quality Graph + impact → regression
3. Multi-domain provider evidence (automation + ≥2 other domains)
4. Certification Engine with human GO/NO-GO
5. RC Quality OS face with explain-why
6. Docs + inventory + proof packs updated

F6 Intelligence is the excellence layer on top — highly desired, not a blocker for “orchestrator of quality” claim if F5 is true.

---

## Operating rules (how I will guide you)

1. **One phase open at a time** — finish proof → update inventory → stop → you open next.
2. **Map before code** inside a phase — short inventory of files/contracts, then implement.
3. **Friction question** at phase start: _what enterprise pain does this phase remove?_
4. **No scope smuggling** — new providers wait their turn in F3.
5. **Honesty over theatre** — unavailable modules stay unavailable (Q6 pattern).
6. **Secrets** only in `.secrets/`.
7. **Commits** only when you ask.

---

## Immediate recommendation

| Step | Action                                                                                            |
| ---- | ------------------------------------------------------------------------------------------------- |
| 1    | Prove **F16** — confirm QA findings with defects, **Produce fix work items** (record_only ledger) |
| 2    | For live Plane/Zammad: set `APZHUB_ALM_PRODUCE_MODE=live` + project/group/requester ids           |
| 3    | Operating Loop F13–F16 closed for this programme arc — open new sprint guide for hardenings       |
| 4    | Never treat ALM produce or Early Check as GO/NO-GO                                                |

Flagship F12–F16 operating loop is **implemented**; further work needs Owner-scoped sprint (Postgres durability, inbound status sync, etc.).
