# APZHUB Product Engineering — Reference Implementation

> **Type:** Product Transition Report · Reference Implementation Guide  
> **Source programme:** [APZHUB-PROJECTS-001](../foundation/completion-reports/APZHUB-PROJECTS-001-programme-acceptance-report.md) — **ACCEPTED / CLOSED** (2026-07-19)  
> **Product:** APZ Projects — maturity **Production** · current release **1.1.0** (**ACCEPTED / CLOSED**)  
> **Authority:** Repository evidence only · Knowledge Foundation · Product Portfolio  
> **Audience:** Owners, architects, AI agents, product engineers  
> **Status:** Active reference (updated for Product Release pattern after 1.1.0)  
> **Rule:** Does not authorise or recommend another product programme or release.

---

## Purpose

This document captures lessons from the **first** Owner-accepted Product Engineering implementation and defines the **reusable pattern** for every future APZHUB product programme.

It complements — does not replace — the Product Engineering Framework ([PRODUCTS-000](./README.md)), Product Portfolio ([PRODUCTS-001](./APZHUB-PRODUCT-PORTFOLIO.md)), Definition Packs ([PRODUCTS-002](./APZHUB-PRODUCT-PORTFOLIO-READINESS-SUMMARY.md)), and readiness advancement ([PRODUCTS-003](./APZHUB-PRODUCT-READINESS-ADVANCEMENT.md)).

---

## 1. Lessons learned

### What worked

| Lesson                                                  | Evidence                                                                                                                   |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Manifest-first, pack-first, then code**               | PRODUCTS-000→003 completed before PROJECTS-001; `module.yaml` existed before UI                                            |
| **Reuse certified stack; productise the Workbench**     | Plane adapter **0.6.0** + `/api/v1/projects*` + `/api/v1/tasks*` already certified; programme built UI only                |
| **Mirror a proven product vertical**                    | Support Workbench pattern (`lib/*` client + `components/*` router + boundary tests + Playwright cert) accelerated delivery |
| **Strict UI boundary tests prevent architecture drift** | `projects-architecture-boundary.test.ts` forbids adapter/SDK/gateway imports                                               |
| **Deep links need shell cooperation**                   | Nested `/workspace/projects/...` routes required Workbench active-view sync to allow path prefixes                         |
| **Honesty about limitations preserves trust**           | Sprint HTTP gap and roadmap/due-date semantics documented; Production declared **with limitations**                        |
| **Owner gates keep Phase 3 orderly**                    | IR advancement ≠ implementation; Approval ≠ Acceptance; each step explicit                                                 |

### What to avoid

| Anti-pattern                                              | Why                                                               |
| --------------------------------------------------------- | ----------------------------------------------------------------- |
| Inventing engine capabilities mid-programme               | Violates Wave 1 freeze; requires ADR + Owner STOP                 |
| Calling connectors or `@apzhub/platform-services` from UI | Architectural defect (003 / 008 / 009)                            |
| Redesigning platform packages “to unblock UI”             | Product extends platform; does not reopen Foundation              |
| Skipping Definition Pack / IR gate                        | PRODUCTS-002 rule: no implementation without pack + IR + Approval |
| Hiding limitations at Production                          | Same honesty rule as Support/Documents/Workflow PRWL slices       |
| Running unbounded Playwright suites as “product cert”     | Scope cert to named product specs; keep filters tight             |

---

## 2. Platform capabilities successfully reused

APZHUB-PROJECTS-001 consumed existing platform surfaces — **no redesign**:

