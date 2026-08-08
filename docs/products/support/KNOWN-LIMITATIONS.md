# APZ Support — Known Limitations

> **Programme:** APZHUB-PRODUCTS-002 · Production baseline **1.0.0** (APZHUB-RELEASES-001 packaging)  
> **Product Definition Pack**  
> **Portfolio:** [support/](./README.md) · [RELEASES.md](./RELEASES.md)  
> **Evidence:** [docs/releases/support/1.0.0/](../../releases/support/1.0.0/README.md)  
> **Authority:** [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md) · Knowledge Foundation · repository disk  
> **Quality baseline:** [QA-002 PRODUCTION READY](../../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) (Owner ACCEPTED)  
> **Rule:** Do not invent functionality. Frozen architectures require ADR + Owner to change.

---

## Known limitations (repository-documented)

- API CERTIFIED_WITH_LIMITATIONS; UI PRODUCTION_READY_WITH_LIMITATIONS (OSS-110-14)
- Zammad webhook HTTP ingress available via Platform `POST /api/v1/integrations/zammad/webhooks` (R12-SUP-01 / APZHUB-ENG-0003 **ACCEPTED**)
- Binary attachment upload/download available via article create + `GET .../attachments/{attachmentId}` (R12-SUP-02 / APZHUB-ENG-0004 · Awaiting Acceptance); max **1 MiB**; attachment delete not exposed
- Support v1.0 product realtime: **not enabled** (honest none). Platform SSE may exist behind `APZHUB_REALTIME_SSE_ENABLED` / `NEXT_PUBLIC_APZHUB_REALTIME_SSE_ENABLED`; Support UI does not connect unless both are explicitly enabled. In-app ENF Attention notifications remain available — APZHUB-1.1-003. Unlock is Owner/ops enablement, not a Support 2.0 programme.
- Durable idempotency deferred (in-memory mapping in test envs)

## Resolved (Release 1.1 — APZHUB-1.1-003)

- Event Bus publish for Support operations — Support Platform Service publishes catalogue events (`support.request.*`, `support.article.created`)
- Support vertical in-app notifications via platform ENF Attention path (not a Support-owned notify subsystem)

## Honesty rule

Limitations must remain visible in certification and product docs. Do not silently treat limited surfaces as complete.
