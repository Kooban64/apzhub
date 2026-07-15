# APZHUB Platform Reporting Workbench

**Milestone:** APZREPORT-002  
**Route:** `/workspace/reporting`

## Purpose

Product-neutral, read-only administration surface for the shared Reporting Platform.

## Sections

| Section | Path | Content |
|---------|------|---------|
| Templates | `/workspace/reporting/templates` | Built-in / registered templates |
| Generated Reports | `/workspace/reporting/generations` | Generation metadata list |
| History | `/workspace/reporting/history` | Same metadata stream (history focus) |
| Formats | `/workspace/reporting/formats` | Supported output formats |

## Commands

Refresh · Generate · Preview · View Metadata · Download Metadata · Validate Template · Open Consumer (`/workspace/testing/reports`)

No edit, delete, schedule, or template designer.

## UX

Search, filter, sort, client-side pagination cues, report category via `reportType`, output format selection, metadata inspection, responsive layout.

## Manifests

`packages/workbench-framework/manifests/platform-reporting*/module.yaml` — permission `report.view`.

## Accessibility

Keyboard-reachable commands, ARIA toolbar/status/alert regions, labelled filters, WCAG-oriented token colours.
