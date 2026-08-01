# Slice Catalogue — APZQEP-120

Executable engineering slices. Future instruction: _Implement APZQEP-120-SNN exactly as specified._

**Baseline HEAD at planning:** `4ff22aac` · **Package baseline:** Evidence 1.0.0 · TE 1.0.1

**Priority key:** P0 critical path · P1 required for 120 · P2 enabling · P3 programme close

**Release boundary key:** R0 security hotfix-style · R1 internal/prerelease · R2 LA evidence hard · R3 LA platform core · R4 120 programme cert

---

## Catalogue index

| ID  | Title                                        | WS  | Pri | Seq | Rel | Size | Effort (eng-days) |
| --- | -------------------------------------------- | --- | --- | --- | --- | ---- | ----------------- |
| S01 | Evidence list/search ACL (L-EM-01)           | B   | P0  | 1   | R0  | M    | 3–5               |
| S02 | Evidence Query Service & Permission Engine   | B   | P0  | 2   | R0  | M    | 3–5               |
| S03 | Evidence Storage Platform (+ Local provider) | A   | P0  | 3   | R2  | L    | 8–12              |
| S04 | Evidence PostgreSQL metadata SoR             | A   | P0  | 4*  | R2  | L    | 8–12              |
| S05 | Server-side content hashing & integrity      | A   | P0  | 5   | R2  | M    | 4–6               |
| S06 | Evidence audit durability & retention hooks  | A/J | P0  | 6   | R2  | M    | 4–6               |
| S07 | QEP domain event catalogue & publish         | D   | P0  | 7   | R1  | M    | 5–7               |
| S08 | TE outbox drain worker (L-03)                | C/G | P0  | 8   | R1  | L    | 7–10              |
| S09 | Worker retries, DLQ, idempotency, fairness   | G   | P0  | 9   | R1  | M    | 5–7               |
| S10 | Event failure evidence & reconciliation      | D/G | P1  | 10  | R1  | M    | 4–6               |
| S11 | Search providers: Spec/Plan/Exec/Evidence    | E   | P1  | 11  | R3  | L    | 7–10              |
| S12 | Search ACL + tenant filter + reindex jobs    | E   | P1  | 12  | R3  | M    | 5–7               |
| S13 | QEP notification foundation (ENF)            | F   | P1  | 13  | R3  | M    | 5–7               |
| S14 | UCP/command registration (QEP actions)       | E   | P2  | 14  | R3  | S    | 2–3               |
| S15 | TE OpenAPI contract (L-01)                   | C   | P1  | 15  | R1  | M    | 4–6               |
| S16 | Live Playwright runner (flagged, L-OP-01)    | C   | P1  | 16  | R3  | L    | 8–12              |
| S17 | QEP observability probes & runbooks          | H   | P1  | 17  | R3  | M    | 4–6               |
| S18 | Performance baselines & QI skeleton          | I   | P2  | 18  | R3  | M    | 4–6               |
| S19 | Security verification suite (tenant/upload)  | J   | P0  | 19  | R4  | M    | 5–7               |
| S20 | APZQEP-120 programme certification gate      | —   | P3  | 20  | R4  | M    | 3–5               |

\* S04 (PG metadata) and later cloud providers still depend on Owner **D-001** where production cloud backends are chosen. **S03** is the **Evidence Storage Platform** (abstraction + Manager + Local reference provider) per [ADR-0094](../../../../adr/ADR-0094-evidence-storage-provider-first.md) — not “local storage as the product,” and not direct S3.

---

# APZQEP-120-S01 — Evidence list/search ACL (L-EM-01)

### Identification

| Field            | Value                     |
| ---------------- | ------------------------- |
| ID               | APZQEP-120-S01            |
| Title            | Evidence list/search ACL  |
| Workstream       | B                         |
| Priority         | P0                        |
| Sequence         | 1                         |
| Release boundary | R0                        |
| Implementation   | **COMPLETE** (2026-08-01) |

### Objective

Close **L-EM-01**: list and search endpoints must not return evidence outside the caller’s ACL/tenant scope.

### Current state

