# ADR-0072 — Platform Realtime Transport Architecture

> **Programme:** Platform-1.3-ADR-0072  
> **ADR ID:** ADR-0072  
> **Title:** Platform Realtime Transport Architecture  
> **Classification:** ARCHITECTURE DECISION RECORD  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform 1.3 Engineering · Platform **1.2.0** architecture freeze  
> **Prerequisites:** Platform-1.3-ARCH-001 **ACCEPTED** · Platform-1.3-ENG-001 **ACCEPTED** · Platform-1.3-ENG-002 **ACCEPTED** · ADR-0070 **ACCEPTED**  
> **Epic gate:** P13-E03 · Future engineering: **Platform-1.3-ENG-003** (Support Realtime)  
> **Date:** 2026-07-22  
> **Status:** **Accepted** — Owner Decision Platform-1.3-ENG-003 bootstrap (2026-07-22)  
> **Implementation:** **Platform-1.3-ENG-003 authorised** (SSE Phase A only; this ADR alone does not ship code)  
> **Canonical pack path:** `docs/architecture/adr/ADR-0072-Platform-Realtime-Transport.md`  
> **Index stub:** [docs/adr/ADR-0072-platform-realtime-transport.md](../../adr/ADR-0072-platform-realtime-transport.md)
> **Engineering pack:** `docs/engineering/platform-1.3-eng-003/`

---

## Context

Platform **1.2.0** delivers Support domain events, webhook ingress fan-out, and the Platform Event Bus, but product Workbenches lack a certified **production realtime subscription surface** (SSE / WebSocket). Support UI certification and HTTP architecture explicitly exclude WS/SSE; clients rely on TanStack Query poll/refetch.

Platform 1.3 planning ([APZHUB-PLAN-001](../../strategy/platform-1.3/README.md) **ACCEPTED**) and architecture confirmation ([Platform-1.3-ARCH-001](../platform-1.3-confirmation/README.md) **ACCEPTED**) require epic **P13-E03 — Support Realtime (R12-SUP-03)** via **Platform-1.3-ENG-003**, gated on this ADR ([EPIC-ASSESSMENT](../platform-1.3-confirmation/EPIC-ASSESSMENT.md), [ADR-RECOMMENDATIONS](../platform-1.3-confirmation/ADR-RECOMMENDATIONS.md)).

Related accepted work:

| Programme                       | Relevance                                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Platform-1.3-ENG-001            | Search Live Drain — async patterns; not realtime transport                                                                |
| Platform-1.3-ENG-002 / ADR-0070 | Observe Live Alerts Phase A — events + delivery hook; optional Workbench push deferred to this ADR                        |
| ADR-0071 (Proposed)             | Notification **delivery providers** (SMTP/WS/SSE as channels) — **distinct** from product Workbench realtime subscription |

Module-owned sockets, browser→engine WebSockets, or bypassing the API Gateway would violate layered architecture (003), Module/Service/Connector separation (008/009), and Gateway standards (010).

Shared-host coexistence with legacy `apz-stack` ([ENVIRONMENT.md](../../ENVIRONMENT.md)) constrains long-lived connection capacity.

### Problem Statement

Without an Owner-accepted realtime transport ADR:

1. ENG-003 cannot lawfully introduce WS/SSE product surfaces.
2. Engineers risk per-module sockets, Zammad EE realtime, or Presentation→Engine bypasses.
3. Notification delivery (ADR-0071) and Workbench subscription may be conflated.
4. SSE vs WebSocket choices may fork inconsistently across products.
5. Marketing may claim “realtime Support” without honesty on transport, authz, and capacity.

### Goals

- Define the **platform-owned realtime transport architecture** for APZHUB.
- Preserve frozen Platform **1.2.0** layering and package boundaries.
- Answer whether SSE, WebSockets, or a transport abstraction is the long-term approach.
- Unblock **ENG-003** (and optional Observe/Notification Workbench push) without new architectural layers.
- Enforce authentication, authorisation, tenant isolation, reconnect/heartbeat, and health semantics.
- Keep Integration SDK **1.0.0** frozen; no Email SoR / FIN-001 / Workflow Execute unlock.

