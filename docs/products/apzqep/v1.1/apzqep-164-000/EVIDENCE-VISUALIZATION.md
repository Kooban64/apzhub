# EVIDENCE-VISUALIZATION — APZQEP-164-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-164-000   |
| Timestamp | 20260803T191002Z |

## Principle

Evidence Platform remains SoR for artifacts. Wave 4 provides **viewers and timelines** only.

## Viewer architecture

| Viewer               | Purpose                                        | Data source                      |
| -------------------- | ---------------------------------------------- | -------------------------------- |
| Screenshot viewer    | Inspect still evidence                         | Evidence API (signed/streamed)   |
| Video viewer         | Playback run recordings                        | Evidence API + progressive media |
| Trace viewer         | Structured execution traces                    | Evidence / Execution projections |
| Execution log viewer | Text logs with search                          | Evidence / Execution             |
| Evidence timeline    | Chronology of artifacts                        | Evidence list API                |
| Artifact explorer    | Browse packs / attachments                     | Evidence catalogue               |
| Relationship view    | Evidence ↔ requirements ↔ defects ↔ executions | Traceability / QKI read-models   |

## Rules

1. No direct object-store credentials in the browser.
2. Enumeration ACL and permission checks remain on Evidence APIs (existing Wave programmes).
3. Viewers must expose accessible controls (keyboard play/pause, captions when available).
4. Do not re-implement Evidence Workbench; deep-link or embed via shared viewers.
