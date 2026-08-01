# Workstreams — APZQEP-120

Aligned to Owner programme instruction §6. Status from [CURRENT-STATE-ASSESSMENT.md](./CURRENT-STATE-ASSESSMENT.md).

---

## A — Evidence Platform Hardening

| Capability                                     | Status          | Target slices    |
| ---------------------------------------------- | --------------- | ---------------- |
| Storage abstraction                            | PARTIAL         | S03–S04          |
| Production persistence                         | MISSING         | S03              |
| Metadata integrity / versioning / immutability | PARTIAL         | S03, S05         |
| Content hashing (server-side)                  | PARTIAL         | S05              |
| Upload/retrieval                               | PARTIAL         | S04              |
| Linking / classification / lifecycle           | PARTIAL         | S03, S06         |
| Retention / deletion restrictions              | PARTIAL         | S06 + D-002      |
| Audit trail durability                         | PARTIAL         | S06              |
| Access control                                 | PARTIAL         | S01–S02          |
| Completeness / reconciliation / export         | MISSING/PARTIAL | S06, S17         |
| Large file / malware hooks                     | MISSING         | S04 (hooks only) |
| Diagnostics                                    | PARTIAL         | S17              |

## B — Access Control & Tenant Boundaries

| Capability                    | Status              | Target slices |
| ----------------------------- | ------------------- | ------------- |
| Auth integration              | COMPLETE (platform) | reuse         |
| RBAC / PermissionService      | COMPLETE (platform) | reuse         |
| Evidence per-item ACL         | COMPLETE            | —             |
| Evidence list/search ACL      | PARTIAL L-EM-01     | **S01**       |
| TE ↔ Evidence ACL             | PARTIAL             | **S02**       |
| Default-deny / privileged ops | PARTIAL             | S01, S19      |
| Cross-tenant isolation tests  | PARTIAL             | S01, S19      |
| Competing authz frameworks    | N/A                 | **forbidden** |

## C — Test Execution Operability

| Capability                       | Status             | Target slices               |
| -------------------------------- | ------------------ | --------------------------- |
| State machine / ingest / history | COMPLETE           | harden via S07–S09, S15–S16 |
| Outbox drain / retries / DLQ     | PARTIAL L-03       | **S08–S09**                 |
| Live runner                      | PARTIAL L-OP-01    | **S16** (flagged)           |
| OpenAPI                          | MISSING L-01       | **S15**                     |
| Suites/Runs/Defects              | DEFERRED → **130** | exclude                     |

## D — Domain & Operational Events

| Capability                  | Status          | Target slices |
| --------------------------- | --------------- | ------------- |
| Manifest stubs              | PARTIAL         | **S07**       |
| Publish / idempotency / DLQ | MISSING/PARTIAL | **S07, S10**  |
| New event platform          | N/A             | **reuse bus** |

## E — Search Foundation

| Capability                      | Status           | Target slices         |
| ------------------------------- | ---------------- | --------------------- |
| Project/requirement/… providers | PARTIAL          | extend **S11**        |
| Spec/Plan/Exec/Evidence         | MISSING          | **S11–S12**           |
| ACL at query                    | PARTIAL          | **S12**               |
| Full UCP UX                     | DEFERRED → shell | **S14** register only |
| Semantic search                 | DEFERRED → 150   | extension points only |

## F — Notification Foundation

| Capability            | Status              | Target slices   |
| --------------------- | ------------------- | --------------- |
| ENF platform          | COMPLETE (platform) | reuse           |
| QEP mapping / centre  | MISSING             | **S13**         |
| Advanced prefs / push | DEFERRED            | exclude / D-004 |

## G — Background Processing

| Capability                  | Status   | Target slices |
| --------------------------- | -------- | ------------- |
| Platform outbox             | COMPLETE | reuse         |
| QEP TE worker               | PARTIAL  | **S08–S09**   |
| Evidence/search/notify jobs | MISSING  | S09–S13       |
| Tenant fairness             | PARTIAL  | S09 + D-005   |

## H — Observability

| Capability            | Status   | Target slices |
| --------------------- | -------- | ------------- |
| Platform health/logs  | COMPLETE | reuse         |
| QEP probes / runbooks | MISSING  | **S17**       |

## I — Performance & Resilience

| Capability               | Status  | Target slices               |
| ------------------------ | ------- | --------------------------- |
| Platform limits          | PARTIAL | document + **D-003/D-005**  |
| QEP SLOs / load evidence | MISSING | **S18** (baselines) / Owner |

## J — Security Hardening

| Capability                   | Status   | Target slices    |
| ---------------------------- | -------- | ---------------- |
| Gateway / facades            | COMPLETE | maintain         |
| Upload / hash / tenant suite | PARTIAL  | S04–S05, **S19** |
| Portfolio security gov       | N/A      | translate only   |