**After S01:** Secured list/search apply getEvidence-equivalent ACL, tenant defence-in-depth, sort, and post-ACL pagination. L-EM-01 **CLOSED**.  
_(Pre-S01: per-item get/download ACL only; list/search tenant+permission scoped.)_

### Scope

- Enforce tenant + ACL filter on list/search query paths in `qep-evidence`.
- Fail closed when principal lacks scope.
- Add tenant-isolation + denied-access tests.
- Update Evidence CERT limitations / changelog notes.

### Explicit exclusions

- Durable storage; TE EvidenceAccessPort wiring (deferred post-S02); events; search index ACL (S12).

### Dependencies

- None technical beyond existing Evidence package.
- Owner: none.

### Architecture

- Components: Evidence application services, list/search handlers, access-policy.
- APIs: existing list/search — **compatible** response shape; fewer rows for unauthorized callers (security-correct narrowing).
- Data: no schema change.
- Security: default-deny list visibility.

### Acceptance criteria

1. Caller without `evidence:read` on item X never sees X in list or search.
2. Cross-tenant principal receives empty/deny — never other-tenant rows.
3. Existing per-item ACL tests still pass.
4. Limitation L-EM-01 marked **CLOSED** in Evidence CERT docs with test refs.
5. Package remains buildable; LA posture unchanged except security fix.

### Test requirements

Unit (policy filter) · Integration (list/search) · Security (cross-tenant) · Denied-access audit if already emitted · No E2E mandatory if API integration covers.

### Evidence requirements

Test log excerpts · before/after CERT limitation note · PR checklist.

### Documentation

Evidence CERT / limitations · this slice close-out note under ops evidence when implemented.

### Certification gate

PASS iff all AC + security tests green and L-EM-01 closed in docs.

### Rollback

Revert commit; behavior returns to prior (less secure) list — treat as emergency only after Board note.

### Complexity / effort

**M** · 3–5 eng-days — focused ACL fix, high security sensitivity.

### Releasability

**Independently releasable** as security patch within LA (patch version bump when Owner authorises release).

---

# APZQEP-120-S02 — Evidence Query Service & Permission Engine

### Identification

| Field            | Value                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------- |
| ID               | APZQEP-120-S02                                                                         |
| Title            | Evidence Query Service & Permission Engine                                             |
| Reference        | L-EM-02 (capability id — not a prior CERT residual)                                    |
| Workstream       | B                                                                                      |
| Priority         | P0                                                                                     |
| Sequence         | 2                                                                                      |
| Release boundary | R0                                                                                     |
| Implementation   | **COMPLETE** (2026-08-01)                                                              |
| Product Board    | **CERTIFIED** (2026-08-01) — Architecture/Service/ACL/Tenant/Docs **PASS** · **10/10** |
| Process          | APZHUB-ENG-001 / ADR-0092                                                              |

> **Owner supersession:** This slice was redefined by Owner instruction to deliver the permission-aware Evidence enumeration pipeline. TE EvidenceAccessPort wiring remains **deferred** (execution workstream — do not pull forward).

### Objective

Single authoritative permission-aware Evidence enumeration path (list/search) for APZQEP: Permission Engine + Query Builder + Enumeration Service. Controllers must not construct ACL filters.

### Current state

**After S02:** `EvidencePermissionEngine`, `EvidenceQueryBuilder`, and `EvidenceEnumerationService` orchestrate list/search; secured facade delegates; S01 ACL semantics preserved (no second authz framework). Memory metadata SoR unchanged (PG metadata → S04; SQL ACL push-down after durable metadata).

### Scope

- Permission Engine (delegates to existing AccessPolicy / SecurityGate)
- Query Builder (validate/merge filters, sort, pagination, text)
- Enumeration Service (authorize → candidates → ACL → sort → page)
- Factory wiring; API compatibility retained
- Tests + docs + evidence

### Explicit exclusions

Uploads · downloads · deletion · durable storage · TE EvidenceAccessPort wiring · Suites/Runs/Defects · QI · AI · workers

### Dependencies

- **S01** COMPLETE (L-EM-01)
- Package: `qep-evidence`

### Architecture

```text
Handler → Platform Service → Secured Query Facade
  → EvidenceEnumerationService
    → PermissionEngine → AccessPolicy/Gate
    → QueryBuilder
    → EvidenceRepository (via inner query)
```

