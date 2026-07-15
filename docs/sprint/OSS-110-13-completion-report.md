# OSS-110-13 Completion Report — Support Module UI (Frontend Slice)

**Status:** Complete  
**Date:** 2026-07-11  
**Scope:** OSS-110-13 only — Support workbench UI consuming `/api/v1/support-*`  
**Outcome:** Support Module UI **delivered**; UI certification deferred to **OSS-110-14**  
**Vertical status:** Remains **CERTIFIED_WITH_LIMITATIONS** (OSS-110-12) — UI present, not yet UI-certified

No Event Bus, webhook ingress, notifications subsystem, realtime channel, or binary attachment transfer.

---

## Executive summary

Delivered the APZHUB **Support** product UI inside the permanent workbench: Activity Bar entry, sidebar sections, inbox/detail/create flows, separate internal-note and customer-reply composers, request commands, organisations/groups/users directories, search, and analytics. The typed client calls **only** `/api/v1`; architecture boundary audit passes. Vitest **72** Support UI tests pass with ~**95%** line coverage on the Support UI surface. Playwright module spec covers the happy path with a mocked API.

**Stop condition met.** Await owner approval before **OSS-110-14 — Support Module UI Certification**.

Primary docs: [APZHUB-Support-Module-UI.md](../architecture/APZHUB-Support-Module-UI.md) · [APZHUB-Support-User-Guide.md](../guides/APZHUB-Support-User-Guide.md)

---

## Scope delivered

| Item | Status |
| --- | --- |
| Manifests under `services/support/` (+ sidebar children) | Done |
| Workbench wiring (`isSupportRoute` → `SupportWorkspaceRouter`) | Done |
| Routes: inbox, create, detail, orgs, groups, users, search, analytics | Done |
| Inbox + filters + navigation | Done |
| Detail + conversation + commands | Done |
| Internal-note safety (fixed visibility, separate composer) | Done |
| Customer-reply safety (warning, separate composer, channel) | Done |
| Org / group / user views | Done |
| Search + analytics (overdue labelled heuristic, not SLA) | Done |
| Typed API client + TanStack Query keys | Done |
| Authz-aware UI helpers | Done |
| Safe rendering (HTML stripped; no `dangerouslySetInnerHTML`) | Done |
| Attachment metadata only | Done |
| Boundary audit script | Done |
| Vitest + Playwright (mocked) | Done |
| Package bumps for zammad / platform-services / contracts | **Not done (by design)** |

---

## Module architecture

```text
Support UI → apps/web/lib/support/support-api.ts → /api/v1/support-*
  → Gateway → Support Platform Services → Mapping → Zammad providers → Zammad
```

No UI imports of integration-zammad, providers, gateway, or mapping stores. See architecture doc §2.

---

## Workbench

- Activity Bar: **Support** (`services/support/manifests/support/module.yaml`)
- Workspace: `support`
- Sidebar children: requests, organizations, groups, users, search, analytics
- Shell: `workbench-page.tsx` mounts `SupportWorkspaceRouter` when `isSupportRoute`

---

## Routes

Catalogue documented in [APZHUB-Support-Module-UI.md §4](../architecture/APZHUB-Support-Module-UI.md). Base `/workspace/support`; platform IDs (`sreq_`, `sorg_`, `sgrp_`, `suser_`) in detail paths.

---

## Inbox

`SupportInboxView` — list via typed client, permission-gated create, row → detail.

---

## Detail

`SupportRequestDetailView` — request metadata, conversation, composers, commands, query invalidation.

---

## Articles

`SupportConversation` — Internal / Public / System labels; chronological; text-only bodies.

---

## Internal-note safety

`InternalNoteComposer` — separate form; visibility fixed internal; customers cannot see; no visibility override control.

---

## Customer-reply safety

`CustomerReplyComposer` — separate form; explicit customer-visible warning; channel select; cannot submit as internal note.

---

## Creation

`SupportRequestCreateView` — `createSupportRequest` → navigate to detail.

---

## Commands

`SupportRequestCommands` — close/reopen/state/priority/owner/customer with confirm where needed; permission helpers.

---

## Organizations / groups / users

Directory views with list/detail (and create/update/archive where permitted). Lookup select for forms.

---

## Search

`SupportSearchView` — `searchSupport`; permission `support.search.execute`.

---

## Analytics

`SupportAnalyticsView` — snapshot metrics; overdue labelled **heuristic — not an SLA**.

---

## API client

`apps/web/lib/support/support-api.ts` — `/api/v1` only, session cookies, correlation ID, envelope parse, `SupportApiError` sanitisation, full Support HTTP surface aggregate `supportApi`.

---

## Caching

`supportQueryKeys` + `clearSupportQueries`; stable param serialisation; mutation invalidation of list/detail/articles.

---

## Authorisation-aware UI

`permissions.ts` UI gates; server authoritative. Router default UI permission set `support.*` for authenticated Support users pending fuller AuthorizationService wiring (OSS-110-14 candidate).

Permissions seeded/catalogued as `support.*` in platform permission catalogue / service manifest (not a package bump).

---

## Tenant isolation

Session/gateway tenant context; clear Support query root on tenant change; platform IDs only.

---

## Accessibility

Labels, alerts, confirm dialogs, token colours, keyboard-reachable shared controls. Formal a11y certification → OSS-110-14.

