# SPR-006 — Technical Specification Index

> **Status:** Active — EN-018 complete; Milestone 6 closed  
> **Sprint:** SPR-006 — Event & Notification Framework  
> **Authority:** [SPR-006 backlog](../backlog/SPR-006-event-notification-framework-backlog.md) · ADRs 0030–0032

---

## ADRs (EN-001)

| ADR                                                                 | Title                                     | Status   |
| ------------------------------------------------------------------- | ----------------------------------------- | -------- |
| [ADR-0030](../adr/ADR-0030-event-notification-framework-package.md) | Event & Notification Framework Package    | Accepted |
| [ADR-0031](../adr/ADR-0031-event-registry-and-bus.md)               | Event Registry and In-Process Event Bus   | Accepted |
| [ADR-0032](../adr/ADR-0032-notification-routing-model.md)           | Notification Routing and Event Separation | Accepted |

---

## Architecture documents (EN-001)

| Document                                                                           | Layer        | Description                                   |
| ---------------------------------------------------------------------------------- | ------------ | --------------------------------------------- |
| [event-notification-framework.md](../architecture/event-notification-framework.md) | Overview     | Combined framework overview                   |
| [event-framework.md](../architecture/event-framework.md)                           | Event        | Event Framework canonical architecture        |
| [notification-framework.md](../architecture/notification-framework.md)             | Notification | Notification Framework canonical architecture |

---

## Specification documents