### Acceptance criteria

1. Enumeration Service is the secured list/search path
2. Permission Engine + Query Builder exist and are reused
3. ACL/tenant isolation preserved (S01 regression green)
4. Invalid queries rejected + audited
5. No breaking API change for v1.0 clients

### Complexity / effort

**M** · 3–5 eng-days.

### Releasability

Independently releasable with S01; LA security/structure hardening.

---

# APZQEP-120-S03 — Evidence Storage Platform

### Identification

| Field            | Value                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| ID               | APZQEP-120-S03                                                                                        |
| Title            | Evidence Storage Platform (Storage Provider Abstraction + Local Provider)                             |
| Workstream       | A                                                                                                     |
| Priority         | P0                                                                                                    |
| Sequence         | 3                                                                                                     |
| Release boundary | R2                                                                                                    |
| Status           | **COMPLETE** (2026-08-01)                                                                             |
| Guidance         | [ADR-0094](../../../../adr/ADR-0094-evidence-storage-provider-first.md)                               |
| Notes            | [S03-ENGINEERING-NOTES.md](./S03-ENGINEERING-NOTES.md) · [STORAGE-PLATFORM.md](./STORAGE-PLATFORM.md) |

### Objective

Design and implement the platform-neutral **Evidence Storage Platform**. Primary outcome is a stable abstraction isolating APZQEP from physical storage. **Local Provider** is the reference implementation only.

### Current state (post-S03)

Storage Platform + Manager + Provider contract + Local + Memory providers implemented. Application consumes `StoragePort` via Manager only. Default runtime provider remains `memory`; Local via env/config.

### Scope

- Storage Provider Interface · Storage Manager · Local Provider · configuration / resolution
- File metadata (content-side) · stream/upload/download/exists/delete · health
- Provider registration/discovery · validation · error translation · audit hooks
- Unit/integration/negative tests · docs · evidence · certification

### Explicit exclusions

- Direct S3 / Azure / GCS / MinIO SDK integration
- Encryption at rest · virus scanning · retention · versioning · lifecycle productisation
- PostgreSQL metadata SoR (S04) · TE EvidenceAccessPort wiring · AI / dashboard

### Dependencies

- S01–S02 COMPLETE
- ADR-0088 · ADR-0094
- Local path/config for LA when provider=`local`

### Architecture

```text
EvidenceService / Application
  → StoragePort
      → EvidenceStorageManager
          → EvidenceStorageProvider
              → LocalStorageProvider (reference)
              → MemoryProvider (default/tests)
              → S3 | Azure | GCS | MinIO | NAS | vault (later)
```

### Acceptance criteria

1. Storage abstraction, Manager, and Provider interface exist
2. Local Provider implemented as reference only
3. No application component accesses filesystem directly
4. Metadata remains logical (opaque locators)
5. Security validation + documentation + certification PASS

### Complexity / effort

**L** · 8–12 eng-days.

### Releasability

Config-selected provider; R2 content path.

---

# APZQEP-120-S04 — Evidence PostgreSQL metadata SoR

### Identification

| Field            | Value                                         |
| ---------------- | --------------------------------------------- |
| ID               | APZQEP-120-S04                                |
| Title            | Evidence PostgreSQL metadata system of record |
| Workstream       | A                                             |
| Priority         | P0                                            |
| Sequence         | 4                                             |
| Release boundary | R2                                            |

### Objective

Replace memory-only Evidence **metadata** with tenant-scoped PostgreSQL SoR (additive migration). Content bytes remain behind Storage Provider (ADR-0088 / ADR-0094 / S03 Local).

### Current state

Memory repository in production factory; no Evidence metadata tables in platform schema.

### Scope

- Additive migration: evidence metadata tables (ids, tenant, project refs, classification, links, versions, hash refs, lifecycle, audit fields per 011).
- Repository adapter implementing existing ports.
- Factory switch: memory → PG (config/env).
- Migration tests + dual-read validation optional during cutover.

### Explicit exclusions

- Cloud object-store providers (later); server hash productisation (S05); bus (S07).
- Content provider work already covered by S03.

