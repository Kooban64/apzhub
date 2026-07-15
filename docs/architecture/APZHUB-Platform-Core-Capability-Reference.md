# APZHUB Platform Core — Capability Reference

> **Status:** Canonical capability catalogue (PC-001)  
> **Companion:** [Platform Core Reference Architecture](./APZHUB-Platform-Core-Reference-Architecture.md)

---

## 1. Platform Runtime

| Field | Detail |
|-------|--------|
| **Purpose** | Manifest-driven orchestration, capability discovery, lifecycle, health aggregation |
| **Package** | `@apzhub/platform-runtime` |
| **Services** | `Runtime.bootstrap()`, Capability Registry, Lifecycle Manager, Dependency Graph, Health Manager, Configuration Manager |
| **Repositories** | In-process registry stores (no DB) |
| **APIs** | Consumed via `/api/health` runtime section; bootstrap diagnostics |
| **Diagnostics** | `Runtime.registry()`, health summary, capability counts |
| **Dependencies** | Manifest engine, filesystem manifests |
| **Consumers** | Workbench, Operations Console, all framework bootstraps |
| **Future extensions** | External capability bus, multi-instance registry sync (PCv2) |

---

## 2. Workbench Framework

| Field | Detail |
|-------|--------|
| **Purpose** | Permanent desktop shell — navigation, views, sessions, layout, context |
| **Package** | `@apzhub/workbench-framework` |
| **Services** | Workbench Manager, 8 engines (Navigation, View, Session, Layout, Context, Selection, Presentation, Request Bus), Workbench API |
| **Repositories** | Session state (localStorage); server metadata via platform APIs |
| **APIs** | Workbench API v1; manifest `workbench.*` blocks |
| **Diagnostics** | Per-engine diagnostics; hydration status |
| **Dependencies** | Platform Runtime, Authorization (permission adapter) |
| **Consumers** | `apps/web`, `apps/law-platform`, all module manifests; **Support workspace** (OSS-110-13 — Activity Bar / sidebar via `services/support/manifests/`, routed in `workbench-page.tsx`) |
| **Future extensions** | Electron/Tauri shell, multi-window docking enhancements; Support UI certification (OSS-110-14) |

---

## 3. Identity

| Field | Detail |
|-------|--------|
| **Purpose** | Platform-owned tenants, membership, session tenant resolution |
| **Package** | `@apzhub/platform-identity` |
| **Services** | `TenantManagementService`, `TenantSessionResolver`, provisioning on first login |
| **Repositories** | In-memory + `PostgresTenantStore` (`platform_tenant`, `platform_user_tenant`) |
| **APIs** | `GET /api/platform/v1/tenants`, `GET /api/platform/v1/identity/diagnostics` |
| **Diagnostics** | In-memory + postgres diagnostics |
| **Dependencies** | `@apzhub/auth`, `@apzhub/config/db` |
| **Consumers** | All apps, Law persistence tenant resolver |
| **Future extensions** | Tenant switch API, org hierarchy, SSO tenant mapping |

---

## 4. Authorization

| Field | Detail |
|-------|--------|
| **Purpose** | Canonical RBAC — roles, permissions, assignments, effective permissions |
| **Package** | `@apzhub/platform-authorization` |
| **Services** | `AuthorizationService`, `PermissionService`, `RoleService`, `RoleAssignmentService`, `EffectivePermissionService` |
| **Repositories** | In-memory + `PostgresAuthorizationStore` (migration `0012`) |
| **APIs** | `/roles`, `/permissions`, `/assignments`, `/authorization/diagnostics` |
| **Diagnostics** | Role/permission counts, assignment summary |
| **Dependencies** | Identity (tenant context), config/db |
| **Consumers** | Workbench DTO filters, Platform API guard, Law API |
| **Future extensions** | ABAC policies, superadmin tier UI, permission inheritance |

---

## 5. Operations

