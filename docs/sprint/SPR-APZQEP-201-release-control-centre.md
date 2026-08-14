# SPR-APZQEP-201 — Release Control Centre & surface completion

> **Status:** **IN PROGRESS — closeout** — 2026-08-14  
> **Parent:** [SPR-APZQEP-200](./SPR-APZQEP-200-competitive-full-swing.md)  
> **Depends on:** APZQEP V1.1 CLOSED; Quality Flow Workspace + Certification/RC APIs live  
> **Does not:** Redesign QO kernels; invent new SoR; auto-certify; start 202–204  
> **Backup:** `backup/checkpoint-20260814-apzqep-200-authorised` @ `6e1c2516` (also on `main`)

## Outcome

An operator opens **Quality → Home** and can answer **“Can we release with confidence?”** from one composition:

- Live release posture (blocked / waiting / exceptions / decisions)
- Live **APZPEN security assurance** posture (honest when unbound / not entitled / blocked)
- Clear next actions into Quality Flows, Release Candidate, Release Readiness
- Release Candidate product entry via recent SCM changes + security strip on RC home/workbench

**Release Readiness** is a second composition over orchestration + security facts — checklist orientation for go/no-go prep — not a duplicate SoR.

## Scope

### In

| ID    | Ship                              | Approach                                                                       | Status   |
| ----- | --------------------------------- | ------------------------------------------------------------------------------ | -------- |
| 201-A | Un-stub **M01 Home**              | Workbench manifest + `qep-home-views` composing quality-flows                  | **Done** |
| 201-B | Un-stub **M12 Release Readiness** | Checklist UI; security row from bridge (never hardcoded ok)                    | **Done** |
| 201-C | Activity entry                    | Quality activity-bar default → `/workspace/qep/home`                           | **Done** |
| 201-D | Permissions                       | `qep.home.read`, `qep.release_readiness.read`                                  | **Done** |
| 201-E | Catalogue honesty                 | M01 + M12 → `enabled`                                                          | **Done** |
| 201-F | APZPEN security domains           | Read-only bridge + `GET /api/v1/qep/security-assurance`; Home / Readiness / RC | **Done** |
| 201-G | Certification RC UX               | Recent SCM change picker + honest copy + APZPEN strip on RC                    | **Done** |

### Out (202+)

- Playwright production ingest, Integrations Centre, AI assist, Evidence/Search GA
- New Platform Service SoR tables for “readiness score”
- New certification domain engines

## Architecture compliance

```
Presentation (Home / Release Readiness / RC)
  → GET /api/v1/qep/quality-flows
  → GET /api/v1/qep/security-assurance  (compose APZPEN posture + source bindings)
  → Certification / SCM APIs
```

- Modules remain presentation-only.
- Bridge never writes APZPEN SoR and never certifies.
- AI never certifies (unchanged hard rule).

## Acceptance criteria

1. Sidebar shows **Home** and **Release Readiness**; routes render real surfaces.
2. Home shows live Quality Flow metrics + APZPEN security panel.
3. Primary CTAs: Quality Flows, Release Candidate, Release Readiness.
4. Release Readiness checklist uses live security posture (`reviewClear`), not hardcoded pass.
5. Opening Quality activity lands on Home.
6. `M01` and `M12` catalogue status = `enabled`.
7. Unit tests for bridge + route helpers; Playwright `apzqep-201-release-control-centre.spec.ts`.
8. RC home offers recent SCM changes; RC workbench shows APZPEN on security domain.
9. No new orchestration tables; no AI certification path.

## Definition of Done (remaining)

- [ ] Targeted Vitest green (bridge + routes + types)
- [ ] Playwright 201 spec green against local web
- [ ] Docs: mark **DELIVERED** after Owner acceptance
- [ ] Owner demo: Quality → Home → Readiness / RC with security honesty

## Non-goals reminder

Do not start SPR-APZQEP-202 until 201 is accepted or Owner reorders.
