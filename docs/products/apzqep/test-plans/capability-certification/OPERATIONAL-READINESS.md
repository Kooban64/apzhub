# Operational Readiness — APZQEP-CERT-080A (full capability)

| Field | Value |
| ----- | ----- |
| Result | **PASS** |
| Date | 2026-07-28 |
| Scope | Full capability go-live readiness — Domain + Infrastructure + Workbench together |

## Checklist

| Concern | Result | Notes |
| ------- | ------ | ----- |
| Documentation completeness | **PASS** | Domain, Infrastructure, Workbench, OES, and all CERT packs complete |
| Configuration | **PASS** | Workspace package; env via platform configuration |
| Permissions | **PASS** | `qep.plan.*` catalogue in `module.yaml`, consistent across layers — see [SECURITY-REVIEW.md](./SECURITY-REVIEW.md) |
| Module registration & Sidebar IA | **PASS** | `modules/qep-test-plans/module.yaml` — Dashboard, Explorer, Review, Search registered, each permission-gated |
| Route wiring | **PASS** | Full route tree in `packages/qep-test-plans/src/presentation/routes.ts`; router wired via `apps/web/components/qep/qep-workspace-router.tsx` |
| Installation / deployment | **PASS** | Next.js `apps/web` hosts REST + Workbench routes; no new package, no new dependency surface |
| Migration | **PASS** | **0085** (tables) · **0086** (RLS) — applied at Infrastructure delivery; no new migration under this programme |
| Rollback | **PASS** | Standard Drizzle migration rollback discipline |
| Observability | **PASS** | Infrastructure `OBSERVABILITY.md` hooks · Workbench telemetry events (ARCH-014) |
| Error handling | **PASS** | Platform envelope + domain/application errors; typed `QepErrorState` on the client |
| Audit behaviour | **PASS** | Infrastructure `AUDIT.md` · append-only lifecycle history |
| Diagnostics / logging | **PASS** | Structured Platform errors / observation hooks |
| Known limitations documented | **PASS** | [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md) |
| Capability go-live | **PASS (recommended)** | No deployment blocker identified across the full capability within its recorded scope |

## Manifest metadata staleness (recorded, non-blocking — see ARCHITECTURE-REVIEW.md)

`modules/qep-test-plans/module.yaml` (`metadata.description`, `module.status`) and `packages/qep-test-plans/src/index.ts` (`QEP_TEST_PLANS_PROGRAMME`) retain text predating the ENG-070A / CERT-060A / CERT-060B / CERT-070A Owner Acceptances. This was first recorded at CERT-070A `OPERATIONAL-READINESS.md` as a documentation-only observation, not a functional defect — routes, Sidebar entries, and permission gates are correctly registered and functionally verified. It is re-confirmed unchanged here and remains **not** certification-blocking, consistent with certification independence (no engineering under CERT-080A).

## Verdict

Full capability operational readiness **PASS** for authorised production use within recorded limitations. This constitutes the **Capability** go-live readiness declaration, distinct from and superseding the Workbench-component-only declaration made at CERT-070A.
