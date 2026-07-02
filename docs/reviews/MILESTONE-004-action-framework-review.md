# Milestone 4 — Action Framework Review

> **Milestone:** 4 — Action Framework  
> **Sprint:** SPR-004  
> **Review date:** 2026-06-28  
> **Release:** `v0.4.0-action-framework` (recommended)  
> **Verdict:** **PASS WITH OBSERVATIONS — Milestone 4 Complete**

---

## Executive summary

### What was achieved

Milestone 4 delivered `@apzhub/command-framework` and integrated it into the authenticated APZHUB shell. Over twenty-two sequential stories (AF-001–AF-022), the team implemented the Action Registry, DefaultActionExecutor, WorkbenchCommandBridge, ShortcutRegistry, client hydration, four Workbench surfaces, Platform Asset scaffolding, gateway stubs, application wiring, documentation, and sprint closeout.

SPR-001 Desktop Shell, SPR-002 Platform Runtime, and SPR-003 Workbench Framework remain intact. Actions flow through one permission-filtered registry and one shared executor to the Workbench Request Bus — no engine bypass.

**672 unit tests** and **19 E2E tests** (last verified AF-020) pass at closeout. **91.46%** statement coverage. ADRs 0024–0026 are accepted.

### Overall verdict

**PASS WITH OBSERVATIONS**

Milestone 4 meets its approved scope. Deferred items (service handlers, full gateway implementation, RBAC population, search integration) are documented, accepted, and scheduled for future milestones — not blocking release of the Action Framework platform layer.

---

## Assessment dimensions

### Architecture — Strong

| Criterion                      | Rating                                                       |
| ------------------------------ | ------------------------------------------------------------ |
| Layer separation               | Strong — Action Framework between Workbench and capabilities |
| Single execution pipeline      | Strong — shared executor for API and surfaces                |
| Server-authoritative hydration | Strong — matches Workbench DTO pattern                       |
| Workbench Surface Pattern      | Strong — presentation vs execution separation                |
| Extension points               | Good — gateways, synchronisation stubs documented            |
| Baseline compliance            | Strong — no v1.0 edits                                       |

See [SPR-004 architecture review](./SPR-004-architecture-review.md).

---

### Engineering — Strong

| Criterion               | Rating                                                 |
| ----------------------- | ------------------------------------------------------ |
| Phased story delivery   | Strong — 22 stories, stop-after-review gates           |
| Package structure       | Strong — clear exports, transpilePackages              |
| DI patterns             | Strong — `resolveActionExecutor`, shared bundle        |
| Error handling          | Good — structured ActionResult codes                   |
| Immutability            | Strong — frozen descriptors, read-only client registry |
| Technical debt tracking | Good — consolidated in closeout                        |

---

### Documentation — Strong

| Artifact                              | Status   |
| ------------------------------------- | -------- |
| Architecture (`command-framework.md`) | Complete |
| Governance guides (4 updated)         | Complete |
| Developer onboarding                  | Complete |
| Release notes v0.4.0                  | Prepared |
| Spec index + 22 completion reports    | Complete |
| Production readiness review           | Complete |

AF-021 consolidated documentation; AF-022 adds formal reviews and closeout.

---

### Testing — Strong

| Area                                      | Coverage       |
| ----------------------------------------- | -------------- |
| Registry, search, context filter          | Unit           |
| Executor, bridge, gateways                | Unit           |
| Shortcuts, palette, toolbar, context menu | Component      |
| Runtime → bootstrap integration           | Integration    |
| App executor bundle                       | Unit           |
| Authenticated shell surfaces              | E2E (19 total) |

**672 tests**, **91.46%** statements. Exceeds 80% thresholds.

**Gaps (accepted):** No Vitest test for `loadActionRegistryDto()`; service handler E2E deferred until handlers exist.

---

### Maintainability — Good

