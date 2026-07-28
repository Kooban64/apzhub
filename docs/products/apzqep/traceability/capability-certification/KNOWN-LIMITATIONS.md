# Traceability Known Limitations

Authorised scope decisions and operational constraints for baseline **1.0.0**. These are not open defects unless marked otherwise.

## Domain / product scope (intentional)

- **No Coverage Engine** — no coverage percentages as System of Record
- **No Impact Engine** — no impact-analysis SoR or automated blast-radius engine
- **No Verification domain** — Test Spec / Test Case / Execution ownership elsewhere
- **No Evidence domain**
- **No Certification Engine**
- **No AI** — no AI-generated Trace Links, recommendations, or decisioning
- **No MCP** — no MCP server / tools for Traceability
- **Matrix presentation only** — Trace Matrix presents Trace Links; it is not Coverage or Impact analysis
- **Graph deferred** — no graph visualisation as product SoR in 1.0.0
- Traceability does **not** own Requirements Relationships (ARCH-005 / Requirements **1.0.0**)

## Technical / operational

- **Permissive endpoint resolver** for unimplemented peer domains — contracts exist; resolution is intentionally permissive until peer domains ship (tighten under future programmes)
- **Playwright smoke-level** — route reservation / reachability; mutation paths covered primarily by package and UI component tests
- **Search eventually consistent** — `trace_link` projection is not SoR; detail always reloads from SoR
- Large Matrix axes should remain bounded per Workbench performance guidance

## Not limitations of this baseline

Coverage, Impact, Verification, Evidence, Certification Engine, AI, and MCP require **separate Owner Architecture and Engineering programmes**. They are out of scope for Traceability module baseline **1.0.0**, not incomplete Traceability work (same certification pattern as Requirements REQ-001).
