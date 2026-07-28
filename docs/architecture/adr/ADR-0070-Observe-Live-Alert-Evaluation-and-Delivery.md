# ADR-0070 — Observe Live Alert Evaluation and Delivery

> **Programme:** Platform-1.3-ADR-0070  
> **ADR ID:** ADR-0070  
> **Title:** Observe Live Alert Evaluation and Delivery  
> **Classification:** ARCHITECTURE DECISION RECORD  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform 1.3 Engineering (ENG-001 **ACCEPTED**) · Platform **1.2.0** architecture freeze  
> **Epic:** P13-E02 · Future engineering: **Platform-1.3-ENG-002**  
> **Date:** 2026-07-22  
> **Status:** **Accepted** — Owner Decision Platform-1.3-ENG-002 (2026-07-22)  
> **Implementation:** **Platform-1.3-ENG-002 Phase A authorised** (this ADR alone does not ship code; ENG-002 does)  
> **Canonical pack path:** `docs/architecture/adr/ADR-0070-Observe-Live-Alert-Evaluation-and-Delivery.md`  
> **Index stub:** [docs/adr/ADR-0070-observe-live-alert-evaluation-delivery.md](../../adr/ADR-0070-observe-live-alert-evaluation-delivery.md)
> **Engineering pack:** `docs/engineering/platform-1.3-eng-002/`

---

## Context

Platform Observability (APZOBSERVE-001…006) is a **frozen metadata System of Record**. Alert **definitions** and **states** exist in `@apzhub/observe-contracts` / `observe-core` / `observe-persistence`, exposed via `gateway.observe.*` and `/api/v1/observe/*`, with Workbench at `/workspace/observability`.

The [Observability Architecture Freeze Notice](../APZHUB-Observability-Architecture-Freeze-Notice.md) lists **alert evaluation and notification delivery** as an intentional absence. Platform Operations today provides **manual triage** evidence (`alert-strategy`) only.

Platform 1.3 planning (APZHUB-PLAN-001 **ACCEPTED**) and architecture confirmation (Platform-1.3-ARCH-001 **ACCEPTED**) require epic **P13-E02** (Observe live alert evaluation & delivery) via **Platform-1.3-ENG-002**, gated on this ADR.

Platform-1.3-ENG-001 (Search Live Drain) is **ACCEPTED** and unrelated except as shared platform async/ops patterns.

### Problem Statement

Without an Owner-accepted ADR:

1. ENG-002 cannot lawfully thaw the Observe freeze absence.
2. Engineers risk implementing Grafana/Prometheus/AlertManager productisation, Email SoR, or Module→provider bypasses.
3. Delivery might incorrectly become a second notification identity SoR.
4. Marketing might claim automated Observe alerting GA without honesty on channels and limitations.

### Goals

- Define an **additive Alert Evaluation & Delivery plane** under Observability Platform Services.
- Preserve frozen Observe metadata SoR and layered path.
- Enable future ENG-002 to close or narrow **PL12-KL-02**.
- Keep Observability ≠ Analytics ≠ Metrics ≠ Notifications SoR boundaries.
- Authorize delivery **hooks** only — full Notification providers remain ADR-0071 / ENG-004.

### Non-goals (this ADR)

- Implementation of evaluation workers, HTTP routes, or UI.
- Live telemetry providers (Prometheus/Loki/OTel scrape/ingest).
- PromQL / LogQL execution engines.
- Email SoR, FIN-001, Workflow Execute, Realtime Transport (ADR-0072), Notification delivery providers (ADR-0071).
- Integration SDK thaw.
- New architectural layers beyond existing Presentation → Platform Services → (optional Connector) → Engine.

---

## Decision

**APZHUB shall authorize an additive Observe Alert Evaluation & Delivery plane** that:

