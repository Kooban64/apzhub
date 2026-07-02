# DF-001 — Completion Report

> **Story:** DF-001 — Knowledge Source Architecture  
> **Sprint:** SPR-005 — Knowledge & Discovery Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before DF-002**

---

## Objective

Define the Knowledge Source Architecture — identify and model knowledge sources that will participate in the Knowledge & Discovery Framework. Planning and architecture only; no search or indexing implementation; no production code.

---

## Initiative rename

Sprint 005 planning updated from **Discovery Framework** to **Knowledge & Discovery Framework** throughout backlog, roadmap, and specifications. Rationale: the framework provides a unified knowledge layer — broader than search alone.

---

## Acceptance criteria

| Criterion                                              | Status                                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Knowledge Source specification                         | ✅ [SPR-005-KDF-knowledge-sources.md](../specs/SPR-005-KDF-knowledge-sources.md)     |
| Knowledge Source taxonomy (tiers, kinds, entity kinds) | ✅ Spec §4                                                                           |
| Registry integration model                             | ✅ Spec §5 — consume registries, no duplication                                      |
| Indexing strategy (documentation only)                 | ✅ Spec §6 — no implementation                                                       |
| Search strategy overview                               | ✅ Spec §7 — no implementation                                                       |
| AI extension points (documentation only)               | ✅ Spec §8                                                                           |
| ADR-0027 — package boundary                            | ✅ Accepted                                                                          |
| ADR-0028 — Knowledge Source model                      | ✅ Accepted                                                                          |
| ADR-0029 — execution routing                           | ✅ Accepted                                                                          |
| Spec index for DF-002–DF-018                           | ✅ [SPR-005-spec-index.md](../specs/SPR-005-spec-index.md)                           |
| Sprint planning updates                                | ✅ Backlog renamed; [SPR-005 sprint doc](./SPR-005-knowledge-discovery-framework.md) |
| No production code                                     | ✅                                                                                   |
| Owner review before DF-002                             | ⏳ Pending                                                                           |

---

## Deliverables produced

### Specification

| Document                                                                      | Content                                                                                                        |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [SPR-005-KDF-knowledge-sources.md](../specs/SPR-005-KDF-knowledge-sources.md) | Knowledge Source spec, taxonomy, registry integration, indexing strategy, search overview, AI extension points |
| [SPR-005-spec-index.md](../specs/SPR-005-spec-index.md)                       | Master index for DF-001–DF-018                                                                                 |

### ADRs

| ADR      | Path                                                                                                                   |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| ADR-0027 | [docs/adr/ADR-0027-knowledge-discovery-framework-package.md](../adr/ADR-0027-knowledge-discovery-framework-package.md) |
| ADR-0028 | [docs/adr/ADR-0028-knowledge-source-model.md](../adr/ADR-0028-knowledge-source-model.md)                               |
| ADR-0029 | [docs/adr/ADR-0029-knowledge-discovery-execution-routing.md](../adr/ADR-0029-knowledge-discovery-execution-routing.md) |

### Sprint planning

| Document                                                                                                        | Change                                      |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| [SPR-005-knowledge-discovery-framework-backlog.md](../backlog/SPR-005-knowledge-discovery-framework-backlog.md) | Renamed and updated — authoritative backlog |
| [SPR-005-discovery-framework-backlog.md](../backlog/SPR-005-discovery-framework-backlog.md)                     | Redirect stub to renamed backlog            |
| [SPR-005-knowledge-discovery-framework.md](./SPR-005-knowledge-discovery-framework.md)                          | Sprint planning document                    |

---

## Architecture compliance

| Rule                                 | Result                                                        |
| ------------------------------------ | ------------------------------------------------------------- |
| Platform 2.0 baseline not redesigned | ✅                                                            |
| Runtime architecture not modified    | ✅                                                            |
| Workbench architecture not modified  | ✅                                                            |
| Action Framework not modified        | ✅                                                            |
| No new execution pipeline            | ✅ ADR-0029                                                   |
| Registry Pattern compliance          | ✅ KnowledgeSourceRegistry follows registration-not-execution |
| Changes only through ADRs            | ✅ ADR-0027, 0028, 0029                                       |
| No search implementation             | ✅                                                            |
| No indexing implementation           | ✅                                                            |
| No production code                   | ✅                                                            |