| Document                                                                                                     | Stories        | Description                                    |
| ------------------------------------------------------------------------------------------------------------ | -------------- | ---------------------------------------------- |
| [SPR-006-ENF-event-architecture.md](./SPR-006-ENF-event-architecture.md)                                     | EN-001         | Event model, taxonomy, registry, bus contract  |
| [SPR-006-ENF-event-registry.md](./SPR-006-ENF-event-registry.md)                                             | EN-003         | Event Registry specification                   |
| [SPR-006-ENF-event-metadata.md](./SPR-006-ENF-event-metadata.md)                                             | EN-003         | Event metadata model                           |
| [SPR-006-ENF-notification-architecture.md](./SPR-006-ENF-notification-architecture.md)                       | EN-001         | Notification model, taxonomy, channels, routes |
| [SPR-006-ENF-notification-registry.md](./SPR-006-ENF-notification-registry.md)                               | EN-007         | Notification Registry specification            |
| [SPR-006-ENF-notification-metadata.md](./SPR-006-ENF-notification-metadata.md)                               | EN-007         | Notification metadata model                    |
| [SPR-006-ENF-event-envelope.md](./SPR-006-ENF-event-envelope.md)                                             | EN-001, EN-004 | PlatformEventEnvelope schema                   |
| [SPR-006-ENF-event-bus.md](./SPR-006-ENF-event-bus.md)                                                       | EN-004         | In-process Event Bus specification             |
| [SPR-006-ENF-event-bus-delivery-semantics.md](./SPR-006-ENF-event-bus-delivery-semantics.md)                 | EN-004         | Delivery semantics (in-process + future)       |
| [SPR-006-ENF-event-manifest.md](./SPR-006-ENF-event-manifest.md)                                             | EN-001, EN-005 | Event manifest schema                          |
| [SPR-006-ENF-event-manifest-bootstrap.md](./SPR-006-ENF-event-manifest-bootstrap.md)                         | EN-005         | Manifest bootstrap specification               |
| [SPR-006-ENF-platform-event-catalogue.md](./SPR-006-ENF-platform-event-catalogue.md)                         | EN-005         | Built-in platform events                       |
| [SPR-006-ENF-event-registry-dto.md](./SPR-006-ENF-event-registry-dto.md)                                     | EN-006         | Event Registry DTO specification               |
| [SPR-006-ENF-notification-manifest.md](./SPR-006-ENF-notification-manifest.md)                               | EN-001, EN-008 | Notification route manifest schema             |
| [SPR-006-ENF-notification-registry-dto.md](./SPR-006-ENF-notification-registry-dto.md)                       | EN-010         | Notification Registry DTO                      |
| [SPR-006-ENF-notification-client-hydration.md](./SPR-006-ENF-notification-client-hydration.md)               | EN-010         | Client hydration pipeline                      |
| [SPR-006-ENF-notification-react-api.md](./SPR-006-ENF-notification-react-api.md)                             | EN-010         | React provider and hooks                       |
| [SPR-006-ENF-platform-notification-catalogue.md](./SPR-006-ENF-platform-notification-catalogue.md)           | EN-008         | Built-in platform notification routes          |
| [SPR-006-ENF-event-to-notification-mapping.md](./SPR-006-ENF-event-to-notification-mapping.md)               | EN-001, EN-009 | Mapper pipeline overview                       |
| [SPR-006-ENF-notification-mapper.md](./SPR-006-ENF-notification-mapper.md)                                   | EN-009         | Notification Mapper specification              |
| [SPR-006-ENF-notification-item.md](./SPR-006-ENF-notification-item.md)                                       | EN-009         | NotificationItem model                         |
| [SPR-006-ENF-notification-template-rendering.md](./SPR-006-ENF-notification-template-rendering.md)           | EN-009         | Template rendering rules                       |
| [event-notification-framework.md](../architecture/event-notification-framework.md)                           | EN-017         | Combined subsystem architecture (complete)     |
| EN-003 Event Registry spec                                                                                   | EN-003         | To be authored at EN-003 start                 |
| [SPR-006-ENF-notification-service.md](./SPR-006-ENF-notification-service.md)                                 | EN-011         | Notification Service specification             |
| [SPR-006-ENF-notification-session-store.md](./SPR-006-ENF-notification-session-store.md)                     | EN-011         | Session store specification                    |
| [SPR-006-ENF-notification-presentation-layer.md](./SPR-006-ENF-notification-presentation-layer.md)           | EN-012         | Presentation layer specification               |
| [SPR-006-ENF-notification-view-model.md](./SPR-006-ENF-notification-view-model.md)                           | EN-012         | Notification view model                        |
| [SPR-006-ENF-notification-experiences.md](./SPR-006-ENF-notification-experiences.md)                         | EN-013         | Notification shell Experiences                 |
| [SPR-006-ENF-in-app-notification-ux.md](./SPR-006-ENF-in-app-notification-ux.md)                             | EN-013         | In-app notification UX notes                   |
| [SPR-006-ENF-action-audit-event.md](./SPR-006-ENF-action-audit-event.md)                                     | EN-014         | Action audit event specification               |
| [SPR-006-ENF-event-to-notification-integration.md](./SPR-006-ENF-event-to-notification-integration.md)       | EN-014         | Event-to-notification pipeline notes           |
| [SPR-006-ENF-application-integration.md](./SPR-006-ENF-application-integration.md)                           | EN-015         | Application integration specification          |
| [SPR-006-ENF-application-bootstrap-sequence.md](./SPR-006-ENF-application-bootstrap-sequence.md)             | EN-015         | Bootstrap sequence documentation               |
| [SPR-006-ENF-health-endpoint-events-notifications.md](./SPR-006-ENF-health-endpoint-events-notifications.md) | EN-015         | Health endpoint event/notification fields      |

---

## Story quick reference