| Capability                      | How reused                                                                                      |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| **API Gateway / Platform HTTP** | `/api/v1/projects*`, `/api/v1/tasks*`, `/api/v1/workspaces`, `/api/v1/health`                   |
| **Platform Services**           | `project-service` / task path via gateway (handlers already present)                            |
| **Certified Plane adapter**     | `@apzhub/integration-plane` **0.6.0** — unchanged                                               |
| **Integration SDK**             | **1.0.0** frozen — unchanged                                                                    |
| **Workbench Framework**         | Activity Bar / Sidebar from module manifest; shell router wiring                                |
| **IAM / AuthN / AuthZ**         | BetterAuth session + `withPlatformApiAuth` operations                                           |
| **Platform Search**             | `/api/v1/search/*` with product filter `projects`; `@apzhub/search-projects` publication stack  |
| **Governance / Provisioning**   | Module enablement (`status: enabled`); existing `platform-governance` / `platform-provisioning` |
| **Events / Outbox / Event Bus** | Mutations via Platform Services retain existing `projects.*` event publication path             |
| **Design System**               | `@apzhub/ui` + semantic tokens + Lucide icons                                                   |
| **Quality baseline**            | QA-002 **PRODUCTION READY** inherited                                                           |

---

## 3. Architecture validation

| Rule                                             | Validated how                                                           |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| Module → Platform Service → Connector → Engine   | UI → `/api/v1/*` → handlers → gateway → providers → adapter             |
| No Module → Connector bypass                     | Boundary Vitest + code review of `lib/projects` / `components/projects` |
| No platform redesign                             | Diff confined to web Workbench, module manifest enablement, docs        |
| Frozen SDK / adapter held                        | Versions unchanged; no `integrations/plane` programme edits             |
| Engine branding masked                           | UI certification asserts no engine name strings                         |
| Request path Auth → Authz → Validation → Service | Existing Platform API pipeline reused                                   |
| Deep-link workspace navigation                   | Shell allows pathname under active view route prefix                    |

**Request path (reference):**

```text
Workbench UI (apps/web/components/{product})
  → /api/v1/{resource}*
  → Auth → Authz → Validation
  → PlatformServiceGateway
  → Service Connector (Adapter)   # when OSS-backed
  → Backend Engine                # when OSS-backed
```

---

## 4. Governance validation

| Gate                                            | Outcome on PROJECTS-001                             |
| ----------------------------------------------- | --------------------------------------------------- |
| Phase 3 commencement in force                   | Yes                                                 |
| Product Definition Pack complete (PRODUCTS-002) | Yes — Owner ACCEPTED                                |
| Implementation Ready (PRODUCTS-003)             | Yes — APZ Projects only                             |
| Explicit Owner Approval of named programme      | Yes — APZHUB-PROJECTS-001                           |
| Sprint Guide before implementation              | Yes                                                 |
| Quality gates before Completion Report          | Typecheck · lint · unit · Playwright · audit · docs |
| Programme Acceptance Report                     | Yes                                                 |
| Owner Acceptance → CLOSED                       | Yes — 2026-07-19                                    |
| KF status docs updated                          | Yes                                                 |

**Governance rule restated:** Implementation Ready ≠ authorised. Owner Approval of a **named** programme is mandatory. Acceptance closes the programme; further scope needs a new Approval.

---

## 5. Product Engineering process validation

The end-to-end process proved viable:

```text
PRODUCTS-000  Framework
     ↓
PRODUCTS-001  Portfolio (WHAT exists)
     ↓
PRODUCTS-002  Definition Packs (HOW engineered)
     ↓
PRODUCTS-003  Advance ONE product → Implementation Ready
     ↓
Owner Approval of named programme (e.g. APZHUB-PROJECTS-001)
     ↓
Sprint Guide → Implementation → Tests → Certification
     ↓
Completion Report → Acceptance Report
     ↓
Owner Acceptance → CLOSED → maturity update (e.g. Production)
     ↓
Transition / Reference Implementation (this document)
```

| Process step                       | Validated                                 |
| ---------------------------------- | ----------------------------------------- |
| Docs-only programmes before code   | Yes                                       |
| Single-product IR advancement      | Yes                                       |
| Scope freeze (in/out of scope)     | Yes — no Kimai/Analytics/SDK/adapter work |
| Support-pattern Workbench delivery | Yes                                       |
| Certification standard gates       | Yes                                       |
| Post-acceptance maturity + KF sync | Yes (this closure)                        |