### Dependencies

- Platform PostgreSQL.
- S01–S03 preferred (enumeration + Local content path).
- D-001 only where cloud content backends are later selected — not required for PG metadata itself.

### Architecture

- Platform DB owns metadata only; blobs never in PG as SoR.
- RLS/tenant columns mandatory.
- Additive migration; no destructive drop.

### Acceptance criteria

1. Evidence create/get/list survives process restart.
2. Tenant RLS/isolation proven.
3. Memory mode remains for tests if needed.
4. Migration rollback script documented (down migration additive-safe).
5. No v1.0 API break for existing clients.

### Tests

Unit repo · Integration PG · Migration up/down · Tenant isolation · Compatibility API.

### Data/migration

See [DATA-AND-MIGRATION-PLAN.md](./DATA-AND-MIGRATION-PLAN.md) (metadata SoR section; renumbered from former S03).

### Complexity / effort

**L** · 8–12 eng-days.

### Releasability

Feature-flagged cutover; internal prerelease then R2.

---

# APZQEP-120-S05 — Server-side content hashing & integrity

### Identification

| Field            | Value                                     |
| ---------------- | ----------------------------------------- |
| ID               | APZQEP-120-S05                            |
| Title            | Server-side content hashing and integrity |
| Workstream       | A                                         |
| Priority         | P0                                        |
| Sequence         | 5                                         |
| Release boundary | R2                                        |

### Objective

Server computes and verifies content hash; reject client-only trust for integrity.

### Current state

Client-supplied hash accepted (integrity gap).

### Scope

- Hash on upload (SHA-256 or platform standard).
- Store canonical hash on metadata; verify on retrieve/export.
- Mismatch → typed integrity error + audit.

### Explicit exclusions

- Encryption-at-rest provider config (infra); legal hold product.

### Dependencies

S03–S04.

### Acceptance criteria

1. Upload without client hash still stores server hash.
2. Tampered blob detected on retrieve.
3. Client-supplied wrong hash rejected or overridden per documented policy (prefer server authoritative).

### Tests

Unit hash · Integration tamper · Audit event present.

### Complexity / effort

**M** · 4–6 eng-days.

### Releasability

With R2.

---

# APZQEP-120-S06 — Evidence audit durability & retention hooks

### Identification

| Field            | Value                                         |
| ---------------- | --------------------------------------------- |
| ID               | APZQEP-120-S06                                |
| Title            | Evidence audit durability and retention hooks |
| Workstream       | A/J                                           |
| Priority         | P0                                            |
| Sequence         | 6                                             |
| Release boundary | R2                                            |

### Objective

Durable audit trail for Evidence mutations; retention/deletion restriction hooks per D-002.

### Current state

Audit patterns partial; not durable SoR-aligned.

### Scope

- Persist audit records (platform audit service or Evidence audit table per 011).
- Deletion restricted when retention/legal hold flag set.
- Completeness checks for required metadata fields.
- Export of metadata+hash manifest (not full BI).

### Explicit exclusions

- Full compliance product; eDiscovery UI.

### Dependencies

S03; **D-002** retention periods.

### Acceptance criteria

1. Create/update/delete attempts produce durable audit rows.
2. Restricted delete denied + audited.
3. Completeness validator blocks incomplete classify where required.

### Tests

Integration audit · Retention deny · Migration if new tables.

### Complexity / effort

**M** · 4–6 eng-days.

### Releasability

R2.

---

# APZQEP-120-S07 — QEP domain event catalogue & publish

### Identification

| Field            | Value                                      |
| ---------------- | ------------------------------------------ |
| ID               | APZQEP-120-S07                             |
| Title            | QEP domain event catalogue and publication |
| Workstream       | D                                          |
| Priority         | P0                                         |
| Sequence         | 7                                          |
| Release boundary | R1                                         |

### Objective

Promote `events/qep/*.yaml` to validated manifests; Platform Services publish via existing bus (029).

### Current state

Stub YAMLs; no QEP→bus publish.

### Scope

- Finalise event.yaml for TE + Evidence lifecycle (past-tense names).
- Envelope: correlation, causation, tenant, user, audit context.
- Publish from services (not modules).
- Idempotency keys; schema validation.
- Contract tests.

