# APZQEP Phase 2 — Screen 1 visual authority (Requirements)

**Status:** LOCKED  
**Date:** 2026-08-19  
**Authority image:** [visuals/phase-2/01-requirements-authority.png](./visuals/phase-2/01-requirements-authority.png)

This image is the **visual authority** for Phase 2 Screen 1. It is not a suggestion. Implementation, when later authorised, must reproduce this geometry — not reinterpret it into another dashboard, card grid, or layout.

## What this screen is

Requirements **list** for the selected Application, with a **compact inspector** on selection.

It is **not** Requirement Detail (Screen 2).  
The inspector footer **Open Requirement** is the handoff to Screen 2. Do not expand this inspector into the full requirement centre.

## Lock sequence (Owner)

```text
Screen 1 — Requirements                    LOCKED
Screen 2 — Requirement Detail              LOCKED
Screen 3 — User Story + AC                 LOCKED
Domain / migration rules                   NOT DEFINED
Consolidated Phase 2 Cursor instruction    NOT AUTHORISED
```

Do not implement Phase 2. Do not write domain/migration rules. Do not start User Stories or Acceptance Criteria screens.

## States in the authority image

Same geometry in all four:

| State         | Presentation                                                                   |
| ------------- | ------------------------------------------------------------------------------ |
| Desktop light | Sidebar + header + table + right inspector                                     |
| Desktop dark  | Identical structure; tokens swap                                               |
| Mobile light  | Header + requirement cards + bottom nav; selected item → full-screen inspector |
| Mobile dark   | Identical structure; tokens swap                                               |

Light and dark are the same product. Do not design a second layout for dark mode.

## Desktop geometry (locked)

Frozen Phase 1 QEP shell:

- Navy full-height **QEP sidebar** (no alphabet activity rail)
- Header: Application selector · Search QEP… · **+ Create** · notifications · user
- Primary workspace: page title + tabs + filter bar + table
- Selection opens the **right inspector** (does not navigate away)

### Sidebar groups shown

COMMAND CENTRE: Overview, My Work  
QUALITY: **Requirements** (active), User Stories, Acceptance Criteria  
TESTING: Test Cases, Test Plans, Executions, Defects  
REPORTS: Traceability, Quality Reports  
ADMIN: Applications, Environments, Execution Targets, Integrations, People & Access, Settings

User Stories and Acceptance Criteria appear in this IA. Their work surface is **Screen 3** (now locked as visual authority). Domain work remains unauthorised until the Phase 2 domain/migration lock and one Cursor instruction.

### Page

- Title: **Requirements**
- Subtitle: define and manage business and system requirements for the application
- Tabs: All Requirements (active) · My Requirements · By Status · By Priority · By Type
- Local search: Search requirements…
- Compact filters: Type · Status · Priority · Filters

### Table columns (locked order)

ID · TITLE (title + one-line summary) · TYPE · PRIORITY · STATUS · OWNER (avatar + display name) · UPDATED (relative)

IDs are the row identity (example: REQ-021). Type / Priority / Status are badges. Owner is a person, not a raw user id.

### Inspector (compact preview only)

Header: requirement ID · previous/next · close  
Hero: icon · title · status / type / priority badges · short summary  
Tabs: Details · Linked (count) · History · Attachments (count)  
Details fields: Requirement ID, Type, Priority, Status, Owner, Created, Updated, Application, Source  
Description block  
Footer: primary **Open Requirement** · overflow menu

Application on the inspector is the selected Application context. Source is provenance (example: imported from PRD), not a Source-control grant.

## Mobile geometry (locked)

- Top: menu · APZ APZQEP · notifications · user
- Body: **cards**, not a squeezed desktop table. Each card: ID, title, type/priority/status badges, updated time
- Select → **full-screen inspector** with the same content model as the desktop drawer, including **Open Requirement**
- Bottom nav: Home · Work · Quality (active) · More
- QEP desktop breakpoint remains **1024px** (Phase 1)

## Honesty constraints (still in force)

- Do not invent requirements, coverage, or owners to fill the table
- Do not seed fake repositories or people directories
- Unbound legacy Cap records remain unbound until domain/migration rules are defined
- `qep_application` remains the Application SoR
- No SSH, Terminal, Source write, or AI proposal UX in this screen

## Next

Phase 2 visuals 1–3 are locked. Domain / migration rules are next. No implementation until one consolidated Cursor instruction.
