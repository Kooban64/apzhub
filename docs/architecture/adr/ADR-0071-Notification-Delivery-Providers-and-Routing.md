# ADR-0071 — Notification Delivery Providers and Routing Architecture

> **Programme:** Platform-1.3-ADR-0071  
> **ADR ID:** ADR-0071  
> **Title:** Notification Delivery Providers and Routing Architecture  
> **Classification:** ARCHITECTURE DECISION RECORD  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform 1.3 Engineering · Platform **1.2.0** architecture freeze  
> **Prerequisites:** ADR-0070 **ACCEPTED** · ADR-0072 **ACCEPTED** · ENG-002 **ACCEPTED** · ENG-003 **ACCEPTED** · Platform-1.3-ARCH-001 **ACCEPTED**  
> **Epic gate:** P13-E04 · Future engineering: **Platform-1.3-ENG-004** (Notification Delivery)  
> **Date:** 2026-07-22  
> **Status:** **Accepted** — Owner Decision Platform-1.3-ENG-004 bootstrap (2026-07-22)  
> **Implementation:** **Platform-1.3-ENG-004 authorised** (Phase A only; this ADR alone does not ship code)  
> **Canonical pack path:** `docs/architecture/adr/ADR-0071-Notification-Delivery-Providers-and-Routing.md`  
> **Index stub:** [docs/adr/ADR-0071-notification-delivery-provider-framework.md](../../adr/ADR-0071-notification-delivery-provider-framework.md)  
> **Owner acceptance:** [OWNER-ACCEPTANCE-ADR-0071.md](./OWNER-ACCEPTANCE-ADR-0071.md)  
> **Pre-conditions:** [PRECONDITION-VERIFICATION-ADR-0071.md](./PRECONDITION-VERIFICATION-ADR-0071.md) **PASS**

---

## Status

**Accepted** — Owner Decision Platform-1.3-ENG-004 bootstrap (2026-07-22)

Implementation under **Platform-1.3-ENG-004** (Phase A). This ADR alone does not ship code.

---

## Context

APZHUB Notification (APZNOTIFY-001…006) is a **frozen metadata System of Record**: notification identity, templates metadata, preferences, categories, Attention/routing catalogue, HTTP management plane, and Workbench. The [Notification Architecture Freeze Notice](../APZHUB-Notification-Architecture-Freeze-Notice.md) and Future Delivery Framework Guide describe **APZNOTIFY-007** (delivery providers) as roadmap-only.

Platform 1.3 planning ([APZHUB-PLAN-001](../../strategy/platform-1.3/README.md) **ACCEPTED**) and architecture confirmation ([Platform-1.3-ARCH-001](../platform-1.3-confirmation/README.md) **ACCEPTED**) require epic **P13-E04 — Notification Delivery Providers** via **Platform-1.3-ENG-004**, gated on this ADR.

Related accepted work:

| Programme          | Relevance                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------- |
| ADR-0070 / ENG-002 | Observe alert evaluation + **delivery hook seam** — must not own providers               |
| ADR-0072 / ENG-003 | Realtime Workbench subscription (SSE) — **distinct** from notification delivery channels |
| APZNOTIFY-006      | Frozen Notification metadata SoR — delivery must extend, not replace                     |

### Problem Statement

Without an Owner-accepted Notification Delivery ADR:

1. ENG-004 cannot lawfully introduce providers (SMTP, webhook, etc.).
2. Products may call providers directly (Module→SMTP bypass).
3. Delivery may be conflated with **Email System of Record**, Realtime Transport, or Workflow Execute.
4. Observe may couple to channel providers.
5. Marketing may claim Email SoR or “full messaging platform” without honesty.

### Goals

- Define authoritative **Notification Delivery** architecture for APZHUB.
- Central governance with provider independence.
- Event-driven + command intake; persistent delivery state; idempotency; retries; preferences; policies; diagnostics; health.
- Keep delivery **≠** Email SoR · Realtime Transport · Workflow Execute.
- Preserve layered architecture and Integration SDK **1.0.0** freeze.
- Unblock future **ENG-004** without authorising implementation in this programme.

