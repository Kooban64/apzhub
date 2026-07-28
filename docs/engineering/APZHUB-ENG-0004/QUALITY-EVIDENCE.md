# APZHUB-ENG-0004 — Quality Evidence

> **Programme:** APZHUB-ENG-0004  
> **Date:** 2026-07-20  
> **Scope:** R12-SUP-02 only

---

## Commands executed

| Gate                            | Command                                              | Result                          |
| ------------------------------- | ---------------------------------------------------- | ------------------------------- |
| Typecheck                       | `pnpm --filter @apzhub/integration-zammad typecheck` | **PASS**                        |
| Typecheck                       | `pnpm --filter @apzhub/platform-services typecheck`  | **PASS**                        |
| Typecheck                       | `apps/web` `tsc --noEmit`                            | **PASS**                        |
| Lint                            | `pnpm --filter @apzhub/integration-zammad lint`      | **PASS**                        |
| Unit                            | `pnpm --filter @apzhub/integration-zammad test`      | **PASS** (13 files / 121 tests) |
| Unit / integration / regression | scoped SUP-02 + Wave 2 + Support HTTP/UI             | **PASS** (7 files / 69 tests)   |
| Architecture                    | Service→connector path; SDK freeze respected         | **PASS**                        |
| Compatibility                   | Support APIs additive; delete still unsupported      | **PASS**                        |
| Certification                   | Wave 2 e2e + certification honesty                   | **PASS**                        |

### Scoped regression command (PASS)

```bash
pnpm exec vitest run --config vitest.config.ts \
  testing/wave2/wave2-adapter.e2e.test.ts \
  testing/wave2/wave2-certification.test.ts \
  packages/platform-services/src/events/support-webhook-ingress-fanout.test.ts \
  apps/web/lib/api/v1/platform-api.support.v1.test.ts \
  apps/web/components/support/support-conversation.test.tsx \
  apps/web/components/support/support-ui.test.tsx \
  apps/web/components/support/internal-note-composer.test.tsx
```

---

## Architecture verification

| Rule                        | Evidence                             |
| --------------------------- | ------------------------------------ |
| No Integration SDK unfreeze | Binary via adapter-local `fetchFn`   |
| Platform owns HTTP          | `apps/web` download route            |
| No Support redesign         | Additive attach/download only        |
| No realtime                 | No WS/SSE                            |
| Delete excluded             | `deleteBinaryAttachment` unsupported |
