# Infrastructure — APZQEP-ENG-050B

## Layers

```text
REST (apps/web)
  → Platform Service (platform-services gateway.qep.specifications)
    → Application Service (orchestration only)
      → Domain (business rules)
      → Repository port
        → Postgres | InMemory
```

## Package

`@apzhub/qep-test-specifications` **0.2.0**

| Export | Contents |
| ------ | -------- |
| `.` | Programme markers + re-exports |
| `./domain` | Aggregate, VOs, policies, repository port |
| `./application` | Commands/queries/DTO adapter |
| `./infrastructure` | Persistence factories, repos, mappers |
| `./shared` | Errors, pagination |

## Non-ownership

Infrastructure does **not** implement business rules, Workbench UI, Evidence, Coverage, Impact, Certification, AI, MCP, Execution, or Test Cases.
