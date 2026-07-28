# Known Limitations — Platform-1.4-ENG-001B-P3

1. Live PostgreSQL concurrency/fencing tests **not run** in this environment (`DATABASE_URL` unset).
2. Uncertain channel timeout may cause duplicate in-app effects on retry — no exactly-once guarantee.
3. Durable intake wiring into web gateway bootstrap remains process-local Maps for command/event intake; P3 focuses on dispatch path for claimed durable rows.
4. Intent aggregate status updates are best-effort in process-local path; durable path does not yet fully mirror intent aggregate transitions.
5. Manual replay / admin browsers deferred to later phases.
6. No provider_reference reconciliation engine.
