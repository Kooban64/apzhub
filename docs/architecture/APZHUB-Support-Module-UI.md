# APZHUB Support Module UI

> **Purpose:** Architecture and implementation reference for the Support workbench UI (OSS-110-13)  
> **Audience:** Engineers, reviewers, AI agents, ops (with user guide)  
> **Product:** Support (APZService / Support product) — backend engine branding (Zammad) hidden  
> **Milestone:** OSS-110-13 delivery · **OSS-110-14 certification**  
> **Status:** **Certified** — **PRODUCTION_READY_WITH_LIMITATIONS** (OSS-110-14)  
> **Last updated:** 2026-07-11  
> **Authoritative references:** [025 Module SDK](../025-module-sdk-module-manifest-module-development-standard.md) · [008 Modules & Connectors](../008-module-plugin-connector-architecture.md) · [009 Platform Services](../009-platform-service-layer-integration-framework.md) · [010 API Gateway](../010-api-gateway-integration-communication-standards.md) · [Support HTTP API](./APZHUB-Support-HTTP-API.md) · [Support Vertical Certification](./SUPPORT-VERTICAL-CERTIFICATION.md) · [Support UI Certification](./SUPPORT-UI-CERTIFICATION.md)  
> **Ops guide:** [APZHUB Support User Guide](../guides/APZHUB-Support-User-Guide.md)  
> **Completion:** [OSS-110-13 Completion Report](../sprint/OSS-110-13-completion-report.md) · [OSS-110-14 Completion Report](../sprint/OSS-110-14-completion-report.md)

---

## 1. Executive summary

OSS-110-13 delivers the **Support Module UI** inside the APZHUB workbench. Agents manage support requests, conversation articles (internal notes vs customer replies), organisations, groups, users, search, and analytics through the permanent shell.

The UI is a **presentation slice only**:

```text
Support UI → typed client → /api/v1 → Gateway → Platform Services → Mapping → Provider → Zammad
```

No React code imports adapters, providers, mapping stores, or Zammad clients. Engine branding stays hidden. API vertical certification remains **CERTIFIED_WITH_LIMITATIONS** (OSS-110-12). UI certification outcome is **PRODUCTION_READY_WITH_LIMITATIONS** (OSS-110-14) — see [SUPPORT-UI-CERTIFICATION.md](./SUPPORT-UI-CERTIFICATION.md).

---

## 2. Module architecture

### 2.1 Request path

| Layer             | Location                                                          | Responsibility                                         |
| ----------------- | ----------------------------------------------------------------- | ------------------------------------------------------ |
| Presentation      | `apps/web/components/support/*`                                   | Views, composers, permission-gated controls            |
| Typed client      | `apps/web/lib/support/support-api.ts`                             | Fetch `/api/v1/support-*` only; envelope parse; errors |
| HTTP routes       | `apps/web/app/api/v1/support-*`                                   | Thin handlers → gateway (OSS-110-11)                   |
| Gateway           | Platform Service Gateway                                          | Auth → Authz → validation → service                    |
| Platform Services | `@apzhub/platform-services`                                       | Support orchestration (OSS-110-10)                     |
| Mapping           | Entity mapping (`sreq_` / `sorg_` / `sgrp_` / `suser_` / `sart_`) | Platform IDs only to clients                           |
| Provider          | Zammad providers                                                  | Adapter boundary                                       |
| Engine            | Zammad (self-hosted CE)                                           | System of record for tickets                           |

### 2.2 Boundary rules (mandatory)

- UI **never** imports `@apzhub/integration-zammad`, providers, `PlatformServiceGateway`, or `EntityMappingStore`.
- UI **never** uses provider/engine IDs in routes or display contracts (platform IDs only).
- UI **never** uses `dangerouslySetInnerHTML`.
- Static audit: `node scripts/support-ui-boundary-audit.mjs` (must PASS).

### 2.3 Service & module manifests

| Artifact            | Path                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| Support service     | `services/support/service.yaml`                                                                         |
| Activity-bar module | `services/support/manifests/support/module.yaml`                                                        |
| Sidebar modules     | `services/support/manifests/support-{requests,organizations,groups,users,search,analytics}/module.yaml` |

Parent module: Activity Bar **Support** (`life-buoy`), workspace `support`, route `/workspace/support`, permission `support.requests.list`, status **enabled**.

