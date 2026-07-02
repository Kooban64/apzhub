# Document 021 — Notification, Activity & Attention Management Framework

> **Document Version:** 1.0  
> **Classification:** Platform Specification  
> **Status:** Core Platform Standard  
> **Applies To:** Desktop Shell · Every Platform Module · Every Platform Service · Every Connector · Future AI Services · Future Mobile & Desktop Clients  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [020](./020-unified-search-knowledge-discovery-framework.md)  
> **Relationship:** Expands [005 — Desktop Experience & Workspace Framework](./005-desktop-experience-workspace-framework.md) Section 12 (Notification Layer summary). Delivered through [016 — Desktop Shell](./016-desktop-shell-architecture-user-experience-framework.md) Notification Layer and Status Bar. Events from [012 — Event-Driven Architecture](./012-event-driven-architecture-background-processing-workflow-framework.md); centralised in [009 — Platform Service Layer](./009-platform-service-layer-integration-framework.md). Search integration per [020 — Unified Search](./020-unified-search-knowledge-discovery-framework.md). User notification preferences: [023 — User Preferences](./023-user-preferences-personalisation-workspace-experience-framework.md).

## 1. Purpose

This document defines the Notification, Activity and Attention Management Framework for APZHUB.

The framework is responsible for ensuring users receive the right information, at the right time, in the right place, with the right priority.

Notifications are a delivery mechanism.

Attention Management is the platform capability.

---

## 2. Vision

The platform should minimise interruption while ensuring users never miss important work.

The framework should distinguish between:

- Information
- Action Required
- Urgent Action
- System Health
- Background Progress
- Personal Activity
- Team Activity
- Future AI Recommendations

The platform manages attention—not simply messages.

---

## 3. Core Philosophy

Modules never send notifications.

Modules publish events.

Platform Services determine whether notifications should be created.

The Notification Framework determines:

- Whether to notify
- Who to notify
- When to notify
- How to notify
- When to suppress
- How long to retain

This keeps notification behaviour consistent.

Per [009](./009-platform-service-layer-integration-framework.md) and [012](./012-event-driven-architecture-background-processing-workflow-framework.md) — modules do not notify, search, audit, or activity directly.

---

## 4. Framework Components

The framework consists of:

- Notification Service
- Activity Service
- Attention Engine
- Preference Service
- Delivery Service
- Subscription Service
- Reminder Service
- Digest Service
- Future AI Recommendation Service

Each component has a defined responsibility.

Platform Services — not modules or connectors ([008](./008-module-plugin-connector-architecture.md)).

---

## 5. Notification Types

Examples include:

- Information
- Success
- Warning
- Error
- Assignment
- Approval Required
- Reminder
- Escalation
- Background Completion
- Connector Alert
- Security Alert
- Maintenance Notice

Each type has predefined behaviour.

Presentation per [006 — Enterprise Design System](./006-enterprise-design-system-ui-standards.md).

---

## 6. Activity Stream

The Activity Stream records significant user and platform events.

**Examples:**

- Project Created
- Task Assigned
- Document Uploaded
- Workflow Completed
- User Provisioned
- Role Changed
- Connector Failed
- Module Installed

Activities are platform-owned.

Immutable audit-aligned activity per [011](./011-platform-data-architecture-database-design-principles.md). Distinct from operational telemetry ([014](./014-observability-monitoring-telemetry-health-framework.md)).

---

## 7. Personal Activity

Each user has a personal activity timeline.

**Examples:**

- Recent Work
- Assigned Tasks
- Approvals
- Recently Viewed
- Background Jobs
- Mentions
- Comments

Users can resume work easily.

Aligns with [018 — Workspace Sessions](./018-workspace-sessions-window-management-state-persistence-framework.md) recent work and [017 — Navigation Framework](./017-navigation-framework-workspace-navigation-architecture.md) recently visited.

---

## 8. Team Activity

Teams may subscribe to shared activity.

**Examples:**

- Support Queue
- Project Team
- Compliance
- Security
- Management

Team activity supports collaboration.

Subscription and visibility are permission-gated ([007](./007-identity-authentication-authorisation-rbac-architecture.md)).

---

## 9. Attention Levels

Every notification receives an attention level.

- Critical
- High
- Normal
- Low
- Informational

Attention level determines behaviour.

Determined by Attention Engine — not by modules.

---

## 10. Delivery Channels

- Desktop Toast
- Notification Centre
- Status Bar
- Workspace Banner
- Email
- Push Notification (future)
- SMS (future)
- Teams/Slack (future)

Users configure preferred delivery channels.

Shell surfaces per [016](./016-desktop-shell-architecture-user-experience-framework.md) — toast, Notification Centre, Status Bar, header indicator.

---

## 11. Notification Centre

The Notification Centre provides:

- Unread
- Read
- Pinned
- Snoozed
- Archived
- Filtered
- Searchable

Notifications remain searchable.

Integrates with [020 — Unified Search](./020-unified-search-knowledge-discovery-framework.md).

---

## 12. Reminder Engine

Supports:

- Snooze
- Repeat
- Escalate
- Expire
- Follow-up

Users control reminder behaviour.

---

## 13. Digests

The platform may generate:

- Morning Summary
- End-of-Day Summary
- Weekly Summary
- Connector Health Summary
- Approval Summary
- Future AI Daily Briefing

Digests reduce notification fatigue.

Attention Engine routes low-priority items to digests rather than interrupting.

---

## 14. Subscription Model

Users subscribe to:

- Projects
- Teams
- Documents
- Dashboards
- Reports
- Tickets
- Workflows

Subscriptions determine notification eligibility.

