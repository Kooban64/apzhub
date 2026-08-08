# APS-002 — Finite Platform Service Inventory

| Field               | Value                                                                                |
| ------------------- | ------------------------------------------------------------------------------------ |
| Document            | **APS-002**                                                                          |
| Status              | **PROPOSED — awaiting Owner Accept**                                                 |
| Timestamp           | 20260808T232000Z                                                                     |
| Prerequisite        | [OWNER-ACCEPT-APS-001.md](./OWNER-ACCEPT-APS-001.md)                                 |
| Derived from        | [APS-001-PLATFORM-SERVICES-ASSESSMENT.md](./APS-001-PLATFORM-SERVICES-ASSESSMENT.md) |
| Programme objective | **Certify and rationalise the Platform Service Layer**                               |
| Engineering         | **Not authorised** until Owner Accept of this inventory                              |

---

## Rules that constrain this inventory

1. **Two-Consumer Rule** — ≥2 Production Ready products **or** Constitution-declared platform responsibility.
2. **No expansion by usefulness** — useful ≠ platform.
3. **Ownership defects over missing capabilities** — prefer certify / correct / reclassify over invent.
4. **Machinery ≠ Service** — users may experience it; products must consume it as a service for it to qualify.
5. **AI/RAG out** — Programme 003 only.

---

## Finite inventory (proposed)

Seven Platform Services. No more.

| ID           | Platform Service    | Primary evidence today                                                | APS-002 action class                                    |
| ------------ | ------------------- | --------------------------------------------------------------------- | ------------------------------------------------------- |
| **APS-S-01** | **Search**          | APE-Search · `@apzhub/search-orchestrator` · multi-product adapters   | **Certify**                                             |
| **APS-S-02** | **Notifications**   | APE-Notify · ENF + `notification-*` · multi-product                   | **Certify** (+ ownership hygiene vs QEP parallel)       |
| **APS-S-03** | **Command**         | APE-Command · `@apzhub/command-framework` · shell + products          | **Certify** (+ ownership hygiene vs `qep-command`)      |
| **APS-S-04** | **Activity**        | APE-Activity · shell-owned · Constitution-declared                    | **Certify** (consumption gaps OK; no redesign)          |
| **APS-S-05** | **Personalisation** | `@apzhub/platform-personalisation` (prefs, favorites, recent, layout) | **Consolidate / Certify**                               |
| **APS-S-06** | **Realtime**        | APE-Realtime · Support + shell · Constitution-declared                | **Certify**                                             |
| **APS-S-07** | **Audit**           | APE-Audit facade · Constitution / ADR-PE-0001                         | **Certify** (facade; domain SoRs remain product/domain) |

---

## Platform machinery (not inventory rows)

These are real and important. They are **not** Platform Services in this inventory.

| Machinery                            | Why excluded from APS inventory                                                           |
| ------------------------------------ | ----------------------------------------------------------------------------------------- |
| Registry / Runtime                   | Capability discovery infrastructure                                                       |
| Workbench / Navigation               | Shell machinery — users experience it; products do not consume a Nav service              |
| Events / Outbox / Processing         | Delivery substrate for services & integrations                                            |
| Integration SDK                      | Adapter engine — provider boundary, not a UX Platform Service                             |
| Configuration engine                 | Platform infrastructure (may underpin Personalisation/Flags; not a separate APS row here) |
| Feature Flags (governance)           | Platform infrastructure / control plane                                                   |
| Identity / Authorization / Security  | Platform control plane — foundation, not Programme 002 UX service layer                   |
| `platform-services` umbrella package | Composition host — implementation detail                                                  |

Clarification of Registry/Workbench overlap belongs in certification docs, not as a new service.

---

## Explicitly removed from inventory

| Candidate                   | Disposition                                                                    |
| --------------------------- | ------------------------------------------------------------------------------ |
| Universal Inbox             | **Removed** — notification inbox is a Notify surface; Support inbox is product |
| Presence                    | **Removed** — no code, no consumers                                            |
| Distinct Navigation Service | **Removed** — machinery                                                        |
| APE-AI / APE-RAG            | **Deferred** — Programme 003                                                   |

---

## Reclassify or promote later (not in APS-002 finite set)

Fail Two-Consumer Rule today — **out of inventory** until evidence changes:

| Package / area                                                                                                                                   | Disposition                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `platform-automation`, `platform-orchestration`, `platform-scm`, `platform-quality-intelligence`, `platform-dashboard`, `platform-visualization` | **Reclassify** as QEP/product-elevated until ≥2 PR products genuinely consume         |
| TCMS `platform-quality` / `platform-release`                                                                                                     | **Product / certification** capability                                                |
| `qep-notification`, `qep-command`                                                                                                                | **Ownership anomalies** — correct toward APS-S-02 / APS-S-03; not additional services |

---

## Ownership anomaly register (rationalise — post-Accept engineering scope only)

| Anomaly                                           | Target                                                     |
| ------------------------------------------------- | ---------------------------------------------------------- |
| `@apzhub/qep-notification` parallel to APE-Notify | Align to **APS-S-02**                                      |
| `@apzhub/qep-command` parallel to APE-Command     | Align to **APS-S-03**                                      |
| Single-consumer `platform-*` packages             | Reclassify (product) or earn promotion via second consumer |
| Domain audit vs APE-Audit facade                  | Keep split; certify facade contract only                   |

---

## What Accept would authorise (later)

Owner Accept of **this inventory** would authorise planning of a **certification / rationalisation** engineering programme only — not greenfield service construction, not AI, not product redesign.

Until Accept: **Engineering not authorised.**

---

## Owner decision required

```text
APS-002 Finite Platform Service Inventory

Proposed: 7 Platform Services (Search, Notifications, Command, Activity,
          Personalisation, Realtime, Audit)

Removed: Universal Inbox, Presence, Navigation-as-service, AI/RAG

Action classes: Certify · Correct ownership · Reclassify single-consumer · Consolidate Personalisation

Awaiting: Owner Accept | Owner Amend | Owner Reject
```
