# APZHUB Testing Typed Client Architecture

**Purpose:** Describe the production Testing workbench client boundary after APZTCMS-012.  
**Audience:** Frontend engineers, platform engineers, AI agents.  
**Authority:** [005 Desktop Framework](../005-desktop-environment-framework-shell-architecture.md) · [APZ TCMS Testing Workbench Architecture](./APZHUB-APZ-TCMS-Testing-Workbench-Architecture.md)  
**Status:** Implemented — APZTCMS-012 complete.  
**Last updated:** 2026-07-12

---

## Client Boundary

`apps/web/lib/testing/client.ts` defines the `TestingClient` interface used by Testing views and commands. Components do not import platform services, testing domain services, persistence packages, repositories, or route handlers.

Default transport selection:

- `NODE_ENV=test`: `createMockTestingClient()` for deterministic unit/component tests.
- Other environments: `createHttpTestingClient()` against `/api/v1/testing/**`.

`setTestingClient()` remains available for tests and story-level overrides.

---

## HTTP Transport

`apps/web/lib/testing/http-client.ts` is the only Testing client file allowed to call `/api/v1/testing`. It:

- Rejects paths outside `/testing/`.
- Sends `credentials: "include"`.
- Passes `AbortSignal` and optional correlation IDs.
- Parses standard API v1 success and collection envelopes.
- Converts error envelopes into `TestingClientError` with status, code, correlation ID, and request ID.
- Maps HTTP payloads into presentation view models, not domain entities.

---

## Boundary Tests

`apps/web/components/testing/testing-architecture-boundary.test.ts` enforces:

- UI components do not call REST directly.
- The HTTP client is scoped to `/api/v1/testing`.
- UI/client files do not import `@apzhub/platform-services`, `@apzhub/testing-services`, or `testing-persistence`.
- No binary evidence route and no AI folders are introduced.