### Non-goals (this ADR)

- Any application/package source changes.
- Provider implementation (SMTP, SMS, push, webhook, etc.).
- Email SoR · FIN-001 · Workflow Execute unlock · WebSocket product transport.
- Integration SDK thaw or new architectural layer.
- Observe PromQL / Support Chat / Collaborative Editing.

---

## Business Drivers

| Driver                                                          | Source                         |
| --------------------------------------------------------------- | ------------------------------ |
| Certified delivery of platform notifications                    | P13-E04 · F-04 · APZNOTIFY-007 |
| Observe alerts need outbound attention without owning SMTP      | ADR-0070 · PL12-KL-02 residual |
| Support may need external notifications without owning channels | Support product honesty        |
| Explicit fence vs Email SoR                                     | PL12-KL-07 · ARCH-001          |
| Zero Trust, audit, POPIA                                        | Foundation 013 · governance    |
| Async, respond-fast                                             | Foundation 012 · Event Bus 029 |

---

## Authoritative Principles (responsibility separation)

| Owner                                     | Owns                                                                                | Must not own                                                                  |
| ----------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Notification Delivery**                 | Intent, lifecycle, routing, attempts, delivery state, retries, provider abstraction | Mailbox, threads, inbound mail archive, Workbench realtime sockets            |
| **Observe**                               | Alert lifecycle / evaluation state                                                  | Providers, SMTP, recipient fan-out ownership                                  |
| **Support**                               | Ticket lifecycle                                                                    | Providers, Email SoR                                                          |
| **Realtime (ADR-0072)**                   | Live presentation subscription (SSE)                                                | Delivery attempts, provider retries                                           |
| **Email SoR (future, excluded from 1.3)** | Mailbox, threads, inbound, archive, search                                          | Notification intent routing (may _consume_ delivery later under separate ADR) |

These responsibilities remain **independent**. Integration is via Platform Events / Platform Service interfaces only.

---

## Architectural Questions (normative answers)

### 1. Who owns Notification Intent?

**Notification Platform Services** (Delivery plane). Producers (Observe, Support, other Platform Services) request intents via events or service commands; they do not own intent persistence after handoff.

### 2. Who owns Delivery State?

**Notification Platform Services**. Delivery and DeliveryAttempt records are subordinate to Notification SoR / delivery plane — not a second identity SoR and not Email SoR.

### 3. How are Domain Events transformed into Notification Intents?

Platform Event Bus subscribers (or synchronous command APIs) invoke `NotificationIntentService.create` / equivalent. Mapping rules are policy-driven (event type → template/category/priority). Fail-soft: producer business mutation remains authoritative if intent creation fails (012).

### 4. How are Recipients resolved?

**Recipient Resolver** inside Notification Platform Services: expands audience (user, role, group, org, explicit addresses) against Identity / membership, then applies preferences and policies. Products supply _audience hints_; Notification owns final resolution.

### 5. How are User Preferences evaluated?

**Preference Service** (platform-owned, hierarchy system→org→role→user→session per 023). Preferences may suppress or channel-shift **non-mandatory** intents. Preferences never grant permissions.

### 6. Which notifications are mandatory?

**NotificationPolicy** marks categories as `mandatory` (security, legal, break-glass, critical ops). Mandatory intents skip user opt-out; still respect authz, tenant isolation, and POPIA purpose limitation. Catalogue of mandatory categories is Owner-governed configuration, not hard-coded per product.

### 7. How are Delivery Channels selected?

**Router** evaluates: policy defaults → product hint → user preference → provider availability → fallback chain. Channel is abstract (`in_app`, `email`, `sms`, `push`, `webhook`); selection yields ordered channel candidates.

### 8. How are Providers selected?

For each selected channel, **Provider Registry** chooses a capable, healthy, tenant-enabled provider by capability match + priority + health. No product hard-codes a provider id.

### 9. How are retries governed?

**Retry Policy** on transient failures: exponential backoff + jitter, max attempts, per-provider classification. Permanent failures → dead-letter / permanent_failure. See Retry Model.

