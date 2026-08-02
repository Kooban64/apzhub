# Execution Workspace Architecture

```text
Execution Workspace UX → Session Application Service
  → PlanHandoffPort (Cap B) → immutable planning snapshot
  → Session Repository (in-memory LA)
  → Events → QKI / Notifications / Commands
  → Evidence references (Evidence Platform IDs only)
```

Product rule: Suites WHAT → Plans WHEN/WHERE/HOW/BY WHOM → Workspace EXECUTION → Results OUTCOME.
