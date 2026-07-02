# APZHUB Unified Search quick reference

Derived lookup for [020](./020-unified-search-knowledge-discovery-framework.md).

> **Document Version:** 1.0 · **Platform Specification · Core Platform Standard**  
> DEF summary: [005 §15](./005-desktop-experience-workspace-framework.md). Navigation: [017](./017-navigation-framework-workspace-navigation-architecture.md). Command palette: [019](./019-universal-command-palette-action-framework.md). Notifications: [021](./021-notification-activity-attention-management-framework.md). Index/data: [011](./011-platform-data-architecture-database-design-principles.md). Events/indexing: [012](./012-event-driven-architecture-background-processing-workflow-framework.md).

## Core rule

**One platform-wide search** — users never need to know which backend owns data. Search is a **platform capability**; backend engines are implementation details.

## Philosophy

Search **knowledge**, not applications. Search **work**, not databases. APZHUB terminology only (002).

## Architecture (mandatory path)

```
Desktop Shell → Search Service → Search Providers → Platform Services → Connectors → Backend Engines
```

Modules **never** implement independent search UIs (008, 009, 010)

## Search providers (module-registered)

Projects · documents · support · automation · testing · analytics · compliance · monitoring · security · administration — future modules register new providers (008)

## Categories

Projects · documents · people · support · tasks · workflows · dashboards · reports · knowledge · settings · commands · notifications · activity · audit — consistent presentation (006)

## Sources (one user experience)

Platform metadata · connector metadata · backend APIs · search index · cache · vector search (future)

## Search types

Global · workspace · quick · advanced · saved · recent · AI (future) · semantic (future) — global in header (016)

## Result types

Projects · documents · tickets · users · dashboards · reports · tasks · files · commands · settings · workflows · sessions · notifications — distinct icons/presentation

## Ranking (platform-owned)

Exact match · usage frequency · recent activity · workspace context · permissions · user prefs · pinned · recent searches · AI relevance (future) — platform metadata (011)

## Permission awareness (mandatory)

Filter **before** presentation — no restricted projects, hidden documents, admin settings, unavailable commands. Server authoritative at query time (005, 007)

## Search metadata (central)

ID · title · description · keywords · category · owner · modified · permissions · navigation target (011)

## Search index

Metadata · keywords · relationships · references · navigation targets — **derived, never SoR** (011)

## Index updates (async via events)

Project created · document uploaded · ticket closed · workflow completed · **permission changed** (012)

## Filters (consistent platform-wide)

Workspace · category · owner · department · status · date · tags · connector · module — permission-respecting (017)

## Saved searches (platform-owned)

My open tickets · projects awaiting approval · documents modified today · outstanding reviews — user prefs (011, 018)

## Suggestions

Recent · popular · recommended commands · recent/pinned objects · AI (future) — integrates with 019 without duplicating nav (017)

## Preview

Document/project summary · ticket preview · dashboard snapshot · report details — via Platform Services, not direct connectors

## Navigation from results

Restore workspace · tab · context · session · panel — deep links re-validate permissions (017, 018)

## Relationships

Expose related tasks · documents · tickets · reports · automation · activity from index metadata

## Semantic search (future, no redesign)

Natural language · embeddings · vector search · knowledge graphs · AI ranking — same permission/nav model

## AI integration (future)

Summarisation · recommendations · related items · Q&A · knowledge discovery — consumes Platform Search Service; no permission bypass (013)

## Performance

Rapid response · cache metadata · incremental results · thousands of records · horizontal scale · minimal backend calls (004, 016)

## Accessibility (mandatory)

Keyboard · screen readers · focus management · high contrast · reduced motion — WCAG AA (006)

## Testing (015)

Unit · index · **permission** · performance · Playwright · regression · connector — restricted objects never in results/suggestions/previews

## Self-hosted first (026)

PostgreSQL FTS · OpenSearch (future) · Meilisearch (future) · Qdrant (future) — **no proprietary hosted search required**; engine replaceable via Platform Search Service (008, 004)

## Build rules

One Platform Search Service · every module registers provider · hide backends · permissions before results · async indexing · semantic/AI-ready · platform capability not module feature

## Acceptance highlights

One platform search · dynamic providers · permission-filtered results · auto index updates · correct workspace/context restore · AI/semantic without redesign · replaceable backend tech · **no restricted leakage** · **no standalone module search bypass**
