# APZHUB events & background jobs quick reference

Derived lookup for [012](./012-event-driven-architecture-background-processing-workflow-framework.md) and [029](./029-platform-event-sdk-event-bus-event-manifest-specification.md). **012** = EDA principles. **029** = Event SDK, `event.yaml`, Event Bus contracts.

## Philosophy

Complete user requests **fast** — only synchronous work required for the immediate response; everything else → **event or background job**. UI never waits for unnecessary processing.

## Request flow model

```
User Action → Validation → Business Rules → Immediate Response
    → Publish Event → Background Processing → Notifications → Audit → Search Updates → Completion Events
```

## Event categories (every event = one category)

Platform · Business · Security · Integration · Connector · Monitoring · Notification · AI · Workflow · Audit

## Example events by category

| Category     | Examples                                                          |
| ------------ | ----------------------------------------------------------------- |
| Platform     | UserCreated, RoleChanged, ModuleInstalled, ConnectorRegistered    |
| Business     | ProjectCreated, TaskAssigned, DocumentUploaded, WorkflowCompleted |
| Integration  | ProvisioningStarted, SynchronisationCompleted, ConnectorOffline   |
| Notification | Assignment, Reminder, Approval Required, Failure, Escalation      |
| Security     | Login, Failed Login, Session Revoked, Connector Auth Failure      |

## Event principles

Immutable · fact-based · timestamped · descriptive · independently processable · **never modified after publish**

## Background jobs (async — never block UI)

OCR · large imports · reports · bulk export · provisioning · connector sync · search indexing · AI · virus scan (future) · doc conversion · notification delivery

Platform jobs stored as platform data ([011](./011-platform-data-architecture-database-design-principles.md)); queues via Redis ([004](./004-technology-stack-repository-standards-development-environment.md)).

## Job states

Queued · waiting · running · retrying · paused · completed · cancelled · failed · expired

## Job priorities

Critical · high · normal · low · background

## Retry & DLQ

Exponential backoff · max retries · dead letter queue · manual retry · auto recovery — failed events traceable; admins inspect/retry/discard/investigate

## Scheduled jobs (platform-owned)

Connector health · nightly sync · search re-index · audit maintenance · DB cleanup · cache refresh · report scheduling

## Workflows

Orchestrated through **Platform Services** ([009](./009-platform-service-layer-integration-framework.md)) — may span multiple connectors; backend workflow engines are implementation details

Example: Employee onboarding → identity → projects → support → documents → time → notify → audit → complete

## Publishing & subscribers

**Services publish**; modules publish **through services**, not to subscribers directly.

Subscribers (loosely coupled): Notification · Audit · Search · Activity Feed · Analytics · AI · Monitoring · future modules — **no module-to-module** ([008](./008-module-plugin-connector-architecture.md))

## Side effects from events (centralised — modules do not do directly)

| Concern       | Rule                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Activity feed | From business events only — modules don't update activity directly                                                                         |
| Notifications | From events — modules don't send notifications directly                                                                                    |
| Search index  | Background only — never delays user ops; derived/non-authoritative ([011](./011-platform-data-architecture-database-design-principles.md)) |
| Audit         | From events/services — immutable ([007](./007-identity-authentication-authorisation-rbac-architecture.md))                                 |

## Idempotency

All background jobs idempotent — including provisioning ([007](./007-identity-authentication-authorisation-rbac-architecture.md))

## Correlation IDs

Inherited from originating request — trace gateway → services → jobs → connectors → audit → logs → notifications ([010](./010-api-gateway-integration-communication-standards.md))

## Observability (mandatory per event)

Execution time · queue time · retries · status · errors · originating service · correlation ID

Admin monitoring: queue depth · worker health · failed jobs · retries · execution times · connector delays · scheduled jobs

## Connector sync (async, isolated)

User provisioning · permission updates · health checks · metadata refresh · role sync — failures must not affect unrelated services

## AI (future)

All AI workloads as background jobs — summarisation, OCR, classification, semantic search, etc.

## Worker security

Auth · authz · audit · secure secrets · connector permissions — platform-managed worker identities ([007](./007-identity-authentication-authorisation-rbac-architecture.md))

## Testing

Unit · integration · queue · retry · failure · performance · Playwright (user workflows)

## Rules for implementers

No long-running work in request handlers · publish events not tight coupling · idempotent jobs · workflows via Platform Services · design for distributed workers

## Acceptance (summary)

Async long-running ops · events drive notify/search/audit/activity · retries/recovery · full correlation trace · loose module coupling · scalable workers · AI-ready · sync doesn't block users
