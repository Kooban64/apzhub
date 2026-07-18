# APZHUB Notification — Future Delivery Framework Guide

**Milestone:** APZNOTIFY-006  
**Status:** Guidance only — **do not implement** delivery providers without owner approval  
**Roadmap item:** **APZNOTIFY-007 — Notification Delivery Provider Framework (SMTP, SES, SMS, Push, Teams, Slack, Webhooks)**

---

## Intent

This guide explains how a **future** Notification delivery plane should be shaped. It is **not** an implementation authorisation.

The frozen metadata SoR (APZNOTIFY-001…006) remains authoritative for notification records. Delivery must never become a second SoR for notification identity or lifecycle.

## Prerequisites (when approved)

1. Owner-approved APZNOTIFY-007 (or successor) sprint guide
2. Read frozen Notification architecture + [Architecture Freeze Notice](../architecture/APZHUB-Notification-Architecture-Freeze-Notice.md)
3. Read Integration SDK (026) + Platform Service SDK (027) + Event SDK (029) as applicable
4. ADR for any deviation from frozen contracts / Gateway / HTTP surfaces

## Recommended sequence (when approved)

1. Provider contracts + `integration.yaml` per channel (SMTP, SES, SMS, Push, Teams, Slack, Webhooks)
2. Secrets in integration boundary only — never in Workbench or typed client
3. Platform Services orchestration for _dispatch_ — still via `gateway.notification.*` (or explicitly approved successor facet)
4. Async workers / queues / Event Bus only if milestone authorises (never in request handlers)
5. HTTP + OpenAPI + typed client extensions only if milestone authorises
6. Workbench delivery diagnostics only if milestone authorises — retain metadata SoR boundaries
7. Vertical / wave certification update

## Non-negotiables

- No Workbench → provider bypass
- No HTTP → provider / persistence bypass
- No Core business-rule collapse into UI
- Product-neutral user-facing names
- CE / self-hosted first
- Preserve backward compatibility of frozen metadata APIs or use ADR
- Recipients remain privacy-safe (no credential leakage)

## Provider examples (documentation only)

| Provider class | Examples                        |
| -------------- | ------------------------------- |
| Email          | SMTP, SES                       |
| SMS            | Carrier / OSS SMS gateways      |
| Push           | Web Push / mobile push adapters |
| Collaboration  | Teams, Slack                    |
| Generic        | Webhooks                        |

## Copy the pattern, not the vendor

Delivery adapters must follow Integration SDK shapes. Metadata SoR ownership stays in Notification Core / Persistence.