### Explicit exclusions

- New bus; webhook product (document extension); Suites events (130).

### Dependencies

Platform event bus; S01 optional.

### Acceptance criteria

1. At least evidence.created / execution.* key events publish with valid envelope.
2. Duplicate publish idempotent at bus/outbox layer.
3. No module direct notify/search.
4. Manifest registry discovers events.

### Tests

Contract · Unit publisher · Integration bus (test double OK).

### Complexity / effort

**M** · 5–7 eng-days.

### Releasability

Internal/prerelease R1; consumers may be none yet.

---

# APZQEP-120-S08 — TE outbox drain worker (L-03)

### Identification

| Field            | Value                  |
| ---------------- | ---------------------- |
| ID               | APZQEP-120-S08         |
| Title            | TE outbox drain worker |
| Workstream       | C/G                    |
| Priority         | P0                     |
| Sequence         | 8                      |
| Release boundary | R1                     |

### Objective

Close **L-03**: drain TE outbox with platform worker pattern; progress executions async.

### Current state

Enqueue-only; no dispatcher.

### Scope

- Worker process/script aligned to `platform-outbox` / existing worker scripts.
- Claim → process → complete/fail lifecycle.
- Graceful shutdown; deployment-safe locking.
- Ops diagnostics (queue depth metric hooks).

### Explicit exclusions

- Live Playwright (S16); full DLQ polish (S09); Suites.

### Dependencies

S07 preferred for event fan-out; platform Redis/PG as today.

### Acceptance criteria

1. Enqueued job reaches terminal execution state without manual DB edit.
2. Crash mid-job → recoverable (at-least-once + idempotent handler).
3. L-03 closed in TE CERT.
4. Concurrent workers do not double-apply same job (lease/lock).

### Tests

Integration worker · Failure/retry · Concurrency · Idempotency.

### Complexity / effort

**L** · 7–10 eng-days.

### Releasability

R1 internal then LA with TE patch when certified.

---

# APZQEP-120-S09 — Worker retries, DLQ, idempotency, fairness

### Identification

| Field            | Value                                             |
| ---------------- | ------------------------------------------------- |
| ID               | APZQEP-120-S09                                    |
| Title            | Worker retries, DLQ, idempotency, tenant fairness |
| Workstream       | G                                                 |
| Priority         | P0                                                |
| Sequence         | 9                                                 |
| Release boundary | R1                                                |

### Objective

Operational hardening of S08: backoff, DLQ, visibility, cancellation, tenant fairness hooks.

### Scope

- Retry/backoff policy; DLQ table/state; cancel API/job flag if missing.
- Job visibility queries for ops.
- Tenant fairness (simple fair scheduling or documented round-robin) per D-005.
- Failure evidence linkage to Evidence when available.

### Explicit exclusions

- Multi-region queue; Kafka replacement.

### Dependencies

S08; D-005 optional for fairness targets.

### Acceptance criteria

1. Poison message reaches DLQ after N retries.
2. Cancelled job does not resume work.
3. Ops can list failed/DLQ jobs.
4. Documented idempotency key behaviour.

### Tests

Retry storm · DLQ · Cancel · Fairness unit if implemented.

### Complexity / effort

**M** · 5–7 eng-days.

### Releasability

R1 with S08.

---

# APZQEP-120-S10 — Event failure evidence & reconciliation

### Identification

| Field            | Value                                     |
| ---------------- | ----------------------------------------- |
| ID               | APZQEP-120-S10                            |
| Title            | Event failure evidence and reconciliation |
| Workstream       | D/G                                       |
| Priority         | P1                                        |
| Sequence         | 10                                        |
| Release boundary | R1                                        |

### Objective

Failed publishes/jobs produce recoverable evidence; reconciliation for orphan blobs/outbox drift.

### Scope

- Failure evidence records (platform pattern).
- Reconciliation job: metadata vs storage; outbox stuck detection.
- Replay path for failed events (idempotent).

### Explicit exclusions

- Full SIEM; auto-healing without audit.

### Dependencies

S04, S07–S09.

### Acceptance criteria