| Factor                 | Assessment                                                      |
| ---------------------- | --------------------------------------------------------------- |
| Code organisation      | Clear subsystem folders in command-framework                    |
| Naming consistency     | Action vs command terminology aligned in docs                   |
| Deprecated aliases     | `registerBuiltInWorkbenchCommands` — cleanup deferred           |
| App wiring centralised | `ActionWorkbenchShellProvider`, `createAppActionExecutorBundle` |
| Diagnostics            | Health endpoint + dev component                                 |

Improvement area: bridge id resolution complexity for maintainers adding manifest actions.

---

### Extensibility — Strong

| Extension point                       | Status                                         |
| ------------------------------------- | ---------------------------------------------- |
| Gateway stubs (AI, voice, automation) | Interface ready                                |
| Client synchronisation                | Documented stub in `client/synchronisation.ts` |
| Actor model                           | user, system, ai-agent, voice                  |
| Manifest actions / toolbar            | Schema + extraction extensible                 |
| Platform catalogue                    | New bridge actions via catalogue entry         |

---

### Developer Experience — Good

| Factor              | Assessment                            |
| ------------------- | ------------------------------------- |
| Onboarding guide    | Complete with gap documentation       |
| Local verification  | Palette, health endpoint, diagnostics |
| Manifest examples   | theme.yaml, platform-home             |
| Quality gate script | Documented and enforced               |
| Friction            | Bridge id vs manifest id confusion    |

---

## Technical debt summary

Full register: [SPR-004-closeout.md](../sprint/SPR-004-closeout.md).

| Priority | Item                                     | Target              |
| -------- | ---------------------------------------- | ------------------- |
| Medium   | TD-AF20-01 Manifest bridge id resolution | Post-M4 hardening   |
| Medium   | TD-AF20-02 Theme service handler         | Theme service story |
| Medium   | M8 RBAC population                       | Milestone 8         |
| Low      | TD-AF20-03 Duplicate theme controls      | UX consolidation    |
| Low      | Gateway implementation                   | Future milestones   |
| Low      | Client synchronisation                   | Future ADR          |

---

## Release recommendation

### Proposed release

**Tag:** `v0.4.0-action-framework`  
**Baseline:** `v0.3.0-workbench-framework`  
**Release notes:** [v0.4.0-action-framework.md](../releases/v0.4.0-action-framework.md)

### Recommendation

**Proceed with release** on owner instruction.

| Criterion                    | Assessment                                |
| ---------------------------- | ----------------------------------------- |
| Sprint scope complete        | ✅ AF-001–AF-022                          |
| Quality gates                | ✅ lint, typecheck, build, test, coverage |
| Architecture review          | ✅ Approved with observations             |
| Documentation                | ✅ Complete for M4                        |
| Known limitations documented | ✅ Release notes + onboarding             |
| Breaking changes             | None                                      |
| Business modules             | None (M9+)                                |

**Do not create the Git tag** until owner explicitly instructs.

This release is appropriate as a **platform infrastructure milestone** — not a commercial product launch. User-visible actions may return `NOT_IMPLEMENTED` for service handlers; this is documented and expected.

---

## Operational readiness review

> **Question:** If APZHUB were released commercially tomorrow, what operational work remains?

This section is a **review only**. No implementation was performed in AF-022.

### Security

| Area                   | Current state                                    | Gap for commercial release                     |
| ---------------------- | ------------------------------------------------ | ---------------------------------------------- |
| Authentication         | Better Auth, session validation                  | Production hardening, MFA, SSO (Document 007)  |
| Authorisation          | Permission adapter structure; RBAC keys declared | Full RBAC population from session (M8)         |
| Action execution audit | Audit hook in executor; no persistent store      | Event Bus + immutable audit log                |
| Gateway stubs          | Reject non-user actors safely                    | Production gateway auth + policy engine        |
| Secrets                | `.env` pattern; BETTER_AUTH_SECRET               | Secrets manager, rotation, HSM for production  |
| Zero Trust             | Document 013 approved; not fully implemented     | Network segmentation, mTLS, policy enforcement |

### Monitoring