| Field | Detail |
|-------|--------|
| **Purpose** | Centralised operational visibility for platform administrators |
| **Surface** | Operations Console (`/workspace/administration/*`) |
| **Services** | Operations summary aggregator, configuration reader, audit viewer |
| **Repositories** | Reads from Identity, Authorization, Runtime, Security services |
| **APIs** | `/operations/summary`, `/operations/configuration`, `/users`, `/modules`, `/services`, `/products`, `/audit` |
| **Diagnostics** | Consolidated via M8-06; per-section JSON panels |
| **Dependencies** | All Platform Core services, Workbench manifests |
| **Consumers** | Platform administrators |
| **Future extensions** | Alerting integrations, runbook automation (PCv2) |

---

## 6. Personalisation

| Field | Detail |
|-------|--------|
| **Purpose** | User preferences, favorites, recent items, workbench layout |
| **Package** | `@apzhub/platform-personalisation` |
| **Services** | `PersonalisationService`, preference/favorite/recent/layout services |
| **Repositories** | In-memory + Postgres (migration `0013`) |
| **APIs** | `/preferences`, `/favorites`, `/recent`, `/personalisation/diagnostics`, `/personalisation/workbench-layout` |
| **Diagnostics** | Store mode, record counts |
| **Dependencies** | Identity (user context), theme bridge |
| **Consumers** | Workbench session, Law Platform theme bridge |
| **Future extensions** | Widget designer, saved searches, org-level prefs |

---

## 7. Governance

| Field | Detail |
|-------|--------|
| **Purpose** | Capability enablement, feature flags (foundation), product/module governance |
| **Package** | `@apzhub/platform-governance` |
| **Services** | `GovernanceService`, `FeatureFlagService`, `CapabilityService`, `GovernanceDiagnosticsService` |
| **Repositories** | In-memory + Postgres (migration `0014`) |
| **APIs** | `/governance`, `/governance/diagnostics`, `/feature-flags`, `/capabilities` |
| **Diagnostics** | Enablement counts, flag evaluations |
| **Dependencies** | Runtime capability registry |
| **Consumers** | Products (feature gating), Operations Console |
| **Future extensions** | Percentage rollouts, licensing, usage metering |

---

## 8. Provisioning

| Field | Detail |
|-------|--------|
| **Purpose** | Product and module provisioning orchestration records |
| **Package** | `@apzhub/platform-governance` (provisioning submodule) |
| **Services** | `ProvisioningService`, `ProductProvisioningService`, `ModuleProvisioningService` |
| **Repositories** | `platform_provisioning_record` (migration `0014`) |
| **APIs** | `GET/POST /api/platform/v1/provisioning` |
| **Diagnostics** | Provisioning history in Operations Console |
| **Dependencies** | Governance, Identity |
| **Consumers** | Operations Console, future SaaS onboarding |
| **Future extensions** | Commercial provisioning workflows, billing hooks (PCv2) |

---

## 9. Security

| Field | Detail |
|-------|--------|
| **Purpose** | Platform security posture, resilience probes, consolidated diagnostics |
| **Package** | `@apzhub/platform-security` |
| **Services** | `PlatformSecurityService`, `EnvironmentValidationService`, `RateLimitService`, `OperationalResilienceService`, `SecurityDiagnosticsService` |
| **Repositories** | Redis (rate limits); no dedicated security DB |
| **APIs** | `/security`, `/security/diagnostics`, `/system/health`, `/system/readiness`, `/system/liveness` |
| **Diagnostics** | Headers, env checks, rate limit status, recovery guidance |
| **Dependencies** | Authorization (API guard), config, shared/redis |
| **Consumers** | Operations Console, health endpoints, edge headers |
| **Future extensions** | Vault, SOC/SIEM, CSP enforcement, gateway rate limits (PCv2) |

---

## 10. Persistence

| Field | Detail |
|-------|--------|
| **Purpose** | Platform and product data access, migrations, RLS |
| **Package** | `@apzhub/config`, `@apzhub/config/db` |
| **Services** | Drizzle ORM, `checkDatabaseHealth`, migration runner |
| **Repositories** | PostgreSQL schemas: platform (`0011`–`0014`), law (`0001`–`0010`), outbox |
| **APIs** | Indirect via Platform Services |
| **Diagnostics** | DB health in `/api/health`, persistence section in consolidated diagnostics |
| **Dependencies** | PostgreSQL, Drizzle |
| **Consumers** | All platform and product packages |
| **Future extensions** | Extract law schema package, read replicas, backup automation |

