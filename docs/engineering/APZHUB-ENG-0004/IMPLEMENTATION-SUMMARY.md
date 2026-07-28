# APZHUB-ENG-0004 — Implementation Summary

> **Programme:** APZHUB-ENG-0004  
> **Title:** Implement R12-SUP-02 — Support binary attachments (CE)  
> **Classification:** ENGINEERING  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform **1.2.0** (packaging unchanged)  
> **Date:** 2026-07-20  
> **Status:** **ACCEPTED / CLOSED**

---

## Selected backlog item

| Field                | Value                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Identifier**       | **R12-SUP-02**                                                                                                  |
| **Title**            | Support binary attachments (CE)                                                                                 |
| **Category**         | Integration / Customer Enhancement                                                                              |
| **Selection basis**  | Rank **4** in ENGINEERING-CANDIDATES immediately after R12-SUP-01; Ready=YES; dependencies met; not implemented |
| **Dependencies**     | Zammad CE + Support services — **satisfied** (SUP-01 ACCEPTED)                                                  |
| **Customer backlog** | CB-04 · PL12-KL-05                                                                                              |

---

## Scope delivered

| Item                                    | Result                                 |
| --------------------------------------- | -------------------------------------- |
| R12-SUP-02 binary upload/download       | **Implemented**                        |
| Attachment webhook metadata translation | **Implemented** (no binary in webhook) |
| Attachment delete                       | **Excluded** (CE limitation)           |
| R12-SUP-03 realtime WS/SSE              | **Excluded**                           |
| Support redesign                        | **None**                               |

---

## Technical changes

1. **Zammad CE download** — `GET /api/v1/ticket_attachment/...` via adapter-local fetch (Integration SDK JSON transport unchanged / freeze respected).
2. **Upload** — inline base64 on article create note/reply (max **1 MiB**).
3. **Platform contracts** — `SupportArticleService.downloadAttachment` + `SupportArticleAttachmentContent`.
4. **HTTP** — `GET .../articles/{articleId}/attachments/{attachmentId}`; note/reply bodies accept `attachments[]`.
5. **UI** — composers file picker; conversation Download action.
6. **Certification** — `binaryAttachmentSupport: true`; attachments capability certified; placeholders cleared.
7. **SemVer** — `@apzhub/integration-zammad` **0.8.0**; `@apzhub/platform-service-contracts` **0.18.0**; `@apzhub/platform-services` **0.30.0**.

---

## Repository impact

| Area                                 | Impact                                  |
| ------------------------------------ | --------------------------------------- |
| `@apzhub/integration-zammad`         | **0.8.0** — download + cert honesty     |
| `@apzhub/platform-service-contracts` | **0.18.0** — download contract          |
| `@apzhub/platform-services`          | **0.30.0** — service + ID normalisation |
| `apps/web`                           | HTTP + Support UI                       |
| APZ Support (commercial)             | Attach files on tickets (CB-04)         |
| Platform **1.2.0** packaging         | **Unchanged**                           |

---

## Architecture impact

- Module → Platform Service → Zammad connector → engine preserved.
- Binary stays out of Integration SDK core (adapter-local fetch).
- Attachment IDs normalised to `satt_` + 32-hex at Platform Service boundary.
- No SoR duplication of file bytes in platform PostgreSQL.

---

## Recommendation

# ACCEPTED / CLOSED

Owner Decision recorded with APZHUB-ENG-0005 programme approval (2026-07-20).