1. Simulated publish failure → durable failure record + retryable.
2. Orphan blob report generated (dry-run).
3. Replay does not duplicate side effects.

### Tests

Failure-path · Reconciliation dry-run · Replay idempotency.

### Complexity / effort

**M** · 4–6 eng-days.

### Releasability

R1/R2.

---

# APZQEP-120-S11 — Search providers Spec/Plan/Exec/Evidence

### Identification

| Field            | Value                                                |
| ---------------- | ---------------------------------------------------- |
| ID               | APZQEP-120-S11                                       |
| Title            | Search providers for Spec, Plan, Execution, Evidence |
| Workstream       | E                                                    |
| Priority         | P1                                                   |
| Sequence         | 11                                                   |
| Release boundary | R3                                                   |

### Objective

Extend `search-qep` beyond 5 types; index Spec/Plan/Execution/Evidence as **derived** index.

### Current state

`search-qep` 0.1.0: limited entity types.

### Scope

- Register providers; indexing from S07 events.
- Query model: filter/sort/page; exact + partial.
- No SoR claims.

### Explicit exclusions

- Semantic/AI search (150); full UCP UX (S14 registers only).

### Dependencies

S07; S03 for Evidence index fields.

### Acceptance criteria

1. Each new type returns permission-safe results in unit/integration.
2. Index update follows create/update/delete events (or documented eventual consistency window).
3. Provider health reported.

### Tests

Provider unit · Indexing integration · Stale index detection unit.

### Complexity / effort

**L** · 7–10 eng-days.

### Releasability

R3; feature-flagged if UI not ready.

---

# APZQEP-120-S12 — Search ACL, tenant filter, reindex

### Identification

| Field            | Value                                      |
| ---------------- | ------------------------------------------ |
| ID               | APZQEP-120-S12                             |
| Title            | Search ACL, tenant filtering, reindex jobs |
| Workstream       | E                                          |
| Priority         | P1                                         |
| Sequence         | 12                                         |
| Release boundary | R3                                         |

### Objective

Query-time ACL + tenant filter; reindex/recovery jobs; audit of admin reindex.

### Dependencies

S01, S11.

### Acceptance criteria

1. Cross-tenant search leakage tests fail the build if regression.
2. Reindex job idempotent; progress visible.
3. Denied results never include titles of forbidden entities (or empty).

### Tests

Security tenant · Reindex · Failure recovery.

### Complexity / effort

**M** · 5–7 eng-days.

### Releasability

R3 with S11.

---

# APZQEP-120-S13 — QEP notification foundation (ENF)

### Identification

| Field            | Value                               |
| ---------------- | ----------------------------------- |
| ID               | APZQEP-120-S13                      |
| Title            | QEP notification foundation via ENF |
| Workstream       | F                                   |
| Priority         | P1                                  |
| Sequence         | 13                                  |
| Release boundary | R3                                  |

### Objective

Map selected QEP events → ENF notifications (in-app); read/unread; duplicate prevention; mandatory types.

### Current state

ENF exists; QEP unwired.

### Scope

- Event→notification mapping for execution completed/failed, evidence access denied (optional), retention warnings stub.
- In-app centre consumption via platform APIs.
- Email **integration point** only unless D-004 says otherwise.
- Prefs: subscribe/unsubscribe non-mandatory.

### Explicit exclusions

- Push/mobile; full digest product; advanced branding.

### Dependencies

S07; ENF; D-004 channels.

### Acceptance criteria

1. Execution failed → in-app notification for assignee/owner principal.
2. Duplicate event → single notification (idempotent).
3. Mandatory notification cannot be fully suppressed.
4. Tenant-scoped delivery.

### Tests

Mapping unit · Delivery integration · Duplicate · Privacy (no cross-tenant).

### Complexity / effort

**M** · 5–7 eng-days.

### Releasability

R3; flag if email not ready.

---

# APZQEP-120-S14 — UCP/command registration (QEP actions)

### Identification

| Field            | Value                                    |
| ---------------- | ---------------------------------------- |
| ID               | APZQEP-120-S14                           |
| Title            | UCP/command registration for QEP actions |
| Workstream       | E                                        |
| Priority         | P2                                       |
| Sequence         | 14                                       |
| Release boundary | R3                                       |

