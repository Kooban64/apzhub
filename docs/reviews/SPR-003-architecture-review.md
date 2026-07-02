# SPR-003 — Architecture Review

> **Sprint:** SPR-003 — Workbench Framework  
> **Review date:** 2026-06-28  
> **Scope:** Phases 0–8 (Workbench Framework delivery)  
> **Recommendation:** **Approve Sprint 003 closeout** — proceed to owner review; tag `v0.3.0-workbench-framework` when instructed

---

## Executive summary

SPR-003 successfully delivers `@apzhub/workbench-framework` as the APZHUB user interaction layer. The Workbench Manager orchestrates eight engines through a typed Request Bus. Capabilities integrate exclusively via the **Workbench API** (ADR-0020). The Desktop Shell is registry-aware, session-capable, and permission-filtered at bootstrap and restore.

All planned Phase 0–7 subsystems are implemented and tested. Phase 8 adds architecture and milestone reviews, release notes, Document 000 API layering, and Sprint 004 extension-point documentation — no new platform functionality.

---

## Architecture compliance

| ADR / Rule                                | Compliance                                              |
| ----------------------------------------- | ------------------------------------------------------- |
| ADR-0019 Workbench Framework package      | ✅ Dedicated package; React-first layer                 |
| ADR-0020 Workbench Request transport      | ✅ Capability → Workbench API → Manager → Engines       |
| ADR-0021 Session persistence              | ✅ Versioned schema; localStorage; restore sanitisation |
| ADR-0022 Navigation manifest extension    | ✅ `workbench.navigation` validated and extracted       |
| ADR-0023 Permission adapter               | ✅ DI factory; auth + scaffold adapters; server filter  |
| Document 000 §6.1 API layering            | ✅ Runtime / Workbench / Capability layers documented   |
| No direct UI manipulation by capabilities | ✅ Request-only integration                             |
| No business modules                       | ✅ Confirmed                                            |
| Phased review gates (ADR-0017)            | ✅ Phase reports 0–7 filed                              |

---

## Subsystem review

### Workbench Manager

**Role:** Central coordinator — routes Workbench Requests, aggregates state, enforces permission gate before engine dispatch.

**Verdict:** ✅ Approved

- Single entry for shell bootstrap (`createWorkbenchManager`)
- Delegates to specialised engines; no business logic in React components
- Diagnostics surface via `getDiagnostics()` on manager and API

**Observations:** `getManager()` on Request Bus remains an internal/test escape hatch (TD-09).

---

### Workbench API

**Role:** Public Layer 2 API for capabilities and shell UI (Document 000 §6.1).

**Verdict:** ✅ Approved

- `WorkbenchAPI` v1.0: `execute`, `executeAction`, typed helpers (`navigate`, `openView`, `setContext`, etc.)
- `useWorkbenchAPI()` React hook for shell integration
- `WorkbenchAction` model and `REQUEST_COMMAND_MAP` prepared for Sprint 004
- Server export: `filterWorkbenchRegistryDto()` for permission-safe hydration

**Observations:** `WorkbenchCommandBridge` interface only — Sprint 004 (TD-05).

---

### Request Bus

**Role:** Typed publish/subscribe transport between API surface and Workbench Manager (ADR-0020).

**Verdict:** ✅ Approved

- Request types cover navigation, layout, panel, view, session, context, selection
- Manager subscription handles routing and permission checks
- No capability may bypass bus to call engines directly

**Observations:** Document `getManager()` as internal-only in a future hardening pass.

---

### Layout Engine

**Role:** Shell region geometry, responsive layout state, dock split ratios.

**Verdict:** ✅ Approved

- Region visibility and geometry persisted in session schema
- Integrates with Panel Engine for collapse/resize state

**Observations:** Dock UI not fully interactive — ratios persisted only (TD from Phase 5).

---

### Panel Engine

**Role:** Region visibility, collapse, resize for shell panels (sidebar, context, etc.).

**Verdict:** ✅ Approved

- Request handlers for show/hide/toggle/collapse
- State included in session snapshot

**Observations:** Context panel does not auto-open on `setContext` (TD-P6-05).

---

### Navigation Engine

**Role:** Registry-driven Activity Bar and sidebar; workspace selection (ADR-0022).

