# Document 023 — User Preferences, Personalisation & Workspace Experience Framework

> **Document Version:** 1.0  
> **Classification:** Platform Specification  
> **Status:** Core Platform Standard  
> **Applies To:** Desktop Shell · Every Platform Module · Every Platform Service · Every User · Future Desktop & Mobile Clients  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [022](./022-presentation-engine-theme-framework-branding-architecture.md)  
> **Relationship:** Consolidates preference ownership across [018 — Workspace Sessions](./018-workspace-sessions-window-management-state-persistence-framework.md), [021 — Notifications & Attention](./021-notification-activity-attention-management-framework.md), [022 — Presentation Engine](./022-presentation-engine-theme-framework-branding-architecture.md), [017 — Navigation Framework](./017-navigation-framework-workspace-navigation-architecture.md), and [020 — Unified Search](./020-unified-search-knowledge-discovery-framework.md). Preference data is platform metadata per [011 — Platform Data Architecture](./011-platform-data-architecture-database-design-principles.md).

## 1. Purpose

This document defines how APZHUB manages user preferences, personalisation and workspace experiences.

Personalisation is owned by the platform.

Business modules consume platform preferences rather than implementing their own settings.

---

## 2. Vision

Every user should feel that APZHUB adapts to the way they work.

Users should never need to repeatedly configure the platform.

The platform should remember preferences automatically while maintaining a consistent enterprise experience.

---

## 3. Core Philosophy

Separate:

Platform Behaviour

↓

User Preferences

↓

Workspace State

↓

Business Data

Preferences never modify business rules.

Preferences never change permissions.

Preferences never bypass platform standards.

Per [007 — IAM](./007-identity-authentication-authorisation-rbac-architecture.md) — permissions are authoritative; preferences are non-security decisions.

---

## 4. Categories of Preferences

The platform supports:

- Appearance
- Navigation
- Workspace
- Notifications
- Search
- Accessibility
- Keyboard
- Language
- Regional
- Privacy
- Productivity
- AI (future)

Every preference belongs to one category.

Modules read preferences via Platform Preference Service — never store module-local user settings for platform behaviour ([008](./008-module-plugin-connector-architecture.md)).

---

## 5. Appearance Preferences

**Examples:**

- Theme
- Colour Accent
- Density
- Font Size
- Panel Style
- Animation Level
- High Contrast

Presentation preferences are applied globally.

Per [022 — Presentation Engine](./022-presentation-engine-theme-framework-branding-architecture.md) and [006 — Design System](./006-enterprise-design-system-ui-standards.md). Theme selector in header per [016 — Desktop Shell](./016-desktop-shell-architecture-user-experience-framework.md).

---

## 6. Navigation Preferences

Users may configure:

- Favourite Workspaces
- Pinned Items
- Default Workspace
- Sidebar Behaviour
- Activity Bar Order
- Recently Opened
- Navigation Density

Navigation remains platform-controlled.

Favourites and pinned items are permission-filtered ([017](./017-navigation-framework-workspace-navigation-architecture.md), [005](./005-desktop-experience-workspace-framework.md)).

---

## 7. Workspace Preferences

Persist:

- Panel Sizes
- Panel Visibility
- Split Layout
- Context Panel
- Open Tabs
- Session Behaviour
- Workspace Templates

Workspace behaviour should feel consistent across modules.

Aligns with [018 — Workspace Sessions](./018-workspace-sessions-window-management-state-persistence-framework.md) — references and UI state only, not business data.

---

## 8. Productivity Preferences

**Examples:**

- Default Landing Workspace
- Autosave
- Draft Recovery
- Confirmation Dialogs
- Recent Items
- Quick Actions
- Startup Behaviour

Productivity settings improve efficiency.

Draft recovery per [018](./018-workspace-sessions-window-management-state-persistence-framework.md).

---

## 9. Notification Preferences

Configure:

- Desktop Alerts
- Email
- Digests
- Reminder Frequency
- Do Not Disturb
- Attention Threshold
- Notification Channels

Preferences integrate with the Attention Engine.

Per [021 — Notifications & Attention](./021-notification-activity-attention-management-framework.md) Preference Service.

---

## 10. Search Preferences

Users may configure:

- Recent Searches
- Saved Searches
- Preferred Result Types
- Search History
- Search Suggestions

Search behaviour remains platform-wide.

Per [020 — Unified Search](./020-unified-search-knowledge-discovery-framework.md) — saved searches are platform metadata.

---

## 11. Accessibility Preferences

**Examples:**

- Reduced Motion
- High Contrast
- Large Text
- Keyboard Focus
- Screen Reader Optimisations

Accessibility preferences override presentation preferences where required.

Per [022](./022-presentation-engine-theme-framework-branding-architecture.md) accessibility themes and [006](./006-enterprise-design-system-ui-standards.md) WCAG AA.

---

## 12. Keyboard Preferences

Support:

- Shortcut Overrides (where appropriate)
- Preferred Key Bindings
- Command Palette Behaviour
- Quick Navigation
- Future custom shortcuts

Keyboard interaction remains consistent.

Command Palette defaults per [019 — Universal Command Palette](./019-universal-command-palette-action-framework.md). Overrides must not bypass permission-gated commands.

---

## 13. Language & Regional Settings

Support:

- Language
- Date Format
- Time Format
- Number Format
- Currency
- Time Zone
- Locale

Regional preferences are platform-managed.

Request context locale per [010](./010-api-gateway-integration-communication-standards.md).

---

## 14. Privacy Preferences

**Examples:**

- Activity Visibility
- Presence
- Profile Visibility
- Search Visibility
- Session Sharing
- Future AI Learning Preferences

Privacy settings respect organisational policies.

