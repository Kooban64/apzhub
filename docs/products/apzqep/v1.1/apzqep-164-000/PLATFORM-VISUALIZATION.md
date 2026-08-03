# PLATFORM-VISUALIZATION — APZQEP-164-000

| Field     | Value                                       |
| --------- | ------------------------------------------- |
| Programme | APZQEP-164-000                              |
| Timestamp | 20260803T191002Z                            |
| Package   | `@apzhub/platform-visualization` (intended) |

## Purpose

Reusable **visualization and media viewer** primitives for APZHUB: charts, timelines, heatmaps, graphs and evidence media viewers. Presentation-only; no business rules.

## Capability groups

| Group              | Examples                                              |
| ------------------ | ----------------------------------------------------- |
| Charts             | Trend lines, bar/column, sparklines, stacked coverage |
| Matrices           | Risk heatmaps, confidence grids, provider comparison  |
| Timelines          | Execution, repository, evidence, audit                |
| Status             | Score gauges, confidence chips, health indicators     |
| Evidence viewers   | Screenshot, video, trace, log, artifact explorer      |
| Relationship views | Evidence↔requirement↔execution links (read-model)     |

## Design rules

1. Consume design tokens from `@apzhub/ui` / Presentation Engine (006/022).
2. Colour encodings must have non-colour secondary cues (pattern/text) for a11y.
3. Large datasets use virtualization / windowing — never dump unbounded series to DOM.
4. Media viewers stream or page artifacts via platform Evidence APIs — no direct S3 UI credentials.
5. No AI inference inside visualization package.

## Separation from platform-dashboard

| Package                  | Owns                                       |
| ------------------------ | ------------------------------------------ |
| `platform-dashboard`     | Composition, layout, widgets, saved views  |
| `platform-visualization` | Rendering primitives used _inside_ widgets |

Avoid merging these into a single “experience” package.
