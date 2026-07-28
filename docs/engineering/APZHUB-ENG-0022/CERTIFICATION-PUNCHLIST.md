# APZHUB-ENG-0022 — Certification Punch List

> **Source:** APZHUB-QA-CERT-002 residuals  
> **Baseline:** Platform **1.2.0**  
> **Date:** 2026-07-21

---

## Group A — Repository Lint

| Field             | Value                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| Symptom           | `pnpm lint` FAIL — 2× `no-useless-escape`                             |
| Location          | `scripts/apzworkflow-001-workflow-foundation-audit.mjs` line 92       |
| Resolution        | Remove unnecessary `\"` escapes inside regex character class / string |
| Functional change | None                                                                  |
| Status            | **REMEDIATED**                                                        |

## Group B — Zammad Capability Certification

| Field           | Value                                                                        |
| --------------- | ---------------------------------------------------------------------------- |
| Symptom         | Vitest expected `discoverCapabilities().length === 12`, received **11**      |
| Source of truth | `ZAMMAD_CORE_SERVICE_CAPABILITIES` / `ZammadCoreServiceId` — **11** services |
| Resolution      | Correct test expectation to **11** (do not invent a 12th capability)         |
| Status          | **REMEDIATED**                                                               |

## Group C — Law API Documentation Routes

| Field                 | Value                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| Symptom               | Playwright 404 on OpenAPI YAML/JSON, developer guide, Law health                                 |
| Architecture decision | **A — belong in `apps/web`** (LAW-014-07; middleware public paths; existing App Router handlers) |
| Resolution            | Verified repository-approved routes; no duplication; suite **6/6 PASS**                          |
| Status                | **VERIFIED / CLOSED**                                                                            |

## Group D — Workbench Navigation

| Field        | Value                                                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Symptom      | Analytics / Projects / Time detail navigation rewound to `/workspace/home`; Configuration `cfg_pw` strict-mode locator |
| Root cause   | Exact-only `resolveViewIdForRoute` left Home focused on product deep links; shell sync effect rewound URL              |
| Platform fix | Longest-prefix view resolution in `@apzhub/workbench-framework`                                                        |
| Locator fix  | Configuration workbench uses `getByRole('cell', { name: 'cfg_pw' })`                                                   |
| Status       | **REMEDIATED**                                                                                                         |

## Group E — SPR-003 Personalisation persistence

| Field      | Value                                                                                              |
| ---------- | -------------------------------------------------------------------------------------------------- |
| Symptom    | Expected persisted `focusedViewId` `platform-home-overview`, received `null`                       |
| Root cause | Debounced persist dropped on teardown; test polled without awaiting PUT                            |
| Resolution | Flush pending persist + `flushPendingPersist()`; SessionStore checks PUT; E2E waits for layout PUT |
| Status     | **REMEDIATED**                                                                                     |
