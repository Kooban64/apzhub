# Document 020 — Unified Search, Knowledge & Discovery Framework

> **Document Version:** 1.0  
> **Classification:** Platform Specification  
> **Status:** Core Platform Standard  
> **Applies To:** Desktop Shell · Every Platform Module · Every Connector · Future AI Services · Future Mobile/Desktop Clients  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [019](./019-universal-command-palette-action-framework.md)  
> **Relationship:** Expands [005 — Desktop Experience & Workspace Framework](./005-desktop-experience-workspace-framework.md) Section 15 (Global Search summary). Integrates with [017 — Navigation Framework](./017-navigation-framework-workspace-navigation-architecture.md), [019 — Universal Command Palette](./019-universal-command-palette-action-framework.md), [018 — Workspace Sessions](./018-workspace-sessions-window-management-state-persistence-framework.md), and [021 — Notifications & Attention](./021-notification-activity-attention-management-framework.md). Search index ownership per [011 — Platform Data Architecture](./011-platform-data-architecture-database-design-principles.md). Indexing via events per [012](./012-event-driven-architecture-background-processing-workflow-framework.md).

## 1. Purpose

The Unified Search Framework provides a single platform-wide search experience.

Users should never need to know which backend system stores information.

Search is a Platform Capability.

Backend search engines remain implementation details.

---

## 2. Vision

Users should be able to type:

> "Project Alpha"

or

> "Invoices approved this month"

or

> "John Smith"

or

> "Tickets assigned to me"

and immediately receive relevant results regardless of which backend system owns the data.

Search should feel like searching one platform.

---

## 3. Search Philosophy

The platform searches knowledge.

Not applications.

Users search for work.

Not databases.

User-facing results use APZHUB terminology — never backend product names ([002](./002-product-naming-positioning-terminology-standard.md)).

---

## 4. Search Architecture

Every searchable module contributes to the Platform Search Service.

Desktop Shell

↓

Search Service

↓

Search Providers

↓

Platform Services

↓

Connectors

↓

Backend Engines

Modules never implement independent search interfaces.

Per [009 — Platform Service Layer](./009-platform-service-layer-integration-framework.md) and [008 — Module Architecture](./008-module-plugin-connector-architecture.md). Client requests through API Gateway only ([010](./010-api-gateway-integration-communication-standards.md)).

---

## 5. Search Providers

Every module registers a Search Provider.

**Examples:**

- Projects
- Documents
- Support
- Automation
- Testing
- Analytics
- Compliance
- Monitoring
- Security
- Administration

Future modules simply register new providers.

Registration is part of the module contract ([003](./003-overall-system-architecture-design-principles.md), [008](./008-module-plugin-connector-architecture.md)).

---

## 6. Search Categories

- Projects
- Documents
- People
- Support
- Tasks
- Workflows
- Dashboards
- Reports
- Knowledge
- Settings
- Commands
- Notifications
- Activity
- Audit

Each category has its own result presentation.

Per [006 — Enterprise Design System](./006-enterprise-design-system-ui-standards.md) — consistent icons and result layouts.

---

## 7. Search Sources

Search may retrieve information from:

- Platform Metadata
- Connector Metadata
- Backend APIs
- Search Index
- Cached Results
- Future Vector Search

The user experiences one search.

---

## 8. Search Types

- Global Search
- Workspace Search
- Quick Search
- Advanced Search
- Saved Search
- Recent Search
- AI Search (future)
- Semantic Search (future)

Global Search in header per [016 — Desktop Shell](./016-desktop-shell-architecture-user-experience-framework.md).

---

## 9. Result Types

Search results may include:

- Projects
- Documents
- Tickets
- Users
- Dashboards
- Reports
- Tasks
- Files
- Commands
- Settings
- Workflows
- Sessions
- Notifications

Every result type has its own icon and presentation.

---

## 10. Search Ranking

Results should consider:

- Exact Match
- Usage Frequency
- Recent Activity
- Current Workspace
- Permissions
- User Preferences
- Pinned Items
- Recent Searches
- Future AI Relevance

Ranking remains platform-owned.

Usage and preference signals are platform metadata ([011](./011-platform-data-architecture-database-design-principles.md)).

---

## 11. Permission Awareness

Search results are filtered before presentation.

Users must never discover:

- Restricted Projects
- Hidden Documents
- Administrative Settings
- Unavailable Commands

Search always respects platform permissions.

Permission evaluation is authoritative on the server ([005](./005-desktop-experience-workspace-framework.md), [007](./007-identity-authentication-authorisation-rbac-architecture.md)). Results filtered at query time — not only in the UI.

---

## 12. Search Metadata

Each searchable object exposes:

- Identifier
- Title
- Description
- Keywords
- Category
- Owner
- Modified Date
- Permissions
- Navigation Target

Metadata is managed centrally.

Platform-owned search metadata per [011](./011-platform-data-architecture-database-design-principles.md).

---

## 13. Search Index

The platform maintains a search index.

The index stores:

- Metadata
- Keywords
- Relationships
- References
- Navigation Targets

The search index never replaces backend systems.

Derived data — never System of Record ([011](./011-platform-data-architecture-database-design-principles.md)).

---

## 14. Index Updates

Index updates occur through platform events.

**Examples**

