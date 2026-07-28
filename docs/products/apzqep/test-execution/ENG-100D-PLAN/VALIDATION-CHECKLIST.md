# ENG-100D Validation Checklist (planning only)

- [ ] Migrations apply cleanly in Compose / CI
- [ ] Repository concurrency conflicts return typed errors
- [ ] Outbox + audit written in same unit of work as aggregate save
- [ ] All PART-04 routes authorised and permission-gated
- [ ] Handlers call Application services only (no Domain bypass)
- [ ] Domain + Application unit tests remain green
- [ ] API / integration tests pass
- [ ] No Workbench code introduced
- [ ] Infrastructure status marker updated
- [ ] Stop at AWAITING OWNER ENGINEERING WAVE 4 DECISION