---

## 11. API Framework

| Field | Detail |
|-------|--------|
| **Purpose** | Versioned REST surface, standard envelopes, platform route namespace |
| **Surface** | `apps/web/app/api/platform/v1/*`, `apps/law-platform/app/api/platform/v1/*` |
| **Services** | Route handlers delegating to package `server.ts` handlers |
| **Repositories** | N/A |
| **APIs** | 28+ platform v1 routes; `GET /api/health` |
| **Diagnostics** | API guard status in security diagnostics |
| **Dependencies** | Auth, Platform Core packages |
| **Consumers** | Operations Console, products, external integrators (Law REST) |
| **Future extensions** | Dedicated gateway, API keys, OpenAPI v3 publish, webhooks (PCv2) |

---

## 12. Actions (Command Framework)

| Field | Detail |
|-------|--------|
| **Purpose** | Universal command palette, action execution, shortcuts, toolbar, context menu |
| **Package** | `@apzhub/command-framework` |
| **Services** | `ActionRegistry`, `DefaultActionExecutor`, audit event emission |
| **Repositories** | In-process action registry |
| **APIs** | Hydrated via bootstrap; health in `/api/health` commands field |
| **Diagnostics** | Action counts, executor status |
| **Dependencies** | Event framework (audit), Workbench surfaces |
| **Consumers** | Workbench palette, toolbar, Law modules |
| **Future extensions** | Gateway implementations (automation, webhooks, AI) |

---

## 13. Knowledge

| Field | Detail |
|-------|--------|
| **Purpose** | Knowledge sources, query orchestration, ranking, discovery experiences |
| **Package** | `@apzhub/knowledge-discovery-framework` |
| **Services** | `KnowledgeService`, Knowledge Registry, orchestrator, ranking |
| **Repositories** | In-process provider registry |
| **APIs** | Client-side query API; health `knowledge` field |
| **Diagnostics** | Provider counts, hydration status |
| **Dependencies** | Action registry, Workbench navigation |
| **Consumers** | Knowledge overlay, command palette knowledge mode |
| **Future extensions** | Persistent search index (OpenSearch/Meilisearch), semantic search |

---

## 14. Search

| Field | Detail |
|-------|--------|
| **Purpose** | Unified search experience (Document 020) — implemented via Knowledge framework |
| **Package** | `@apzhub/knowledge-discovery-framework` (search = knowledge query path) |
| **Services** | Same as Knowledge — orchestrator aggregates providers |
| **Repositories** | Derived index deferred; query-time provider fan-out |
| **APIs** | Knowledge query surfaces (overlay, palette) |
| **Diagnostics** | Included in knowledge diagnostics |
| **Dependencies** | Knowledge providers registered per module |
| **Consumers** | Workbench, Command Palette |
| **Future extensions** | Platform Search Service, async indexing, permission-filtered index (PCv2+) |

---

## 15. Events

| Field | Detail |
|-------|--------|
| **Purpose** | Platform event catalogue, in-process event bus |
| **Package** | `@apzhub/event-notification-framework` |
| **Services** | `EventRegistry`, `EventBus`, event mappers |
| **Repositories** | In-process; outbox table for async (workers deferred) |
| **APIs** | Health `events` field |
| **Diagnostics** | Event type counts, bus status |
| **Dependencies** | Platform Runtime manifests |
| **Consumers** | Actions (audit), Notifications, Activity Timeline |
| **Future extensions** | External message bus, replay, DLQ (PCv2) |

---

## 16. Notifications

| Field | Detail |
|-------|--------|
| **Purpose** | Attention delivery — badge, panel, notification experiences |
| **Package** | `@apzhub/event-notification-framework` |
| **Services** | `NotificationRegistry`, `NotificationService`, mapper from events |
| **Repositories** | Session-only in Phase 1 (TD-EN15) |
| **APIs** | Health `notifications` field |
| **Diagnostics** | Route counts, hydration status |
| **Dependencies** | Event Bus |
| **Consumers** | Workbench notification region |
| **Future extensions** | Persistent store, SMTP/WebSocket delivery, digests |