### 10. How are duplicates prevented?

Intent **IdempotencyKey** (tenant + source + logical key) unique. Delivery attempts keyed by intent + channel + recipient + attempt ordinal. Event redelivery is idempotent at intent create.

### 11. How is idempotency maintained?

At-least-once Event Bus + idempotent intent upsert + delivery attempt uniqueness. Replays do not create duplicate successful deliveries for the same idempotency key + channel + recipient.

### 12. How are delivery receipts represented?

**NotificationDeliveryStatus** / receipt fields distinguish provider-accepted, queued, sent, delivered, opened, rejected, expired, unknown. “Delivered to human” is claimed only when provider supports and confirms it.

### 13. How are templates managed?

**NotificationTemplate** in Notification SoR (metadata). Versioned, tenant/org scoped where allowed, render at send-time with redaction rules. ENG-004 may extend; Email SoR templates are out of scope.

### 14. How are provider credentials secured?

Secrets in platform secret store / encrypted connector config refs (011) — never in code, logs, or client payloads. Rotation via Administration ops. Least privilege provider credentials.

### 15. How are tenant boundaries enforced?

Every intent/delivery carries `TenantId` (and optional `OrganisationId`). Resolvers, providers, and queries are tenant-scoped. Cross-tenant delivery is an architectural defect.

### 16. How are diagnostics exposed?

Notification Delivery diagnostics API / Administration Workspace: counters, queue depth, provider latency, suppression reasons — permission-gated.

### 17. How is health determined?

Composite: configuration ready + queue healthy + ≥1 required provider healthy (when delivery enabled). **Unknown ≠ Healthy**.

### 18. How are provider failures handled?

Classify transient vs permanent; retry or fail; circuit-break unhealthy providers; failover to next provider/channel per policy; emit `notification.delivery.failed` / `.retry`.

### 19. How are providers replaced?

Provider Registry + capability discovery; hot configuration; no product code changes. Future Integration SDK adapter work is **deferred** (SDK remains frozen for 1.3).

### 20. How does Notification Delivery integrate with Observe, Support, Realtime without coupling?

| System       | Integration                                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Observe**  | Publishes alert lifecycle events / calls delivery hook → Notification creates intents. Observe never imports providers.                                                                                                  |
| **Support**  | Ticket domain events / service commands → intents for external attention. Ticket SoR unchanged.                                                                                                                          |
| **Realtime** | May _present_ in-app attention items already stored by Notification; Realtime does not perform provider delivery. In-app channel may update Notification SoR; Workbench SSE (ADR-0072) is a separate subscription plane. |

---

## Architecture Options

### Option A — Products call providers directly

Products/modules invoke SMTP/SMS SDKs.

| Dimension              | Assessment                          |
| ---------------------- | ----------------------------------- |
| Coupling               | **High** — products bind to vendors |
| Scalability            | Fragmented                          |
| Auditability           | Weak / inconsistent                 |
| Provider independence  | Poor                                |
| Security               | Secrets sprawl                      |
| Maintainability        | Poor                                |
| Tenant isolation       | Easy to get wrong                   |
| Operational simplicity | False short-term simplicity         |

**Rejected.**

### Option B — Central Notification Service (command-only)

All delivery via synchronous Notification Service APIs; no event intake.

| Dimension              | Assessment                                   |
| ---------------------- | -------------------------------------------- |
| Coupling               | Medium — central good; sync blocks producers |
| Scalability            | Weaker under burst                           |
| Auditability           | Good if persistent                           |
| Provider independence  | Good                                         |
| Security               | Good if centralised                          |
| Maintainability        | Good                                         |
| Tenant isolation       | Good                                         |
| Operational simplicity | Medium                                       |

**Insufficient alone** — misses event-driven Observe/Support fan-in (012).

### Option C — Pure Event-driven Notification Orchestration

Only Event Bus; no command API.

| Dimension              | Assessment                                  |
| ---------------------- | ------------------------------------------- |
| Coupling               | Low between products                        |
| Scalability            | Good                                        |
| Auditability           | Needs careful persistence                   |
| Provider independence  | Good                                        |
| Security               | Good                                        |
| Maintainability        | Medium — hard for admin “send now” / replay |
| Tenant isolation       | Good                                        |
| Operational simplicity | Harder ops without command surface          |