---

## Key decisions locked in ADRs

| Decision                                                                       | ADR           |
| ------------------------------------------------------------------------------ | ------------- |
| Repurpose `@apzhub/search` → `@apzhub/knowledge-discovery-framework` in DF-002 | 0027          |
| Core / server / react export split                                             | 0027          |
| Knowledge Source tier model T0–T4                                              | 0028          |
| Manifest block `knowledge.sources` (canonical)                                 | 0028          |
| Registry-projection adapters — no registry duplication                         | 0028          |
| T0 live projection for SPR-005; persistent index deferred M8/M9                | 0028, Spec §6 |
| Selection routes via CommandRegistry.execute() or Workbench navigation         | 0029          |
| No KnowledgeExecutor parallel pipeline                                         | 0029          |
| Semantic/AI stubs return NOT_IMPLEMENTED — no bypass                           | 0029          |

---

## Knowledge Source taxonomy summary

| Tier | Name               | SPR-005                                                  |
| ---- | ------------------ | -------------------------------------------------------- |
| T0   | Platform Registry  | ✅ Foundation — Action, Workbench, Capability projection |
| T1   | Platform Metadata  | Documented — deferred M8                                 |
| T2   | Session Signals    | Scaffold — recency/frequency (DF-009)                    |
| T3   | Business Knowledge | Documented — deferred M9                                 |
| T4   | Semantic / AI      | Interface stubs (DF-014)                                 |

---

## Risks

| Risk                                                 | Severity | Mitigation                                                         |
| ---------------------------------------------------- | -------- | ------------------------------------------------------------------ |
| Terminology drift (Discovery vs Knowledge)           | Low      | Rename complete in SPR-005 docs; story IDs unchanged               |
| Package rename breaks workspace refs                 | Medium   | DF-002 scoped to directory rename + package.json; empty shell only |
| Palette vs header search duplication                 | Medium   | ADR-0029 + DF-013 — single Action Registry source                  |
| Orchestrator scope creep into indexing               | Medium   | Spec §6 explicitly defers T1/T3 indexing                           |
| Manifest field `discovery.providers` in early drafts | Low      | Superseded by `knowledge.sources` in ADR-0028                      |
| Capability registry adapter complexity               | Low      | DF-008 focuses navigation; capability metadata minimal in SPR-005  |

---

## Recommendations for DF-002

1. **Start DF-002 immediately after this report is approved** — rename `packages/search/` → `packages/knowledge-discovery-framework/` per ADR-0027.

2. **Export `KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS = "scaffold"`** — mirror command-framework pattern.

3. **Pre-wire package exports** for `.`, `./server`, `./react` even if server/react are empty stubs.

4. **Do not add React dependency** to core package.json in DF-002 — react subpath only in DF-010.

5. **Single PR for DF-002** — expected diff: package rename + scaffold only; zero runtime behaviour change.

6. **Update `pnpm-workspace.yaml` references** if any hard-coded `@apzhub/search` paths exist (grep before merge).

---

## Quality gates

Documentation-only story — all gates run to confirm no regression:

| Gate                 | Result                                    |
| -------------------- | ----------------------------------------- |
| `pnpm lint`          | ✅ Pass                                   |
| `pnpm typecheck`     | ✅ Pass                                   |
| `pnpm build`         | ✅ Pass                                   |
| `pnpm test`          | ✅ Pass (672)                             |
| `pnpm test:coverage` | ✅ Pass (91.46%)                          |
| `pnpm test:e2e`      | Not re-run (no code changes since AF-020) |

---

## Stop condition

DF-001 complete. **Do not begin DF-002** until this report is reviewed and approved.

Next story upon approval: **DF-002 — Knowledge & Discovery Framework package scaffold**.

---

_DF-001 Completion Report — Sprint 005 Knowledge & Discovery Framework._