Shell wiring: `apps/web/components/workbench-page.tsx` uses `isSupportRoute(pathname)` → `<SupportWorkspaceRouter />`.

---

## 3. Workbench integration

| Concern      | Behaviour                                                                            |
| ------------ | ------------------------------------------------------------------------------------ |
| Activity Bar | **Support** entry from `support/module.yaml`                                         |
| Workspace    | `support`                                                                            |
| Sidebar      | Requests, Organizations, Groups, Users, Search, Analytics (child manifests)          |
| Shell        | Header / Activity Bar / Sidebar / Workspace / Status Bar unchanged                   |
| Routing      | Client-side resolution via `resolveSupportRoute` in `apps/web/lib/support/routes.ts` |

Manifest `workbench.navigation.permission` values gate nav visibility; the HTTP API remains authoritative for every mutation and read.

---

## 4. Routes and views catalogue

Base: `/workspace/support`

| Path                                                   | Route kind            | View                                     |
| ------------------------------------------------------ | --------------------- | ---------------------------------------- |
| `/workspace/support`                                   | `inbox`               | Requests inbox                           |
| `/workspace/support/requests`                          | `inbox`               | Requests inbox                           |
| `/workspace/support/requests/new` · `/requests/create` | `create`              | Create request                           |
| `/workspace/support/requests/{sreq_…}`                 | `detail`              | Request detail + conversation + commands |
| `/workspace/support/organizations`                     | `organizations`       | Org list / create                        |
| `/workspace/support/organizations/{sorg_…}`            | `organization-detail` | Org detail / update / archive            |
| `/workspace/support/groups`                            | `groups`              | Group list / create                      |
| `/workspace/support/groups/{sgrp_…}`                   | `group-detail`        | Group detail / update                    |
| `/workspace/support/users`                             | `users`               | User directory                           |
| `/workspace/support/users/{suser_…}`                   | `user-detail`         | User detail                              |
| `/workspace/support/search`                            | `search`              | Support search                           |
| `/workspace/support/analytics`                         | `analytics`           | Intelligence snapshot                    |

Unknown Support paths render an empty state (“Unknown Support route”).

Helpers: `isSupportRoute`, `resolveSupportSection`, `parseSupportDetailId`, `supportRequestDetailPath`, `supportRequestCreatePath`.

---

## 5. Inbox

**Component:** `SupportInboxView`

- Lists support requests via `listSupportRequests` with filters (status, priority, assignee, search text as supported by API params).
- Row navigation to detail path.
- Create CTA when `support.requests.create` is granted (UI gate).
- Loading / empty / error states via shared `support-ui` primitives.
- TanStack Query key: `supportQueryKeys.requests.list(params)`.

---

## 6. Request detail

**Component:** `SupportRequestDetailView`

- Loads request + articles (+ history where wired).
- Shows status, priority, assignee, requester, group/org refs as platform fields.
- Embeds conversation, internal-note composer, customer-reply composer, and command bar.
- Invalidates request/articles/list caches after mutations.

---

## 7. Conversation / articles

**Component:** `SupportConversation`

- Chronological article list.
- Labels: **Internal**, **Public**, **System** (from visibility / channel / senderType).
- Body rendering: **text only** via `renderableArticleBody` (`sanitize-article-body.ts`).
  - `text/html` → strip tags/scripts → plain text.
  - Plain text → rendered as escaped text content (React text nodes; no HTML injection).
- Attachment metadata list only (see §15).

---

## 8. Internal-note safety

**Component:** `InternalNoteComposer`

| Rule              | Implementation                                                             |
| ----------------- | -------------------------------------------------------------------------- |
| Separate composer | Distinct from customer reply                                               |
| Visibility fixed  | Hidden field `visibility=internal`; copy states customers cannot see notes |
| No override       | UI does not offer public/customer visibility for notes                     |
| API               | `POST …/articles/notes` via `createInternalNote`                           |
| Permission gate   | Requires article create permission helper                                  |

---

## 9. Customer-reply safety

**Component:** `CustomerReplyComposer`