| Area             | Current state                                  | Gap                                       |
| ---------------- | ---------------------------------------------- | ----------------------------------------- |
| Health endpoint  | `/api/health` — DB, Redis, runtime, `commands` | APM, synthetic monitoring, SLO dashboards |
| Action hydration | `commands` field counts                        | Alerting on degraded/unhealthy registry   |
| Executor metrics | In-memory diagnostics only                     | Prometheus/OpenTelemetry export           |
| Error tracking   | Console / test failures                        | Sentry or equivalent                      |

### Observability

| Area               | Current state               | Gap                                               |
| ------------------ | --------------------------- | ------------------------------------------------- |
| Structured logging | Partial                     | Centralised log aggregation (Document 014)        |
| Tracing            | Not implemented             | Distributed tracing for action → service → engine |
| Diagnostics UI     | Dev-only hidden span        | Operator dashboard                                |
| Audit trail        | Hook generates reference id | Persistent audit store                            |

### Backup strategy

| Area         | Current state            | Gap                                           |
| ------------ | ------------------------ | --------------------------------------------- |
| PostgreSQL   | Docker dev compose       | Production backup schedule, PITR, encryption  |
| Redis        | Dev instance             | Persistence policy, backup                    |
| Session data | localStorage client-only | Server session sync (M8)                      |
| Registry     | In-memory at bootstrap   | Optional PostgreSQL cache (ADR-0009 deferred) |

### Disaster recovery

| Area               | Current state                  | Gap                                     |
| ------------------ | ------------------------------ | --------------------------------------- |
| DR plan            | Not documented for production  | RTO/RPO targets, failover runbooks      |
| Multi-region       | Single dev environment         | Geo-redundancy, replication             |
| Bootstrap recovery | Fail-fast on invalid manifests | Production manifest validation pipeline |

### Secrets management

| Area                 | Current state        | Gap                                           |
| -------------------- | -------------------- | --------------------------------------------- |
| Local dev            | `.env` file          | Vault / AWS Secrets Manager / similar         |
| CI secrets           | Not fully documented | GitHub Actions secrets, rotation              |
| Database credentials | Env vars             | Least-privilege DB roles, credential rotation |

### Deployment

| Area               | Current state                  | Gap                                           |
| ------------------ | ------------------------------ | --------------------------------------------- |
| Application        | Next.js build verified         | Production Dockerfile, K8s/ECS manifests      |
| Infrastructure     | Docker compose dev             | Production infra-as-code, staging environment |
| Migrations         | `pnpm db:migrate` script       | Automated migration in deploy pipeline        |
| Legacy coexistence | ENVIRONMENT.md notes apz-stack | Cutover plan                                  |

### Rollback

| Area                 | Current state   | Gap                                |
| -------------------- | --------------- | ---------------------------------- |
| Application rollback | Git revert      | Blue/green or canary deployment    |
| Database rollback    | Manual          | Down migration strategy            |
| Feature flags        | Not implemented | Gradual rollout for action changes |

### CI/CD

| Area               | Current state                          | Gap                                       |
| ------------------ | -------------------------------------- | ----------------------------------------- |
| Quality gates      | lint, typecheck, build, test, coverage | Full CI pipeline documentation            |
| E2E in CI          | Playwright configured                  | Browser cache pinning, CI E2E on every PR |
| Pre-commit         | husky + lint-staged                    | Branch protection enforcement             |
| Release automation | Manual tag on owner instruction        | Automated release notes, changelog        |

### Licensing

| Area                | Current state        | Gap                           |
| ------------------- | -------------------- | ----------------------------- |
| OSS dependencies    | pnpm lockfile        | License compliance scan, SBOM |
| Third-party engines | Not integrated (M9+) | Connector licensing review    |

### Compliance

| Area                  | Current state                      | Gap                                            |
| --------------------- | ---------------------------------- | ---------------------------------------------- |
| WCAG                  | axe on login + shell (no critical) | Full accessibility audit                       |
| GDPR / data residency | Not assessed                       | Data processing agreements, retention policies |
| SOC 2 / ISO           | Not started                        | Control framework mapping                      |

### Documentation

