# Dependency Map — APZQEP-120

## Slice dependency graph

```text
S01 ──► S02 ──┬──► S16
              │
              ├──► S15 (soft)
              │
              └──► S12
                     ▲
S07 ──► S08 ──► S09 ──► S10
 │       │              ▲
 │       └──────────────┤
 │                      │
 └──► S11 ──► S12       │
 │            │         │
 │            ▼         │
 └──► S13 ◄───┘         │
                        │
D-001 ──► S03 ──► S04 ──► S05 ──► S06 ──► S10
                │
                └──► S17 (storage health)

S01 ──► S14
S08+S11+S13 ──► S17 ──► S18 ──► S19 ──► S20
S01…S06+S12 ──► S19
```

---

## Technical dependencies

| Dependency                          | Used by                | Notes                   |
| ----------------------------------- | ---------------------- | ----------------------- |
| PostgreSQL (platform)               | S03, S06, S08–S10      | Metadata/outbox         |
| Redis / platform queues             | S08–S09                | As today                |
| Object storage (TBD D-001)          | S04                    | Credentials Owner       |
| Playwright browsers                 | S16                    | Flagged                 |
| `platform-event-bus`                | S07, S10               | Reuse                   |
| `platform-outbox`                   | S08–S09                | Reuse                   |
| `search-integration` / `search-qep` | S11–S12                | Extend                  |
| ENF                                 | S13                    | Reuse                   |
| PermissionService / RequestPipeline | S01–S02, S12, S14      | Reuse — no second authz |
| Better Auth                         | all authenticated APIs | Auth only               |

---

## Programme dependencies

| Upstream                       | Status   |
| ------------------------------ | -------- |
| APZQEP v1.0                    | COMPLETE |
| APZQEP-110                     | APPROVED |
| APZQEP-111                     | APPROVED |
| APZHUB Foundation / governance | COMPLETE |

Downstream consumers (not in 120): **130–180** consume contracts from S07/S11/S13/S18.

---

## Package dependencies (logical)

| Package                              | Touched slices              |
| ------------------------------------ | --------------------------- |
| `@apzhub/qep-evidence`               | S01, S03–S06, S07, S10, S19 |
| `@apzhub/qep-test-execution`         | S02, S07–S09, S15–S16, S19  |
| `search-qep` / search-integration    | S11–S12                     |
| event-notification-framework         | S13                         |
| platform-event-bus / platform-outbox | S07–S10                     |
| apps/web (registration only)         | S14, health S17             |

---

## Owner decisions as dependencies

See [DECISION-REGISTER.md](./DECISION-REGISTER.md).

---

## External / credentials

| Item                         | Slice |
| ---------------------------- | ----- |
| Object store endpoint + keys | S04   |
| SMTP (if email in D-004)     | S13   |
| CI browser deps              | S16   |