- Project Created
- Document Uploaded
- Ticket Closed
- Workflow Completed
- Permission Changed

Search indexing should remain asynchronous.

Per [012 — Event-Driven Architecture](./012-event-driven-architecture-background-processing-workflow-framework.md). Permission changes must trigger re-index or permission filter updates.

---

## 15. Search Filters

Users may filter by:

- Workspace
- Category
- Owner
- Department
- Status
- Date
- Tags
- Connector
- Module

Search filters remain consistent across the platform.

Filters respect permissions — unavailable categories are not offered ([017](./017-navigation-framework-workspace-navigation-architecture.md)).

---

## 16. Saved Searches

Users may save searches.

**Examples**

- My Open Tickets
- Projects Awaiting Approval
- Documents Modified Today
- Outstanding Reviews

Saved searches belong to the platform.

Stored as user preference metadata ([011](./011-platform-data-architecture-database-design-principles.md), [018](./018-workspace-sessions-window-management-state-persistence-framework.md)).

---

## 17. Search Suggestions

Suggestions include:

- Recent Searches
- Popular Searches
- Recommended Commands
- Recent Objects
- Pinned Objects
- Future AI Suggestions

Suggestions improve productivity.

Integrates with [019 — Command Palette](./019-universal-command-palette-action-framework.md) without duplicating navigation ([017](./017-navigation-framework-workspace-navigation-architecture.md)).

---

## 18. Search Preview

Results should support preview.

**Examples**

- Document Summary
- Project Summary
- Ticket Preview
- Dashboard Snapshot
- Report Details

Preview reduces unnecessary navigation.

Preview content fetched via Platform Services — not direct connector calls.

---

## 19. Search Navigation

Every result has a navigation target.

Opening a result restores the appropriate:

- Workspace
- Tab
- Context
- Session
- Panel

Navigation should preserve productivity.

Aligns with [017 — Navigation Framework](./017-navigation-framework-workspace-navigation-architecture.md) deep linking and [018](./018-workspace-sessions-window-management-state-persistence-framework.md) context preservation. Deep links re-validate permissions on open.

---

## 20. Relationships

Search should expose relationships.

**Example**

Project Alpha

↓

Tasks

↓

Documents

↓

Tickets

↓

Reports

↓

Automation

↓

Activity

Users should discover related work.

Relationship metadata in platform index — not duplicated business records ([011](./011-platform-data-architecture-database-design-principles.md)).

---

## 21. Future Semantic Search

The architecture should support:

- Natural Language
- Embeddings
- Vector Search
- Knowledge Graphs
- AI Ranking

Without redesigning the platform.

Provider abstraction through Platform Search Service — same permission and navigation model.

---

## 22. AI Integration

Future AI capabilities include:

- Summarisation
- Recommendations
- Related Items
- Question Answering
- Knowledge Discovery

AI consumes the same Platform Search Service.

AI does not bypass permission filtering ([013](./013-security-architecture-zero-trust-framework.md)).

---

## 23. Performance

Search should:

- Respond rapidly.
- Cache metadata.
- Load results incrementally.
- Support thousands of records.
- Scale horizontally.
- Avoid unnecessary backend requests.

Per [004](./004-technology-stack-repository-standards-development-environment.md) and shell performance targets ([016](./016-desktop-shell-architecture-user-experience-framework.md)).

---

## 24. Accessibility

Search supports:

- Keyboard
- Screen Readers
- Focus Management
- High Contrast
- Reduced Motion

Accessibility is mandatory.

WCAG AA per [006](./006-enterprise-design-system-ui-standards.md).

---

## 25. Testing

Search requires:

- Unit Tests
- Index Tests
- Permission Tests
- Performance Tests
- Playwright Tests
- Regression Tests
- Connector Tests

Search quality is essential.

Permission tests must verify restricted objects never appear in results ([015](./015-software-quality-testing-qa-cicd-release-management-framework.md)).

---

## 26. Self-Hosted First Principle

The Unified Search Framework must operate entirely using self-hosted open-source technologies.

**Examples include:**

- PostgreSQL Full-Text Search
- OpenSearch (future)
- Meilisearch (future)
- Qdrant (future semantic search)

The search architecture must never require proprietary hosted search services.

The underlying search engine is replaceable through the Platform Search Service.

Aligns with [008](./008-module-plugin-connector-architecture.md) self-hosted OSS first and [004](./004-technology-stack-repository-standards-development-environment.md) stack choices.

---

## 27. Cursor Instructions

When implementing Unified Search:

- Build one Platform Search Service.
- Require every module to register a Search Provider.
- Keep backend implementations hidden.
- Respect permissions before returning results.
- Use asynchronous indexing.
- Design for future semantic search and AI.
- Treat search as a platform capability rather than a module feature.

---

## 28. Acceptance Criteria

The Unified Search Framework is complete when:

- Users search one platform rather than multiple systems.
- Search providers register dynamically.
- Results respect permissions.
- Indexes update automatically.
- Search restores the correct workspace and context.
- Future AI and semantic search integrate without redesign.
- Backend search technologies remain replaceable.
- **Restricted objects never appear in results, suggestions, or previews.**
- **No module implements a standalone search UI or bypasses the Platform Search Service.**

The Unified Search Framework transforms APZHUB into a unified knowledge platform where information is discovered through one consistent experience regardless of its physical location.