| Rule              | Implementation                                      |
| ----------------- | --------------------------------------------------- |
| Separate composer | Distinct from internal note                         |
| Explicit warning  | Customer-visible warning banner (`role="note"`)     |
| Channel select    | email / phone / web / chat / sms / fax              |
| API               | `POST …/articles/replies` via `createCustomerReply` |
| No silent note    | Cannot submit as internal note from this form       |

---

## 10. Creation

**Component:** `SupportRequestCreateView`

- Form → `createSupportRequest`.
- On success, navigates to the new request detail path.
- Permission: `support.requests.create` (UI + server).

---

## 11. Commands

**Component:** `SupportRequestCommands`

Permission-gated actions:

| Action                | Typical permission                                     |
| --------------------- | ------------------------------------------------------ |
| Close / Reopen        | `support.requests.transition`                          |
| Change state          | `support.requests.transition`                          |
| Change priority       | `support.requests.update`                              |
| Assign / remove owner | `support.requests.assign`                              |
| Change customer       | `support.requests.assign` / update path as API defines |

Close uses a confirm dialog. Failed commands surface safe API error messages (no provider leakage).

---

## 12. Organizations / groups / users

| View                       | Capabilities                                             |
| -------------------------- | -------------------------------------------------------- |
| `SupportOrganizationsView` | List, create, detail, update, archive (permission-gated) |
| `SupportGroupsView`        | List, create, detail, update                             |
| `SupportUsersView`         | List / detail (directory; read-oriented)                 |

Lookup selects (`SupportLookupSelect`) load options via the typed client for forms that need org/group/user IDs.

---

## 13. Search

**Component:** `SupportSearchView`

- Calls `searchSupport` with query params.
- Results grouped/labelled by search kind (format helpers).
- Permission: `support.search.execute`.

---

## 14. Analytics

**Component:** `SupportAnalyticsView`

- Calls `getSupportAnalytics`.
- Metrics from `SupportIntelligenceSnapshot`.
- **Overdue** labelled as **heuristic estimate — not an SLA measurement**.
- Permission: `support.analytics.read`.

---

## 15. Attachment metadata only

`AttachmentMetadataList` shows filename, content type, size, disposition, and the message **“Binary access not available”**.

No upload, download, preview, or binary transfer UI. Aligns with certified vertical limitations.

---

## 16. API client design

**Primary file:** `apps/web/lib/support/support-api.ts`

| Concern     | Design                                                               |
| ----------- | -------------------------------------------------------------------- |
| Base URL    | `/api/v1` only                                                       |
| Credentials | `credentials: "include"` (session cookies)                           |
| Correlation | Optional `x-correlation-id`; reads `meta.correlationId`              |
| Envelopes   | Success / collection / error envelopes typed in `types.ts`           |
| Errors      | `SupportApiError` — sanitises provider/adapter leakage (`errors.ts`) |
| Surface     | Named functions + `supportApi` aggregate for tests                   |

Exported operations cover requests lifecycle, articles (notes/replies), history, organizations, groups, users, search, and analytics.

Related helpers:

| File                       | Role                                               |
| -------------------------- | -------------------------------------------------- |
| `types.ts`                 | DTOs aligned to platform Support API               |
| `errors.ts`                | Controlled error mapping                           |
| `query-keys.ts`            | TanStack Query key factory + `clearSupportQueries` |
| `routes.ts`                | Path resolution                                    |
| `permissions.ts`           | UI-only permission helpers                         |
| `format.ts`                | Dates, statuses, priorities, byte sizes            |
| `sanitize-article-body.ts` | Safe text rendering                                |
| `index.ts`                 | Barrel re-exports                                  |

---

## 17. Caching / invalidation (TanStack Query)

Root key: `["support"]`.

| Key factory                                                 | Example                                  |
| ----------------------------------------------------------- | ---------------------------------------- |
| `supportQueryKeys.requests.list(params)`                    | Inbox lists (stable param serialisation) |
| `supportQueryKeys.requests.detail(id)`                      | Detail                                   |
| `supportQueryKeys.requests.articles(id)`                    | Conversation                             |
| `supportQueryKeys.requests.history(id, params)`             | History                                  |
| `supportQueryKeys.organizations.*` / `groups.*` / `users.*` | Directories                              |
| `supportQueryKeys.search(params)`                           | Search                                   |
| `supportQueryKeys.analytics()`                              | Analytics                                |

