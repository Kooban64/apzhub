# Document 002 — Product Naming, Positioning & Terminology Standard

> **Status:** Active — naming and language standard  
> **Depends on:** [001 — Project Vision & Guiding Principles](./001-project-vision-and-guiding-principles.md)

## 1. Purpose

This document defines the official terminology, naming conventions, branding principles, and language standards for APZHUB.

All documentation, source code, APIs, UI components, database schemas, and user interfaces must comply with this document.

The objective is to ensure consistency throughout the entire platform.

---

## 2. Product Positioning

APZHUB is an Enterprise Productivity Platform.

It is not:

- a portal
- a dashboard
- an intranet
- a collection of OSS applications

It is a unified enterprise operating environment.

The platform brings together multiple specialist services behind one consistent user experience.

---

## 3. Guiding Language

Throughout the product, always refer to APZHUB as:

- Platform
- Workspace
- Workbench
- Environment

Never refer to APZHUB as:

- Portal
- Launcher
- Dashboard of tools
- Collection of applications

---

## 4. Backend Product Naming

Backend product names must never appear in the standard user interface.

Examples:

| Avoid     | Use           |
| --------- | ------------- |
| Plane     | Projects      |
| Kimai     | Time Tracking |
| Paperless | Documents     |
| Zammad    | Support       |
| Kiwi TCMS | Testing       |
| Metabase  | Analytics     |
| n8n       | Automation    |

Users should never need to know which backend engine powers each capability.

---

## 5. Internal Terminology

The engineering team may use backend product names only in:

- integration services
- adapters
- infrastructure
- documentation for developers
- diagnostic tools
- system administration

The frontend must remain product-neutral.

---

## 6. Navigation Standard

Primary navigation should describe business capability, not technology.

Examples:

- Projects
- Tasks
- Documents
- Support
- Testing
- Automation
- Analytics
- Compliance
- Security
- Operations
- Settings
- Administration

Never use backend product names as navigation items.

---

## 7. User Language

The platform should use natural business terminology.

Avoid technical language wherever possible.

| Instead of       | Use                    |
| ---------------- | ---------------------- |
| Execute Workflow | Run Automation         |
| Submit Ticket    | Create Support Request |
| Upload Asset     | Upload Document        |

The platform should feel approachable to non-technical users.

---

## 8. API Naming

Internal services should follow a consistent naming convention.

Examples:

- ProjectService
- DocumentService
- TestingService
- SupportService
- AnalyticsService
- AutomationService
- IdentityService
- NotificationService
- SearchService
- PermissionService

Avoid backend-specific service names such as:

- PlaneService
- KimaiService
- PaperlessService

The backend implementation should remain hidden behind adapters.

---

## 9. Adapter Naming

Each backend integration should use an adapter pattern.

Examples:

- ProjectAdapter
- DocumentAdapter
- AnalyticsAdapter
- TestingAdapter
- SupportAdapter
- AutomationAdapter

Inside the adapter implementation, backend-specific clients may exist.

Example:

- PlaneClient
- KimaiClient
- PaperlessClient

These clients must never be used directly by application code.

Application code interacts only with platform services.

---

## 10. Branding Principle

Everything visible to end users belongs to APZHUB.

Examples include:

- Login screen
- Navigation
- Menus
- Icons
- Notifications
- Dialogs
- Emails
- Reports
- Exports
- Documentation
- Help screens
- Settings

No backend logos or branding should be visible unless explicitly enabled for administrators.

---

## 11. Workspace Concept

The application is organised into Workspaces.

Examples:

- Project Workspace
- Support Workspace
- Document Workspace
- Testing Workspace
- Analytics Workspace
- Automation Workspace
- Administration Workspace
- Compliance Workspace

A Workspace may contain:

- Views
- Panels
- Tools
- Actions
- Widgets
- Tabs

Each Workspace behaves consistently throughout the platform.

---

## 12. Feature Naming

Features should be named using business language.

Examples:

- Time Tracking
- Leave
- Approvals
- Projects
- Documents
- Support
- Automation
- Reporting
- Testing
- Monitoring
- Compliance
- Audit
- Notifications

Avoid exposing implementation details.

---

## 13. Code Naming Standards

**UI components**

- ProjectSidebar
- ProjectExplorer
- WorkspaceHeader
- WorkspaceTabs
- NotificationPanel
- ActivityFeed
- SearchPanel
- CommandPalette

**Services**

- ProjectService
- SupportService
- TestingService
- PermissionService

**Repositories**

- ProjectRepository
- DocumentRepository
- UserRepository
- PermissionRepository

Avoid vendor-specific naming in application code.

---

## 14. Future Expansion Principle

Every future backend integration must conform to these naming standards.

Regardless of whether the backend is:

- Greenbone
- Faraday
- MobSF
- Grafana
- Prometheus
- Loki
- Wazuh
- or any future platform,

users must experience only APZHUB terminology.

---

## 15. Cursor Instruction

Cursor must treat APZHUB as the product.

Cursor must never expose backend implementation details in generated UI unless specifically instructed.

When adding new functionality:

- Think in business capabilities.
- Hide infrastructure.
- Maintain consistent terminology.
- Keep the user experience platform-centric.

The user interacts with APZHUB.

APZHUB interacts with backend services.

Backend services interact with backend engines.

This separation is mandatory throughout the project.
