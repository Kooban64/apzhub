# APZHUB-ENG-0003 — Implementation Summary

> **Programme:** APZHUB-ENG-0003  
> **Title:** Implement R12-SUP-01 — Support webhook ingress (CE)  
> **Classification:** ENGINEERING  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform **1.2.0** (packaging unchanged)  
> **Date:** 2026-07-20  
> **Status:** Complete — **Awaiting Acceptance**

---

## Selected backlog item

| Field               | Value                                                                                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Identifier**      | **R12-SUP-01**                                                                                                                                                                   |
| **Title**           | Support webhook ingress (CE)                                                                                                                                                     |
| **Selection basis** | Rank **3** in [ENGINEERING-CANDIDATES](../../product-lifecycle/backlog/ENGINEERING-CANDIDATES.md) immediately after R12-PERSIST-02; Ready=YES; dependencies met; not implemented |
| **Dependencies**    | Zammad CE + Support services — **satisfied**                                                                                                                                     |

---

## Scope delivered

| Item                          | Result                                     |
| ----------------------------- | ------------------------------------------ |
| R12-SUP-01                    | **Implemented**                            |
| R12-SUP-02 binary attachments | **Excluded** (attachment webhooks ignored) |
| R12-SUP-03 realtime WS/SSE    | **Excluded**                               |
| Support redesign              | **None**                                   |

---

## Technical changes

1. **Zammad CE verifier** — HMAC-SHA1 / `X-Hub-Signature` (`createZammadWebhookVerifier`).
2. **Pipeline translator** — wraps existing `translateZammadWebhookToSourceEvent`; ignores attachment events.
3. **Ingress pipeline** — SDK `createWebhookProcessingPipeline` + Zammad decoder (prefers `X-Zammad-Delivery`).
4. **HTTP route** — `POST /api/v1/integrations/zammad/webhooks` (signature-gated).
5. **Support fan-out** — maps accepted source events → Support catalogue domain events (notify path; no SoR write-back).
6. **Certification honesty** — webhooks/events capabilities updated; `@apzhub/integration-zammad` **0.7.0**.

---

## Repository impact

| Area                         | Impact                                     |
| ---------------------------- | ------------------------------------------ |
| `@apzhub/integration-zammad` | **0.7.0** — verifier, translator, pipeline |
| `@apzhub/platform-services`  | Support ingress fan-out helper             |
| `apps/web`                   | Zammad webhook ingress route + handler     |
| APZ Support (commercial)     | Ticket ingest via webhook (CB-03)          |
| Platform **1.2.0** packaging | **Unchanged**                              |

---

## SemVer impact

- `@apzhub/integration-zammad` **0.6.0 → 0.7.0** (additive ingress capability).
- Public Support ticket HTTP APIs unchanged.

---

## Env

| Variable                         | Purpose                                                             |
| -------------------------------- | ------------------------------------------------------------------- |
| `ZAMMAD_WEBHOOK_SIGNATURE_TOKEN` | CE `signature_token` for HMAC verification (required in production) |

---

## Recommendation

# READY FOR OWNER ACCEPTANCE