1. **Owns evaluation orchestration** inside Observability Platform Services (async jobs/workers per Events & Background Processing 012).
2. **Persists evaluation outcomes** by updating existing `AlertState` (and additive evaluation-run / delivery-attempt records if ENG-002 proves necessary) in the Observe SoR — never inventing a parallel alert identity SoR.
3. **Delivers attention** only by publishing platform events / calling Notification Platform Service delivery hooks (ADR-0071 when accepted) or documented interim in-platform channels — Observe never becomes Notification SoR or SMTP owner.
4. **Does not** introduce Grafana/Prometheus/AlertManager as user-facing products; `providerKind` remains metadata.
5. **Does not** execute PromQL/LogQL or open live telemetry provider SDKs in this decision’s ENG-002 Phase A scope (see Future Engineering).
6. Requires **named Owner Approval of Platform-1.3-ENG-002** before any code; this ADR alone does not authorize engineering.

---

## Alternatives Considered

| Alternative                                                     | Rejected because                                                                                   |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **A. Redesign Observe into full Grafana/AlertManager product**  | Violates freeze, Reference Standard, Analytics/Metrics separation; structural redesign             |
| **B. Implement evaluation inside Platform Operations only**     | Splits SoR; Observe already owns alert definition/state metadata                                   |
| **C. Deliver alerts by modules calling SMTP/Webhooks directly** | Violates 008/009/010; creates Email SoR risk                                                       |
| **D. Wait for ADR-0071 before any Observe evaluation**          | Blocks KL-02 progress; evaluation can update states + emit events with interim honesty on delivery |
| **E. Status quo (manual triage forever)**                       | Rejected by Owner-approved P13-E02 Must epic                                                       |

**Selected:** Additive evaluation plane under Observe Platform Services + delivery hooks (Decision above).

---

## Architecture

### Preserved frozen path (unchanged)

```text
Observability Administration Workbench
→ Typed Client
→ HTTP /api/v1/observe/*
→ PlatformServiceGateway.observe.*
→ RequestPipeline (Auth → Authz → Validation)
→ Observability Platform Services
→ Observability Core
→ Observability Persistence
→ PostgreSQL
```

### Additive evaluation & delivery plane (authorized by this ADR)

```text
                    ┌─────────────────────────────┐
                    │ Alert Evaluation Worker      │
                    │ (async · dedicated identity) │
                    └──────────────┬──────────────┘
                                   │
         read definitions/rules    │   write AlertState + evaluation audit
                                   ▼
┌──────────────────────────────────────────────────────────────┐
│ Observability Platform Services (orchestration)               │
│  · load AlertDefinition (+ rule config)                       │
│  · evaluate against Observe metadata signals (Phase A)        │
│  · suppress / dedupe / escalate                               │
│  · acknowledge / resolve transitions                          │
│  · emit platform events · call Notification delivery hooks    │
└───────────────────────────┬──────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
   Observe Persistence  Event Bus (029)  Notification PS
   (AlertState SoR)     observe.alert.*  (ADR-0071 hooks)
```

**No new top-level layer.** Worker is a runtime deployment of Platform Services / jobs, not a Module or Connector redesign.

### Layer rules

| Layer                 | May                                                                  | Must not                                         |
| --------------------- | -------------------------------------------------------------------- | ------------------------------------------------ |
| Workbench             | Show states, ack/resolve UI, diagnostics banners                     | Call providers; evaluate rules locally as SoR    |
| HTTP / Gateway        | Thin ack/resolve/list evaluation diagnostics                         | Embed evaluation business rules outside services |
| Platform Services     | Orchestrate evaluation, transitions, delivery hooks                  | Import Grafana/Prometheus SDKs in Phase A        |
| Connectors            | Future Phase B signal adapters (if Owner-approved)                   | Own alert identity                               |
| Notification Services | Deliver notifications when ADR-0071 live                             | Own Observe alert definitions                    |
| Search                | Index derived alert activity if Search providers register (optional) | Become alert SoR                                 |

---

## Alert model (normative for ENG-002)

### Severity model (existing — retain)