**Insufficient alone** — administration, tests, and mandatory sends need commands.

### Option D — Hybrid (preferred)

**Central Notification Delivery Service** (Platform Services) **plus** event-driven intake **and** command intake.

| Dimension              | Assessment                          |
| ---------------------- | ----------------------------------- |
| Coupling               | Low — products never call providers |
| Scalability            | Async workers + queues              |
| Auditability           | Persistent intent/delivery/attempt  |
| Provider independence  | Registry + adapters                 |
| Security               | Central secrets, authz, audit       |
| Maintainability        | Single plane                        |
| Tenant isolation       | First-class                         |
| Operational simplicity | Admin diagnostics + DLQ             |

**Selected.**

---

## Decision

**APZHUB shall adopt Option D — Hybrid Notification Delivery Architecture:**

1. **Ownership:** Notification Platform Services own Notification Intent, routing, delivery state, retries, and provider abstraction (APZNOTIFY-007 shape).
2. **Intake:**
   - **Event-driven:** subscribe to platform domain events (Observe, Support, others).
   - **Command:** `createIntent` / admin replay via Gateway → Notification Platform Services.
3. **Persistence:** Intent, Recipient expansion snapshot, Delivery, DeliveryAttempt, and status transitions in platform PostgreSQL (Notification delivery plane) — subordinate to Notification SoR; **not** Email SoR; **not** duplicating Observe/Support business entities.
4. **Providers:** Abstract `NotificationProvider` behind Platform Services (connector-style). Presentation never calls providers. Integration SDK **1.0.0 remains frozen**; Phase A ENG-004 may use platform-local provider adapters under Notification/Services packages without thawing SDK (record future SDK extraction as deferred work).
5. **Channels:** Abstract channel model; **Platform 1.3 authorises design of all channels but implementation authority for ENG-004 is Owner-scoped** (recommended Phase A: **in-app** + at most one external channel such as **email-as-delivery** SMTP — still ≠ Email SoR).
6. **Fences:** Explicit exclusion of Email SoR, Realtime Transport redesign, Workflow Execute, FIN-001.
7. **This ADR alone does not authorize engineering** — named **Platform-1.3-ENG-004** Owner Approval required after ADR Acceptance.

### Rejected alternatives

| Option                   | Why rejected                  |
| ------------------------ | ----------------------------- |
| A                        | Layer bypass; secret sprawl   |
| B alone                  | Blocks async event intake     |
| C alone                  | Weak admin/command/replay     |
| Status quo (no delivery) | Rejected by P13-E04 Must epic |

---

## Domain Model

| Entity                            | Ownership                        | Lifecycle                   | Persistence                 | Security classification                   |
| --------------------------------- | -------------------------------- | --------------------------- | --------------------------- | ----------------------------------------- |
| **NotificationIntent**            | Notification Delivery            | requested→…→terminal        | Platform PG                 | Internal; may contain PII in payload refs |
| **NotificationRecipient**         | Notification Delivery (resolved) | derived per intent          | Snapshot on intent/delivery | PII / confidential                        |
| **NotificationPreference**        | Preference / Notification        | CRUD by user/admin          | Platform PG                 | Internal                                  |
| **NotificationPolicy**            | Notification admin               | versioned config            | Platform PG                 | Internal                                  |
| **NotificationTemplate**          | Notification                     | draft→published→retired     | Platform PG                 | Internal; may embed locale strings        |
| **NotificationChannel**           | Abstract enum/config             | N/A                         | Config                      | Public enum                               |
| **NotificationPriority**          | Enum on intent                   | N/A                         | On intent                   | Internal                                  |
| **NotificationDelivery**          | Notification Delivery            | queued→…→terminal           | Platform PG                 | Internal + recipient PII refs             |
| **NotificationDeliveryAttempt**   | Notification Delivery            | per try                     | Platform PG                 | Internal; provider refs; no raw secrets   |
| **NotificationDeliveryStatus**    | Enum                             | N/A                         | On delivery/attempt         | Internal                                  |
| **NotificationProvider**          | Registry metadata                | registered→enabled→disabled | Config + secret refs        | Secret refs = restricted                  |
| **CorrelationId**                 | Cross-cutting (010)              | request/event scoped        | Propagated                  | Internal                                  |
| **IdempotencyKey**                | Notification Delivery            | unique per tenant           | Unique index                | Internal                                  |
| **TenantId** / **OrganisationId** | Platform identity                | N/A                         | On all records              | Internal                                  |
| **ProductId**                     | Producer product key             | N/A                         | On intent                   | Internal                                  |
| **AuditMetadata**                 | Platform audit                   | immutable                   | Audit store                 | Restricted                                |

