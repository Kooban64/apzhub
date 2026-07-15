# Zammad Operations, Diagnostics & Certification

**Milestone:** OSS-102-07 (ops) · **Wave 2 certified:** OSS-102-08  
**Package:** `@apzhub/integration-zammad` v0.6.0 — Wave 2 **CERTIFIED_WITH_LIMITATIONS**  
**Scope:** Operational quality only — no new end-user business capabilities; no PlatformService / HTTP / UI

---

## Purpose

Certify `@apzhub/integration-zammad` as a production-quality adapter that complies with the [Reference Adapter Standard](../../docs/architecture/REFERENCE-ADAPTER-STANDARD.md). Provides capability self-assessment, compatibility reporting, readiness checks, health classification, feature detection, and structured operational reports for future administration tooling.

Architecture remains frozen to the Plane Reference Adapter patterns.

---

## Public API

| API                                           | Description                                                     |
| --------------------------------------------- | --------------------------------------------------------------- |
| `adapter.operations.certifyCapabilities()`    | Capability self-assessment matrix (includes attachments placeholder) |
| `adapter.operations.getCompatibilityMatrix()` | Version / edition / unsupported feature report                  |
| `adapter.detectFeatures(ctx)`                 | Optional endpoint probes (never fail startup for optional gaps) |
| `adapter.evaluateReadiness(ctx)`              | Structured readiness validation                                 |
| `adapter.operations.classifyHealth()`         | `HEALTHY` / `DEGRADED` / `LIMITED` / `UNAVAILABLE`              |
| `adapter.buildOperationalReport(ctx)`         | Aggregated report for ops tooling                               |
| `adapter.getRuntimeDiagnosticsSnapshot()`     | Safe runtime diagnostics (no secrets)                           |

---

## Certification decision rules

| Outcome                        | When                                                                 |
| ------------------------------ | -------------------------------------------------------------------- |
| `CERTIFIED`                    | Required capabilities available; compatible; ready; healthy; compliant |
| `CERTIFIED_WITH_LIMITATIONS`   | Ready with optional gaps, unverified version, documented deviations, or DEGRADED health |
| `NOT_CERTIFIED`                | Required capability missing; readiness blocked; health `LIMITED` or `UNAVAILABLE` |
| `INCOMPATIBLE`                 | Blocking version incompatibility or failed mandatory Reference Adapter checks |

Optional capability gaps (webhooks, search, history, analytics) produce limitations — not automatic failure.

---

## Capability certification

Every capability reports: implemented / registered / available / enabled / status / supported & unsupported operations / optional / degraded / dependencies / version range / edition / configuration requirements / known limitations / test evidence.

| Capability | Required | Notes |
| --- | --- | --- |
| support, organizations, groups, users | Yes | Core Support |
| articles | Yes | Attachment **metadata** only |
| events | Yes | Translation only — no Platform Event Bus |
| synchronisation | Yes | In-memory — no persistence / workers |
| search, history, analytics | Optional | Read-only |
| webhooks | Optional | Registration only — no HTTP ingress |
| attachments | Placeholder | Binary transfer **not** certified |

---

## Compatibility matrix

| Field | Governed value |
| --- | --- |
| Minimum supported | Zammad **6.3.0** |
| Verified family | **6.3.0 – 6.5.x** |
| Edition | Community Edition first |
| Older than minimum | `incompatible` (blocking) |
| Newer than verified max | `unverified` (warning, not blocking) |
| Optional feature gaps | Warnings only — never fail startup alone |

Do not expand the supported range without test evidence and documentation.

---

## Health model

| Level | Meaning |
| --- | --- |
| `HEALTHY` | Required capabilities available; provider reachable; auth valid |
| `DEGRADED` | Optional gaps, unverified/warning version, or degraded optional services — still usable |
| `LIMITED` | Required capability unavailable or sync unhealthy — restricted safe use |
| `UNAVAILABLE` | Auth invalid, provider down, circuit open, invalid config, or blocking version incompatibility |

Optional webhook or analytics limitations must **not** mark the entire adapter unavailable.

---

## Readiness model

| Check | Required |
| --- | --- |
| configuration | Yes |
| authentication | Yes |
| connectivity | Yes |
| version_compatibility | Yes (blocking incompatibilities fail) |
| capability_registration | Yes |
| core_support_readiness | Yes |
| article_service_readiness | Yes |
| sync_configuration | Yes |
| webhook_configuration | **No** (warnings only) |
| diagnostics_availability | Yes |
| logger_availability | Yes |
| metrics_availability | **No** |

