# OSS-110-14 Architecture Audit — Support Module UI

> **Milestone:** OSS-110-14 — Support Module UI Certification & Production Readiness  
> **Date:** 2026-07-11  
> **Verdict:** **PASS**  
> **Standard:** APZHUB Engineering Constitution (000) + Foundation Docs (001–029)  
> **Architecture reference:** [APZHUB-Support-Module-UI.md](../architecture/APZHUB-Support-Module-UI.md)

---

## Audit checklist

| #   | Criterion                                                                                                  | Verdict | Notes                                                                           |
| --- | ---------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------- |
| 1   | Workbench integration via permanent shell (Header / Activity Bar / Sidebar / Workspace / Status Bar)       | ✅ PASS | `WorkbenchPage` hosts Support inside `DesktopShell`                             |
| 2   | Navigation registration is manifest-driven (not hardcoded shell entries)                                   | ✅ PASS | Activity Bar / Sidebar from `services/support/manifests/**`                     |
| 3   | Manifest registration — `services/support/service.yaml` + module manifests present                         | ✅ PASS | Service + 7 module manifests                                                    |
| 4   | Parent Support module **enabled** on Activity Bar (`life-buoy`, workspace `support`)                       | ✅ PASS | `manifests/support/module.yaml` — `status: enabled`, route `/workspace/support` |
| 5   | Sidebar modules registered (requests, organizations, groups, users, search, analytics)                     | ✅ PASS | All six sidebar manifests `enabled` with correct routes/permissions             |
| 6   | View / workspace routing via `SupportWorkspaceRouter` + `resolveSupportRoute`                              | ✅ PASS | Inbox, create, detail, orgs, groups, users, search, analytics                   |
| 7   | `workbench-page.tsx` wires `isSupportRoute(pathname)` → `<SupportWorkspaceRouter />`                       | ✅ PASS | Confirmed in `apps/web/components/workbench-page.tsx`                           |
| 8   | Typed frontend client only (`apps/web/lib/support/support-api.ts`)                                         | ✅ PASS | Named operations; envelope parse; `credentials: "include"`                      |
| 9   | Client calls **only** `/api/v1` (`API_BASE = "/api/v1"`)                                                   | ✅ PASS | Certification audit check `support-api-v1`                                      |
| 10  | No `PlatformServiceGateway` / `getPlatformServiceGateway` imports in UI                                    | ✅ PASS | Boundary + certification audits                                                 |
| 11  | No provider imports (`providers/zammad`, integration packages)                                             | ✅ PASS | Zero hits in UI roots                                                           |
| 12  | No adapter / `@apzhub/integration-zammad` imports in UI                                                    | ✅ PASS | Zero hits                                                                       |
| 13  | No mapping-store imports (`EntityMappingStore`, entity-mapping)                                            | ✅ PASS | Zero hits                                                                       |
| 14  | No database / drizzle / postgres imports in UI                                                             | ✅ PASS | Zero hits                                                                       |
| 15  | No `@apzhub/platform-services` implementation imports in UI                                                | ✅ PASS | Contracts types only in `types.ts` (allowed)                                    |
| 16  | Full chain: UI → client → `/api/v1` → gateway → pipeline → authz → services → mapping → provider → adapter | ✅ PASS | UI stops at `/api/v1`; vertical layers certified OSS-110-12                     |
| 17  | Internal note safety — separate composer; `visibility=internal` forced                                     | ✅ PASS | `InternalNoteComposer` hidden field; no public override                         |
| 18  | Customer reply safety — separate composer; customer-visible warning                                        | ✅ PASS | `CustomerReplyComposer` warning banner (`role="note"`)                          |
| 19  | Attachment metadata only — no upload/download/preview/binary transfer UI                                   | ✅ PASS | `AttachmentMetadataList` + “Binary access not available”                        |
| 20  | No Event Bus / webhook / realtime Support UI surfaces                                                      | ✅ PASS | Out-of-scope patterns absent                                                    |
| 21  | No provider-native ID patterns in display code (`_zammad_`, `s*_zammad_*`)                                 | ✅ PASS | Scan clean on non-test UI files                                                 |
| 22  | No `dangerouslySetInnerHTML`; article bodies sanitized to text                                             | ✅ PASS | `sanitize-article-body.ts` + boundary rule                                      |
| 23  | Engine branding hidden (product name **Support** only)                                                     | ✅ PASS | No `zammad` labels in presentation (sanitizer allowlist only)                   |
| 24  | Static certification audit script PASS                                                                     | ✅ PASS | `node scripts/support-ui-certification-audit.mjs`                               |
| 25  | Companion UI boundary audit PASS                                                                           | ✅ PASS | `node scripts/support-ui-boundary-audit.mjs`                                    |
| 26  | Vertical dependency audit still PASS (HTTP / providers / service impls)                                    | ✅ PASS | `node scripts/support-vertical-dependency-audit.mjs` — 0 violations             |

---

## Execution chain (verified)

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

No UI bypass to gateway, providers, mapping, adapters, or engines.

---

## Scope summary

| Component           | Location                                                   | Status                             |
| ------------------- | ---------------------------------------------------------- | ---------------------------------- |
| Activity Bar module | `services/support/manifests/support/module.yaml`           | ✅ Enabled                         |
| Sidebar modules (6) | `services/support/manifests/support-*/module.yaml`         | ✅ Enabled                         |
| Service manifest    | `services/support/service.yaml`                            | ✅ Present                         |
| Workbench wiring    | `apps/web/components/workbench-page.tsx`                   | ✅ Wired                           |
| Workspace router    | `apps/web/components/support/support-workspace-router.tsx` | ✅ Present                         |
| Typed API client    | `apps/web/lib/support/support-api.ts`                      | ✅ `/api/v1` only                  |
| Presentation views  | `apps/web/components/support/*`                            | ✅ Inbox → analytics               |
| Support lib helpers | `apps/web/lib/support/*`                                   | ✅ Routes, perms, sanitize, errors |

---

## Accepted limitations (not defects)

Inherited from OSS-110-12 / Wave 2 — honoured by the UI:

| Limitation                          | UI behaviour                             |
| ----------------------------------- | ---------------------------------------- |
| No binary attachment transfer       | Metadata + “Binary access not available” |
| No Platform Event Bus               | No bus-driven UI refresh                 |
| No webhook ingress                  | No webhook-driven inbox                  |
| No notifications subsystem          | No Support notification panel wiring     |
| No realtime (WS/SSE)                | TanStack Query poll/refetch only         |
| Vertical CERTIFIED_WITH_LIMITATIONS | API vertical cert unchanged              |

---

## Dependency audit reference

- **Script:** `scripts/support-ui-certification-audit.mjs`
- **Output:** `docs/sprint/OSS-110-14-dependency-audit.md` / `.json`
- **UI boundary:** `scripts/support-ui-boundary-audit.mjs` — PASS
- **Vertical (API) dependency:** `scripts/support-vertical-dependency-audit.mjs` — PASS (still)
- **Verdict:** PASS (0 violations)

---

## Recommendation

Support Module UI is **architecturally sound** for UI certification within documented limitations. No boundary defects requiring product UI changes.

Proceed to remaining OSS-110-14 certification evidence (Playwright, a11y, coverage, master certification doc) under parent milestone ownership.