**Verdict:** ✅ Approved

- Hydrates from filtered registry DTO at bootstrap
- Workspace activation drives view routing via View Engine
- Permission filtering applied before model build

**Observations:** Activity bar glyph uses label initial, not icon assets (TD-12). Legacy `module.navigation` coexistence (TD-11).

---

### View Engine

**Role:** View activation, route mapping, focused view lifecycle.

**Verdict:** ✅ Approved

- Registry `workbench.view` entries validated and mapped to routes
- Client-side route sync with Next.js App Router
- Session restores active view with permission re-validation

**Observations:** No tab bar UI — single focused view (TD-01). View content region is placeholder (TD-02). Deep link SSR guard not implemented (TD-08).

---

### Session Engine

**Role:** Versioned client session model and persistence (ADR-0021).

**Verdict:** ✅ Approved

- Schema v1.0: layout, navigation, view, panel, context, selection slices
- `localStorage` key: `apzhub:workbench:session:{userId}`
- Restore on load with permission sanitisation (drops disallowed views/workspaces)
- Diagnostics for persistence failures

**Observations:** PostgreSQL/server sync deferred to Milestone 8 (TD-04).

---

### Context Engine

**Role:** Context panel data orchestration; manifest-driven provider slots.

**Verdict:** ✅ Approved (scaffold)

- `setContext`, `clearContext`, typed context payloads
- Session persistence of context state

**Observations:** Context panel UI and manifest provider wiring not complete (TD-06).

---

### Selection Engine

**Role:** Per-view selection state (clear, single, multi).

**Verdict:** ✅ Approved (scaffold)

- Selection scoped by view ID
- Persisted in session; sanitised on restore

**Observations:** Not exposed in shell UI (TD-07).

---

### Permission integration

**Role:** Gate navigation, views, and session restore via injectable adapter (ADR-0023).

**Verdict:** ✅ Approved with observations

- `ScaffoldWorkbenchPermissionAdapter` — dev allow-all
- `AuthWorkbenchPermissionAdapter` — wired via `createWorkbenchPermissionAdapter()`
- Server-side `filterWorkbenchRegistryDto()` strips disallowed registry entries before client hydration
- Session restore re-validates persisted IDs against adapter

**Observations:** RBAC permission keys not populated from auth session until Milestone 8 (TD-03). Adapter structure is correct; empty permission set is an accepted interim state per ADR-0023.

---

## Integration review

```text
Runtime.bootstrap()  →  PlatformRegistry
        │
        ▼
filterWorkbenchRegistryDto(registry, permissionAdapter)   [server]
        │
        ▼
createWorkbenchManager(dto)  →  engines hydrated
        │
        ▼
WorkbenchRequestBus  ←  WorkbenchAPI  ←  capabilities / shell
        │
        ▼
Workbench Manager  →  Layout | Panel | Navigation | View | Session | Context | Selection
        │
        ▼
React shell (@apzhub/workspace, apps/web providers)
```

`apps/web` integrates via `workbench-hydration.ts`, `workbench-shell-provider.tsx`, and `react/workbench-context.tsx`. Desktop Shell remains the presentation layer; engines own state.

---

## Testing review

| Category                 | Result                                                        |
| ------------------------ | ------------------------------------------------------------- |
| Unit tests               | ✅ 383 passing                                                |
| Coverage                 | ✅ workbench-framework branch threshold ≥ 80%                 |
| E2E                      | ✅ 15 passing — shell navigation, session restore, route sync |
| SPR-001 / SPR-002 suites | ✅ Compatible                                                 |

---

## Known limitations (accepted)

1. Tab bar and multi-view UI not rendered
2. View content placeholder — no capability mount pipeline
3. RBAC permissions empty in production auth adapter until Milestone 8
4. Command Framework / palette / keyboard shortcuts — Sprint 004
5. Server session persistence deferred
6. Context panel and selection not fully surfaced in UI

---

## Recommendation

**Approve Sprint 003 closeout.**

Recommend tagging **`v0.3.0-workbench-framework`** after owner review. Do not begin Sprint 004 implementation until owner instructs.

---

_Architecture review — SPR-003 Workbench Framework._
