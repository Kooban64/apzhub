# Observability Health and Status Presentation Guide

**Milestone:** APZOBSERVE-004

## Principle

Use **only canonical domain values** from Observability contracts. The Workbench must not invent UI-only status taxonomies.

## StatusBadge

`StatusBadge` renders the raw string value with a non-colour-only marker (`●` + text + `aria-label="Status {value}"`).

- Empty / missing → **`unknown`** (never implied healthy)
- Applied consistently to cells and detail fields named `status`, `severity`, `state`, `overallStatus`, etc.

## Surfaces

| Surface | Canonical fields (examples) |
| --- | --- |
| Service Health | `overallStatus`, `readinessStatus`, `livenessStatus` |
| Service Status | `status` |
| Component Status | `status` |
| Alert Definitions | `severity`, `status` |
| Alert States | `state` |
| Health Summaries | `overallStatus` |
| Diagnostics | readiness Ready / Not ready / Loading; provider execution always Unavailable |

## Unknown

Absent or blank values display as **unknown**, not healthy/ready/ok.

See also: [Views Catalogue](./APZHUB-Observability-Views-Catalogue.md), [Capability Limitations Guide](./APZHUB-Observability-Capability-Limitations-Guide.md).
