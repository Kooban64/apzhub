# Current State Assessment — APZQEP-120

| Field            | Value                                                          |
| ---------------- | -------------------------------------------------------------- |
| Inspected commit | `4ff22aac6d250241383bda9c7b281b3bfc2c48d9`                     |
| Evidence         | `@apzhub/qep-evidence` **1.0.0** LA                            |
| Test Execution   | `@apzhub/qep-test-execution` **1.0.1** LA                      |
| Method           | Repository inspection (code + CERT limitations + architecture) |

---

## Classification legend

`COMPLETE` · `PARTIAL` · `MISSING` · `DEFERRED` · `NOT APPLICABLE`

---

## Workstream rollup

| WS  | Name                               | Overall      | Headline gap                                                                                                      |
| --- | ---------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------- |
| A   | Evidence Platform Hardening        | **PARTIAL**  | Memory SoR; no durable StoragePort; client hash; no bus                                                           |
| B   | Access Control & Tenant Boundaries | **PARTIAL**  | L-EM-01 **CLOSED** (S01); Query/Permission pipeline **COMPLETE** (S02); TE EvidenceAccessPort wiring **deferred** |
| C   | Test Execution Operability         | **PARTIAL**  | Outbox enqueue-only; mocked Playwright; no OpenAPI                                                                |
| D   | Domain & Operational Events        | **PARTIAL**  | Manifest stubs; no QEP→bus publish                                                                                |
| E   | Search Foundation                  | **PARTIAL**  | 5 entity types only (no spec/plan/exec/evidence)                                                                  |
| F   | Notification Foundation            | **DEFERRED** | Architecture docs; no QEP wiring                                                                                  |
| G   | Background Processing              | **PARTIAL**  | Platform outbox exists; QEP TE table undrained                                                                    |
| H   | Observability                      | **PARTIAL**  | Platform health only; no QEP-specific probes                                                                      |
| I   | Performance & Resilience           | **PARTIAL**  | 1 MiB body / page caps; no QEP SLOs                                                                               |
| J   | Security Hardening                 | **PARTIAL**  | Strong gateway+facades; upload/hash/audit durability gaps                                                         |

---

## Reuse (do not rebuild)

| Capability            | Location                                                                 |
| --------------------- | ------------------------------------------------------------------------ |
| Event bus             | `packages/platform-event-bus/`                                           |
| Outbox worker pattern | `packages/platform-outbox/`, `scripts/worker-outbox.mjs`                 |
| Search integration    | `packages/search-integration/`, `packages/search-qep/`                   |
| ENF / notifications   | `packages/event-notification-framework/`, platform notification delivery |
| Authz pipeline        | `packages/platform-services` RequestPipeline                             |
| Better Auth           | `packages/auth/` (auth only)                                             |
| Command / UCP         | knowledge-discovery / command framework (register QEP actions)           |

---

## Evidence (A) — detail

| Item                      | Status                             | Path / note                                          |
| ------------------------- | ---------------------------------- | ---------------------------------------------------- |
| Domain + secured services | COMPLETE                           | `packages/qep-evidence`                              |
| StoragePort contract      | COMPLETE                           | `application/ports/storage-port.ts`                  |
| Durable adapter           | MISSING                            | skeleton throws                                      |
| PG metadata SoR           | MISSING                            | no evidence schema in config                         |
| Runtime mode              | PARTIAL                            | memory-only production factory                       |
| Per-item ACL              | COMPLETE                           | access-policy + secure-services                      |
| List/search ACL           | **COMPLETE** (S01)                 | L-EM-01 **CLOSED**                                   |
| Evidence Query pipeline   | **COMPLETE** (APZQEP-120-S02)      | PermissionEngine + QueryBuilder + EnumerationService |
| Bus publish               | DEFERRED                           | CERT-003                                             |
| ADR-0088                  | ACCEPTED arch / **tech undecided** | `docs/adr/ADR-0088-evidence-storage-abstraction.md`  |

## Test Execution (C) — detail

| Item                     | Status                              | Note                          |
| ------------------------ | ----------------------------------- | ----------------------------- |
| State machine + PG + RLS | COMPLETE                            | migrations 0087/0088          |
| Ingestion API            | COMPLETE                            | `/executions/ingestions`      |
| Outbox enqueue           | PARTIAL                             | **L-03** no dispatcher        |
| Live Playwright          | PARTIAL                             | **L-OP-01** mocked            |
| OpenAPI                  | MISSING                             | **L-01**                      |
| EvidenceAccessPort       | COMPLETE code / PARTIAL integration | fail-closed; not Evidence ACL |

## Search / Notify / Events

| Item                          | Status        |
| ----------------------------- | ------------- |
| search-qep 5 types            | PARTIAL       |
| TE/Evidence/Specs/Plans index | MISSING       |
| QEP notifications             | MISSING       |
| `events/qep/*.yaml`           | PARTIAL stubs |
| QEP publish to bus            | MISSING       |

---

## Architectural contradictions

None found that invalidate APZQEP-111.  
**Decision dependency:** ADR-0088 technology selection blocks durable Evidence slices (S03–S06) but not ACL/events/search planning.

---

## Implications for slicing

1. Security ACL slices first (no Owner storage decision).
2. Evidence persistence/storage after **D-001**.
3. Event/worker slices unlock notify + search consistency.
4. TE E2E/OpenAPI parallelisable after events or independently.
5. QI skeleton thin enabling contract only (dashboards → 140).