### Non-goals (this ADR)

- Implementation of SSE/WS routes, clients, or workers.
- Support Realtime product delivery (ENG-003).
- Notification delivery providers (ADR-0071 / ENG-004).
- Email SoR · FIN-001 · Workflow Execute.
- Observe PromQL / live telemetry streaming.
- Collaborative bidirectional editing / multiplayer presence as a 1.3 requirement.
- Thawing Integration SDK or inventing a new top-level architectural layer.

---

## Business Drivers

| Driver                                                                      | Source                                                  |
| --------------------------------------------------------------------------- | ------------------------------------------------------- |
| Support inbox/detail updates after webhook/attachments without poll-only UX | P13-E03 · F-03 · PL12-KL-05                             |
| Prefer SSE; shared-host capacity                                            | ARCH-001 EPIC-ASSESSMENT / ARCHITECTURE-REVIEW          |
| Optional Observe Workbench push of alert lifecycle                          | ADR-0070 Future Engineering                             |
| Notification in-app attention may later consume same subscription plane     | Soft dependency with ADR-0071 (delivery ≠ subscription) |
| Zero Trust authn/authz on every stream                                      | Foundation 013 · Gateway 010                            |
| Respond fast, process async                                                 | Foundation 012 · Event Bus 029                          |

---

## Architectural Questions (normative answers)

### 1. What business capabilities require realtime communication?

| Capability                                                                           | 1.3 status                                                                | Direction                                               |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Support inbox / request detail updates** after webhook, article, assignment, close | **Must** (P13-E03)                                                        | Server → client                                         |
| **Observe alert state push** to Observability Workbench                              | Optional after ENG-003 framework                                          | Server → client                                         |
| **In-app notification / attention stream**                                           | Soft; may use Notification delivery (ADR-0071) or this subscription plane | Server → client                                         |
| Client mutations (reply, assign, ack alert, suppress)                                | Required product UX                                                       | **HTTP REST / Platform Services** — not realtime duplex |
| Collaborative live editing, typing presence, peer P2P                                | **Not** an approved Platform 1.3 Must epic                                | Out of scope                                            |

### 2. Server → client only vs bidirectional

| Pattern                                                            | Required for approved 1.3 Must?                            |
| ------------------------------------------------------------------ | ---------------------------------------------------------- |
| Server → client event push (Support, optional Observe)             | **Yes**                                                    |
| Bidirectional duplex (client sends realtime frames on same socket) | **No** — mutations remain Gateway REST → Platform Services |
| Client → server realtime without HTTP                              | **Not required** for P13-E03                               |

### 3. Can Platform 1.3 requirements be fully satisfied using SSE?

**Yes.** P13-E03 is push of domain events into Workbench views. SSE provides unidirectional server→client streams over HTTP, works with existing Caddy/edge TLS patterns, and aligns with ARCH-001 “Prefer SSE”. Client→server work stays on authenticated REST.

### 4. Which future requirements would require WebSockets?

| Future need                                                      | Why WS (or duplex) may be needed       |
| ---------------------------------------------------------------- | -------------------------------------- |
| Live collaborative editing / CRDT sync                           | Frequent bidirectional frames          |
| Voice/video signalling or binary duplex                          | Full-duplex / binary                   |
| Ultra-low-latency interactive presence (cursor, typing) at scale | Bidirectional without HTTP round-trips |
| Engine-proxied duplex protocols                                  | Rare; still must not bypass Gateway    |

None of the above are approved Platform **1.3** Must epics. Approving them later requires Owner amendment / new programme — not ENG-003 scope creep.

### 5. Should the platform expose a transport abstraction?

**Yes — thin platform-owned abstraction; SSE is the only authorized concrete Phase A transport.**