Organisation policies may lock or override user privacy choices (Section 22). Privacy prefs do not grant access to restricted data ([007](./007-identity-authentication-authorisation-rbac-architecture.md)).

---

## 15. Session Preferences

Configure:

- Automatic Restore
- Session Startup
- Recent Sessions
- Pinned Sessions
- Workspace Recovery

Session behaviour belongs to the platform.

Per [018 — Workspace Sessions](./018-workspace-sessions-window-management-state-persistence-framework.md). Restore re-validates permissions.

---

## 16. Dashboard Preferences

Users may customise:

- Favourite Dashboards
- Default Dashboard
- Widget Order
- Widget Visibility
- Widget Size

Personal dashboards remain platform metadata.

Widget data from Platform Services — not connector-direct ([009](./009-platform-service-layer-integration-framework.md)).

---

## 17. Saved Views

Support:

- Tables
- Reports
- Filters
- Sorting
- Column Visibility
- Grouping

Users should not repeatedly recreate views.

Saved views store filter/sort/column state — not duplicated business records ([011](./011-platform-data-architecture-database-design-principles.md)).

---

## 18. User Profiles

Profiles contain:

- Identity
- Preferences
- Sessions
- Workspace Templates
- Recent Activity
- Favourite Items
- Saved Searches

Profile information remains platform-owned.

Identity from [007](./007-identity-authentication-authorisation-rbac-architecture.md); profile metadata in platform PostgreSQL ([011](./011-platform-data-architecture-database-design-principles.md)).

---

## 19. Preference Hierarchy

Preferences resolve using this order:

System Default

↓

Organisation Default

↓

Role Default

↓

User Preference

↓

Current Session Override

This hierarchy keeps behaviour predictable.

Administrative locked settings override user choices (Section 22). Session overrides are UI state only — never permissions.

---

## 20. Synchronisation

Future capability.

Synchronise preferences across:

- Desktop
- Browser
- Tablet
- Mobile

Preferences follow the user.

Architecture supports future sync without redesign ([018](./018-workspace-sessions-window-management-state-persistence-framework.md), [022](./022-presentation-engine-theme-framework-branding-architecture.md) client-agnostic model).

---

## 21. Import & Export

Users may:

- Export Preferences
- Import Preferences
- Reset Preferences
- Share Workspace Templates

Personalisation becomes portable.

Export must not include inaccessible resource references or secrets ([013](./013-security-architecture-zero-trust-framework.md)).

---

## 22. Administration

Administrators may define:

- Organisation Defaults
- Mandatory Preferences
- Locked Settings
- Recommended Settings
- Brand Defaults

Administrative policies take precedence.

Brand defaults via [022](./022-presentation-engine-theme-framework-branding-architecture.md) Branding Service. Superadmin configures policies — not a normal user persona ([007](./007-identity-authentication-authorisation-rbac-architecture.md)).

---

## 23. AI Preferences (Future)

Users may configure:

- AI Assistant Behaviour
- Preferred Models
- Summaries
- Recommendations
- Privacy
- Automation Permissions

AI remains optional.

AI prefs do not bypass permission or privacy policies ([013](./013-security-architecture-zero-trust-framework.md)).

---

## 24. Performance

Preference loading should:

- Be immediate.
- Require minimal backend calls.
- Support caching.
- Load before the desktop shell renders.

The platform should never visibly "reconfigure" after loading.

Preferences loaded before shell render per [016](./016-desktop-shell-architecture-user-experience-framework.md) performance targets ([004](./004-technology-stack-repository-standards-development-environment.md)).

---

## 25. Security

Preferences should never:

- Grant permissions
- Reveal restricted information
- Expose connector details
- Override administrative policies

Preferences remain non-security decisions.

Zero Trust applies — prefs are not an authz bypass ([013](./013-security-architecture-zero-trust-framework.md)). No connector credentials or backend branding in preference payloads ([002](./002-product-naming-positioning-terminology-standard.md)).

---

## 26. Self-Hosted First Principle

All preference data is stored within the APZHUB Platform Database.

No preference data should require proprietary cloud synchronisation services.

Future synchronisation between user devices should operate entirely through self-hosted platform services.

Platform PostgreSQL per [011](./011-platform-data-architecture-database-design-principles.md) and [008](./008-module-plugin-connector-architecture.md) self-hosted OSS first.

---

## 27. Testing

Preference functionality requires:

- Unit Tests
- Persistence Tests
- Migration Tests
- Playwright Tests
- Accessibility Tests
- Performance Tests
- Regression Tests

Preference reliability is essential.

Hierarchy resolution and locked-admin settings per [015](./015-software-quality-testing-qa-cicd-release-management-framework.md).

---

## 28. Cursor Instructions

When implementing user preferences:

- Treat preferences as platform metadata.
- Never store preferences inside business modules.
- Build reusable preference services.
- Respect the preference hierarchy.
- Keep personalisation independent of business logic.
- Optimise for rapid loading.
- Ensure future synchronisation requires no architectural redesign.

The Preference Framework is a platform capability and must remain independent of module implementations.

Platform Preference Service per [009](./009-platform-service-layer-integration-framework.md).

---

## 29. Acceptance Criteria

The User Preference Framework is complete when:

- Preferences persist across sessions.
- Workspace layouts restore correctly.
- Personalisation does not affect business rules.
- Organisation defaults and user preferences coexist through a defined hierarchy.
- Preferences remain portable and synchronisable.
- Future AI settings integrate naturally.
- The platform adapts to individual users while maintaining architectural consistency.
- **Preferences never grant permissions or expose restricted data.**
- **No module implements its own preference store for platform behaviour.**

The User Preference Framework enables APZHUB to deliver a personalised Enterprise Workbench experience without compromising platform integrity.
