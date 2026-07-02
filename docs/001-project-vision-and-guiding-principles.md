# Document 001 — Project Vision & Guiding Principles

> **Status:** Foundation document — active  
> **Depends on:** [000 — Engineering Constitution](./000-apzhub-engineering-constitution.md)  
> **Product name:** APZHUB (working name)

## 1. Project Name

Working name: **APZHUB**

This may be changed later, but all initial code, documents, and architecture should refer to the platform as **APZHUB** unless instructed otherwise.

---

## 2. Product Vision

APZHUB is a modern internal productivity platform designed to give users one seamless desktop-style application through which they can access work, projects, tickets, documents, time tracking, workflows, analytics, testing, compliance, security tools, and operational systems.

The platform must feel like a single professional application, not a collection of separate open-source products.

Users must never need to understand, see, or directly interact with the underlying backend engines.

---

## 3. Core Principle

APZHUB is not a portal of links.

APZHUB is an enterprise application layer that uses selected open-source products as backend engines and sources of truth.

The APZHUB frontend must communicate only with APZHUB-controlled APIs and services.

The frontend must never call Metabase, Kimai, n8n, Plane, Paperless, Zammad, Kiwi TCMS, Greenbone, Faraday, MobSF, or any future backend engine directly.

---

## 4. Backend Engines

Initial backend engines may include:

- BetterAuth — authentication and identity
- Caddy or Nginx — reverse proxy and routing
- Metabase — analytics and dashboards
- Kimai — time tracking
- n8n — workflow automation
- Plane — project and task management
- Paperless-ngx — document management
- Zammad — ticketing and support
- Kiwi TCMS — test case management

Future backend engines may include:

- Greenbone
- Faraday
- MobSF
- Grafana
- Prometheus
- Loki
- Wazuh
- Additional open-source business, security, compliance, and operational tools

---

## 5. Architectural Rule

Every backend engine must be integrated through a dedicated APZHUB service layer.

Each service layer must provide:

- Authentication handling
- User mapping
- Role mapping
- Permission mapping
- API gateway functions
- Data transformation
- Error handling
- Audit logging
- Sync logic where required
- Health checks
- Testing coverage

No backend service should be exposed directly to end users.

---

## 6. User Experience Vision

APZHUB must look and feel like a modern desktop productivity application.

The visual inspiration is:

- Cursor
- VS Code
- Vercel dashboard
- Linear
- GitHub Codespaces
- Modern admin workbenches

The interface should use:

- Tight layouts
- Resizable panels
- Left sidebar navigation
- Top command bar
- Workspace tabs
- Docked tools
- Context panels
- Keyboard shortcuts
- Command palette
- Light and dark modes
- Professional enterprise styling

The application must feel fast, sharp, and efficient.

---

## 7. Identity and Roles

BetterAuth will be the primary authentication layer.

APZHUB must maintain its own internal user, role, and permission model.

A user may have different roles across different services.

Example:

- User is a Manager in APZHUB
- Project Admin in Plane
- Viewer in Metabase
- Agent in Zammad
- Timesheet User in Kimai
- Reviewer in Paperless
- Tester in Kiwi TCMS

APZHUB must translate platform permissions into backend-specific permissions.

---

## 8. Masking Requirement

All backend engine branding, URLs, login screens, menus, terminology, and UI elements must be hidden from normal users.

Users should experience only:

- APZHUB navigation
- APZHUB screens
- APZHUB terminology
- APZHUB permissions
- APZHUB workflows

Backend product names may appear only in admin, developer, integration, or diagnostic areas.

---

## 9. Development Methodology

The project must be built in controlled parts.

Do not build the full application at once.

Each part must have:

- Requirements
- Technical design
- UI specification
- API specification
- Data model where needed
- Unit tests
- Integration tests
- Playwright E2E tests
- Regression tests
- Documentation
- Acceptance criteria

No feature is complete unless it is tested and documented.

---

## 10. Testing Principle

Testing is mandatory from the start.

The platform must include:

- Unit tests
- Component tests
- API tests
- Integration tests
- Playwright E2E tests
- Regression tests
- Accessibility checks where practical

Every major user journey must have Playwright coverage.

---

## 11. Cursor Instruction

Cursor must treat this document as the foundation document for the project.

Do not contradict this document unless the project owner explicitly changes the direction.

When generating code, Cursor must prioritise:

- Clean architecture
- Modular services
- Strong typing
- Testability
- Clear naming
- Maintainability
- Security
- Future extensibility

---

## 12. Definition of Success

The project is successful when users can work inside APZHUB as their primary productivity environment without needing to know that multiple backend systems power the platform.

APZHUB must feel like one unified product.

The backend engines must feel invisible.