---

## Lifecycle

### Intent / delivery states

| State               | Meaning                                         |
| ------------------- | ----------------------------------------------- |
| `requested`         | Accepted for validation                         |
| `validated`         | Schema/policy/authz OK                          |
| `suppressed`        | Preference/policy suppressed (terminal or hold) |
| `queued`            | Ready for worker                                |
| `processing`        | Provider call in flight                         |
| `delivered`         | Terminal success (per receipt model)            |
| `retry`             | Transient failure; scheduled retry              |
| `permanent_failure` | Terminal failure                                |
| `cancelled`         | Operator/user/system cancel                     |
| `expired`           | Past TTL without success                        |

### Legal transitions (normative)

```
requested → validated | suppressed | cancelled | expired
validated → queued | suppressed | cancelled | expired
queued → processing | cancelled | expired
processing → delivered | retry | permanent_failure | cancelled | expired
retry → queued | permanent_failure | cancelled | expired
suppressed → (terminal) | queued  # only if policy allows later release
delivered | permanent_failure | cancelled | expired → (terminal)
```

Illegal transitions are defects. Workers must be idempotent on re-entry.

---

## Channel Model (abstract — do not implement in this ADR)

| Channel                   | Platform 1.3                                                                          | Platform 1.4 | Future |
| ------------------------- | ------------------------------------------------------------------------------------- | ------------ | ------ |
| **in-app**                | **Authorised for ENG-004 Phase A** (SoR + Attention; optional Realtime present)       | Enhance      | —      |
| **email** (delivery only) | **Optionally authorised** for ENG-004 if Owner scopes SMTP provider — **≠ Email SoR** | Harden       | —      |
| **webhook**               | Design-ready; implement only if Owner scopes                                          | Likely       | —      |
| **push**                  | Future                                                                                | Candidate    | Yes    |
| **SMS**                   | Future                                                                                | Candidate    | Yes    |

**Not authorised by this ADR alone:** mailbox ingestion, IMAP/JMAP, thread SoR, outbound marketing ESP productisation.

---

## Provider Model

### Abstraction

```
NotificationProvider {
  id, channelCapabilities[],
  send(attempt) → ProviderResult,
  getHealth(), getDiagnostics(),
  classifyError(error) → transient | permanent,
  rateLimitHints
}
```

### Capabilities

Channel support, receipt depth (accepted/sent/delivered/opened), batching, template passthrough vs platform-rendered body.

### Health / diagnostics / rate limits

Self-reported health; Platform aggregates. Rate limits enforced before send. Circuit breaker on repeated transient failures.

### Retry / permanent failure classification

Provider maps vendor errors → platform taxonomy. Unknown errors default to **transient** with capped retries, then permanent_failure.

### Configuration & credentials

Tenant/org enablement flags; secret references only; rotation runbooks in Operations. **No Integration SDK modification** in 1.3; future extraction of shared adapter interfaces is deferred work.

---

## Routing Model

1. Intake (event or command) → create Intent (idempotent).
2. Validate authz, tenant, schema, template.
3. Resolve recipients.
4. Apply **Policy** (mandatory, priority, allowed channels).
5. Apply **Preferences** (non-mandatory).
6. Select channel ordered list.
7. For each recipient × channel: create Delivery; enqueue.
8. Worker selects Provider; create Attempt; send; update status; retry or complete.
9. Emit domain events; audit.