Rationale: SSE satisfies 1.3, while a **Realtime Subscription Service** interface preserves package boundaries if a WebSocket adapter is Owner-approved later — without modules binding to `EventSource` or `WebSocket` APIs directly.

### 6. Reconnect, retry, heartbeat, back-pressure

| Concern           | Decision                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Reconnect**     | Client reconnects with exponential backoff + jitter; last-event-id / cursor resume where Event Bus supports it                             |
| **Retry**         | Transient stream failure → reconnect; permanent authz failure → fail closed, no silent reconnect storm                                     |
| **Heartbeat**     | Server comment/ping frames (SSE) or protocol ping (future WS) within configured idle timeout                                               |
| **Back-pressure** | Drop or coalesce low-priority events per subscription policy; never block Event Bus publishers; prefer at-least-once + idempotent UI apply |
| **Replay**        | Bounded resume window; beyond window → client refetch snapshot via REST                                                                    |

### 7. Authentication and authorisation

| Layer             | Rule                                                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Authn**         | Same platform session / bearer as Gateway REST (Better Auth session cookie or authorized token); no anonymous streams               |
| **Authz**         | Deny-by-default; subscription topics filtered by ProductionAuthorizationProvider + product permissions (e.g. Support request scope) |
| **Re-validation** | Periodic or on resume; revoked session closes stream                                                                                |
| **Superadmin**    | Explicit tier; not a bypass of tenant filters                                                                                       |

### 8. Tenant isolation

- Subscriptions scoped by `tenantId` (and organisation where applicable).
- Event payloads already tenant-tagged; transport must not fan cross-tenant.
- Shared connection pools must enforce tenant filters at subscribe time and on each emit.
- Observability of cross-tenant attempts = security audit event.

### 9. Transport failures and platform health

| Condition                           | Health effect                                                           |
| ----------------------------------- | ----------------------------------------------------------------------- |
| Transport disabled / not configured | Capability **disabled** — not “healthy with zero streams”               |
| Event Bus unavailable               | Realtime **degraded/unhealthy**; REST product APIs may remain available |
| Partial worker failure              | Degraded; last-known connection metrics exposed                         |
| Unknown dependency state            | **Must not** report READY                                               |

Workbench must retain honest empty/unavailable/error states (poll fallback may remain until stream healthy).

### 10. Integration without new layers

```text
Workbench (Presentation)
  → Typed Client
  → API Gateway (/api/v1/realtime/... or product-scoped subscribe routes)
  → Auth → Authz → Validation
  → Platform Realtime Subscription Service (Platform Services)
  → Platform Event Bus (subscribe / fan-in)
  → (domain events from Support / Observe / … Platform Services)

Mutations remain:
  Workbench → Gateway → Platform Services → Connector → Engine
```

No Module→Engine sockets. No new layer above Platform Services. Connectors never own browser transports.

---

## Boundaries (interaction without new layers)

| Capability            | Interaction                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------- |
| **Platform Runtime**  | Hosts stream endpoints, connection limits, health, config flags                             |
| **Workbench**         | Consumes typed realtime client; never opens raw engine sockets                              |
| **Identity**          | Session / actor for subscribe; permission catalogue                                         |
| **Administration**    | May expose connection diagnostics; not a second transport SoR                               |
| **Observe**           | Publishes alert lifecycle events; optional subscribe for Workbench push                     |
| **Notifications**     | ADR-0071 owns **delivery providers**; may reuse Event Bus; must not collapse into Email SoR |
| **Support**           | First ENG-003 consumer; events already on bus via webhook fanout                            |
| **Platform Services** | Sole orchestration home for subscribe/authorize/filter                                      |
| **Event Bus**         | Source of truth for fan-in; transport is a subscriber projection                            |
| **Search**            | No requirement to stream search hits in 1.3 Must; derived index remains async               |

---

## Architectural Alternatives

### Option A — Server-Sent Events (SSE) only

**Summary:** Concrete SSE endpoints as the platform realtime surface; no formal transport interface.