---

## 17. Activity Timeline

| Field | Detail |
|-------|--------|
| **Purpose** | Activity stream and timeline presentation from audit/events |
| **Package** | `@apzhub/activity-timeline-framework` |
| **Services** | `ActivityRegistry`, `TimelineRegistry`, `ActivityTimelineService` |
| **Repositories** | Session-only presentation store (TD-AT15-03) |
| **APIs** | Health `activities`, `timelines` fields |
| **Diagnostics** | Type counts, hydration status |
| **Dependencies** | Action audit events, Event framework |
| **Consumers** | Context panel, inline feeds |
| **Future extensions** | Live subscriptions, persistent activity store |

---

## 18. Developer Experience

| Field | Detail |
|-------|--------|
| **Purpose** | Onboarding, tooling, conventions, manifest workflow |
| **Surface** | `docs/developer/*`, `docs/governance/*`, Cursor rules, package READMEs |
| **Services** | pnpm workspace, ESLint, Prettier, Vitest, Storybook, Husky |
| **Repositories** | N/A |
| **APIs** | N/A |
| **Diagnostics** | N/A |
| **Dependencies** | Document 004 toolchain |
| **Consumers** | All engineers |
| **Future extensions** | Published SDK packages, CI automation, deployment guides (PCv2) |

---

## 19. Testing

| Field | Detail |
|-------|--------|
| **Purpose** | Quality gates per Document 015 |
| **Surface** | `vitest.config.ts`, `testing/`, `*.test.ts`, Playwright E2E |
| **Services** | Unit (Vitest), component (Storybook), E2E (Playwright) |
| **Repositories** | Test fixtures, mocks |
| **APIs** | N/A |
| **Diagnostics** | Coverage reports, CI status |
| **Dependencies** | jsdom, testing-library |
| **Consumers** | All packages and apps |
| **Future extensions** | CI workflow, contract tests, load testing (PCv2) |

---

## 20. Documentation

| Field | Detail |
|-------|--------|
| **Purpose** | Authoritative architecture, ADRs, sprint reports, onboarding |
| **Surface** | `docs/` (000–029, architecture, adr, sprint, reviews) |
| **Services** | Document registry in `docs/README.md` |
| **Repositories** | Git-tracked markdown |
| **APIs** | N/A |
| **Diagnostics** | Documentation review (M16) |
| **Dependencies** | Phase gate process |
| **Consumers** | Engineering, product, certification |
| **Future extensions** | Auto-generated API docs, architecture diagrams CI |

---

## Capability index

| # | Capability | Package | Migration |
|---|------------|---------|-----------|
| 1 | Runtime | `platform-runtime` | — |
| 2 | Workbench | `workbench-framework` | — |
| 3 | Identity | `platform-identity` | 0011 |
| 4 | Authorization | `platform-authorization` | 0012 |
| 5 | Operations | apps/web ops console | — |
| 6 | Personalisation | `platform-personalisation` | 0013 |
| 7 | Governance | `platform-governance` | 0014 |
| 8 | Provisioning | `platform-governance` | 0014 |
| 9 | Security | `platform-security` | — |
| 10 | Persistence | `config` | 0000–0014 |
| 11 | API Framework | apps route handlers | — |
| 12 | Actions | `command-framework` | — |
| 13 | Knowledge | `knowledge-discovery-framework` | — |
| 14 | Search | (via Knowledge) | — |
| 15 | Events | `event-notification-framework` | — |
| 16 | Notifications | `event-notification-framework` | — |
| 17 | Activity Timeline | `activity-timeline-framework` | — |

---

## References

- [Platform Core Reference Architecture](./APZHUB-Platform-Core-Reference-Architecture.md)
- [Platform Capability Matrix](./APZHUB-Platform-Capability-Matrix.md)
- [Platform Core Certification](../reviews/APZHUB-Platform-Core-Certification.md)
