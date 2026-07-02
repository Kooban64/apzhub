# APZHUB Platform Event SDK quick reference

Derived lookup for [029](./029-platform-event-sdk-event-bus-event-manifest-specification.md).

> **Document Version:** 1.0 · **Developer Specification · Mandatory**  
> EDA framework: [012](./012-event-driven-architecture-background-processing-workflow-framework.md). Platform SDK: [024](./024-apzhub-platform-sdk-development-framework.md). Services: [027](./027-platform-service-sdk-business-service-framework-service-manifest-specification.md).

## Core rule

**Event Bus coordinates cross-capability communication** — no direct module↔module, unrelated service↔service, or integration-driven business workflows.

## Philosophy

Modules publish/consume via framework · Platform Services publish business events · Integrations publish state changes · Workers process async · Event Framework coordinates (009, 012)

## Architecture

```
Module → Platform Service → Event Bus → Search / Audit / Notifications → Background Workers → Integrations
```

Event Bus is **platform-owned**

## Objectives

Loose coupling · scalability · auditability · observability · retry · background processing · replay (future) · AI consumption (future)

## Event categories

Platform · business · user · security · connector · infrastructure · system · notification · AI (future) — one category per event

## Manifest

`event.yaml` before implementation (024)

## Example manifest fields

`event` (id, version) · category · publisher · subscribers · payload schema fields

## Standard envelope

Event ID · name · version · category · correlation ID · causation ID · timestamp · publisher · payload · tenant (future) · user ID · source service (010, 012)

## Registration (auto-discovery)

ID · version · publisher · subscribers · payload schema · retention · docs · tests (011)

## Publishing rules

After successful business operation · not before transaction completion (unless designed pre-op) · idempotent publishing — Platform Services publish after validation (027)

## Subscription rules

Explicit interest · independent processing · safe duplicate handling · no assumed order unless guaranteed · don't modify original event · idempotent subscribers (012)

## Naming (past tense)

UserCreated · ProjectArchived · TicketAssigned · DocumentUploaded · WorkflowCompleted — **not** CreateProject / UpdateUser

## Versioning

Semantic versions · breaking changes need new version + migration docs · transition support (015)

## Payloads

IDs + metadata only · no large datasets · no full object graphs · no unnecessary sensitive data · platform IDs not engine IDs (011, 013)

## Delivery guarantees

At-least-once · retry · DLQ · duplicate detection · idempotent subscribers — **do not assume exactly-once** (012)

## Background processing

OCR · reports · bulk sync · email · search indexing — via Background Processing Framework; UI stays responsive (012, 020, 021)

## Security

Respect permissions · minimal sensitive data · auditable · block unauthorised publish · validate schemas (013)

## Observability (014)

Publish time · processing duration · subscriber status · retry/failure counts · correlation ID

## Directory (`events/project-created/`)

`event.yaml` · README · `schema.json` · publisher/ · subscribers/ · tests/ (unit, contract, integration, replay) · docs/ (004)

## Testing (015)

Schema validation · publisher · subscriber · retry · idempotency · contract · performance

## Cursor workflow (9 steps)

Read 024, 026, 027, 029 → `event.yaml` → payload schema → register publishers/subscribers → idempotent handlers → tests → docs → validate registration — **never bypass Event Framework without approval · phase gate applies**

## Acceptance highlights

Manifest for every business event · dynamic publisher/subscriber registration · versioned & documented · validated payloads · full lifecycle observability · background integration · independent idempotent subscribers · evolvable without tight coupling · **no unapproved direct coupling** · **modules don't notify/search/audit directly — publish events**