---

## Recipient Model

- Inputs: explicit user ids, roles, groups, org broadcast hints, optional external addresses (channel-constrained).
- Resolution via Identity Platform Services.
- Snapshot frozen on intent for audit (later membership changes do not rewrite history).
- External addresses require policy allow + POPIA purpose check.

---

## Preference Model

- Hierarchy: system → org → role → user → session (023).
- Actions: suppress, delay, channel preference, quiet hours.
- Cannot disable mandatory policy categories.
- Cannot elevate privileges.
- Evaluation recorded on intent (`suppressedReason` / `preferenceDecision`).

---

## Template Model

- Versioned templates with locale variants.
- Render in Notification Services with allow-listed variables.
- No unrestricted HTML from producers.
- Missing template → validated failure or suppress per policy (never silent healthy).

---

## Security Model

| Control                | Rule                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------- |
| Authentication         | Session / service identity on commands; worker service identity                    |
| Authorization          | Deny-by-default permissions (`notification.delivery.*`, admin ops)                 |
| Tenant / org isolation | Mandatory on all records and provider calls                                        |
| Provider secrets       | Encrypted refs; never logs                                                         |
| Key rotation           | Admin ops; dual-key window                                                         |
| Sensitive data         | Minimise payload; store refs; redact logs                                          |
| Audit                  | Intent create, suppress, send, fail, replay, config change                         |
| Encryption             | TLS in transit; encrypt sensitive fields at rest per 013                           |
| Rate limiting          | Per tenant/user/provider                                                           |
| Abuse prevention       | Caps on broadcast fan-out; mandatory dual-control for org-wide blasts (ops policy) |

---

## POPIA Considerations

| Principle              | Application                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------- |
| Purpose limitation     | Intent must declare purpose/category; providers used only for that purpose             |
| Data minimisation      | Templates + variables only; no full ticket/alert dumps by default                      |
| Recipient accuracy     | Resolve from Identity; bounce handling updates suppression lists carefully             |
| Retention              | Configurable retention for intents/attempts; purge jobs                                |
| Cross-border providers | Document provider regions; Owner approval for extraterritorial processors              |
| Provider agreements    | Operator must maintain DPAs / processing terms before enablement                       |
| Consent                | Marketing-like categories require consent flags; operational/security may be mandatory |
| Compliance review      | ENG-004 acceptance includes POPIA checklist evidence                                   |

---

## Idempotency Model

| Layer            | Mechanism                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Intent           | `IdempotencyKey` unique per tenant                                                                                                    |
| Delivery         | Unique (intentId, channel, recipientKey)                                                                                              |
| Attempt          | Unique (deliveryId, attemptNumber)                                                                                                    |
| Replay           | Admin replay creates **new** intent with causation link **or** requeues failed delivery under policy — never silently doubles success |
| Event redelivery | Intent upsert by idempotency key                                                                                                      |
| Correlation      | `CorrelationId` / `CausationId` on all events                                                                                         |

---

## Retry Model

| Concept         | Rule                                                        |
| --------------- | ----------------------------------------------------------- |
| Transient       | Network, 429, 5xx, temporary auth glitch                    |
| Permanent       | 400 mapping, unknown recipient, policy deny, config missing |
| Backoff         | Exponential + jitter; provider-specific caps                |
| Limits          | Max attempts (config; default e.g. 8)                       |
| Dead-letter     | After max → `permanent_failure` + DLQ view                  |
| Operator replay | Admin permission; audited                                   |
| Cancellation    | Cancel queued/retry; not rewind delivered                   |
| Expiry          | Intent TTL; expire supersedes retry                         |

---

## Delivery Receipt Model

| Receipt             | Meaning                             | Claim to end user?         |
| ------------------- | ----------------------------------- | -------------------------- |
| `provider_accepted` | Provider API accepted request       | No                         |
| `queued`            | In provider or platform queue       | No                         |
| `sent`              | Provider reports sent to network    | Limited                    |
| `delivered`         | Provider confirms endpoint delivery | Only if provider supports  |
| `opened`            | Optional engagement signal          | Never as security proof    |
| `rejected`          | Provider rejected                   | Yes (failure)              |
| `expired`           | TTL                                 | Yes                        |
| `unknown`           | No signal                           | **Never equals delivered** |

