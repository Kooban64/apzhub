# APZ Knowledge — Administrator Guide (v1.0)

## Permissions

| Permission         | Purpose                               |
| ------------------ | ------------------------------------- |
| `knowledge.view`   | Browse Memory Companion surfaces      |
| `knowledge.admin`  | Manage memory + diagnostics           |
| `knowledge.manage` | Write/lifecycle (accepted with admin) |

## Operator surfaces

- **Diagnostics** — admin-gated; not the default user path.
- **Settings** — personal prefs + operator section.

## Production store

- Platform Postgres organisational memory (`platform_knowledge_object`).
- Do **not** set `APZHUB_KNOWLEDGE_MEMORY_STORE=memory` in production.
- Unavailable store fails closed (503).

## Out of scope for admins to “enable”

Overlays, AI/RAG, Knowledge 2.0 — not toggles in v1.0.
