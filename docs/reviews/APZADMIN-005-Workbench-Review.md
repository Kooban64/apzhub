# APZADMIN-005 — Workbench Review

**Date:** 2026-07-16  
**Surface:** `/workspace/administration` · parent manifest `platform-admin`

## Certified properties

| Property                                                       | Status |
| -------------------------------------------------------------- | ------ |
| Catch-all mount via `AdministrationWorkspaceRouter`            | PASS   |
| Typed-client facades only (`administration-api`)               | PASS   |
| Capability banners (runtime / provision / execution / …)       | PASS   |
| Unavailable cards (users / roles / tenants / Event Bus / AI …) | PASS   |
| Child manifests for all required sections                      | PASS   |
| No direct `fetch` / localStorage / gateway / core              | PASS   |
| Distinct from Platform Operations `/workspace/operations`      | PASS   |

## Manifests

Parent `platform-admin` + children: overview, modules, categories, sections, registrations, capabilities, actions, permissions, policies, navigation, shortcuts, dashboards, widgets, references, audit, history, diagnostics.

## Verdict

**PASS** — `pnpm audit:administration-workbench` + vertical Workbench checks.