Subscriptions respect permissions — users cannot subscribe to inaccessible resources ([005](./005-desktop-experience-workspace-framework.md)).

---

## 15. Mentions

Support:

- @User
- @Team
- @Role

Mentions automatically generate attention items.

Mention targets must be permission-validated.

---

## 16. Background Progress

Long-running operations publish progress.

**Examples:**

- Report Generation
- OCR
- Imports
- Provisioning
- Exports

Users should never wonder whether work is still executing.

Per [012](./012-event-driven-architecture-background-processing-workflow-framework.md) — async jobs publish progress events; Status Bar integration ([016](./016-desktop-shell-architecture-user-experience-framework.md)). Session switches do not cancel jobs ([018](./018-workspace-sessions-window-management-state-persistence-framework.md)).

---

## 17. Activity Timeline

Every activity records:

- Timestamp
- Actor
- Action
- Target
- Workspace
- Module
- Correlation ID
- Outcome

Activities provide historical context.

Correlation IDs per [010](./010-api-gateway-integration-communication-standards.md) and [012](./012-event-driven-architecture-background-processing-workflow-framework.md).

---

## 18. Search Integration

Activities and notifications integrate with Platform Search.

Users should search:

- "My approvals"
- "Yesterday's work"
- "Failed imports"
- "Unread alerts"

The Notification Framework contributes searchable metadata.

Per [020 — Unified Search](./020-unified-search-knowledge-discovery-framework.md) — permission-filtered results.

---

## 19. AI Integration

Future AI capabilities may:

- Summarise activity
- Prioritise notifications
- Recommend actions
- Detect unusual behaviour
- Identify overdue work
- Generate daily briefings

AI consumes the same activity data.

AI does not bypass permission filtering ([013](./013-security-architecture-zero-trust-framework.md)).

---

## 20. Attention Engine

The Attention Engine decides:

- Should this interrupt the user?
- Should it wait?
- Should it appear in a digest?
- Should it escalate?
- Should it repeat?
- Should it be ignored?

The engine prevents notification overload.

Core platform capability — modules cannot override delivery logic.

---

## 21. Context Awareness

Notifications should consider:

- Current Workspace
- Current Session
- User Presence
- Current Task
- Do Not Disturb
- Working Hours (future)

Context improves relevance.

Integrates with [018 — Workspace Sessions](./018-workspace-sessions-window-management-state-persistence-framework.md).

---

## 22. User Preferences

Users configure:

- Channels
- Priority Thresholds
- Sounds
- Desktop Alerts
- Email
- Digests
- Snooze Rules

Preferences remain platform-owned.

User preference metadata per [011](./011-platform-data-architecture-database-design-principles.md).

---

## 23. Administrative Controls

Administrators may configure:

- System Announcements
- Maintenance Notices
- Connector Alerts
- Security Alerts
- Mandatory Notifications
- Platform Messages

Administrative communication remains centralised.

Administrative and connector health surfaces are permission-gated; standard users do not see raw backend dashboards ([014](./014-observability-monitoring-telemetry-health-framework.md), [002](./002-product-naming-positioning-terminology-standard.md)). Superadmin is explicit tier — not normal user persona ([007](./007-identity-authentication-authorisation-rbac-architecture.md)).

---

## 24. Security

Notifications respect:

- Permissions
- Workspace Visibility
- Document Access
- Project Membership
- Organisation Policies

Notifications never reveal inaccessible information.

Zero Trust applies ([013](./013-security-architecture-zero-trust-framework.md)). Notification content must not leak backend product names or internal connector details to standard users ([002](./002-product-naming-positioning-terminology-standard.md)).

---

## 25. Performance

The framework should:

- Process asynchronously.
- Support batching.
- Handle high event volumes.
- Scale horizontally.
- Remain responsive.

Notification generation should never block user interaction.

Per [012](./012-event-driven-architecture-background-processing-workflow-framework.md) — never block request handlers for notification delivery.

---

## 26. Self-Hosted First Principle

The framework should rely entirely on self-hosted open-source infrastructure.

Delivery mechanisms may integrate with:

- SMTP
- WebSockets
- Server-Sent Events
- Push Services (future)
- Messaging Queues

The architecture should not depend on proprietary notification platforms.

Aligns with [008](./008-module-plugin-connector-architecture.md) self-hosted OSS first and [004](./004-technology-stack-repository-standards-development-environment.md).

---

## 27. Testing

The framework requires:

- Unit Tests
- Integration Tests
- Preference Tests
- Delivery Tests
- Reminder Tests
- Performance Tests
- Playwright Tests
- Regression Tests

Notification quality is essential.

Permission tests must verify inaccessible content never appears in notifications, activity, or search ([015](./015-software-quality-testing-qa-cicd-release-management-framework.md)).

---

## 28. Cursor Instructions

When implementing the Notification Framework:

- Build notifications from platform events.
- Keep notification logic centralised.
- Separate activities from notifications.
- Use the Attention Engine to determine delivery.
- Respect user preferences.
- Make activities searchable.
- Design for future AI prioritisation.

Notifications are a platform capability rather than a feature of individual modules.

---

## 29. Acceptance Criteria

The Notification & Attention Framework is complete when:

- Modules publish events rather than notifications.
- Activities provide a searchable work history.
- Notifications respect permissions and user preferences.
- Attention levels determine delivery behaviour.
- Digests reduce notification fatigue.
- Long-running jobs report progress consistently.
- Future AI services can prioritise and summarise user activity.
- The framework scales across all platform modules.
- **Notifications never expose records or actions the user cannot access.**
- **No module implements its own notification or activity subsystem.**

The Notification, Activity & Attention Management Framework ensures APZHUB communicates with users intelligently, consistently and without unnecessary interruption.
