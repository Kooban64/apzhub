# APZHUB Support Module UI — Master Certification Report

**Certification ID:** OSS-110-14  
**Date:** 2026-07-11  
**Outcome:** **PRODUCTION_READY_WITH_LIMITATIONS**  
**Issued by:** APZHUB Engineering (automated certification suite + audits)  
**Prerequisite:** OSS-110-13 (Support Module UI delivery) · OSS-110-12 (Support Vertical CERTIFIED_WITH_LIMITATIONS)

---

## Executive summary

The APZHUB **Support Module UI** — workbench presentation, typed `/api/v1` client, manifests, and mocked Playwright certification suite — is hereby **PRODUCTION_READY_WITH_LIMITATIONS**.

The full presentation chain is certified (mocked; no live Zammad):

```text
Support Workbench UI
  → typed client (apps/web/lib/support/support-api.ts)
  → /api/v1/support-*
  → PlatformServiceGateway
  → RequestPipeline
  → Production Authorization
  → Support Platform Services
  → MappingOrchestrator
  → ProviderResolver
  → Zammad Provider
  → Certified Zammad Adapter
```

Architecture and dependency audits **PASS**. Playwright certification **23 passed** (functional, a11y axe critical/serious clean, responsive 4 viewports, visual baselines, performance measurement). Vitest Support UI **72 passed** with strong coverage. Typecheck, OpenAPI platform validate, and Support lint **PASS**. Known platform/product limitations remain documented below — they are accepted constraints, not certification blockers for this UI slice.

**Stop condition met.** Do not invent further Support UI feature milestones. Await owner approval for the next APZHUB domain or platform milestone.

---

## Certification outcome: PRODUCTION_READY_WITH_LIMITATIONS

### Justification

| Evidence | Result |
|----------|--------|
| Full UI → `/api/v1` → gateway → services → mapping → provider → adapter chain | ✅ Certified (mocked; no live Zammad) |
| Architecture audit | ✅ PASS |
| Dependency / boundary audit | ✅ PASS (17/17 certification checks; vertical 0/36) |
| Playwright `oss-110-14-support*` | ✅ **23 passed** |
| Vitest Support UI | ✅ **72 passed** |
| Coverage (Support UI) | ~**94.9%** lines / **87.7%** branches / **80.3%** functions / **94.9%** statements; `support-api` **100%** lines |
| Typecheck | ✅ PASS |
| OpenAPI platform validate | ✅ PASS |
| Lint (Support surface) | ✅ PASS |
| Known limitations | Documented — not remediated in this milestone |

### Rationale for `PRODUCTION_READY_WITH_LIMITATIONS` (not defects)

The following are **accepted constraints** carried from OSS-110-12 / Wave 2 and UI design scope — not defects requiring remediation before this UI certification outcome:

| Limitation | Category | Notes |
|------------|----------|-------|
| No Platform Event Bus | Infrastructure dependency | No bus-driven UI refresh |
| No webhook HTTP ingress | Infrastructure dependency | No webhook-driven inbox |
| No notifications subsystem | Infrastructure dependency | No Support notification panel wiring |
| No realtime (WS/SSE) | Scope boundary | TanStack Query poll/refetch only |
| No binary attachment transfer | Adapter / product limitation | Metadata + “Binary access not available” |
| UI may use `support.*` default permission wildcard | UI authz helper | Server remains authoritative (403 + error mapping) |
| Overdue metric is heuristic, not SLA | Product labelling | Explicit “heuristic — not an SLA” in analytics |
| Visual baselines are mocked-API Chromium snapshots | Test posture | Not live-engine visual truth |
| Next.js `/_global-error` prerender build FAIL | Pre-existing framework caveat | Unrelated to Support UI |

---

## Scope

### What IS certified

| Domain | Component | Status |
|--------|-----------|--------|
| Workbench | Activity Bar **Support**, sidebar children, `SupportWorkspaceRouter` | ✅ CERTIFIED |
| Typed client | `apps/web/lib/support/support-api.ts` → `/api/v1` only | ✅ CERTIFIED |
| Presentation | Inbox, create, detail, conversation, composers, commands, orgs/groups/users, search, analytics | ✅ CERTIFIED |
| Boundaries | No gateway/provider/adapter/mapping/DB imports in UI | ✅ CERTIFIED |
| Safety | Internal-note vs customer-reply composers; sanitized article text; no engine branding | ✅ CERTIFIED |
| Attachments | Metadata-only UI | ✅ CERTIFIED |
| A11y | axe critical/serious clean on certified surfaces; keyboard reach | ✅ CERTIFIED |
| Responsive | Four viewports; no horizontal overflow on inbox | ✅ CERTIFIED |
| Visual | Three Chromium baselines (inbox, detail, analytics) | ✅ CERTIFIED |
| Performance | Soft measurement baseline recorded | ✅ CERTIFIED (measurement) |

### What is NOT certified / not delivered

| Feature | Why |
|---------|-----|
| Live Zammad E2E UI | Certification uses mocked `/api/v1` |
| Event Bus / webhook ingress / notifications / realtime / binary | Explicitly out of scope |
| Full AuthorizationService → UI permission hydration (no `support.*` wildcard) | Accepted limitation; server authoritative |
| Production SLA analytics | Overdue remains heuristic |
| `pnpm build` apps/web green | Pre-existing `/_global-error` caveat |