Honesty rule: UI must not claim “read by user” unless supported and permitted.

---

## Event Contracts (additive)

| Event                             | Producer             | Typical consumers         |
| --------------------------------- | -------------------- | ------------------------- |
| `notification.intent.created`     | Notification Service | Audit, metrics, Workbench |
| `notification.intent.suppressed`  | Notification Service | Audit, metrics            |
| `notification.delivery.started`   | Notification worker  | Metrics                   |
| `notification.delivery.delivered` | Notification worker  | Attention, metrics        |
| `notification.delivery.failed`    | Notification worker  | Ops, metrics              |
| `notification.delivery.retry`     | Notification worker  | Ops                       |
| `notification.delivery.cancelled` | Notification Service | Audit                     |
| `notification.delivery.expired`   | Notification worker  | Audit                     |

**Versioning:** `eventVersion` on envelope; additive fields only in minor.  
**Ordering:** per intentId best-effort; consumers idempotent.  
**Sensitive data:** no secrets; minimise PII in payloads (ids + category).

---

## Observe Integration

- Observe owns alert lifecycle (ADR-0070).
- On fire/ack/resolve/suppress (as configured), Observe emits events or calls Notification delivery hook.
- Notification owns recipient resolution, routing, providers.
- **Observe shall never import or configure SMTP/SMS providers.**

---

## Support Integration

- Support owns ticket lifecycle.
- Support may emit domain events → Notification intents for external attention.
- Realtime inbox updates remain ADR-0072 SSE.
- Support UI must not call providers.

---

## Realtime Interaction (ADR-0072)

| Concern                                                | Owner                                             |
| ------------------------------------------------------ | ------------------------------------------------- |
| Workbench live ticket/alert **presentation**           | Realtime Subscription (SSE)                       |
| Notification **delivery attempt** to email/SMS/webhook | Notification Delivery                             |
| In-app notification list / Attention                   | Notification SoR (+ optional Realtime invalidate) |

Realtime must not become a delivery provider bus for external channels. Notification must not open Workbench SSE sockets.

---

## Health

| Check                | Healthy when                                                   |
| -------------------- | -------------------------------------------------------------- |
| Readiness            | Config loaded; DB reachable; workers registered (when enabled) |
| Health               | Readiness + not shutting down                                  |
| Provider health      | Each enabled provider self-report OK                           |
| Queue health         | Depth below threshold; lag OK                                  |
| Configuration health | Required templates/policies present                            |
| Template health      | Published templates resolve                                    |
| Retry health         | DLQ growth within bounds                                       |

**Unknown must never equal Healthy.** Disabled delivery flag → `disabled` / degraded honesty, not healthy success.

---

## Diagnostics / Metrics

Intents created · suppressed · queued · processing · delivered · failed · retry · cancelled · expired ·  
Delivery latency · provider latency · queue depth · template failures · preference suppressions · authz denials · fan-out size · DLQ size.

Exposed via Notification diagnostics APIs and Administration Workspace (permission-gated).

---

## Administration

Admin surfaces (permission-gated):

Providers · Templates · Policies · Preferences (org defaults) · Retries · Dead letters · Replay · Health · Metrics · Diagnostics · Audit.

No backend provider dashboards exposed to standard users.

---

## Operations

| Topic               | Guidance                                                   |
| ------------------- | ---------------------------------------------------------- |
| Provider onboarding | Register → secrets → health check → tenant enable → canary |
| Credential rotation | Dual-key; audit; rollback                                  |
| Provider outage     | Circuit break; failover channel; status page honesty       |
| Rate limiting       | Shared-host aware; per-tenant caps                         |
| Capacity            | Queue/worker sizing; coexistence with apz-stack            |
| Incident response   | Correlate correlationId; DLQ triage                        |
| Retention           | Policy-driven purge                                        |
| DR                  | Backup intent/delivery tables with platform PG             |

