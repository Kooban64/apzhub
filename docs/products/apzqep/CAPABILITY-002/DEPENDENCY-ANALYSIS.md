# Dependency Analysis — APZQEP-CAPABILITY-002

## Capability dependency graph (logical)

```text
Requirements ──┐
Traceability ──┼──► Verification / Specs / Plans ──► Test Execution (1.0.1)
               │                                         │
               │                                         ├── EvidenceReference ──► Evidence Management ★
               │                                         ├── Observations ───────► Defect Management
               │                                         └── Execution aggregates ► Test Runs
               │
Test Suites ◄── Specs / Plans (optional Execution suiteId)
               │
Evidence Management ──► Coverage & Analytics ──► Reporting / Dashboards
               │
AI Assistance ── consumes mature facts (late)
```

★ = recommended CAPABILITY-002

## Shared platform services (reuse for any next capability)

| Shared concern      | Owner                           |
| ------------------- | ------------------------------- |
| AuthN / session     | Better Auth + platform          |
| AuthZ / permissions | PermissionService (`qep.*`)     |
| Audit               | Platform / capability AuditPort |
| Events / outbox     | Platform event patterns         |
| Search index        | Search publication hooks        |
| Workbench shell     | Desktop Framework + shared UI   |
| API gateway         | APZHUB gateway envelope         |
| Tenancy             | Platform request context        |

## Test Execution 1.0.1 integration points

| Candidate                          | Integration with TE 1.0.1                                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Evidence Management                | Replaces coarse baseline ACL with real evidence ACL; owns blobs behind existing URIs; TE stays reference-only (ADR-0080) |
| Test Runs                          | Groups executions; consumes status/progress events                                                                       |
| Defects                            | Promotes observations; optional evidence links                                                                           |
| Test Suites                        | Optional suite identity on prepare/manifest                                                                              |
| Reporting / Analytics / Dashboards | Consume TE outcomes (+ Evidence later)                                                                                   |
| AI                                 | Assistive only; must not own SoR                                                                                         |

## Shared UI / API opportunities

- Workbench regions, DataTable, command patterns from Plans/Execution
- REST style `/api/v1/qep/{capability}/*` + `availableActions` authority (ADR-0083)
- Evidence access decision model introduced in TE REM-001 as integration hook
