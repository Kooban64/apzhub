# APZHUB-1.2-006 — Implementation Summary

> **Programme:** APZHUB-1.2-006  
> **Backlog item:** **R12-SEARCH-02** — `search-law` publication adapter  
> **Date:** 2026-07-20

---

## Selection

| Field                        | Value                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| Identifier                   | **R12-SEARCH-02**                                                                                      |
| Position                     | Next P0 immediately after R12-SEARCH-01                                                                |
| Classification               | Platform Capability / Integration                                                                      |
| Dependencies                 | Law SoR + AuthZ (OBS closed) — **complete** (Law **1.0.0**; OBS-LAW-01/02 **ACCEPTED**)                |
| Affected packages            | `@apzhub/search-law` **0.1.0** (new); `@apzhub/search-contracts` **0.4.0** (additive `law` product id) |
| Affected platform services   | None modified — publishes via Search Integration Framework only                                        |
| Affected commercial products | **Law**                                                                                                |

## What was implemented

1. **`@apzhub/search-law` 0.1.0** — Law Search Publication Adapter.
2. Entity catalogue: `law_matter`, `law_client`, `law_document`, `law_task`, `law_knowledge_article`.
3. Mapper / validator / publisher / lifecycle hooks / diagnostics — external engine IDs, financial/trust/billing fields, storage refs rejected.
4. Factory `createLawSearchAdapter` → `SearchIntegrationPublisher` only.
5. Audit gate `pnpm audit:search-law`.
6. Additive `SearchProductId` / declared adapter catalogue member **`law`**.

## Explicit non-goals (held)

R12-TCMS-01 · Email SoR · FIN-001 · Workflow Execute · Search architecture thaw · composition-hook wiring into Law app · live Meilisearch drain · invoice/trust publication · second backlog item · breaking API changes.
