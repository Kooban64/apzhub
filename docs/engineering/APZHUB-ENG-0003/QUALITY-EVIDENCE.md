# APZHUB-ENG-0003 — Quality Evidence

> **Programme:** APZHUB-ENG-0003  
> **Date:** 2026-07-20  
> **Scope:** R12-SUP-01 only

---

## Commands executed

| Gate               | Command                                                    | Result                          |
| ------------------ | ---------------------------------------------------------- | ------------------------------- |
| Typecheck          | `pnpm --filter @apzhub/integration-zammad typecheck`       | **PASS**                        |
| Typecheck          | `pnpm --filter @apzhub/platform-services typecheck`        | **PASS**                        |
| Typecheck          | `apps/web` `tsc --noEmit`                                  | **PASS**                        |
| Lint               | `pnpm --filter @apzhub/integration-zammad lint`            | **PASS**                        |
| Unit               | `pnpm --filter @apzhub/integration-zammad test`            | **PASS** (13 files / 121 tests) |
| Unit / integration | scoped SUP-01 + Wave 2 honesty                             | **PASS** (5 files / 20 tests)   |
| Architecture       | Dedicated Zammad route; ADR-0055 verifier; no SUP-02/03    | **PASS**                        |
| Compatibility      | Existing Support HTTP APIs unchanged; cert honesty updated | **PASS**                        |

### Scoped regression command (PASS)

```bash
pnpm exec vitest run --config vitest.config.ts \
  packages/platform-services/src/events/support-webhook-ingress-fanout.test.ts \
  apps/web/lib/api/v1/handlers/r12-sup-01-boundary.test.ts \
  integrations/zammad/src/events/zammad-webhook-ingress.test.ts \
  testing/wave2/wave2-adapter.e2e.test.ts \
  testing/wave2/wave2-certification.test.ts
```

---

## Test coverage (this programme)

| Suite                                                       | Focus                                                 |
| ----------------------------------------------------------- | ----------------------------------------------------- |
| `zammad-webhook-ingress.test.ts`                            | HMAC-SHA1 verify; ticket translate; attachment ignore |
| `support-webhook-ingress-fanout.test.ts`                    | Support catalogue event mapping                       |
| `r12-sup-01-boundary.test.ts`                               | Route + adapter exports                               |
| `zammad-operations.test.ts`                                 | Certification capability honesty (0.7.0 / ingress)    |
| `wave2-adapter.e2e.test.ts` / `wave2-certification.test.ts` | Wave 2 cert claims aligned to R12-SUP-01              |

---

## Architecture verification

| Rule                                 | Evidence                                                      |
| ------------------------------------ | ------------------------------------------------------------- |
| Adapter owns CE signature convention | `createZammadWebhookVerifier`                                 |
| Platform owns HTTP ingress           | `apps/web` route                                              |
| No Support redesign                  | Fan-out via existing domain event helpers                     |
| No binary attachments                | Attachment payloads ignored; `binaryAttachmentSupport: false` |
| No realtime                          | No WS/SSE                                                     |
| Cert honesty                         | `webhookIngressSupport: true`; `webhookHttpIngress` supported |