| Dimension                     | Assessment                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Advantages**                | Fits server→client 1.3 needs; HTTP-friendly; simpler ops than WS; aligns with ARCH-001 preference; Caddy-compatible |
| **Disadvantages**             | Unidirectional only; binary awkward; some proxies buffer streams poorly if misconfigured                            |
| **Operational complexity**    | Low–medium (connection count, idle timeouts, proxy buffering)                                                       |
| **Security**                  | Standard HTTP auth cookies/headers; CSRF considerations for cookie sessions                                         |
| **Scalability**               | Good for moderate fan-out; connection-bound on shared host                                                          |
| **Hosting**                   | Works on existing Next.js Route Handlers + Caddy; watch proxy buffering (`flush`, disable response buffering)       |
| **Shared-host compatibility** | Best of the three for coexistence — fewer protocol upgrades                                                         |
| **Future evolution**          | Harder to add WS later without client/API churn                                                                     |

### Option B — WebSockets only

**Summary:** Duplex WS as the sole platform realtime surface.

| Dimension                     | Assessment                                                                                         |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| **Advantages**                | Bidirectional ready; low latency frames; binary possible                                           |
| **Disadvantages**             | Overkill for 1.3 push-only; higher ops/security surface; sticky sessions / upgrade path complexity |
| **Operational complexity**    | Higher (upgrade, idle, ping/pong, load-balancer affinity)                                          |
| **Security**                  | Origin checks, auth on connect, topic authz, DoS via connection floods                             |
| **Scalability**               | Connection-heavy; worse shared-host pressure than SSE for same fan-out                             |
| **Hosting**                   | Needs explicit WS support at Caddy/nginx edge                                                      |
| **Shared-host compatibility** | Riskier on dense legacy host                                                                       |
| **Future evolution**          | Good for collab later; encourages premature duplex APIs now                                        |

### Option C — Transport Abstraction (preferred)

**Summary:** Platform-owned **Realtime Subscription Service** interface + contracts; **SSE is the only authorized Phase A adapter**. WebSocket adapter forbidden until Owner-approved amendment / programme.

| Dimension                     | Assessment                                                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Advantages**                | Preserves package boundaries; SSE for 1.3; future WS without Module rewrites; clear SoR separation from ADR-0071 delivery |
| **Disadvantages**             | Slightly more design surface than pure SSE; risk of over-abstraction if unbounded                                         |
| **Operational complexity**    | Phase A = SSE complexity; abstraction itself is design-time only until second adapter                                     |
| **Security**                  | Centralized subscribe authz in Platform Services                                                                          |
| **Scalability**               | Same as chosen adapter (SSE Phase A)                                                                                      |
| **Hosting**                   | Phase A identical to Option A                                                                                             |
| **Shared-host compatibility** | Same as SSE Phase A                                                                                                       |
| **Future evolution**          | Best — WS becomes a replaceable adapter, not a product rewrite                                                            |

---

## Decision

**APZHUB shall adopt Option C — a platform-owned Realtime Transport Abstraction — with Server-Sent Events (SSE) as the sole authorized concrete transport for Platform 1.3 / ENG-003.**

Normative rules:

1. **Abstraction:** Define a Realtime Subscription Service (name finalized in ENG-003 contracts / `service.yaml`) behind Platform Services. Presentation depends on published SDK/client contracts — never on a concrete browser transport type.
2. **Phase A transport:** **SSE only.** ENG-003 must not ship WebSocket product endpoints.
3. **Path:** Client → API Gateway → Auth → Authz → Realtime Subscription Service → Event Bus fan-in. Mutations remain REST → Platform Services → Connector → Engine.
4. **First consumer:** Support Workbench (P13-E03). Framework reusable for Observe Workbench push and (carefully) in-app attention streams without becoming Notification Delivery / Email SoR.
5. **ADR-0071 fence:** Notification **delivery providers** remain a separate decision. A WS/SSE **delivery channel** under Notifications is not a substitute for this Workbench subscription plane, and vice versa.
6. **Zammad CE only:** No EE-only realtime features; no browser→Zammad socket.
7. **Deny-by-default enablement:** Feature flag (name finalized in ENG-003, e.g. `APZHUB_REALTIME_SSE_ENABLED`) — unset/invalid = disabled.
8. **Capacity:** Shared-host connection limits and OPS coexistence checks are acceptance criteria for ENG-003.
9. **WebSocket future:** Requires Owner-accepted ADR amendment or successor programme; Integration SDK remains frozen.
10. **This ADR alone does not authorize engineering** — named **Platform-1.3-ENG-003** Owner Approval is required before code.

