# Requirements Relationships — Workbench Technical Guide

## Entry points

- Sidebar: **Requirements → Relationships**
- Requirement detail: Relationships panel (inbound/outbound)
- Deep links: `/workspace/qep/requirements/relationships/{id}`
- Create: `/relationships/new?source={requirementId}`
- Supersede: `/relationships/supersede`

## Interaction model

1. **List Explorer** — primary surface; filters by type, lifecycle, conflicts.
2. **Create / Supersede** — guided forms; endpoint selection via requirement search.
3. **Detail Inspector** — multi-pane; lifecycle and field edits only when `availableActions` includes them.
4. **Context banners** — retired/deprecated, Content-Version pins, Baseline scope.

## Authority

Server `availableActions` governs buttons. Missing actions ⇒ read-only. Client never infers authority from lifecycle alone.

## Comparison / bulk

- Content Version and Baseline comparison remain on their existing Workbench surfaces.
- Relationship history summaries appear in the inspector.
- Bulk mutations are **not** enabled (backend has no safe bulk mutation API); multi-select export is deferred.
