# APZHUB-ENG-0006 — Remediation Evidence

> **Programme:** APZHUB-ENG-0006  
> **Groups:** RG-HEALTH-503 → RG-AUTH-SHELL  
> **Date:** 2026-07-20

---

## Before (APZHUB-ENG-0005 / QA-RECERT-001)

| Group                | Failures |
| -------------------- | -------: |
| RG-HEALTH-503        |        6 |
| RG-AUTH-SHELL        |       20 |
| **Total authorised** |   **26** |

Primary signals: `/api/health` **503**; Better Auth `Invalid password`; shell never reached Home.

---

## After (this programme)

| Group         | Remaining hard fails | Notes                                                   |
| ------------- | -------------------: | ------------------------------------------------------- |
| RG-HEALTH-503 |                **0** | All 6 health certs PASS                                 |
| RG-AUTH-SHELL |                **4** | Auth seed works; residual session/palette/knowledge nav |

Scoped suite snapshot: **22 passed · 8 flaky · 4 failed** (~10.4m).

---

## Residual failures (not RG-HEALTH; post-auth UI)

| Spec                      | Failure                                                   | Classification                |
| ------------------------- | --------------------------------------------------------- | ----------------------------- |
| spr-003 context selection | localStorage `focusedViewId` null                         | Workbench session persistence |
| spr-003 session restore   | Overview heading missing after reload                     | Workbench session restore     |
| spr-004 palette execute   | dialog not visible after Ctrl+Shift+P                     | Command palette timing/UI     |
| spr-005 knowledge nav     | URL `/workspace/administration/overview` vs home overview | Knowledge→nav routing         |

These remain candidates for a **separate** Owner-approved remediation (not ENG-0006 expansion).

---

## Fixes applied (evidence trail)

1. `integrations/n8n/integration.yaml` — `supportedApiVersion: "v1"`
2. Playwright webServer env merge — `testing/playwright/web-server-env.ts`
3. globalSetup health + DEV auth — `testing/playwright/global-setup.ts`
4. Shared `signInDevUser` — `testing/playwright/e2e/auth-helpers.ts`