`clearSupportQueries(queryClient)` removes all Support caches (e.g. tenant change). Mutations invalidate the affected request/list/article keys.

---

## 18. Authorisation-aware UI

- Helpers in `permissions.ts` hide/disable controls (`canCreateSupportRequest`, `canTransitionSupportRequest`, etc.).
- Wildcards: `*`, `support.*`, `support.requests.*`.
- **Server is authoritative** — UI gating is UX only; 403 maps to safe messages.
- `SupportWorkspaceRouter` currently defaults UI permissions to `["support.*"]` for authenticated Support nav users; replace with effective permissions from Authorization when wiring is completed in a later milestone. API still enforces every call.

### Permissions / action visibility (summary)

| UI surface                 | Permission(s)                                       |
| -------------------------- | --------------------------------------------------- |
| Inbox / nav Support        | `support.requests.list`                             |
| Create request             | `support.requests.create`                           |
| Update fields / priority   | `support.requests.update`                           |
| Assign owner / customer    | `support.requests.assign`                           |
| Close / reopen / state     | `support.requests.transition`                       |
| List / create articles     | `support.articles.list` / `support.articles.create` |
| Organizations CRUD/archive | `support.organizations.*`                           |
| Groups CRUD                | `support.groups.*`                                  |
| Users list/read            | `support.users.list` / `support.users.read`         |
| Search                     | `support.search.execute`                            |
| Analytics                  | `support.analytics.read`                            |

Catalogue source: platform permission catalogue + `services/support/service.yaml`.

---

## 19. Tenant isolation

- Session + gateway supply tenant context; client does not select arbitrary tenants.
- Queries are session-scoped; `clearSupportQueries` on tenant switch prevents cross-tenant cache bleed.
- Platform IDs are tenant-scoped in mapping; UI never stitches cross-tenant engine IDs.

---

## 20. Accessibility notes

- Semantic forms, labels (`aria-label` on note/reply bodies), `role="alert"` for errors, `role="note"` for customer-reply warning.
- Confirm dialogs for destructive close.
- Keyboard-reachable buttons/inputs via shared `@apzhub/ui` primitives.
- Colour via design tokens (`var(--color-*)`) — not hardcoded brand colours.
- Playwright + component tests cover primary flows; formal UI a11y certification is **OSS-110-14**.

---

## 21. Responsive-design notes

- Flex/wrap layouts for command bars and metadata chips.
- Tables/lists use full workspace width; detail stacks conversation + composers vertically.
- Token-based spacing; no fixed desktop-only pixel grids for core flows.
- Target: usable on desktop workbench breakpoints first; mobile polish is not a certification claim of this milestone.

---

## 22. Privacy and safe-rendering rules

| Rule                        | Enforcement                                      |
| --------------------------- | ------------------------------------------------ |
| No raw HTML rendering       | No `dangerouslySetInnerHTML`; strip HTML to text |
| No engine leakage in errors | `SupportApiError` sanitisation                   |
| No secrets in UI            | Client never handles connector credentials       |
| Attachment metadata only    | No binary content in DOM                         |
| Internal vs public clarity  | Distinct composers + badges                      |
| Backend branding hidden     | Product name **Support** only                    |

Boundary tests fail the suite if `dangerouslySetInnerHTML` appears under Support UI paths.

---

## 23. Known certified limitations (honoured)

Inherited from OSS-110-12 / Wave 2 — **not** defects of this UI slice:

| Limitation                                | UI behaviour                                           |
| ----------------------------------------- | ------------------------------------------------------ |
| No binary attachment transfer             | Metadata + “Binary access not available”               |
| No Platform Event Bus                     | No live event-driven UI refresh from bus               |
| No webhook ingress                        | No webhook-driven realtime inbox                       |
| No notifications subsystem                | No Support notification panel wiring                   |
| No realtime                               | Poll/refetch via Query only; no WS/SSE Support channel |
| Vertical still CERTIFIED_WITH_LIMITATIONS | UI delivered; **UI not yet UI-certified**              |

---

## 24. Component map

