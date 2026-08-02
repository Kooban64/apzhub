# Defect Architecture

```
Client → Gateway → Defect Application Service → Defect Repository (SoR)
                              ↓
                    Cap C ExecutionSessionPort (read-only)
                              ↓
                    Evidence refs (IDs only)
                              ↓
                    Events → Processing → QKI / Notifications / Commands
```

Product rule: **A Defect is an investigation record, not evidence.**

Does not reopen frozen `@apzhub/qep-test-execution` defect links or legacy `/api/v1/testing/defects`.