From `@apzhub/observe-contracts`:

| Severity   | Meaning                                 |
| ---------- | --------------------------------------- |
| `info`     | Informational attention                 |
| `warning`  | Degraded / attention required           |
| `critical` | Service-impacting / immediate attention |

ENG-002 must not invent parallel severity enums without contract ADR amendment.

### Alert state lifecycle (existing — extend transitions)

Canonical states: `inactive` → `pending` → `firing` → `resolved` | `silenced`.

```text
inactive ──evaluate match──► pending ──confirm──► firing
   ▲                            │                   │
   │                            │ suppress          │ ack (metadata)
   │                            ▼                   │
   │                         silenced ◄─────────────┤
   │                                                │
   └────────────── resolve / auto-resolve ◄─────────┘
```

| Transition   | Trigger                               | Notes                        |
| ------------ | ------------------------------------- | ---------------------------- |
| → `pending`  | Rule matched, not yet confirmed       | Dedup window applies         |
| → `firing`   | Confirmed / sustained match           | Delivery hooks may fire      |
| → `silenced` | Suppression / maintenance window      | No delivery                  |
| → `resolved` | Condition cleared or operator resolve | Delivery of resolve optional |
| → `inactive` | Definition disabled / retired         | Terminal for that instance   |

### Alert categories

Categories are **metadata classifications** on `AlertDefinition` (via `metadata.category` or additive field in ENG-002 contracts), not separate SoRs:

| Category          | Examples                                               |
| ----------------- | ------------------------------------------------------ |
| `platform_health` | Service health / readiness / liveness metadata signals |
| `component`       | Component status metadata                              |
| `capacity`        | Capacity / saturation metadata samples                 |
| `security`        | Security/ops diagnostic metadata (permission-gated)    |
| `integration`     | Connector/engine health metadata                       |
| `custom`          | Tenant-defined catalogue entries                       |

### Alert creation

| Path                     | Owner                                                 | Rule                                                           |
| ------------------------ | ----------------------------------------------------- | -------------------------------------------------------------- |
| Catalogue create/update  | Observe Admin Workbench → HTTP → `alertDefinitions`   | Existing CRUD; authz `observePlatformOps`                      |
| Evaluation-created state | Evaluation worker → Platform Services → `alertStates` | Must reference `alertDefinitionId`; never create orphan states |
| Manual state triage      | Ops / Observe UI                                      | Retained; coexists with automated evaluation                   |

### Alert rules

Rules are **configuration attached to AlertDefinition** (additive schema under Observe persistence — ENG-002):

| Field (conceptual)    | Purpose                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------- |
| `signalSource`        | Phase A: Observe metadata keys (`serviceHealth`, `componentStatus`, `healthSummary`, …) |
| `predicate`           | Threshold / status match / absence detection — **not** PromQL                           |
| `forDuration`         | Pending → firing confirmation window                                                    |
| `labels`              | Dedup / routing keys                                                                    |
| `severityOverride`    | Optional                                                                                |
| `deliveryPolicyRef`   | Reference to Notification routing / interim channel map                                 |
| `escalationPolicyRef` | Optional escalation ladder                                                              |
| `enabled`             | Gate evaluation                                                                         |

**Phase A forbidden:** PromQL, LogQL, live scrape queries, provider credential use.

### Alert evaluation pipeline

1. **Schedule** — worker tick / queue (idempotent job).
2. **Load** — enabled definitions + rules for tenant.
3. **Collect signals** — read Observe metadata SoR (and only Owner-approved future signal adapters in Phase B).
4. **Match** — apply predicates.
5. **Deduplicate** — fingerprint = `tenantId + definitionId + labels hash`.
6. **Suppress** — maintenance windows, silence rules, muted services.
7. **Transition** — update `AlertState` with correlation ID.
8. **Deliver** — publish `observe.alert.fired|resolved|acknowledged` events; invoke Notification delivery hook if available.
9. **Record** — evaluation run metrics + diagnostics.
10. **Retry / DLQ** — failed delivery attempts per Failure handling.