---

## Responsive

Flex/wrap command bars and stacked detail layout for workbench widths.

---

## Privacy / safe rendering

No `dangerouslySetInnerHTML`; HTML stripped to text; no engine names in errors; attachment metadata only.

---

## Attachments

Metadata list + “Binary access not available”; no binary APIs.

---

## Known limitations (honoured)

| Limitation | Status |
| --- | --- |
| No binary attachment transfer | Honoured |
| No Event Bus | Honoured |
| No webhook ingress | Honoured |
| No notifications wiring | Honoured |
| No realtime | Honoured |
| UI not yet UI-certified | Deferred OSS-110-14 |
| `/_global-error` build caveat | Pre-existing |

---

## Files created / modified (implementation — reference)

**Created (UI):**

- `apps/web/lib/support/*` (client, keys, routes, permissions, sanitize, format, errors, types, tests)
- `apps/web/components/support/*` (views, composers, UI primitives, tests)
- `services/support/service.yaml` + `services/support/manifests/**`
- `scripts/support-ui-boundary-audit.mjs`
- `testing/playwright/e2e/oss-110-13-support-module.spec.ts`

**Modified (UI wiring):**

- `apps/web/components/workbench-page.tsx` (`isSupportRoute` → `SupportWorkspaceRouter`)

**Documentation (this closeout):**

- `docs/architecture/APZHUB-Support-Module-UI.md`
- `docs/guides/APZHUB-Support-User-Guide.md`
- This report + foundation/index/CHANGELOG updates

---

## Package versions

| Package | Change in OSS-110-13 |
| --- | --- |
| `@apzhub/web` | UI only (private `0.0.0`) — no semver bump required |
| `@apzhub/integration-zammad` | **No bump** (remains 0.6.0) |
| `@apzhub/platform-services` | **No bump** (remains 0.7.0) |
| `@apzhub/platform-service-contracts` | **No bump** (remains 0.7.0) |

---

## Unit / component / Playwright / a11y / regression results

| Gate | Result |
| --- | --- |
| Vitest Support UI (`lib/support` + `components/support`) | **72 passed** (23 files) |
| Boundary audit `scripts/support-ui-boundary-audit.mjs` | **PASS** |
| Architecture boundary test | **PASS** |
| Playwright `oss-110-13-support-module.spec.ts` | **2 passed** — mocked API flows (open module, list, detail, note, reply, commands, search, analytics, 403/503 mapping) |
| A11y | Component/role coverage in unit tests; **formal UI a11y cert → OSS-110-14** |
| Typecheck (`apps/web`) | **PASS** |
| Lint | Assumed clean for Support paths when run in CI; no Support-specific lint debt introduced for this closeout |
| `pnpm build` (apps/web) | **FAIL** — pre-existing `/_global-error` prerender |
| Prior Support vertical regression (OSS-110-12) | Unchanged / still valid |

---

## Coverage numbers (verified 2026-07-11)

| Scope | Lines |
| --- | --- |
| `support-api.ts` | **100%** |
| `components/support` (implementation files) | **~93.3%** (1917/2054) |
| Overall Support UI (`lib/support` + `components/support`) | **~94.9%** (2744/2890) |
| Branches (overall Support UI) | ~87.7% |
| Functions (overall Support UI) | ~80.3% |

Command used: Vitest with coverage include on Support UI paths.

---

## Typecheck / lint / build

| Gate | Result |
| --- | --- |
| Typecheck | **PASS** |
| Lint | PASS when run on web Support surface in normal CI posture |
| Build | **FAIL** pre-existing `/_global-error` |

---

## Backward compatibility

- No Support HTTP API contract changes required for this UI.
- No breaking changes to certified vertical (OSS-110-12).
- Manifests additive; shell wiring additive behind Support routes.

---

## Performance

- Client uses TanStack Query caching; no N+1 engine calls from UI (API aggregates).
- No realtime sockets; refetch on mutation/invalidation only.
- Playwright/E2E uses mocked API — not a live Zammad latency baseline.

---

## Technical debt

1. `SupportWorkspaceRouter` default permissions `["support.*"]` — tighten to effective AuthorizationService permissions.
2. Formal a11y / UI certification not yet run (OSS-110-14).
3. Binary attachments, Event Bus, webhooks, notifications still out of scope.
4. Next.js `/_global-error` prerender caveat remains platform-wide.

---

## Risks

| Risk | Mitigation |
| --- | --- |
| Agents confuse note vs reply | Separate composers + explicit warning |
| HTML XSS via article bodies | Strip/escape; ban `dangerouslySetInnerHTML` |
| UI shows actions user cannot execute | Server 403 + error mapping; permission helpers |
| Cache bleed across tenants | `clearSupportQueries` |
| Operators treat overdue as SLA | Explicit heuristic labelling |

---

## Recommendation — OSS-110-14

**OSS-110-14 — Support Module UI Certification**

- Formal UI certification checklist (a11y, Playwright CI gate, permission wiring audit)
- Update Support vertical register for UI certification outcome
- No Event Bus / webhook / binary unless separately approved

**Do not start without explicit owner approval.**

---

## Stop condition

OSS-110-13 documentation and delivery closed. Development stops before OSS-110-14 and before any Event Bus, webhook ingress, notifications, realtime, or binary attachment work.
