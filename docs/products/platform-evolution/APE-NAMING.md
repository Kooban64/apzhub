# APZ Platform Engines (APE) — Naming Standard

| Field     | Value                                          |
| --------- | ---------------------------------------------- |
| Status    | **IN FORCE** · Owner-ratified (Foundation RC1) |
| Timestamp | 20260808T220000Z                               |
| Programme | Platform Evolution Programme 001 **CLOSED**    |

## Official namespace (ratified)

| Short name            | Engine                   |
| --------------------- | ------------------------ |
| **APE-Registry**      | Provider Registry Engine |
| **APE-Search**        | Search Engine            |
| **APE-Notify**        | Notification Engine      |
| **APE-Events**        | Event Engine             |
| **APE-Audit**         | Unified Audit Engine     |
| **APE-Configuration** | Configuration Engine     |
| **APE-Activity**      | Activity Engine          |
| **APE-Command**       | Command Engine           |
| **APE-FeatureFlags**  | Feature Flag Engine      |
| **APE-Realtime**      | Realtime Engine          |
| **APE-Integration**   | Integration Engine       |

Aliases used during Programme 001 engineering (`APE-Config`, `APE-Flags`) map to **APE-Configuration** and **APE-FeatureFlags**.

## Deferred (Phase 3)

| Short name | Engine     |
| ---------- | ---------- |
| APE-AI     | AI Gateway |
| APE-RAG    | RAG Engine |

## Rules

- Future platform engines follow the `APE-*` convention.
- Never duplicate a capability when an APE exists.
- Products never call providers directly.