| Story  | Title                             | Primary spec                                                                                                                                                                                                                                                                | ADR       |
| ------ | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| EN-001 | Event & Notification Architecture | [Event](./SPR-006-ENF-event-architecture.md) · [Notification](./SPR-006-ENF-notification-architecture.md)                                                                                                                                                                   | 0030–0032 |
| EN-002 | Package scaffold                  | [Package README](../../packages/event-notification-framework/README.md)                                                                                                                                                                                                     | 0030      |
| EN-003 | EventRegistry core                | [Event Registry spec](./SPR-006-ENF-event-registry.md) · [Event Metadata spec](./SPR-006-ENF-event-metadata.md)                                                                                                                                                             | 0031      |
| EN-004 | In-process Event Bus              | [Event Bus spec](./SPR-006-ENF-event-bus.md) · [Envelope](./SPR-006-ENF-event-envelope.md)                                                                                                                                                                                  | 0031      |
| EN-005 | Manifest event bootstrap          | [Bootstrap spec](./SPR-006-ENF-event-manifest-bootstrap.md) · [Catalogue](./SPR-006-ENF-platform-event-catalogue.md)                                                                                                                                                        | 0031      |
| EN-006 | Server filter DTO (events)        | [Event Registry DTO](./SPR-006-ENF-event-registry-dto.md)                                                                                                                                                                                                                   | 0031      |
| EN-007 | NotificationRegistry core         | [Registry spec](./SPR-006-ENF-notification-registry.md) · [Metadata](./SPR-006-ENF-notification-metadata.md)                                                                                                                                                                | 0032      |
| EN-008 | Notification route providers      | [Bootstrap spec](./SPR-006-ENF-notification-manifest-bootstrap.md) · [Catalogue](./SPR-006-ENF-platform-notification-catalogue.md)                                                                                                                                          | 0032      |
| EN-009 | Event-to-notification mappers     | [Mapper spec](./SPR-006-ENF-notification-mapper.md) · [NotificationItem](./SPR-006-ENF-notification-item.md)                                                                                                                                                                | 0032      |
| EN-010 | Client hydration + hooks          | [Registry DTO](./SPR-006-ENF-notification-registry-dto.md) · [Client hydration](./SPR-006-ENF-notification-client-hydration.md) · [React API](./SPR-006-ENF-notification-react-api.md)                                                                                      | 0030      |
| EN-011 | Notification Service API          | [Service spec](./SPR-006-ENF-notification-service.md) · [Session store](./SPR-006-ENF-notification-session-store.md)                                                                                                                                                        | 0032      |
| EN-012 | Notification Presentation Layer   | [Presentation layer](./SPR-006-ENF-notification-presentation-layer.md) · [View model](./SPR-006-ENF-notification-view-model.md)                                                                                                                                             | 0032      |
| EN-013 | Shell Experiences                 | [Experiences](./SPR-006-ENF-notification-experiences.md) · [UX notes](./SPR-006-ENF-in-app-notification-ux.md)                                                                                                                                                              | 0032      |
| EN-014 | Action audit Event Bus wire       | [Action audit event](./SPR-006-ENF-action-audit-event.md) · [Integration notes](./SPR-006-ENF-event-to-notification-integration.md)                                                                                                                                         | 0031      |
| EN-015 | Application integration           | [Application integration](./SPR-006-ENF-application-integration.md) · [Bootstrap](./SPR-006-ENF-application-bootstrap-sequence.md) · [Health](./SPR-006-ENF-health-endpoint-events-notifications.md)                                                                        | 0030      |
| EN-016 | E2E tests                         | [EN-016 completion report](../sprint/EN-016-completion-report.md) · `spr-006-event-notification-framework.spec.ts`                                                                                                                                                          | —         |
| EN-017 | Documentation                     | [Architecture](../architecture/event-notification-framework.md) · [Onboarding](../developer/event-notification-onboarding.md) · [Architecture review](../reviews/SPR-006-architecture-review.md) · [Production readiness](../reviews/MILESTONE-006-production-readiness.md) | —         |
| EN-018 | Sprint closeout                   | [SPR-006 closeout](../sprint/SPR-006-closeout.md) · [M6 review](../reviews/MILESTONE-006-event-notification-framework-review.md) · [v0.6.0 release](../releases/v0.6.0-event-notification-framework.md)                                                                     | —         |

---

## Taxonomy quick reference

### Event categories

| Category           | Value         | Example                               |
| ------------------ | ------------- | ------------------------------------- |
| System Events      | `system`      | `system.platform.bootstrap.completed` |
| User Events        | `user`        | `user.session.started`                |
| Capability Events  | `capability`  | `capability.action.executed`          |
| Integration Events | `integration` | `integration.connector.sync.failed`   |

### Notification kinds

| Kind    | Value     | SPR-006 channel     |
| ------- | --------- | ------------------- |
| Toast   | `toast`   | `in-app` (scaffold) |
| Banner  | `banner`  | `in-app` (scaffold) |
| Inbox   | `inbox`   | `in-app` ✅         |
| In-App  | `in-app`  | `in-app` ✅         |
| Email   | `email`   | `email` (stub)      |
| SMS     | `sms`     | `sms` (stub)        |
| Push    | `push`    | `push` (stub)       |
| Webhook | `webhook` | `webhook` (stub)    |

---

## Quality gates (all stories)

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm test:coverage
pnpm test:e2e    # when UI/integration affected
```

EN-001 is documentation-only — gates must remain green.

---

_SPR-006 Technical Specification Index — EN-018 complete._