### Rejected

| Option                        | Why rejected as sole decision                                                     |
| ----------------------------- | --------------------------------------------------------------------------------- |
| **A alone**                   | Satisfies 1.3 but freezes clients to SSE without a service boundary for future WS |
| **B**                         | Bidirectional not required for approved 1.3 Must; higher shared-host risk         |
| **Status quo (poll forever)** | Rejected by Owner-approved P13-E03                                                |

---

## Consequences

### Positive

- Unblocks ENG-003 with clear SSE-first honesty.
- Prevents module socket sprawl and layer bypass.
- Separates Workbench subscription (this ADR) from Notification delivery (ADR-0071).
- Preserves Platform 1.2 freeze and Integration SDK 1.0.0.

### Negative / costs

- ENG-003 must implement flag, SSE routes, authz topic filters, client reconnect, tests, capacity docs, KL-05 update.
- Proxies must be configured not to buffer SSE indefinitely.
- Until stream enabled, Workbench may retain poll fallback (honest UX).

### Compliance

- After ADR Acceptance + ENG-003 Approval: implement under freeze change-control; update Support/Observability honesty docs as needed.
- PL12-KL-05 narrowed only after ENG-003 evidence.

---

## Security

- Zero Trust on subscribe and emit.
- Deny-by-default permissions; topic ACLs.
- No secrets in event payloads or logs.
- Rate-limit connection establishment; cap streams per user/tenant.
- CSRF: prefer SameSite session cookies + Gateway conventions; document token query-string ban for long-lived URLs.
- Origin allowlisting for any future WS adapter.

### Authentication

Better Auth / platform session as for REST Gateway. Stream handshake must establish authenticated `ServiceRequestContext` (tenant, user, correlation ID, permissions).

### Authorisation

Subscribe requires product-scoped permissions (e.g. Support read for request topics). Server filters events per principal; client-supplied topic lists are never trusted alone.

---

## Scalability Assessment

| Factor           | Guidance                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| Connection model | One SSE stream per Workbench session (or per product channel) preferred over many fine-grained sockets |
| Fan-out          | Event Bus → filtered subscriber; coalesce high-chatter topics                                          |
| Shared host      | Hard connection caps; OPS audit before production enable                                               |
| Horizontal scale | Sticky or bus-centric fan-out; do not require engine affinity                                          |
| Back-pressure    | Drop/coalesce; protect bus publishers                                                                  |

---

## Failure Handling

| Failure             | Behaviour                                                  |
| ------------------- | ---------------------------------------------------------- |
| Authn/authz failure | Close stream; no data                                      |
| Bus down            | Health degraded; client falls back to REST refetch         |
| Slow client         | Apply back-pressure policy; disconnect abusive connections |
| Partial event loss  | At-least-once; UI idempotent; snapshot reconcile via REST  |
| Flag disabled       | Capability disabled; honest Workbench banner               |

---

## Transport Lifecycle

1. **Connect** — authenticated SSE open; subscribe to authorized topics.
2. **Ready** — optional snapshot hint / cursor.
3. **Push** — domain events projected to wire format (no backend engine leakage).
4. **Heartbeat** — keep-alive comments/frames.
5. **Resume** — reconnect with cursor/last-event-id when supported.
6. **Disconnect** — client navigation, idle timeout, auth revoke, or server drain.
7. **Disable** — config flag off terminates new connects.