Evaluation **must not** run inside interactive HTTP request handlers for long work (012).

### Alert suppression

| Mechanism           | Source                                          |
| ------------------- | ----------------------------------------------- |
| Maintenance windows | Existing `MaintenanceWindow` metadata           |
| Silence state       | `AlertState.state = silenced`                   |
| Definition disabled | `AlertDefinition.status` / rule `enabled=false` |
| Policy mute         | Optional tenant mute list in config             |

Automated “maintenance suppression execution” beyond honouring metadata windows remains out of Phase A unless ENG-002 Acceptance explicitly includes it.

### Alert deduplication

- Fingerprint-stable within `dedupWindow`.
- Re-entry while `firing` updates `lastSeenAt` metadata; does not create new identity.
- Resolve closes fingerprint; new match opens new state instance (or reuses per ENG-002 persistence design — document in ENG-002).

### Alert persistence

| Datum                         | SoR                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| AlertDefinition               | Observe PostgreSQL (existing)                                                                                 |
| AlertState                    | Observe PostgreSQL (existing)                                                                                 |
| Evaluation run / attempt logs | Observe persistence additive tables **or** platform job telemetry — decide in ENG-002; never Notification SoR |
| Notification records          | Notification metadata SoR (when delivery creates them)                                                        |

### Alert acknowledgement

- Operator ack via Workbench → HTTP → Platform Services.
- Persists ack actor, timestamp, correlation ID on `AlertState.metadata` or additive fields.
- Ack does **not** imply resolve; does **not** bypass authz.
- Emits `observe.alert.acknowledged`.

### Alert resolution

- Automatic when predicate clears for `resolveFor` duration.
- Manual resolve by authorized operator.
- Sets `resolvedAt`; state → `resolved`.
- Optional resolve notification via delivery hooks.

### Alert escalation

- Escalation is a **policy ladder** (time-in-firing, severity, unanswered ack).
- Escalation actions: raise severity metadata, re-notify via Notification hooks, create `IncidentReference` metadata link — **not** auto-page external IR tools in Phase A unless Owner expands ENG-002.
- No Workflow Execute unlock.

### Retry behaviour

| Failure class                   | Behaviour                                                        |
| ------------------------------- | ---------------------------------------------------------------- |
| Transient delivery failure      | Retry with exponential backoff; max attempts; DLQ                |
| Evaluation signal read failure  | Mark run failed; do not flip to healthy; alert unknown ≠ healthy |
| Permanent config error          | Disable rule; surface diagnostics; no tight retry loop           |
| Authz denial on operator action | Fail closed; audit                                               |

Jobs: idempotent, correlation ID on all attempts (010/012/029).

### Failure handling

- Fail closed on authz.
- Never mark engine healthy on missing data.
- Delivery failure must not roll back a valid `firing` state transition (state truth ≠ channel success).
- Channel success/failure recorded on delivery attempt.
- Structured errors; no provider secret leakage.

### Metrics

Platform-owned metrics (Observe/Metrics boundaries respected):

| Metric (conceptual)                             | Meaning           |
| ----------------------------------------------- | ----------------- |
| `observe_alert_evaluations_total`               | Evaluation runs   |
| `observe_alert_transitions_total{to}`           | State transitions |
| `observe_alert_delivery_attempts_total{result}` | Hook attempts     |
| `observe_alert_suppressed_total`                | Suppressions      |
| `observe_alert_evaluation_duration_ms`          | Latency           |

Do not scrape Prometheus as Observe SoR; metrics emission follows platform telemetry conventions (014).

### Health reporting

- Evaluation worker reports health into existing Observe health hierarchy (platform → service → worker).
- Unhealthy worker must be visible in Observability Workbench / ops diagnostics.
- Worker down ≠ “no alerts exist”; last-known states retained.

### Diagnostics

