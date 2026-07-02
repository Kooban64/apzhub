# Document 004 — Technology Stack, Repository Standards & Development Environment

> **Status:** Active — engineering standard (mandatory)  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md), [002](./002-product-naming-positioning-terminology-standard.md), [003](./003-overall-system-architecture-design-principles.md)  
> **Relationship:** [024 — APZHUB Platform SDK & Development Framework](./024-apzhub-platform-sdk-development-framework.md) codifies extension contracts, manifests, registration, and lifecycle that implement these stack and repo standards. [025 — Module SDK & Manifest Standard](./025-module-sdk-module-manifest-module-development-standard.md) defines the Module SDK, `module.yaml` schema, and module development workflow.

## 1. Purpose

This document defines the official technology stack, repository structure, development standards, coding conventions, testing framework, and engineering principles for APZHUB.

These standards are mandatory and must be followed throughout the project.

Cursor must not substitute technologies without explicit approval.

---

## 2. Engineering Philosophy

The platform is expected to have a lifespan measured in years.

Technology choices must prioritise:

- Maintainability
- Stability
- Type Safety
- Security
- Testability
- Performance
- Scalability
- Developer Experience
- Long-term support

Avoid choosing technologies based solely on popularity.

---

## 3. Primary Technology Stack

### Frontend

- Next.js (App Router)
- React
- TypeScript (Strict Mode)
- Tailwind CSS
- shadcn/ui
- TanStack Query
- TanStack Table
- React Hook Form
- Zod
- Lucide Icons
- Motion (for subtle animations only)

### Backend

- Next.js Server Actions where appropriate
- Next.js Route Handlers
- BetterAuth
- TypeScript
- Node.js LTS

Business logic must remain inside Platform Services.

### Database

**Primary database:** PostgreSQL

Platform owns:

- Users
- Permissions
- Navigation
- Settings
- Audit
- Search
- Platform Configuration
- Module Registration
- Activity Feed
- Notifications

Backend engines remain owners of their own domain data.

### Cache

**Redis** — used for:

- Sessions
- Caching
- Rate Limiting
- Queues
- Temporary State
- Locks

### Object Storage

**S3-compatible storage** — used for:

- Attachments
- Exports
- Generated Reports
- Temporary Uploads
- Platform Files

---

## 4. Reverse Proxy

**Primary:** Caddy

**Alternative:** Nginx

Responsibilities:

- TLS
- Routing
- Compression
- Static Assets
- Security Headers
- Load Balancing
- Service Discovery

---

## 5. Authentication

**BetterAuth**

Single Sign-On managed by APZHUB.

Backend engines authenticate through Platform Services where possible.

Users should authenticate only once.

---

## 6. API Design

**Platform APIs:** REST-first. GraphQL may be introduced later if justified.

**Internal APIs:** Strongly typed, validated, versioned, documented.

Every endpoint requires:

- Validation
- Authentication
- Authorisation
- Audit Logging
- Error Handling

---

## 7. Repository Strategy

**Single monorepo.**

Example structure:

```
/apps
/packages
/services
/modules
/adapters
/libs
/tooling
/scripts
/docs
/tests
/docker
/infrastructure
```

No unrelated code should exist at repository root.

---

## 8. Module Structure

Each Platform Module should contain:

```
components/
pages/
services/
repositories/
hooks/
types/
validators/
schemas/
tests/
documentation/
```

Every module should be self-contained.

---

## 9. Shared Packages

Shared packages may include:

- UI Components
- Design System
- Authentication
- Permissions
- Utilities
- Configuration
- Logging
- Notifications
- Search
- API Client
- Testing Helpers
- Types

Shared packages must not contain module-specific business logic.

---

## 10. Coding Standards

- TypeScript Strict Mode is mandatory.
- Avoid `any`.
- Prefer interfaces.
- Prefer composition.
- Prefer immutable data.
- Keep functions small.
- Prefer pure functions.
- Dependency Injection where appropriate.
- Meaningful naming.
- Avoid abbreviations.
- No duplicated logic.
- Every public function should have clear documentation.

---

## 11. Error Handling

Errors must be:

- Consistent
- Typed
- Logged
- Audited

Never expose internal stack traces.

Never expose backend engine errors directly.

---

## 12. Logging

Every important action should be logged.

Examples:

- Authentication
- Permission Changes
- Workflow Execution
- API Errors
- System Errors
- Module Registration
- Integration Failures

Logs should be structured.

---

## 13. Configuration

No hardcoded values.

Configuration should come from:

- Environment Variables
- Configuration Service
- Platform Settings
- Secrets Manager

Never commit secrets.

---

## 14. Package Management

**Package manager:** pnpm

Lock file must always be committed.

Avoid unnecessary dependencies.

Review dependency quality before installation.

---

## 15. Code Quality

Mandatory:

- ESLint
- Prettier
- Type Checking
- Unused Import Detection
- Dead Code Detection
- Build Validation

Every Pull Request must pass all checks.

---

## 16. Documentation

Every module requires:

- README
- Architecture Notes
- API Documentation
- Configuration
- Testing Instructions
- Known Limitations

No undocumented modules.

---

## 17. Testing Standards

Every feature requires:

- Unit Tests
- Component Tests
- Integration Tests
- API Tests
- Playwright End-to-End Tests
- Regression Tests

Critical business workflows require end-to-end coverage.

Testing is not optional.

---

## 18. Playwright Standards

Every major user journey must be automated.

Examples:

- Login
- Logout
- Navigation
- Create Project
- Upload Document
- Submit Support Request
- Approve Workflow
- Search
- Notifications
- Permissions

Tests must be deterministic and repeatable.

---

## 19. Continuous Integration

Every commit should trigger:

- Install
- Lint
- Type Check
- Unit Tests
- Integration Tests
- Playwright
- Build
- Artifact Generation

Deployment should never occur if any mandatory stage fails.

---

## 20. Performance Standards

Optimise for:

- Fast initial load
- Lazy loading
- Code splitting
- Minimal bundle size
- Caching
- Efficient API usage

Avoid unnecessary re-renders.

---

## 21. Accessibility

Platform should aim for WCAG AA compliance.

Support:

- Keyboard Navigation
- Screen Readers
- High Contrast
- Focus Management
- Reduced Motion

Accessibility is part of quality.

---

## 22. Security

Mandatory:

- HTTPS
- CSRF Protection
- XSS Protection
- Rate Limiting
- Input Validation
- Output Encoding
- Secure Cookies
- Role-Based Access Control
- Audit Logging
- Least Privilege

Security applies to every module.

---

## 23. AI Development Standards

Cursor should:

- Generate modular code.
- Prefer reusable components.
- Avoid duplicate implementations.
- Keep files focused.
- Suggest refactoring where beneficial.
- Never bypass architecture.

When uncertain, ask for clarification rather than making architectural assumptions.

---

## 24. Technical Debt

Technical debt should be tracked explicitly.

Temporary workarounds require:

- Reason
- Owner
- Expected Resolution
- Target Release

No hidden technical debt.

---

## 25. Definition of Complete

A feature is complete only when:

- Requirements approved.
- Architecture approved.
- Code implemented.
- Tests passing.
- Documentation written.
- Peer reviewed.
- Integrated successfully.
- Regression tests pass.

Only then may it be merged.

---

## 26. Cursor Instruction

Treat this document as the engineering standard for the entire platform.

Do not introduce alternative technologies without approval.

Optimise for long-term maintainability rather than short-term implementation speed.

Every line of code should contribute to a platform capable of supporting dozens of modules, hundreds of users, and years of future development.

The architecture, repository, and coding standards defined here are mandatory for all future work.