---

## 6. Recommendations for improving future product programmes

These are **process improvements**, not authorisations of work:

1. **Register Workbench view descriptors for primary nested routes** (list/detail) where practical, to reduce reliance on shell prefix fallbacks.
2. **Expose Wave 1 service methods as HTTP before UI stories that need them** (e.g. sprint list/CRUD) — still without adapter changes — or consciously document task-derived UX.
3. **Keep Playwright product filters as file-name prefixes** (`apzhub-{product}-*`) and never pipe through buffering that hides failures.
4. **Clone the Support/Projects client layout verbatim** for the next OSS-backed Workbench product: `lib/{product}/{routes,*-api,errors,permissions,query-keys}` + `components/{product}/*` + boundary test + cert helpers.
5. **Treat Production-with-limitations as first-class** — update KNOWN-LIMITATIONS and readiness OPERATIONAL=PARTIAL when connector deployment is external.
6. **Do not open multiple products to IR or implementation in one programme** — PRODUCTS-003 single-product rule scales.
7. **Reference this document in AI-MANIFEST bootstrap** before any future product Recommendation.

---

## 7. Reusable implementation pattern

### 7.1 Preconditions (all required)

1. Product Definition Pack complete and Owner-accepted (PRODUCTS-002 pattern)
2. Product marked **Implementation Ready** (or Owner-explicit exception)
3. Dependencies on disk (adapter/service/HTTP as applicable)
4. **Owner Approval** of a named programme ID
5. Sprint Guide filed under `docs/sprint/`

### 7.2 Directory pattern (OSS-backed Workbench product)

```text
services/{domain}/manifests/{module}/module.yaml   # status: enabled; nav; permissions
apps/web/lib/{product}/
  routes.ts · {product}-api.ts · errors.ts · permissions.ts
  types.ts · format.ts · query-keys.ts · *.test.ts
apps/web/components/{product}/
  {product}-workspace-router.tsx
  {product}-ui.tsx
  *-view.tsx · *-architecture-boundary.test.ts · *.test.tsx
apps/web/components/workbench-page.tsx             # wire is{Product}Route + Router
testing/playwright/e2e/
  {product}-ui-cert-helpers.ts
  apzhub-{product}-*-workbench.spec.ts
  apzhub-{product}-*-ui-certification.spec.ts
docs/sprint/{PROGRAMME}-sprint-guide.md
docs/sprint/{PROGRAMME}-completion-report.md
docs/foundation/completion-reports/{PROGRAMME}-programme-acceptance-report.md
docs/products/{product}/                           # pack updates + KNOWN-LIMITATIONS
```

### 7.3 Client rules (non-negotiable)

- Fetch **only** `/api/v1/...` (or approved platform API prefix)
- Never import `@apzhub/integration-*`, `@apzhub/platform-services`, or gateway helpers from UI
- Sanitize errors — never leak engine/provider names
- Permission helpers are UI-only; server remains authoritative
- Engine branding hidden

### 7.4 Test minimums

| Layer         | Minimum                                                                     |
| ------------- | --------------------------------------------------------------------------- |
| Unit          | Routes resolution + architecture boundary scan                              |
| Component     | Router/view smoke with mocked API                                           |
| E2E / UI cert | Sign-in · mock Platform API · list/detail/search/health · no engine strings |
| Repo gates    | typecheck · lint · targeted tests · audit when defined                      |

### 7.5 Closure checklist

- [ ] Completion Report
- [ ] Programme Acceptance Report
- [ ] Owner Acceptance recorded (**ACCEPTED / CLOSED**)
- [ ] Portfolio + readiness matrix maturity updated
- [ ] Product pack README / IMPLEMENTATION-READINESS / KNOWN-LIMITATIONS synced
- [ ] CURRENT-STATE · CURRENT-MILESTONE · PROJECT-INDEX · DOCUMENT-MAP · AI-MANIFEST · SESSION-START updated
- [ ] No next programme recommended without Owner request