---

## Boundaries (preserved)

```
Presentation → Platform Services → Connector/Provider Adapter → Engine/Provider
```

- No new architectural layer.
- Products never call providers directly.
- Gateway holds no business routing logic beyond authz/validation forwarding.
- Integration SDK **1.0.0** frozen; no SDK change in this ADR.

---

## Dependencies

| Dependency                        | Status                      |
| --------------------------------- | --------------------------- |
| APZNOTIFY-001…006 metadata SoR    | Frozen / accepted           |
| ADR-0070 Observe delivery hook    | ACCEPTED                    |
| ADR-0072 Realtime                 | ACCEPTED (distinct)         |
| Platform Event Bus                | Available                   |
| Identity for recipient resolution | Available                   |
| ENG-004 Owner Approval            | **Required after this ADR** |

---

## Risks

| ID     | Risk                           | Mitigation                                        |
| ------ | ------------------------------ | ------------------------------------------------- |
| R71-01 | Conflation with Email SoR      | Explicit fence; marketing honesty; channel naming |
| R71-02 | Observe couples to SMTP        | Hook-only; architecture tests                     |
| R71-03 | Secret leakage in logs/events  | Redaction; secret refs                            |
| R71-04 | Fan-out abuse                  | Caps; mandatory dual-control                      |
| R71-05 | SDK thaw pressure              | Defer SDK; local adapters first                   |
| R71-06 | Duplicate storms on bus replay | Idempotency keys                                  |
| R71-07 | Claiming false “delivered”     | Receipt honesty model                             |

---

## Deferred Work / Future Engineering

- **Platform-1.3-ENG-004:** implement Hybrid plane Phase A (intent/delivery persistence, worker, ≥1 certified provider path, diagnostics, tests, honesty docs).
- SMS / push / advanced webhook — 1.4+ unless Owner expands ENG-004.
- Integration SDK shared Notification provider kit — future programme.
- Email SoR — separate ADR/programme (excluded).
- Deep engagement analytics (opens/clicks) — future.

---

## Future ENG-004 Scope (guidance — not authorised here)

1. Additive contracts for Intent/Delivery/Attempt.
2. Intent service + router + preference/policy evaluation.
3. Worker + retry/DLQ.
4. In-app delivery path + optional SMTP provider adapter (if Owner scopes).
5. Admin diagnostics/health.
6. Observe/Support integration via events/hooks only.
7. POPIA + security evidence.
8. Update PL12-KL-02 delivery residual / notification honesty docs.

---

## Acceptance Criteria (for this ADR programme)

- [x] Pre-conditions verified PASS
- [x] Options A–D evaluated; Option D selected
- [x] Domain model, lifecycle, provider/channel/routing/security/POPIA/idempotency/retry/receipts defined
- [x] Observe / Support / Realtime fences explicit
- [x] Health/diagnostics/admin/ops defined
- [x] Explicit exclusions recorded
- [x] OWNER-ACCEPTANCE artefact awaiting Owner
- [x] No implementation performed

---

## Explicit Exclusions

- Email System of Record
- FIN-001
- Workflow Execute unlock
- WebSocket implementation
- Notification provider implementation (ENG-004)
- Integration SDK changes
- Platform Service redesign beyond additive delivery plane (to be designed in ENG-004 under this ADR)
- Observe Realtime product stream
- Support Chat / Collaborative Editing

---

## Documentation Created

| Artefact                   | Path                                                                            |
| -------------------------- | ------------------------------------------------------------------------------- |
| Canonical ADR              | `docs/architecture/adr/ADR-0071-Notification-Delivery-Providers-and-Routing.md` |
| Owner acceptance           | `docs/architecture/adr/OWNER-ACCEPTANCE-ADR-0071.md`                            |
| Pre-condition verification | `docs/architecture/adr/PRECONDITION-VERIFICATION-ADR-0071.md`                   |
| Index stub (updated)       | `docs/adr/ADR-0071-notification-delivery-provider-framework.md`                 |
