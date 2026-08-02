# Test Suite Lifecycle — APZQEP-140-A

## States

`draft` → `review` → `approved` → `published` → `deprecated` → `archived` → `retired`

Logical deletion: `deleted` (terminal). Restore: `archived` → `draft`.

## Allowed transitions

| From       | To                            |
| ---------- | ----------------------------- |
| draft      | review, deleted               |
| review     | draft, approved, deleted      |
| approved   | published, review, deprecated |
| published  | deprecated, archived          |
| deprecated | archived, published           |
| archived   | draft (restore), retired      |
| retired    | archived                      |
| deleted    | —                             |

## Features mapped

Create · Update · Delete (logical) · Archive · Restore · Clone · Version · Publish · Retire · Copy (clone) · Move · Tag · Favourite · Pin · Recent / Search / Filter / Sort (list APIs + workspace).