### 7.6 Reference artefacts (PROJECTS-001)

| Artefact     | Path                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| Sprint Guide | `docs/sprint/APZHUB-PROJECTS-001-sprint-guide.md`                                       |
| Completion   | `docs/sprint/APZHUB-PROJECTS-001-completion-report.md`                                  |
| Acceptance   | `docs/foundation/completion-reports/APZHUB-PROJECTS-001-programme-acceptance-report.md` |
| UI           | `apps/web/components/projects/*` · `apps/web/lib/projects/*`                            |
| Manifest     | `services/projects/manifests/projects/module.yaml`                                      |
| Playwright   | `testing/playwright/e2e/apzhub-projects-001-*.spec.ts`                                  |
| Pack         | `docs/products/projects/`                                                               |

### 7.7 Product Releases after Production (APZ Projects 1.1.0)

After a product reaches Production via a named programme, further delivery uses **Product Releases** under the Engineering Operating Model (not new repository-wide governance programmes):

1. Owner Release Approval → planning docs under `docs/releases/{product}/`
2. Owner Approves scope → Workbench-only implementation on existing Platform HTTP
3. SemVer product version · `RELEASES.md` · evidence archive `docs/releases/{product}/{version}/`
4. Playwright filter `apzhub-{product}-{version}-*` alongside prior cert suites
5. Owner Acceptance → version becomes Production baseline (Patch / Minor / Major naming thereafter)

Reference evidence: [docs/releases/projects/1.1.0/](../releases/projects/1.1.0/README.md). Phase 1 Workbench directory/client rules in §7.2–7.4 remain unchanged.

### 7.8 Second OSS-backed Workbench product (APZ Time 1.0.0)

APZ Time **1.0.0** Phase 1 confirmed the §7.2–7.4 clone pattern for a second OSS-backed product (Kimai CERTIFIED_DOMAIN → Time Platform Services → Time HTTP → Workbench).

| Artefact         | Path                                                          |
| ---------------- | ------------------------------------------------------------- |
| Evidence archive | [docs/releases/time/1.0.0/](../releases/time/1.0.0/README.md) |
| Manifest         | `services/time/manifests/time/module.yaml`                    |
| Client / UI      | `apps/web/lib/time/*` · `apps/web/components/time/*`          |
| Playwright       | `testing/playwright/e2e/apzhub-time-1.0-*.spec.ts`            |
| Pack / RELEASES  | `docs/products/time/`                                         |

**Reusable additions beyond Projects (optional for future products):**

1. **Diagnostics brand redaction** — `formatSafeDiagnosticsJson` (or equivalent) so health/diagnostics JSON never renders engine brand tokens in the UI.
2. **Dedicated diagnostics sidebar route** — optional alongside a combined health view.
3. **Multi-entity session defaults** — `sessionStorage` last-entity helpers for more than one primary ID (e.g. last timesheet + last customer).

Directory/client/HTTP-only rules in §7.2–7.3 remain the primary pattern. No architectural deviation was introduced.

---

## Confirmation

| Item                            | Status                                       |
| ------------------------------- | -------------------------------------------- |
| APZHUB-PROJECTS-001             | **ACCEPTED / CLOSED**                        |
| APZ Projects Production Release | **1.1.0 ACCEPTED / CLOSED**                  |
| APZ Time Production Release     | **1.0.0** Phase 1 **ACCEPTED / CLOSED**      |
| APZ Projects / Time maturity    | **Production** (with documented limitations) |
| Other products                  | Unchanged except as evidenced                |
| Next product / release          | **Not authorised** — await Owner direction   |

**STOP.** Await explicit Owner direction for the next product or release.
