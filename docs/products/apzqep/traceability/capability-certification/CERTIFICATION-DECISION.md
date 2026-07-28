# Certification Decision — APZQEP-TRACE-001

| Field               | Value                                                               |
| ------------------- | ------------------------------------------------------------------- |
| Programme           | APZQEP-TRACE-001 — Traceability Capability Certification & Baseline |
| Date                | 2026-07-26                                                          |
| Package             | `@apzhub/qep-traceability` **1.0.0**                                |
| Decision status     | **DRAFT — AWAITING OWNER ACCEPTANCE**                               |
| Certification class | **PRODUCTION_READY_WITH_LIMITATIONS**                               |
| Recommendation      | **PRODUCTION READY**                                                |

## Decision statement

The Traceability capability (ARCH-007, ENG-030A Parts 1–2, ARCH-008, ENG-030C) is certified as **production-ready with documented limitations** for use as the APZ QEP Traceability module baseline at SemVer **1.0.0**.

This decision is **proposed** by the certification pack. It becomes binding only when the Owner records Acceptance via [OWNER-ACCEPTANCE-PACK.md](./OWNER-ACCEPTANCE-PACK.md). Until then, programme status remains **IMPLEMENTED / AWAITING OWNER ACCEPTANCE**.

## Justification

1. **Architecture closed and consistent** — ARCH-007 and ARCH-008 accepted; Trace Links ≠ Requirements Relationships; ARCH-008 extends ARCH-006 without fork; Requirements **1.0.0** remains a frozen consumer with no drift.
2. **Domain complete in authorised scope** — TraceLink aggregate, 16 Trace Types, lifecycle, history, authority/confidence/origin/provenance/context — ENG-030A Part 1 accepted.
3. **Infrastructure complete in authorised scope** — Migrations 0079/0080, dual repos, REST APIs, permissions, audit, search projection, observability, endpoint resolution, RLS, optimistic concurrency — ENG-030A Part 2 accepted.
4. **Workbench complete in authorised scope** — Explorer, Matrix (presentation), Inspector, History, Taxonomy, create/lifecycle; server-only `availableActions` — ENG-030C accepted.
5. **Quality gates verified** — typecheck PASS; package tests 52 PASS; UI+package 65 PASS; architecture boundaries PASS.
6. **Limitations intentional** — Coverage, Impact, Verification, Evidence, Certification Engine, AI, MCP, and Graph are separate future programmes — not incomplete Traceability baseline work (same pattern as REQ-001).

## What this does _not_ certify

- Coverage Engine / coverage percentages as SoR
- Impact analysis Engine
- Verification / Evidence / Certification Engine domains
- AI proposals or MCP tooling
- Graph visualisation as product SoR
- Unlimited peer-domain endpoint resolution beyond documented contracts

## Effect upon Owner Acceptance (pending)

- Traceability Capability marked **ACCEPTED / CERTIFIED / FROZEN** at **1.0.0**
- Patch line **1.0.x** for defect fixes only under new Owner Instruction
- No Coverage / Impact / AI / MCP without separate Owner Instruction
