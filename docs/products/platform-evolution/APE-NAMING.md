# APZ Platform Engines (APE) — Naming Standard

| Field     | Value                            |
| --------- | -------------------------------- |
| Status    | **IN FORCE**                     |
| Timestamp | 20260808T212000Z                 |
| Programme | Platform Evolution Programme 001 |

## Rule

Cross-cutting platform capabilities are named **APZ Platform Engines (APE)**.

| Short name          | Engine                   | Inventory ID |
| ------------------- | ------------------------ | ------------ |
| **APE-Registry**    | Provider Registry Engine | PE-PR-01     |
| **APE-Search**      | Search Engine            | PE-PR-02     |
| **APE-Notify**      | Notification Engine      | PE-PR-03     |
| **APE-Activity**    | Activity Engine          | PE-PR-04     |
| **APE-Audit**       | Unified Audit Engine     | PE-PR-05     |
| **APE-Command**     | Command Engine           | PE-PR-06     |
| **APE-Events**      | Event Engine             | PE-PR-07     |
| **APE-Integration** | Integration Engine       | PE-PR-08     |
| **APE-Config**      | Configuration Engine     | PE-PR-09     |
| **APE-Flags**       | Feature Flag Engine      | PE-PR-10     |
| **APE-Realtime**    | Realtime Engine          | PE-PR-11     |

Deferred (Phase 3 — not APE Foundation v1.0):

| Short name | Engine     |
| ---------- | ---------- |
| APE-AI     | AI Gateway |
| APE-RAG    | RAG Engine |

## Usage

- Docs / ADRs / evidence: `APE-Audit`, `APE-Search`, …
- Code packages: prefer `@apzhub/platform-audit`, `@apzhub/…` with APE id in manifests
- APIs: `/api/v1/platform/…` — do not expose provider brands

Product engines (future Programme 002) are **not** APE — they remain product-scoped.