### Objective

Register permission-filtered QEP commands (open evidence, open execution) — not full palette redesign.

### Scope

- Manifest/command registration; permission filter; deep link targets existing routes.
- AI-ready metadata stubs only.

### Explicit exclusions

- New shell; AI execution (150); executive commands (140).

### Dependencies

S01 permissions; existing UCP framework.

### Acceptance criteria

1. Unauthorised command hidden/denied.
2. Authorised command navigates/invokes Platform Service path only.
3. No hardcoded module list in shell beyond registry pattern.

### Tests

Permission filter unit · Smoke registration.

### Complexity / effort

**S** · 2–3 eng-days.

### Releasability

R3; low user exposure risk.

---

# APZQEP-120-S15 — TE OpenAPI contract (L-01)

### Identification

| Field            | Value                           |
| ---------------- | ------------------------------- |
| ID               | APZQEP-120-S15                  |
| Title            | Test Execution OpenAPI contract |
| Workstream       | C                               |
| Priority         | P1                              |
| Sequence         | 15                              |
| Release boundary | R1                              |

### Objective

Close **L-01**: published OpenAPI for TE public APIs; contract tests.

### Scope

- OpenAPI artifact in package/docs; CI contract check vs handlers.
- Compatibility with v1.0 clients documented.

### Explicit exclusions

- UI swagger portal productisation.

### Dependencies

Stable TE routes (may parallel S08).

### Acceptance criteria

1. OpenAPI covers ingest + execution read paths used by LA clients.
2. Contract test fails on breaking change.
3. L-01 closed in CERT.

### Tests

Contract · Lint OpenAPI.

### Complexity / effort

**M** · 4–6 eng-days.

### Releasability

R1; docs+package artifacts only.

---

# APZQEP-120-S16 — Live Playwright runner (flagged)

### Identification

| Field            | Value                                      |
| ---------------- | ------------------------------------------ |
| ID               | APZQEP-120-S16                             |
| Title            | Live Playwright runner behind feature flag |
| Workstream       | C                                          |
| Priority         | P1                                         |
| Sequence         | 16                                         |
| Release boundary | R3                                         |

### Objective

Close **L-OP-01** for environments with flag ON; default remains mocked/safe.

### Scope

- Real Playwright adapter; isolation; timeouts; artifact capture → Evidence attach path.
- Feature flag default OFF in production until cert.
- Concurrency limits; stale run recovery.

### Explicit exclusions

- Multi-browser matrix product; cloud grid vendor lock-in; Suites (130).

### Dependencies

S08–S09; S02 for evidence attach; infra browsers.

### Acceptance criteria

1. Flag OFF → prior mocked behaviour.
2. Flag ON → real run produces pass/fail + artifacts linked.
3. Timeout → terminal failed + auditable.
4. No secret leakage in artifacts/logs.

### Tests

Integration hermetic · Failure/timeout · Security artifact · E2E optional smoke.

### Complexity / effort

**L** · 8–12 eng-days.

### Releasability

Feature-flagged; dependent on later enablement decision.

---

# APZQEP-120-S17 — QEP observability probes & runbooks

### Identification

| Field            | Value                                 |
| ---------------- | ------------------------------------- |
| ID               | APZQEP-120-S17                        |
| Title            | QEP observability probes and runbooks |
| Workstream       | H                                     |
| Priority         | P1                                    |
| Sequence         | 17                                    |
| Release boundary | R3                                    |

### Objective

QEP-specific health: Evidence storage, TE worker, queue depth, event failures, search index, notification delivery hooks.

### Scope

- Health/readiness contributors; structured log fields; metrics names; runbooks under `docs/operations/`.
- Correlation ID continuity checks documented.

### Explicit exclusions

- Executive Grafana product (140); new observability stack.

### Dependencies

S04, S08, S11–S13 preferred.

### Acceptance criteria

1. `/api/health` (or platform health aggregation) surfaces QEP component statuses.
2. Runbooks for: storage down, DLQ growth, index lag.
3. Metrics emitted for queue depth / failure rate (names documented).

### Tests

Health unit · Integration probe fail injection.

### Complexity / effort

