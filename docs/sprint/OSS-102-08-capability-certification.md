# OSS-102-08 Capability Certification Matrix

> **Milestone:** OSS-102-08  
> **Adapter:** `@apzhub/integration-zammad` v0.6.0  
> **Minimum Zammad CE:** 6.3.0 (verified family 6.3.0–6.5.x)  
> **Date:** 2026-07-11  
> **Wave 2 outcome:** **CERTIFIED_WITH_LIMITATIONS**

Legend: **I** Implemented · **R** Registered · **T** Tested · **D** Documented · **C** Certified

---

## Capability matrix

| Capability | I | R | T | D | C | Optional | Status | Known limitations | Min Zammad | Future platform needs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Support requests | ✅ | ✅ | ✅ | ✅ | ✅ | No | available | No delete | 6.3.0 | Global-ID mapping; SupportService |
| Organisations | ✅ | ✅ | ✅ | ✅ | ✅ | No | available | No delete | 6.3.0 | Mapping + gateway |
| Groups | ✅ | ✅ | ✅ | ✅ | ✅ | No | available | No delete | 6.3.0 | Mapping + gateway |
| Support users | ✅ | ✅ | ✅ | ✅ | ✅ | No | available | No provisioning | 6.3.0 | Identity bridge |
| Articles | ✅ | ✅ | ✅ | ✅ | ✅ | No | available | No update/delete; metadata only | 6.3.0 | Mapping |
| Attachment metadata | ✅ | ✅ | ✅ | ✅ | ✅ | No | via articles | Binary transfer **not** certified | 6.3.0 | Binary transfer later |
| Search | ✅ | ✅ | ✅ | ✅ | ✅ | Yes | available | Read-only; no semantic search | 6.3.0 | Platform Search provider |
| History | ✅ | ✅ | ✅ | ✅ | ✅ | Yes | available | Read-only | 6.3.0 | Activity stream optional |
| Analytics | ✅ | ✅ | ✅ | ✅ | ✅ | Yes | available | Heuristic; not authoritative SLA | 6.3.0 | Reporting service optional |
| Events | ✅ | ✅ | ✅ | ✅ | ✅ | No | available | Translation only; no Event Bus | 6.3.0 | Event Bus publish |
| Synchronisation | ✅ | ✅ | ✅ | ✅ | ✅ | No | available | In-memory; no article sync | 6.3.0 | Persistent state + workers |
| Webhooks | ✅ | ✅ | ✅ | ✅ | ✅ | Yes | available | Registration only; no ingress | 6.3.0 | HTTP ingress |
| Diagnostics | ✅ | ✅ | ✅ | ✅ | ✅ | No | available | Secret-free | 6.3.0 | Admin console |
| Health | ✅ | ✅ | ✅ | ✅ | ✅ | No | available | 4-level model | 6.3.0 | Ops console |
| Readiness | ✅ | ✅ | ✅ | ✅ | ✅ | No | available | Webhook/metrics optional | 6.3.0 | Ops console |
| Compatibility | ✅ | ✅ | ✅ | ✅ | ✅ | No | available | 6.3.0–6.5.x | 6.3.0 | Range expansion needs evidence |
| Operational reports | ✅ | ✅ | ✅ | ✅ | ✅ | No | available | Adapter-side only | 6.3.0 | Admin tooling |
| Binary attachments | ❌ | ❌ | ✅ | ✅ | ❌ | Yes | unavailable | Explicitly out of scope | — | Future milestone |
| Webhook ingress | ❌ | ❌ | ✅ | ✅ | ❌ | Yes | unavailable | Explicitly out of scope | — | Future milestone |
| Platform Event Bus | ❌ | ❌ | ✅ | ✅ | ❌ | Yes | unavailable | Explicitly out of scope | — | Future milestone |
| Persistent sync state | ❌ | ❌ | ✅ | ✅ | ❌ | Yes | unavailable | Explicitly out of scope | — | Future milestone |
| PlatformService / HTTP / UI | ❌ | ❌ | ✅ | ✅ | ❌ | — | unavailable | Explicitly out of Wave 2 | — | OSS-110-10+ sequence |

---

## Unsupported / not certified (must remain uncertified)

- Binary attachment upload/download
- Webhook HTTP ingress
- Platform Event Bus publication
- Persistent synchronisation state
- Platform SupportService / gateway / HTTP / UI

---

## Certification statement

All implemented Wave 2 Support-domain capabilities above are **Implemented, Registered, Tested, Documented, and Certified** at the adapter boundary with accurate limitation labelling. Wave 2 closes as **CERTIFIED_WITH_LIMITATIONS**.