---

## Integration Points

| Interface (conceptual; ENG-003 finalizes names)       | Responsibility                                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `RealtimeSubscriptionService.subscribe`               | Authz + topic bind + stream lifecycle                                                |
| `RealtimeSubscriptionService.getHealth` / diagnostics | Connection counts, bus dependency, flag state                                        |
| Wire events                                           | Projection of `support.*` / `observe.alert.*` envelopes — not raw connector payloads |
| Workbench client                                      | SDK-facing subscribe API; transport detail hidden                                    |
| Feature flag                                          | Deny-by-default enablement                                                           |

Additive HTTP under Gateway only (illustrative): `/api/v1/realtime/stream` and/or `/api/v1/support/events/stream` — final paths in ENG-003 OpenAPI.

---

## Operational Considerations

- Document proxy buffering disable for SSE paths (Caddy/nginx).
- Connection and event metrics (low cardinality).
- Runbooks: enable flag, drain connections, diagnose bus lag.
- Coexistence: non-conflicting ports with `apz-stack` retained.
- Do not overclaim GA realtime if flag off or capacity unmet.

---

## Future Engineering

### Platform-1.3-ENG-003 (only after this ADR Accepted + ENG Approval)

1. Contracts / `service.yaml` for Realtime Subscription Service.
2. Deny-by-default flag + health/diagnostics.
3. SSE adapter + Gateway routes + OpenAPI.
4. Support Workbench subscribe (inbox/detail); REST snapshot reconcile.
5. Authz topic filters; tenant isolation tests.
6. Capacity/ops docs; PL12-KL-05 update.
7. Optional Observe subscribe — only if ENG-003 Acceptance includes it.

### Explicitly not in ENG-003 without new Approval

WebSocket product transport · Notification delivery providers (ADR-0071) · Email SoR · FIN-001 · Workflow Execute · Integration SDK thaw · collaborative duplex UX.

### Successor (Owner-gated)

WebSocket adapter behind the same abstraction; richer resume stores; multi-region fan-out.

---

## Risks

| Risk                              | Mitigation                          |
| --------------------------------- | ----------------------------------- |
| Module-owned sockets              | Architecture tests; SDK-only client |
| Conflate with ADR-0071 delivery   | Explicit fence in Decision          |
| Shared-host connection exhaustion | Caps + deny-by-default + OPS audit  |
| Proxy buffering breaks SSE        | Ops checklist; integration tests    |
| Silent “healthy” when bus unknown | Health rules in Q9                  |
| Scope into Zammad EE realtime     | CE-only; connector-internal only    |

---

## Acceptance Criteria (for this ADR document)

- [x] Context, problem, business drivers, alternatives, decision, consequences documented
- [x] Architectural questions 1–10 answered
- [x] Options A/B/C evaluated across required dimensions
- [x] Security, authn, authz, tenant isolation, scalability, failure, lifecycle, integration, operations specified
- [x] Boundaries with Runtime, Workbench, Identity, Administration, Observe, Notifications, Support, Platform Services, Event Bus, Search defined
- [x] No new architectural layers
- [x] No implementation under Platform-1.3-ADR-0072
- [x] Future engineering (ENG-003) clearly gated

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

- [Index stub](../../adr/ADR-0072-platform-realtime-transport.md)
- [ADR-0070 Observe Live Alerts](./ADR-0070-Observe-Live-Alert-Evaluation-and-Delivery.md)
- [ADR-0071 Notification Delivery (Proposed)](../../adr/ADR-0071-notification-delivery-provider-framework.md)
- [Platform 1.3 EPICS](../../strategy/platform-1.3/EPICS.md)
- [ARCH-001 EPIC-ASSESSMENT](../platform-1.3-confirmation/EPIC-ASSESSMENT.md)
- [Support HTTP API](../APZHUB-Support-HTTP-API.md)
- [ENVIRONMENT.md](../../../ENVIRONMENT.md) host coexistence
