# APZ Documents — Integrations (Release 1.0 Planning)

> **Programme:** APZ-DOCUMENTS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Authority:** [INTEGRATION-PRODUCT-CAPABILITY-INVENTORY](../../foundation/INTEGRATION-PRODUCT-CAPABILITY-INVENTORY.md) · APZDOCS freeze

---

## Strategy summary

| Approach        | Release 1.0                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------- |
| Document SoR    | **Native platform** (APZDOCS) — System of Record for document metadata                       |
| External DMS    | **Not required** — Paperless-ngx **absent**; explicitly **out of scope**                     |
| Storage         | Platform `@apzhub/document-storage` providers (filesystem · S3-compatible · memory)          |
| Search          | `@apzhub/search-documents` publication into Platform Search (frozen Search Publication wave) |
| Integration SDK | **1.0.0** Architecture Frozen — no new public SDK API from this programme                    |

---

## Provider table

| Provider                                     | Role                                | CE/self-hosted | Status                                                                    |
| -------------------------------------------- | ----------------------------------- | -------------- | ------------------------------------------------------------------------- |
| Native Document Core / Persistence / Storage | SoR + storage coordination          | Yes            | **On disk** · APZDOCS-006 PRWL · frozen                                   |
| Paperless-ngx                                | Historical OSS catalogue DMS option | CE             | **ABSENT** — no `integrations/paperless*` · **excluded from Release 1.0** |
| Azure Blob / GCS                             | Cloud object storage                | Cloud          | **Not certified** for Documents vertical                                  |

---

## Adapter rules (when any future provider is authorised)

1. `integration.yaml` before code under `integrations/{provider}/`
2. Service Connector only — no business logic
3. Modules never import adapter clients
4. Engine brand names never appear in user-facing UI
5. Error translation + health via Integration SDK

---

## Cross-product integration (planning)

| Product / capability            | Release 1.0 expectation                                                                                    |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Identity / AuthZ                | **Required** — BetterAuth session + `document.*` permissions                                               |
| Search                          | **Present** — search-documents publication; Unified Search consumes index                                  |
| Workflow                        | **Optional / later** — no Documents 1.0 dependency on Workflow execute plane                               |
| Analytics                       | **Optional / later** — no Documents 1.0 dependency on Analytics product                                    |
| Projects / Support / Time / Law | **Consumers** of Documents patterns/APIs as already designed — commercial packaging does not redesign them |

See [PLATFORM-ALIGNMENT.md](./PLATFORM-ALIGNMENT.md).

---

## Status

Documented against disk: present versions are authoritative; **ABSENT** means not on disk. This programme does **not** create Paperless or any new integration package.
