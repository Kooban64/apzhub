# APZQEP-140 — Capability Streams

| Field     | Value                     |
| --------- | ------------------------- |
| Programme | APZQEP-140                |
| Status    | **DRAFT** (Board framing) |
| Timestamp | 20260802T163026Z          |

Stakeholder-oriented organisation of Core Quality Engineering. Detailed ownership lands in **APZQEP-140-000**.

---

## Capability A — Test Management

| Element    | Notes                         |
| ---------- | ----------------------------- |
| Suites     | Organise executable test sets |
| Cases      | Test case definitions         |
| Parameters | Data / variation              |
| Libraries  | Shared reusable assets        |

## Capability B — Execution

| Element   | Notes                                |
| --------- | ------------------------------------ |
| Runs      | Planned / scheduled execution units  |
| Execution | Runtime orchestration                |
| Results   | Outcomes and status                  |
| Evidence  | Links to Evidence Platform (S01–S06) |

## Capability C — Quality

| Element      | Notes               |
| ------------ | ------------------- |
| Defects      | Defect lifecycle    |
| Traceability | Req ↔ test ↔ defect |
| Coverage     | Coverage models     |
| Risk         | Risk signals        |

## Capability D — Reporting

| Element             | Notes                     |
| ------------------- | ------------------------- |
| Dashboards          | Role-aware views          |
| Analytics           | Operational analytics     |
| Executive Reporting | Decision-support surfaces |

---

## Cross-cutting (consume APZQEP-120)

Every capability stream consumes — never redesigns — Event Platform, QKI, Notifications, Command Platform, Evidence.
