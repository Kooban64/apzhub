# Infrastructure — APZQEP-ENG-060B

## Layers

```text
REST (apps/web)
  → Platform Service (platform-services gateway.qep.plans)
    → Application Service (orchestration only)
      → Domain (business rules — unchanged, 0.1.0 CERTIFIED semantics)
      → Repository port
        → Postgres | InMemory
```

## Package

`@apzhub/qep-test-plans` **0.2.0**

| Export | Contents |
| ------ | -------- |
| `.` | Programme markers + re-exports |
| `./domain` | Aggregate, VOs, policies, repository port (additive — `plan-repository.ts`) |
| `./application` | Commands/queries/DTO adapter/available actions |
| `./infrastructure` | Persistence factories, repos, mapper |
| `./presentation` | Permissions constants, route constants, navigation stub (no UI) |
| `./shared` | Errors, pagination |

## Non-ownership

Infrastructure does **not** implement business rules, Workbench UI, Evidence, Coverage, Impact, Certification, AI, MCP, Execution, or Test Cases. Domain command/lifecycle behaviour, invariants, and events are **unchanged** from the certified `0.1.0` baseline; the only Domain addition is the additive `TestPlanRepository` port (`src/domain/test-plan/plan-repository.ts`), exported alongside the existing aggregate.