**M** · 4–6 eng-days.

### Releasability

R3 ops enablement.

---

# APZQEP-120-S18 — Performance baselines & QI skeleton

### Identification

| Field            | Value                                                   |
| ---------------- | ------------------------------------------------------- |
| ID               | APZQEP-120-S18                                          |
| Title            | Performance baselines and Quality Intelligence skeleton |
| Workstream       | I                                                       |
| Priority         | P2                                                      |
| Sequence         | 18                                                      |
| Release boundary | R3                                                      |

### Objective

Capture performance baselines under documented load assumptions; thin QI metrics emission skeleton (no executive UI).

### Scope

- Baseline test harness + recorded numbers (not invented SLOs — use D-005 or mark TBD).
- QI event/metric stubs for future 140/160.
- Backpressure notes for upload/index.

### Explicit exclusions

- Dashboards (140); Coverage engine (160); AI (150).

### Dependencies

S08, S11; D-005 targets.

### Acceptance criteria

1. Baseline report file in ops evidence for stated scenario.
2. QI skeleton publishes ≥1 metric/event without UI.
3. No silent SLO invention — Owner TBD flagged.

### Tests

Perf smoke · Contract for QI stub.

### Complexity / effort

**M** · 4–6 eng-days.

### Releasability

Internal evidence + R3 stubs.

---

# APZQEP-120-S19 — Security verification suite

### Identification

| Field            | Value                                               |
| ---------------- | --------------------------------------------------- |
| ID               | APZQEP-120-S19                                      |
| Title            | Security verification suite (tenant, upload, abuse) |
| Workstream       | J                                                   |
| Priority         | P0                                                  |
| Sequence         | 19                                                  |
| Release boundary | R4                                                  |

### Objective

Programme security gate: tenant isolation, upload, rate-limit/abuse, sensitive log scan, privileged ops audit.

### Scope

- Automated security test pack for Evidence+TE+Search ACL.
- Rate-limit verification against platform limits.
- Dependency audit script invocation (existing toolchain).
- Secure failure behaviour checklist.

### Explicit exclusions

- Full pen-test engagement (may be Owner-external).

### Dependencies

S01–S06, S12 minimum.

### Acceptance criteria

1. Cross-tenant suite green.
2. Upload abuse cases rejected.
3. No secrets in sample logs.
4. Checklist signed in certification evidence.

### Tests

Security · Tenant · Abuse · Dependency audit.

### Complexity / effort

**M** · 5–7 eng-days.

### Releasability

Required before R4 programme cert.

---

# APZQEP-120-S20 — APZQEP-120 programme certification gate

### Identification

| Field            | Value                                   |
| ---------------- | --------------------------------------- |
| ID               | APZQEP-120-S20                          |
| Title            | APZQEP-120 programme certification gate |
| Workstream       | Programme                               |
| Priority         | P3                                      |
| Sequence         | 20                                      |
| Release boundary | R4                                      |

### Objective

Close APZQEP-120: all P0/P1 slices certified or explicitly waived by Owner; releasable LA posture; evidence pack; no 130+ scope creep.

### Scope

- Certification checklist execution.
- Package version recommendations (do not bump in planning).
- Freeze recommendation for Product Board.
- Deferred backlog handoff to 130+.

### Explicit exclusions

- Implementation of deferred items.

### Dependencies

S01–S19 as applicable.

### Acceptance criteria

1. All P0 slices PASS or Owner-waived with risk acceptance.
2. Repository releasable; CERT docs updated.
3. No Suites/Runs/Defects shipped as 120.
4. Evidence JSON for programme completion recorded (future programme).

### Complexity / effort

**M** · 3–5 eng-days (mostly verification).

### Releasability

R4 programme release recommendation only — Board approves.

---

## Deferred enabling contracts (not slices)

| Item                                  | Programme  |
| ------------------------------------- | ---------- |
| Suites / Runs / Defects               | APZQEP-130 |
| Executive dashboards                  | APZQEP-140 |
| AI skills                             | APZQEP-150 |
| Coverage / cert engine                | APZQEP-160 |
| ALM integrations                      | APZQEP-170 |
| GA / operational excellence programme | APZQEP-180 |