- Evaluation last-run, last-error, backlog depth, DLQ depth.
- Permission-gated admin diagnostics surfaces (extend Observability Workbench / ops — ENG-002).
- Correlation IDs join logs/traces/events.

### Configuration

| Config                                                 | Location                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| Feature flag `APZHUB_OBSERVE_ALERT_EVALUATION_ENABLED` | Env / Configuration SoR reference (deny-by-default)          |
| Rule payloads                                          | Observe persistence (definition-attached)                    |
| Delivery channel map                                   | References Notification policies; no SMTP secrets in Observe |
| Worker concurrency / batch                             | Ops config                                                   |

Secrets: never in Observe SoR editors; connector/Notification boundary only when ADR-0071 lands.

### Administration interfaces

| Interface                 | Role                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Observability Workbench   | Definitions, states, ack/resolve, diagnostics banners                                                         |
| HTTP `/api/v1/observe/*`  | Additive endpoints for ack/resolve/evaluation diagnostics if needed                                           |
| Platform Operations       | Runbooks; capacity; worker ops — not second alert SoR                                                         |
| Administration / Identity | Unchanged SoRs; authz uses existing Observe permissions (+ additive permissions if ENG-002 contracts require) |

---

## Boundaries (interaction without new layers)

| Capability            | Interaction                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Observe**           | Owns definitions, states, evaluation orchestration, transitions                                                          |
| **Search**            | Optional derived indexing of alert activity via Search publication patterns; not required for ENG-002 MVP                |
| **Notifications**     | Delivery sink via Platform Notification services / events; identity SoR stays Notification; full providers need ADR-0071 |
| **Platform Runtime**  | Hosts workers, health, config flags                                                                                      |
| **Platform Services** | Sole orchestration home (`gateway.observe.*` extended additively)                                                        |
| **Workbench**         | Presentation only                                                                                                        |
| **Identity**          | Actor identity for ack/resolve; Better Auth session unchanged                                                            |
| **Administration**    | Separate SoR; may deep-link; no merge                                                                                    |

---

## Interfaces (contracts for ENG-002)

Conceptual service operations (names illustrative; ENG-002 finalizes in `service.yaml` / contracts):

| Interface                                                        | Responsibility                        |
| ---------------------------------------------------------------- | ------------------------------------- |
| `ObserveAlertEvaluationService.evaluateBatch`                    | Worker entry — async                  |
| `ObserveAlertEvaluationService.getDiagnostics`                   | Admin diagnostics                     |
| `ObserveAlertStatesService.acknowledge`                          | Operator ack                          |
| `ObserveAlertStatesService.resolve`                              | Operator / auto resolve               |
| `ObserveAlertDeliveryHook.notify(transition)`                    | Calls Notification PS / emits events  |
| Events `observe.alert.fired\|acknowledged\|resolved\|suppressed` | Past-tense envelope per ADR-0029/0031 |

Additive HTTP only through Gateway; OpenAPI bump under ENG-002.

---

## Dependencies

| Dependency                     | Status          | Notes                                                                    |
| ------------------------------ | --------------- | ------------------------------------------------------------------------ |
| Observe freeze + packages      | Frozen baseline | Additive thaw via this ADR + ENG-002                                     |
| Platform Event Bus / Event SDK | Available       | Prefer events for fan-out                                                |
| Notification metadata SoR      | Frozen          | Delivery providers = ADR-0071                                            |
| ADR-0071                       | Proposed        | Soft dependency for rich channels; ENG-002 may ship with interim honesty |
| ADR-0072 Realtime              | Proposed        | Not required for evaluation; optional later UX                           |
| Integration SDK 1.0.0          | Frozen          | No thaw; Phase B adapters additive only                                  |
| Search Live Drain (ENG-001)    | ACCEPTED        | Optional search indexing later                                           |
| Manual alert-strategy ops      | Retained        | Coexist until KL-02 closed                                               |

---

## Consequences

### Positive