| Component                  | Path                              | Role                                                   |
| -------------------------- | --------------------------------- | ------------------------------------------------------ |
| `SupportWorkspaceRouter`   | `support-workspace-router.tsx`    | Route → view                                           |
| `SupportInboxView`         | `support-inbox-view.tsx`          | Inbox                                                  |
| `SupportRequestDetailView` | `support-request-detail-view.tsx` | Detail                                                 |
| `SupportRequestCreateView` | `support-request-create-view.tsx` | Create                                                 |
| `SupportRequestCommands`   | `support-request-commands.tsx`    | Lifecycle commands                                     |
| `SupportConversation`      | `support-conversation.tsx`        | Articles                                               |
| `InternalNoteComposer`     | `internal-note-composer.tsx`      | Internal notes                                         |
| `CustomerReplyComposer`    | `customer-reply-composer.tsx`     | Customer replies                                       |
| `SupportOrganizationsView` | `support-organizations-view.tsx`  | Orgs                                                   |
| `SupportGroupsView`        | `support-groups-view.tsx`         | Groups                                                 |
| `SupportUsersView`         | `support-users-view.tsx`          | Users                                                  |
| `SupportSearchView`        | `support-search-view.tsx`         | Search                                                 |
| `SupportAnalyticsView`     | `support-analytics-view.tsx`      | Analytics                                              |
| `SupportLookupSelect`      | `support-lookup-select.tsx`       | Entity lookups                                         |
| Shared UI                  | `support-ui.tsx`                  | PageShell, badges, empty/loading, attachments, confirm |

Lib: `apps/web/lib/support/*` (client, keys, routes, permissions, sanitize, format, errors, types).

---

## 25. Testing notes

| Suite             | Evidence                                                                              |
| ----------------- | ------------------------------------------------------------------------------------- |
| Vitest Support UI | **72** tests — `apps/web/lib/support` + `apps/web/components/support`                 |
| Coverage (lines)  | **support-api.ts 100%**; **components/support ~93.3%**; **overall Support UI ~94.9%** |
| Boundary          | `scripts/support-ui-boundary-audit.mjs` PASS + architecture boundary test             |
| Playwright        | `testing/playwright/e2e/oss-110-13-support-module.spec.ts` (mocked `/api/v1`)         |
| Typecheck         | PASS (`apps/web`)                                                                     |
| Build             | FAIL pre-existing `/_global-error` prerender — unrelated to Support UI                |

---

## 26. Known build caveat

`pnpm build` for `apps/web` may fail on Next.js App Router `/_global-error` prerender. This is a **pre-existing** framework caveat documented since OSS-110-12. It is **not** introduced by Support UI and does not block runtime/dev use of Support routes.

---

## 27. Package versions

OSS-110-13 is a **web UI slice**. Do **not** bump:

- `@apzhub/integration-zammad`
- `@apzhub/platform-services`
- `@apzhub/platform-service-contracts`

`@apzhub/web` remains private workspace package (`0.0.0`).

---

## 28. Certification status (OSS-110-14)

**Outcome:** **PRODUCTION_READY_WITH_LIMITATIONS**

Master report: [SUPPORT-UI-CERTIFICATION.md](./SUPPORT-UI-CERTIFICATION.md) · Completion: [OSS-110-14-completion-report.md](../sprint/OSS-110-14-completion-report.md)

**Next:** Await owner approval for the next APZHUB domain or platform milestone (e.g. OSS-100-06, PCv2-02, QE-001). Do **not** invent a large Support UI feature milestone by default. Event Bus / webhook ingress / notifications / realtime / binary require separate approval.

---

## Companion documents

| Document                                                                  | Role                      |
| ------------------------------------------------------------------------- | ------------------------- |
| [SUPPORT-UI-CERTIFICATION.md](./SUPPORT-UI-CERTIFICATION.md)              | UI master certification   |
| [APZHUB Support User Guide](../guides/APZHUB-Support-User-Guide.md)       | Ops-facing how-to         |
| [OSS-110-13 Completion Report](../sprint/OSS-110-13-completion-report.md) | UI delivery closeout      |
| [OSS-110-14 Completion Report](../sprint/OSS-110-14-completion-report.md) | UI certification closeout |
| [SUPPORT-VERTICAL-CERTIFICATION.md](./SUPPORT-VERTICAL-CERTIFICATION.md)  | Vertical cert (API)       |
| [APZHUB-Support-HTTP-API.md](./APZHUB-Support-HTTP-API.md)                | API contract              |
| [workbench-framework.md](./workbench-framework.md)                        | Shell architecture        |
