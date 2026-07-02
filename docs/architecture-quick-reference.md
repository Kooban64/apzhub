# APZHUB architecture quick reference

One-page lookup derived from [003](./003-overall-system-architecture-design-principles.md). Use when designing features, APIs, or modules.

## Seven principles

1. User only knows APZHUB — never expose engines.
2. Frontend never talks to engines — all traffic through APZHUB.
3. One isolated, replaceable adapter per engine.
4. Business logic lives in APZHUB — engines do specialist functions only.
5. Features are modular — installable, removable, upgradeable.
6. Every module is independently testable.
7. API-first — UI never depends on implementation details.

**Rule:** Architecture consistency > development speed. Conflicts → redesign.

## Layers (strict — no bypassing)

| Layer               | Responsibility                                                                   | Business logic?                 |
| ------------------- | -------------------------------------------------------------------------------- | ------------------------------- |
| **Presentation**    | UI, workspaces, nav, panels, forms, themes, a11y, shortcuts                      | No — requests services          |
| **Application**     | Use cases, commands, queries, validation, orchestration, transactions, workflows | Yes — operations start here     |
| **Domain**          | Entities, rules, permissions, policies, platform models                          | Yes — no backend-specific logic |
| **Service**         | Stable capability APIs (`ProjectService`, `DocumentService`, …)                  | Platform API surface            |
| **Adapter**         | Auth, mapping, conversion, retry, cache, health, errors, audit                   | Backend-specific only here      |
| **Backend Engines** | Authoritative source per specialist domain                                       | Engine-native only              |

```
Presentation → Application → Domain → Services → Adapters → Engines
```

Reverse dependencies are **prohibited**.

## Request path

```
Client → API Gateway → Auth → Authz → Platform Service → Connector → Engine → standard envelope → Client
```

Never expose backend APIs directly. Details: [010 API communication quick reference](./api-communication-quick-reference.md).

## Security pipeline

```
Authentication → Authorisation → Validation → Business Rules → Audit → Execution
```

Never rely on frontend-only security. Full Zero Trust framework: [013 security architecture](./013-security-architecture-zero-trust-framework.md) — applies to every module, connector, service, API, and worker.

## Platform modules (008)

Projects · Support · Documents · Testing · Automation · Analytics · Compliance · Security · Monitoring · Administration

**Module → Platform Service → Service Connector → Engine** — modules never call connectors/backends directly; manifest registration; self-hosted OSS/CE first.

**Platform Service Layer (009):** mandatory business boundary; interface-first; orchestrates connectors, audit, search, notifications, events. See [platform-services quick reference](./platform-services-quick-reference.md).

## Cross-cutting services (shared — never duplicate)

Identity · Permissions · Audit · Notifications · Logging · Configuration · Search · Feature Flags · Observability · Telemetry · Error Handling · Caching

**Permissions drive the Desktop Framework UI** (005): nav, Activity Bar, commands, search — hide what user cannot access; superadmin is a special permission tier, not a normal user.

**IAM** (007): BetterAuth for auth only; platform owns RBAC + provisioning; per-engine SSO config for seamless single login; see [iam-quick-reference](./iam-quick-reference.md).

## Data ownership

| Owned by engine (system of record)                                                                                                                    | Owned by APZHUB (PostgreSQL platform DB)                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Projects, support requests, timesheets, documents, workflows, analytics metadata, test cases, security findings, monitoring data, assets, KB articles | Identity, sessions, permissions, roles, navigation, workspaces, prefs, notifications, audit, activity feed, module/connector registration, search index, events, jobs, telemetry, connector config, platform metadata |

Do not duplicate engine data except cache, index, or performance — duplicates are **never** authoritative. Full rules: [011 platform data architecture](./011-platform-data-architecture-database-design-principles.md).

## Events (decouple modules)

`UserCreated` · `ProjectUpdated` · `TicketAssigned` · `DocumentUploaded` · `WorkflowExecuted` · `RoleChanged`

Full EDA framework: [012 events & background processing](./012-event-driven-architecture-background-processing-workflow-framework.md) — async jobs, DLQ, correlation IDs, workflows via Platform Services.

## Errors

Adapters translate engine errors → platform-standard responses. Never expose raw backend errors to users.

## Scalability targets (design for now)

Multi-org · future multi-tenant · plugins · backend replacement · distributed services · horizontal scale · future mobile/desktop · future AI — without architectural redesign.

## Success criteria

- Engines replaceable with minimal changes (adapter only).
- One seamless APZHUB UX.
- Independent module testability.
- Clear service responsibilities.
- Platform-owned business logic.
- Growth to dozens of modules without degradation.
