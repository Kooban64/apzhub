# OSS-110-14 Dependency & Boundary Audit — Support Module UI

> **Milestone:** OSS-110-14 — Support Module UI Certification & Production Readiness  
> **Date:** 2026-07-11  
> **Verdict:** **PASS** (0 violations, 47 files, 17 checks)  
> **Companion architecture audit:** [OSS-110-14-architecture-audit.md](./OSS-110-14-architecture-audit.md)

---

## Scope

### Support UI presentation roots
- `apps/web/components/support`
- `apps/web/lib/support`

### Workbench wiring
- `apps/web/components/workbench-page.tsx`

### Manifests
- `services/support/service.yaml`
- `services/support/manifests/support/module.yaml` (activity-bar)
- `services/support/manifests/support-requests/module.yaml`
- `services/support/manifests/support-organizations/module.yaml`
- `services/support/manifests/support-groups/module.yaml`
- `services/support/manifests/support-users/module.yaml`
- `services/support/manifests/support-search/module.yaml`
- `services/support/manifests/support-analytics/module.yaml`

Files scanned (UI TS/TSX under presentation roots): **47**

---

## Rules

### Presentation boundary (Support UI)
- `no-zammad-integration` — MUST NOT import `@apzhub/integration-zammad` / `integrations/zammad`
- `no-entity-mapping-store` — MUST NOT import `EntityMappingStore` / entity-mapping / mapping-store
- `no-platform-services-impl` — MUST NOT import `@apzhub/platform-services` implementations, `support-service-impls`, `support-mapping-helpers`, `providers/zammad`
- `no-gateway-import` — MUST NOT import `getPlatformServiceGateway` / `PlatformServiceGateway`
- `no-adapter-import` — MUST NOT import integration adapter packages from UI
- `no-database-import` — MUST NOT import drizzle / postgres / prisma / pg
- `no-dangerously-set-inner-html` — MUST NOT use `dangerouslySetInnerHTML`
- `no-zammad-label` — MUST NOT expose engine branding in UI labels (sanitizer allowlist in `errors.ts` only)
- `must-use-api-v1` / `support-api-v1` — `support-api.ts` MUST call `/api/v1` only
- `no-event-bus-ui` / `no-webhook-ui` / `no-binary-attachment-ui` — out-of-scope surfaces MUST be absent
- `no-provider-native-id` — MUST NOT display `_zammad_` / `s*_zammad_*` provider-boundary IDs

### Workbench / manifests
- Activity-bar Support module MUST exist, `status: enabled`, workspace `support`, route `/workspace/support`
- Sidebar child modules MUST exist and be enabled with correct routes
- `workbench-page.tsx` MUST wire `isSupportRoute` → `SupportWorkspaceRouter`

### Vertical layer (reference — still PASS)
HTTP handlers, Zammad providers, and Support service implementations remain under OSS-110-12 rules. Re-run:

```bash
node scripts/support-vertical-dependency-audit.mjs
```

**Result (2026-07-11):** PASS (0 violations, 36 files)

---

## Certification checks (script)

| Check | Result |
|-------|--------|
| `ui-boundary-script` | PASS |
| `support-service-yaml` | PASS |
| `manifest-support` (activity-bar) | PASS |
| `manifest-support-requests` | PASS |
| `manifest-support-organizations` | PASS |
| `manifest-support-groups` | PASS |
| `manifest-support-users` | PASS |
| `manifest-support-search` | PASS |
| `manifest-support-analytics` | PASS |
| `workbench-wiring` | PASS |
| `support-api-v1` | PASS |
| `ui-forbidden-imports` | PASS |
| `ui-out-of-scope-absent` | PASS |
| `ui-no-provider-native-ids` | PASS |
| `internal-note-safety` | PASS |
| `customer-reply-safety` | PASS |
| `attachment-metadata-only` | PASS |

---

## Import graph

```text
support-ui
  → @/lib/support/errors
  → @/lib/support/format
  → @/lib/support/permissions
  → @/lib/support/query-keys
  → @/lib/support/routes
  → @/lib/support/sanitize-article-body
  → @/lib/support/support-api
  → @/lib/support/types
  → @apzhub/platform-service-contracts
  → @apzhub/ui
```

**Notes:**
- `@apzhub/platform-service-contracts` — type/DTO imports in `apps/web/lib/support/types.ts` only (allowed; not platform-services implementation).
- `@apzhub/ui` — shared design-system primitives (allowed).
- No `@apzhub/platform-services`, `@apzhub/integration-zammad`, gateway, mapping, or DB packages.
- Relative `@/lib/support/*` edges are presentation-internal.

Also used transitively in components (not `@apzhub` package specs): `@tanstack/react-query`, `next/navigation` — framework only.

---

## Violations

None — all boundary rules and certification checks satisfied.

---

## Vertical dependency audit (still PASS)

| Artifact | Verdict |
|----------|---------|
| `scripts/support-vertical-dependency-audit.mjs` | **PASS** |
| `docs/sprint/OSS-110-12-dependency-audit.md` | PASS (0 violations, 36 files) |
| HTTP → contracts only; providers → integration-zammad; service impls → contracts | Unchanged |

---

## Companion

- Machine-readable: `docs/sprint/OSS-110-14-dependency-audit.json`
- Script: `scripts/support-ui-certification-audit.mjs`
- UI boundary: `scripts/support-ui-boundary-audit.mjs`
- Architecture audit: `docs/sprint/OSS-110-14-architecture-audit.md`
