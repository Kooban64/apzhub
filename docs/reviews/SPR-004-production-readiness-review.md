# SPR-004 — Production Readiness Review

> **Milestone:** 4 — Action Framework (`v0.4.0-action-framework`)  
> **Date:** 2026-06-28  
> **Scope:** Sprint 004 (AF-001 through AF-021)  
> **Verdict:** **READY WITH OBSERVATIONS** — suitable for milestone release pending owner tag instruction

---

## Executive summary

Sprint 004 delivers a cohesive Action Framework integrated into the authenticated APZHUB shell. Architecture layering, permission filtering, and test coverage meet platform standards. Known limitations are documented and scoped to future milestones — they do not block milestone release as a **platform infrastructure** delivery.

**Recommendation:** Approve `v0.4.0-action-framework` release notes and defer tag creation to owner instruction. Plan AF-022 sprint closeout and Milestone 4 formal review.

---

## Architecture maturity

| Criterion           | Assessment           | Notes                                                         |
| ------------------- | -------------------- | ------------------------------------------------------------- |
| Layering compliance | ✅ Strong            | Executor → bridge → Workbench API; no engine bypass           |
| Package boundaries  | ✅ Strong            | `@apzhub/command-framework` separate from workbench/workspace |
| ADR coverage        | ✅ Complete          | ADR-0024, 0025, 0026 accepted                                 |
| Extension points    | ✅ Documented        | Gateways, synchronisation stubs, actor model                  |
| Baseline alignment  | ✅ No baseline edits | Frozen v1.0 preserved                                         |
| Known gaps          | ⚠ Observed           | Bridge handler resolution for manifest ids (TD-AF20-01)       |

**Score:** Mature for Milestone 4 platform layer.

---

## Engineering maturity

| Criterion               | Assessment | Notes                                                                  |
| ----------------------- | ---------- | ---------------------------------------------------------------------- |
| Monorepo structure      | ✅         | Package exports, transpilePackages configured                          |
| DI patterns             | ✅         | `CommandRegistryProvider`, `resolveActionExecutor`, shared executor    |
| Error handling          | ✅         | Structured `ActionResult` codes; NOT_IMPLEMENTED for deferred handlers |
| Immutability            | ✅         | Frozen descriptors; read-only client registry                          |
| Code conventions        | ✅         | Matches workbench/runtime patterns                                     |
| Technical debt register | ✅         | TD-AF19-* and TD-AF20-* documented                                     |

**Score:** Production-grade engineering for platform infrastructure.

---

## Test maturity

| Layer       | Coverage                                        | Assessment              |
| ----------- | ----------------------------------------------- | ----------------------- |
| Unit        | Registry, executor, bridge, shortcuts, surfaces | ✅ Comprehensive        |
| Integration | Runtime → bootstrap → DTO                       | ✅                      |
| Component   | Palette, toolbar, context menu, shortcuts       | ✅                      |
| App wiring  | `createAppActionExecutorBundle`, diagnostics    | ✅                      |
| E2E         | spr-004-action-framework, health, palette       | ✅ 19 total             |
| Coverage    | 91.46% monorepo statements                      | ✅ Above 80% thresholds |

**Gaps:**

- No Vitest integration test for `loadActionRegistryDto()` (Next.js auth dependency)
- Service handler execution paths untested end-to-end (handlers not implemented)

**Score:** Strong — meets Constitution § testing requirements.

---

## Documentation maturity

| Artifact                              | Status                |
| ------------------------------------- | --------------------- |
| Architecture (`command-framework.md`) | ✅ AF-021             |
| Package README                        | ✅ Updated            |
| Governance guides                     | ✅ Updated            |
| Spec index (AF-001–AF-021)            | ✅                    |
| Release notes v0.4.0                  | ✅                    |
| Developer onboarding                  | ✅                    |
| Completion reports AF-001–AF-021      | ✅                    |
| Quick reference (019)                 | ✅ Updated cross-refs |

**Score:** Complete for milestone release.

---

## Developer experience

| Aspect            | Assessment                                                |
| ----------------- | --------------------------------------------------------- |
| Onboarding path   | ✅ getting-started → onboarding guide → manifest examples |
| Local dev         | ✅ `pnpm dev`, palette, health diagnostics                |
| Manifest examples | ✅ theme.yaml, platform-home/module.yaml                  |
| Test feedback     | ✅ Clear quality gate script                              |
| Discoverability   | ✅ docs/README index updated                              |

**Friction points:**

- Manifest bridge handler vs action id confusion (documented in onboarding gaps)
- Two theme toggle controls (header + toolbar) may confuse testers

**Score:** Good — actionable onboarding with documented gaps.

---

## Known technical debt

| ID         | Item                                         | Severity | Milestone               |
| ---------- | -------------------------------------------- | -------- | ----------------------- |
| TD-AF19-01 | `platform.theme.toggle` service handler      | Medium   | Theme service           |
| TD-AF20-01 | Manifest action id vs bridge id resolution   | Medium   | AF-022+ / handler story |
| TD-AF20-02 | Service handlers NOT_IMPLEMENTED             | Medium   | Platform services       |
| TD-AF20-03 | Duplicate theme controls                     | Low      | UX consolidation        |
| TD-AF20-04 | apps/web hydration Vitest gap                | Low      | Optional test story     |
| TD-AF20-05 | Health allow-all vs session filter semantics | Low      | Ops documentation ✅    |

No debt item blocks milestone release as platform infrastructure.

---

## Operational considerations

| Topic                  | Guidance                                                              |
| ---------------------- | --------------------------------------------------------------------- |
| Health monitoring      | `/api/health` → `commands` field reports registry hydration counts    |
| Degraded status        | `commands.status: degraded` when registered > 0 but filtered = 0      |
| Production diagnostics | Dev UI hidden; rely on health endpoint                                |
| Bootstrap failure      | Empty registry DTO; shell surfaces show empty states                  |
| Shortcut conflicts     | Logged in shortcut diagnostics; not surfaced in production UI         |
| Performance            | Client hydration is O(n) on action count; acceptable at current scale |

---

## Recommendations for future milestones

### Milestone 4 closeout (AF-022)

- Formal architecture review (`SPR-004-architecture-review.md`)
- Milestone 4 verdict document
- Consolidate CHANGELOG unreleased sections into v0.4.0
- Tag `v0.4.0-action-framework` on owner instruction

### Post-M4 (no implementation in AF-021)

1. **Handler resolution story** — resolve `handler: workbench-bridge:…` from manifest action id
2. **Theme service** — implement `service:theme-service:toggle` for `platform.theme.toggle`
3. **Milestone 5 Search** — palette search integration per Document 020
4. **Milestone 8 RBAC** — populate permission adapter from auth session
5. **Milestone 9** — first business capability actions using manifest pattern
6. **UX consolidation** — single theme toggle via Action Framework or header only

---

## Release readiness checklist

| Item                             | Status                    |
| -------------------------------- | ------------------------- |
| AF-001 through AF-021 complete   | ✅                        |
| Application integration (AF-020) | ✅                        |
| Documentation (AF-021)           | ✅                        |
| Quality gates pass               | ✅                        |
| Release notes prepared           | ✅                        |
| Known limitations documented     | ✅                        |
| Git tag                          | ⏳ Owner instruction only |

---

## Verdict

**READY WITH OBSERVATIONS**

The Action Framework milestone is suitable for release as `v0.4.0-action-framework`. Observations (service handlers, bridge id resolution, duplicate theme controls) are expected for a platform infrastructure milestone and are tracked in technical debt without blocking release.

---

_SPR-004 Production Readiness Review — AF-021 deliverable._
