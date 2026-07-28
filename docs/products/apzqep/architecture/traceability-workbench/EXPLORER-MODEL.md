# Explorer Model — APZQEP-ARCH-008

> Companion extract. Authoritative detail: [TRACEABILITY-WORKBENCH-ARCHITECTURE.md](./TRACEABILITY-WORKBENCH-ARCHITECTURE.md) §6.

## Purpose

List-first navigational inventory of Trace Links with hierarchical grouping, endpoint browsing, and rich filtering.

## Capabilities

| Capability                                                  | Rule                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Hierarchical browsing                                       | Group by Trace Type, endpoint kinds, lifecycle, scope, confidence, authority, origin |
| Endpoint browsing                                           | Inbound / outbound / both from an artefact reference                                 |
| Taxonomy browsing                                           | Entry to normative Trace Types                                                       |
| Tenant filtering                                            | Session-authoritative tenant only                                                    |
| Lifecycle / confidence / authority / origin / scope filters | Combinable (AND); saved filters supported                                            |
| Selection                                                   | Single primary; bulk multi-select with action intersection                           |
| Row contract                                                | ENG-030A Part 2 list summary + `availableActions` — no N+1 detail                    |

## Non-goals

- Graph rendering
- Loading confidential endpoint body content into rows
- Client-side business-rule inference
