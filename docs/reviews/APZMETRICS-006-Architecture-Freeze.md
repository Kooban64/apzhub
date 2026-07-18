# APZMETRICS-006 — Architecture Freeze Review

**Date:** 2026-07-18  
**Status:** Frozen

## Freeze declaration

The certified Metrics path is frozen per [Architecture Freeze Notice](../architecture/APZHUB-Metrics-Architecture-Freeze-Notice.md).

## Change control

| Requirement            | Mandatory |
| ---------------------- | --------- |
| ADR                    | Yes       |
| Owner approval         | Yes       |
| Architecture review    | Yes       |
| New approved milestone | Yes       |

No exceptions for runtime path changes.

## Surfaces frozen

Contracts **0.2.0** · Core **0.2.0** · Persistence **0.1.0** · platform-services metrics wiring **0.25.0** · OpenAPI **1.9.0** · typed client · Workbench · `metricsPlatformOps` · migrations **0056/0057**.

## Separation retained

Platform Metrics remains separate from frozen Observability, frozen Identity, and frozen Administration.