| Area          | Current state       | Gap                                  |
| ------------- | ------------------- | ------------------------------------ |
| Platform docs | Strong for M1–M4    | Operator runbooks, incident response |
| API docs      | Internal TypeScript | External API documentation if SaaS   |
| Support KB    | Not created         | Customer-facing help centre          |

### Support readiness

| Area          | Current state           | Gap                                    |
| ------------- | ----------------------- | -------------------------------------- |
| Support tiers | Not defined             | L1/L2/L3 escalation                    |
| Known issues  | Technical debt register | Customer-facing known limitations page |
| On-call       | Not established         | PagerDuty / on-call rotation           |

### Operational verdict

APZHUB Milestone 4 is **operationally ready for continued platform development** — not for commercial general availability. The health endpoint and quality gates provide a foundation for ops tooling. Commercial release requires Milestones 5–8 minimum plus infrastructure hardening above.

---

## Sprint 005 backlog recommendations

Do **not** begin Sprint 005 until owner approves. Recommendations only.

### Technical debt

| Item                                                          | Rationale                                    |
| ------------------------------------------------------------- | -------------------------------------------- |
| TD-AF20-01 Handler resolution for manifest bridge actions     | Unblocks shortcut execution for manifest ids |
| TD-AF20-02 Theme service for `platform.theme.toggle`          | Makes scaffolded toolbar action functional   |
| TD-AF20-03 Consolidate theme toggle UX                        | Remove duplicate header/toolbar controls     |
| TD-AF20-04 Vitest integration test for command hydration      | App wiring regression safety                 |
| M8 RBAC permission population                                 | Security prerequisite for production         |
| Deprecated alias cleanup (`registerBuiltInWorkbenchCommands`) | Maintenance                                  |

### Enhancements

| Item                                               | Rationale                         |
| -------------------------------------------------- | --------------------------------- |
| Production diagnostics for orphan toolbar warnings | Ops visibility (TD-AF19-05)       |
| Executor metrics export                            | Observability foundation          |
| Client synchronisation design ADR                  | If multi-tab / server push needed |
| Shortcut conflict UI in dev diagnostics            | Developer experience              |
| Toolbar regions beyond `workspace`                 | Platform UX expansion             |
| Command history / pinned commands                  | Document 019 optional features    |

### New capabilities (Milestone 5 — Search Framework)

| Item                                        | Rationale                       |
| ------------------------------------------- | ------------------------------- |
| `@apzhub/search-framework` package scaffold | M5 deliverable per Document 020 |
| Search provider registration API            | Provider model                  |
| Header search UI integration                | Shell search slot               |
| Search overlay component                    | Unified discovery UX            |
| Palette ↔ search integration                | Commands as searchable entities |
| Index abstraction (interface only)          | No business indexes in M5       |
| Platform Runtime search-provider kind       | Registry extension              |

---

## Quality gates

Closeout verification (2026-06-28). No production code changed since AF-020.

| Gate                 | Result                                                    |
| -------------------- | --------------------------------------------------------- |
| `pnpm lint`          | ✅                                                        |
| `pnpm typecheck`     | ✅                                                        |
| `pnpm build`         | ✅                                                        |
| `pnpm test`          | ✅ 672 passed                                             |
| `pnpm test:coverage` | ✅ 91.46%                                                 |
| `pnpm test:e2e`      | ✅ 19 passed (AF-020; not re-run — no code changes since) |

---

## Sign-off checklist

| Item                        | Status |
| --------------------------- | ------ |
| Sprint 004 stories complete | ✅     |
| Architecture review filed   | ✅     |
| Milestone review filed      | ✅     |
| Release notes prepared      | ✅     |
| Technical debt consolidated | ✅     |
| Sprint 005 not started      | ✅     |
| Git tag not created         | ✅     |

---

## Final verdict

**PASS WITH OBSERVATIONS — Milestone 4 Complete**

Recommend owner approval for:

1. Release tag `v0.4.0-action-framework` (when instructed)
2. Sprint 005 planning gate (Search Framework)

---

_Milestone 4 Action Framework Review — SPR-004 closeout._
