# Administration Workbench Views Guide

**Milestone:** APZADMIN-004

All views consume typed-client facades from `@/lib/administration/administration-api` only.

## Shared states

Every section supports loading, empty, error, and forbidden (403) presentation patterns via shared shell helpers.

## Overview

Counts from modules, categories, capabilities, permissions, registrations; management-plane readiness; metadata banner; unavailable capability cards.

## Catalogue sections

Modules, Categories, Sections, Registrations, Capabilities, Actions, Permissions, Policies, Navigation, Shortcuts, Dashboards, Widgets, References — list + detail where APIs exist. Client-side filter/sort on paged list data where practical.

## Modules

Status model (Registered, Enabled, Available, Healthy Metadata, Certified, Production Ready). Commands: Refresh, View Details, Copy ID, Open Product (canonical route only), Open Documentation, Archive / Restore / Transition when facades + permission allow. No Start/Stop/Deploy.

## Audit & History

Read-only timelines from `listAudit` / `listModuleHistory`.

## Diagnostics

Management-plane health/readiness/capabilities plus unavailable runtime cards. No live probes.
