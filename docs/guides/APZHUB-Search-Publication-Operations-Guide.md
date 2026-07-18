# Search Publication Operations Guide

> **Milestone:** APZSEARCH-017

## Workbench

Open **Search → Publication Ops** (`/workspace/search/publication`).

## Views

- Queue depth, retrying, failed, dead-letter, backlog, throughput
- Product summaries (Projects, Support, Documents, Testing, Reporting)
- Journal list with status filter
- Orchestration diagnostics (bootstrap, journal readiness, health)

## Operations

| Action                             | Permission                       |
| ---------------------------------- | -------------------------------- |
| List / inspect                     | `search.publication.read`        |
| Retry / clear completed            | `search.publication.retry`       |
| Dead-letter ack/archive/re-enqueue | `search.publication.deadletter`  |
| Drain batch                        | `search.publication.admin`       |
| Diagnostics                        | `search.publication.diagnostics` |

All mutating operations are audited.