- Unblocks ENG-002 / P13-E02 without structural redesign.
- Clear Phase A vs Phase B honesty.
- Preserves SoR separations and freeze change-control.

### Negative / costs

- ENG-002 must implement workers, flags, tests, docs, freeze-notice update.
- Until ADR-0071, delivery channels may be limited (in-app / event only) — must be documented.
- Ops must enable evaluation flag after capacity check.

### Compliance

- Updates Observability Freeze Notice after ADR **Accepted** + ENG-002 Approval (change control steps).
- PL12-KL-02 closed or narrowed only after ENG-002 evidence.

---

## Risks

| Risk                                | Mitigation                                          |
| ----------------------------------- | --------------------------------------------------- |
| Scope creep into PromQL/Grafana     | Phase A explicit forbid; Owner gate for Phase B     |
| Observe becomes Email SoR           | Delivery hooks only; ADR-0071 fence; STOP Email SoR |
| Duplicate Notification SoR          | Events + Notification PS; no Observe-owned mailbox  |
| Silent “healthy” on missing signals | Unknown ≠ healthy rule                              |
| Worker overload on shared host      | Deny-by-default flag; batch limits; OPS capacity    |
| Bypass via Workbench                | Architecture tests; typed client only               |

---

## Future Engineering

### Platform-1.3-ENG-002 (authorized only after this ADR Accepted + ENG Approval)

**Phase A (required for KL-02 narrowing):**

1. Feature flag + worker skeleton.
2. Rule config on definitions (metadata predicates).
3. Evaluation against Observe metadata signals.
4. State transitions + ack/resolve APIs/UI.
5. Event publication + delivery hook stub / interim channel honesty.
6. Metrics, health, diagnostics, tests, freeze-notice amendment, KL-02 update.

**Phase B (separate Owner scope — may need further ADR):**

- Signal adapters to external telemetry (still not Grafana productisation).
- Rich Notification providers after ADR-0071.
- Optional realtime Workbench updates after ADR-0072.

### Explicitly not in ENG-002 without new Approval

Email SoR · FIN-001 · Workflow Execute · Integration SDK unfreeze · ADR-0071/0072 implementation.

---

## Acceptance Criteria (for this ADR document)

- [x] Context, problem, decision, alternatives, consequences documented
- [x] Alert lifecycle, creation, severity, categories, evaluation, rules, suppression, dedup, persistence, ack, resolve, escalation, retry, failure, metrics, health, diagnostics, configuration, admin interfaces specified
- [x] Boundaries with Observe, Search, Notifications, Runtime, Platform Services, Workbench, Identity, Administration defined
- [x] No new architectural layers introduced
- [x] No implementation performed under Platform-1.3-ADR-0070
- [x] Future engineering (ENG-002) clearly gated

---

## Recommendation

# READY FOR OWNER ADR ACCEPTANCE

---

## Owner decision (record)

| Field      | Value                                                |
| ---------- | ---------------------------------------------------- |
| Decision   | ☐ ACCEPTED · ☐ REJECTED · ☐ ACCEPTED WITH CONDITIONS |
| Date       |                                                      |
| Conditions |                                                      |
| Sign-off   |                                                      |

---

## Related

- [Observability Freeze Notice](../APZHUB-Observability-Architecture-Freeze-Notice.md)
- [Observability Reference Standard](../APZHUB-Observability-Reference-Standard.md)
- [ADR-0066 Analytics boundaries](../../adr/ADR-0066-analytics-platform-boundaries.md)
- [ADR-0032 Notification routing](../../adr/ADR-0032-notification-routing-model.md)
- [ADR-0071 Notification delivery (Proposed)](../../adr/ADR-0071-notification-delivery-provider-framework.md)
- [Platform 1.3 EPICS — P13-E02](../../strategy/platform-1.3/EPICS.md)
- [ARCH-001 ADR Recommendations](../platform-1.3-confirmation/ADR-RECOMMENDATIONS.md)
