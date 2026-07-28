# APZHUB-1.2-005 — Implementation Summary

> **Programme:** APZHUB-1.2-005  
> **Backlog item:** **R12-SEARCH-01** — `search-time` publication adapter  
> **Date:** 2026-07-20

---

## Selection

| Field                        | Value                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Identifier                   | **R12-SEARCH-01**                                                                                            |
| Position                     | Next P0 immediately after R12-OPS-03                                                                         |
| Classification               | Platform Capability / Integration                                                                            |
| Dependencies                 | Time HTTP/SoR stable — **complete** (Time **1.0.0** ACCEPTED; Search Integration Framework frozen/certified) |
| Affected packages            | `@apzhub/search-time` **0.1.0** (new); `@apzhub/search-contracts` **0.4.0** (additive `time` product id)     |
| Affected platform services   | None modified — publishes via Search Integration Framework only                                              |
| Affected commercial products | **Time**                                                                                                     |

## What was implemented

1. **`@apzhub/search-time` 0.1.0** — Time Search Publication Adapter (mirror of certified product publishers).
2. Entity catalogue: `time_entry`, `time_activity`, `time_customer`, `time_project`, `time_tag`.
3. Mapper / validator / publisher / lifecycle hooks / diagnostics — Kimai IDs, billing/rates/financial fields, provider metadata rejected.
4. Factory `createTimeSearchAdapter` → `SearchIntegrationPublisher` only.
5. Audit gate `pnpm audit:search-time`.
6. Additive `SearchProductId` / declared adapter catalogue member **`time`** (SemVer-compatible; package remains **0.4.0**).

## Explicit non-goals (held)

`search-law` (R12-SEARCH-02) · TCMS · Email SoR · FIN-001 · Workflow Execute · Search architecture thaw · composition-hook wiring into Time platform-services · live Meilisearch drain · second backlog item · breaking API changes.
