# OSS-001 Acceptance Criteria

**Milestone:** OSS-001 — OSS Integration Master Plan  
**Type:** Planning milestone done definition

---

## OSS-001 complete when

### Documentation delivered

- [x] Master OSS Integration Plan (index document)
- [x] Master OSS Integration Architecture
- [x] Wave Roadmap with implementation sequencing
- [x] Integration Standards
- [x] Capability Mapping
- [x] Product Integration Catalog (all 12 engines, all required fields)
- [x] Risk Register
- [x] Engineering Estimates
- [x] Dependency graph (in architecture doc)
- [x] Completion Report

### Validation complete

- [x] Every planned OSS integration consumes Platform Core correctly
- [x] Product-specific exceptions documented before implementation
- [x] No Platform Core modifications in OSS-001
- [x] No Plane production integration code
- [x] No OSS adapter implementation code

### Quality gates

- [x] `pnpm lint` — pass (no code changes)
- [x] `pnpm typecheck` — pass
- [x] `pnpm build` — pass
- [x] `pnpm test` — pass
- [x] `pnpm test:coverage` — pass

---

## Per-wave acceptance (OSS-1xx+) — future

Each implementation wave is complete when:

1. Manifests (`integration.yaml`, `service.yaml`, `module.yaml`) approved
2. Adapter + service + module implemented
3. Platform Core consumed — no duplicate IAM/ops
4. Search, notification, activity registered
5. Operations control plane reports connector health
6. Contract + integration + Playwright tests pass
7. Wave completion report approved by owner

---

## Stop condition

OSS-001 complete. Await owner approval before **OSS-101 (Plane Integration)**.

---

## Related

- [OSS-001 Master Plan](./OSS-001-APZHUB-OSS-Integration-Master-Plan.md)
- [OSS-001 Completion Report](./OSS-001-completion-report.md)