---

## Certification domains

| Domain | Verdict | Companion |
|--------|---------|-----------|
| Architecture | ✅ PASS | [OSS-110-14-architecture-audit.md](../sprint/OSS-110-14-architecture-audit.md) |
| Dependency / boundary | ✅ PASS (17/17; vertical 0/36) | [OSS-110-14-dependency-audit.md](../sprint/OSS-110-14-dependency-audit.md) |
| Functional UI (Playwright) | ✅ 23 passed (suite total) | [OSS-110-14-completion-report.md](../sprint/OSS-110-14-completion-report.md) |
| Accessibility | ✅ PASS | [OSS-110-14-accessibility-report.md](../sprint/OSS-110-14-accessibility-report.md) |
| Responsive | ✅ PASS | [OSS-110-14-responsive-report.md](../sprint/OSS-110-14-responsive-report.md) |
| Visual regression | ✅ PASS (3 baselines) | [OSS-110-14-visual-regression-report.md](../sprint/OSS-110-14-visual-regression-report.md) |
| Performance | ✅ Measurement recorded | [OSS-110-14-performance-report.md](../sprint/OSS-110-14-performance-report.md) |
| Unit / coverage | ✅ 72 passed; ~94.9% lines | Completion report |
| Quality gates | ✅ Typecheck / OpenAPI / lint Support | Completion report |

---

## Audit evidence

```bash
node scripts/support-ui-certification-audit.mjs   # PASS 17/17
node scripts/support-ui-boundary-audit.mjs        # PASS
node scripts/support-vertical-dependency-audit.mjs # PASS 0/36
```

---

## Certification defect corrections (minimal)

During certification, three minimal presentation/shared-UI defects were corrected (not product-feature work):

1. **Input `useId` label association** — `@apzhub/ui` `Input` associates `label` via stable `useId` when `id`/`name` absent.
2. **Shell / header horizontal overflow** — shell layout `overflow-x-hidden` / `min-w-0` so Support inbox does not force horizontal scroll at narrow viewports.
3. **VisibilityBadge contrast** — token-safe foreground/border styles for Internal / Customer-visible badges (axe contrast).

No Event Bus, webhook, notifications, realtime, or binary attachment capability was added.

---

## Limitations register (UI + inherited)

1. **No Event Bus** — Support UI does not subscribe to platform events for inbox refresh.
2. **No webhook ingress** — No webhook-driven Support surfaces.
3. **No notifications** — No Attention Engine / Support notification wiring.
4. **No realtime** — No WS/SSE; TanStack Query only.
5. **No binary attachments** — Metadata only; “Binary access not available”.
6. **UI permission wildcard** — Router/helpers may default to `support.*` for authenticated Support users; HTTP authz remains authoritative.
7. **Overdue heuristic** — Analytics overdue is not an SLA clock.
8. **Visual baselines mocked** — Chromium snapshots against mocked API fixtures.
9. **`/_global-error` build FAIL** — Pre-existing Next.js App Router caveat; unrelated to Support UI.
10. **API vertical** — Remains **CERTIFIED_WITH_LIMITATIONS** (OSS-110-12); UI status is separately **PRODUCTION_READY_WITH_LIMITATIONS**.

---

## Relationship to Support Vertical certification

| Layer | Document | Outcome |
|-------|----------|---------|
| API vertical (HTTP→adapter) | [SUPPORT-VERTICAL-CERTIFICATION.md](./SUPPORT-VERTICAL-CERTIFICATION.md) | **CERTIFIED_WITH_LIMITATIONS** (OSS-110-12) |
| Module UI (workbench) | **This document** | **PRODUCTION_READY_WITH_LIMITATIONS** (OSS-110-14) |

Together these constitute the Support product slice available for production use within the shared limitations register.

---

## Recommendation — next platform milestone

**Do not** invent a large new Support UI feature milestone (no OSS-110-15 Support UI expansion by default).

**Recommended next step:** Await **owner approval** for the next APZHUB domain or platform milestone already on the ratified roadmap, for example:

- **OSS-100-06** — Integration SDK webhook & polling contracts  
- **PCv2-02** / other Platform Core production-readiness work  
- **QE-001** — Quality Engineering platform start  
- Or another owner-approved product domain

Any Event Bus wiring, webhook HTTP ingress, notifications, realtime, or binary attachment transfer for Support requires a **separately approved** milestone — not implied by this UI certification.

---

## Companion documents

| Document | Location |
|----------|----------|
| Architecture audit | `docs/sprint/OSS-110-14-architecture-audit.md` |
| Dependency audit | `docs/sprint/OSS-110-14-dependency-audit.md` |
| Accessibility report | `docs/sprint/OSS-110-14-accessibility-report.md` |
| Responsive report | `docs/sprint/OSS-110-14-responsive-report.md` |
| Performance report | `docs/sprint/OSS-110-14-performance-report.md` |
| Visual regression report | `docs/sprint/OSS-110-14-visual-regression-report.md` |
| Completion report | `docs/sprint/OSS-110-14-completion-report.md` |
| Support Module UI architecture | `docs/architecture/APZHUB-Support-Module-UI.md` |
| Support Vertical (API) certification | `docs/architecture/SUPPORT-VERTICAL-CERTIFICATION.md` |
| OSS-110-13 delivery closeout | `docs/sprint/OSS-110-13-completion-report.md` |