Each check includes status, reason, safe diagnostic metadata, and remediation hint. No credentials, tokens, PII, or ticket content.

---

## Feature detection

Safe, non-destructive probes for optional endpoints:

- `GET /api/v1/webhooks`
- History via list tickets (page size 1) + history for first ticket (or assumed if empty)
- `GET /api/v1/tickets/search` with minimal query

Never creates production records; never fails startup for optional gaps. Where detection is unreliable, report assumed/unverified rather than falsely certified.

---

## Diagnostics (secret-free)

Includes: adapter/SDK versions, provider version, supported range, edition, auth/connection modes, capability counts, health, readiness summary, circuit breaker, latency summary, recent failure codes (not payloads), sync/webhook/event readiness flags, and explicit `false` for persistent sync / webhook ingress / binary attachments.

**Never include:** API tokens, OAuth secrets, authorization headers, cookies, webhook secrets, article bodies, ticket titles/descriptions, emails, attachment filenames, or raw provider responses.

---

## Operational reports

`buildOperationalReport(ctx)` returns a serialisable aggregate:

- certification outcome
- health, capabilities, compatibility, readiness, diagnostics
- feature detection
- configuration validation
- known limitations register
- Reference Adapter compliance result
- reference patterns for future adapters

Adapter-side only — no platform administration services, routes, or UI.

---

## Synchronisation / webhook / event certification

| Area | Certified as |
| --- | --- |
| Sync | Full + incremental; resume tokens; safe restart; entities: support requests, orgs, groups, users; **in-memory only**; article sync **not** implemented |
| Webhooks | list/create/update/delete/validate; secrets never in diagnostics; **ingress not implemented** |
| Events | Canonical translation for support request/article/org/group/user/assignment/priority/state/attachment metadata; unknown events safe; **no Event Bus** |

---

## Article / search / history / analytics certification

| Area | Notes |
| --- | --- |
| Articles | list/get; internal notes; customer replies; channels; visibility; attachment metadata; **no** update/delete/binary transfer |
| Search | Support-domain kinds; read-only; no semantic/cross-engine search |
| History | Read-only chronological; unknown events preserved |
| Analytics | Inventory-derived; heuristic overdue; SLA metrics not authoritative |

Internal notes are certified never to become customer-visible (payload + post-create visibility checks).

---

## Reference Adapter compliance

Structured assessment covers package structure, factory, lifecycle, operation runner, REST boundaries, internal API types, canonical DTOs, capabilities, diagnostics, metrics, logging, error translation, mocks, tests, docs, versioning, and forbidden dependencies.

Documented deviations (limitations, not failures): persistent sync deferred; webhook ingress / Event Bus deferred; binary attachments deferred.

---

## Explicit exclusions

No Platform `SupportServiceImpl`, mapping, gateway, HTTP, UI, binary attachments, webhook ingress, Platform Event Bus, workers, schedulers, persistent sync, OAuth, SLA engine, or SDK redesign.

---

## SDK harness wrappers (OSS-100-09)

Thin wrappers in `src/harness/zammad-harness.ts` adopt `@apzhub/integration-sdk/harness` without changing operations APIs:

| Export | Role |
| ------ | ---- |
| `getZammadHarnessMetadata` | Declared certification subject for SDK engine |
| `createZammadAdapterHarness` | SDK `AdapterHarness` with Zammad fixtures |
| `certifyZammadWithSdkHarness` | Runs SDK `certifyAdapter` **plus** existing `certifyZammadCapabilities` / compatibility |

See [ADAPTER-HARNESS.md](../../packages/integration-sdk/docs/ADAPTER-HARNESS.md) · [ADR-0057](../../docs/adr/ADR-0057-sdk-harness-vs-adapter-operations-certification.md).

---

## Next milestone

**Await owner approval** before SDK v1.0, provisioning (deferred), Event Bus/ingress, or next business-domain integration. Historical “OSS-102-08” closeout already complete.

---

## Related

- [ZAMMAD-ADAPTER.md](./ZAMMAD-ADAPTER.md)
- [REFERENCE-ADAPTER-STANDARD.md](../../docs/architecture/REFERENCE-ADAPTER-STANDARD.md)
- [OSS-102-07 Completion Report](../../docs/sprint/OSS-102-07-completion-report.md)
- [OSS-100-09 Completion Report](../../docs/sprint/OSS-100-09-completion-report.md)
- [PLANE-OPERATIONS.md](../plane/docs/PLANE-OPERATIONS.md) (pattern source)
