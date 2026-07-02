# APZHUB technology stack quick reference

One-page lookup derived from [004](./004-technology-stack-repository-standards-development-environment.md).

## Stack (do not substitute without approval)

| Layer           | Technology                                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend        | Next.js (App Router), React, TypeScript strict, Tailwind, shadcn/ui, TanStack Query, TanStack Table, React Hook Form, Zod, Lucide, Motion (subtle only) |
| Backend         | Next.js Server Actions + Route Handlers, BetterAuth, TypeScript, Node.js LTS                                                                            |
| Database        | PostgreSQL (platform-owned data)                                                                                                                        |
| Cache           | Redis (sessions, cache, rate limit, queues, locks, temp state)                                                                                          |
| Object storage  | S3-compatible (attachments, exports, reports, uploads)                                                                                                  |
| Reverse proxy   | Caddy (primary) or Nginx                                                                                                                                |
| Auth            | BetterAuth — SSO via APZHUB                                                                                                                             |
| Package manager | **pnpm** (lock file committed)                                                                                                                          |
| APIs            | REST-first; GraphQL only if later justified                                                                                                             |

## Monorepo layout

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

No unrelated code at repository root.

## Module folder structure

```
components/  pages/  services/  repositories/  hooks/
types/  validators/  schemas/  tests/  documentation/
```

Self-contained; shared packages hold no module-specific business logic.

## Shared packages (examples)

UI · Design System · Auth · Permissions · Utilities · Config · Logging · Notifications · Search · API Client · Testing Helpers · Types

## Every API endpoint requires

Validation · Authentication · Authorisation · Audit logging · Error handling

## Code quality (mandatory on every PR)

ESLint · Prettier · Type check · Unused import detection · Dead code detection · Build validation

TypeScript strict — no `any`. Prefer interfaces, composition, immutability, small pure functions, DI where appropriate.

## Testing (not optional)

Unit · Component · Integration · API · Playwright E2E · Regression

Major journeys: login, logout, navigation, create project, upload document, support request, workflow approval, search, notifications, permissions — deterministic and repeatable.

## CI pipeline (every commit)

Install → Lint → Type check → Unit tests → Integration tests → Playwright → Build → Artifacts

Deploy only if all mandatory stages pass. Full quality framework: [015](./015-software-quality-testing-qa-cicd-release-management-framework.md).

## Platform PostgreSQL owns

Users · Permissions · Navigation · Settings · Audit · Search · Platform config · Module registration · Activity feed · Notifications

Engines own their domain data.

## Configuration

No hardcoded values. Env vars · config service · platform settings · secrets manager. **Never commit secrets.**

## Logging (structured)

Auth · permission changes · workflows · API/system errors · module registration · integration failures

## Security (every module)

HTTPS · CSRF · XSS · rate limiting · input validation · output encoding · secure cookies · RBAC · audit · least privilege

## Accessibility

Target WCAG AA — keyboard, screen readers, high contrast, focus management, reduced motion.

## Performance

Fast initial load · lazy loading · code splitting · minimal bundles · caching · efficient APIs · avoid unnecessary re-renders.

## Definition of complete

Requirements + architecture approved → code → tests pass → docs → peer review → integrated → regression pass → merge.

## Technical debt

Track explicitly: reason, owner, expected resolution, target release. No hidden debt.

## Engineering philosophy

Years-long lifespan — maintainability, stability, type safety, security, testability, performance, scalability, DX, long-term support — not popularity chasing.
