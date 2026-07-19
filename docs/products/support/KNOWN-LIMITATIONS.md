# APZ Support — Known Limitations

> **Programme:** APZHUB-PRODUCTS-002  
> **Product Definition Pack**  
> **Portfolio:** [support/](./README.md)  
> **Classification:** Documentation only — no implementation authorised  
> **Authority:** [APZHUB-PRODUCT-PORTFOLIO](../APZHUB-PRODUCT-PORTFOLIO.md) · Knowledge Foundation · repository disk  
> **Quality baseline:** [QA-002 PRODUCTION READY](../../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) (Owner ACCEPTED)  
> **Rule:** Do not invent functionality. Frozen architectures require ADR + Owner to change.

---

## Known limitations (repository-documented)

- API CERTIFIED_WITH_LIMITATIONS; UI PRODUCTION_READY_WITH_LIMITATIONS (OSS-110-14)
- No Event Bus publish for Support operations
- No Zammad webhook HTTP ingress
- No binary attachments
- No notifications/realtime for Support vertical as certified
- Durable idempotency deferred (in-memory mapping in test envs)

## Honesty rule

Limitations must remain visible in certification and product docs. Do not silently treat limited surfaces as complete.
