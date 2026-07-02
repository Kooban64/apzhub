# APZHUB Platform Governance

> **Platform Version:** 2.0  
> **Status:** Permanent governance reference  
> **Authority:** [Document 000 — Engineering Constitution](../000-apzhub-engineering-constitution.md) · [Engineering Handbook](./APZHUB-Engineering-Handbook.md)  
> **Scope:** All platform development from Milestone 5 onward

---

## Purpose

This document defines how the APZHUB platform is governed — lifecycle, decisions, standards, processes, and Definition of Done. Platform 2.0 establishes the baseline. This governance ensures future milestones **extend** the platform without redesigning it.

---

## Platform lifecycle

### Version model

| Version                        | Meaning                                                               |
| ------------------------------ | --------------------------------------------------------------------- |
| **Architecture Baseline v1.0** | Frozen architectural rules (ADR-gated changes only)                   |
| **Platform Version 2.0**       | Collective M1–M4 deliverable — definitive reference                   |
| **Milestone releases**         | `v0.x.0-{theme}` tags per sprint closeout                             |
| **Platform Version 3.0**       | Future — when M5–M10 collective baseline is declared (owner decision) |

### Build order (non-negotiable)

```text
Foundation (M1)
        ↓
Platform Runtime (M2)
        ↓
Workbench Framework (M3)
        ↓
Action Framework (M4) ✅ Platform 2.0
        ↓
Knowledge & Discovery Framework (M5)
        ↓
Notification Framework (M6)
        ↓
Activity Framework (M7)
        ↓
Identity & Administration (M8)
        ↓
Business Capabilities (M9)
        ↓
Enterprise Operations (M10)
```

Never skip layers. Never add business modules before platform infrastructure is ready.

### Milestone gates

Each milestone completes with:

1. Sprint closeout report
2. Architecture review
3. Milestone review (PASS / PASS WITH OBSERVATIONS / FAIL)
4. Release notes
5. Owner approval before next milestone

---

## ADR process

### When an ADR is required

- New platform package or major subsystem
- Public API contract change
- Manifest schema breaking change
- Baseline v1.0 exception
- New capability kind
- Cross-layer dependency rule change

### ADR workflow

```text
Problem identified
        ↓
Draft ADR in docs/adr/ADR-NNNN-{slug}.md
        ↓
Review against Baseline v1.0 and Platform Reference Architecture
        ↓
Owner approval
        ↓
Status: Accepted | Rejected | Superseded
        ↓
Implement in sprint stories
        ↓
Reference ADR in completion reports
```

### ADR format

Follow existing ADRs (0024–0026 as recent examples):

- Status, date, context, decision, consequences
- Index maintained in [docs/adr/README.md](../adr/README.md)

### Platform 2.0 ADR inventory

**26 ADR documents** — 25 accepted, 1 superseded (ADR-0008 → ADR-0018).

Sprint-specific ADRs:

| Sprint  | ADRs      |
| ------- | --------- |
| SPR-002 | 0010–0018 |
| SPR-003 | 0019–0023 |
| SPR-004 | 0024–0026 |

---

## Engineering standards

### Constitution compliance

Every change must comply with [Document 000](../000-apzhub-engineering-constitution.md):

| Principle             | Requirement                           |
| --------------------- | ------------------------------------- |
| Platform first        | Infrastructure before features        |
| Manifest first        | Extensions begin with YAML            |
| SDK first             | No custom patterns without ADR        |
| Backend agnostic      | Users never see backend product names |
| Security by design    | Auth, RBAC keys, audit, validation    |
| Test everything       | Automated tests mandatory             |
| Documentation is code | Undocumented = incomplete             |

### Code standards

- TypeScript strict mode
- ESLint at repo root
- Prettier formatting (lint-staged on commit)
- Conventional commits (commitlint)
- pnpm workspaces — no npm/yarn mixing

### Package standards

- Explicit `exports` in `package.json`
- No circular dependencies across layers
- Server-only code in `/server` export paths
- React code in `/react` export paths where applicable
- `transpilePackages` in Next.js for workspace packages

---

## Registry Pattern

All platform indexes follow the [Registry Pattern](../architecture/APZHUB-Registry-Pattern.md):

1. **Declaration** — manifest or built-in catalogue
2. **Server bootstrap** — extraction, validation, registration
3. **Permission filter** — adapter strips disallowed entries
4. **DTO serialisation** — immutable snapshot for client
5. **Read-only hydration** — client registry; no UI registration
6. **Consumer** — surface or executor; not both storing and executing

New registries (Discovery providers, notification routes) must follow this pattern.

---

## Surface Pattern

Workbench surfaces follow the [Workbench Surface Pattern](../architecture/APZHUB-Workbench-Surface-Pattern.md):

- Presentation in `@apzhub/workspace` or `@apzhub/ui`
- Execution via existing pipelines (Action Framework `execute()` for actions)
- No parallel handler maps in UI components
- Surface catalogue in `workbench-surfaces.ts`

Discovery UI (M5) is a **new surface category** — must consume registries, not create execution paths.

---

## Release process

### Milestone release

```text
Sprint closeout complete
        ↓
All quality gates pass
        ↓
Release notes in docs/releases/
        ↓
Milestone review verdict: PASS or PASS WITH OBSERVATIONS
        ↓
Owner approves
        ↓
Git tag created (owner instruction only)
        ↓
CHANGELOG updated
```

### Recommended tags (Platform 2.0 components)

| Tag                          | Milestone |
| ---------------------------- | --------- |
| `v0.1.0-foundation`          | M1        |
| `v0.2.0-platform-runtime`    | M2        |
| `v0.3.0-workbench-framework` | M3        |
| `v0.4.0-action-framework`    | M4        |

**Platform Version 2.0** is the collective designation — not necessarily a single Git tag unless owner instructs.

### Do not

- Tag without owner instruction
- Force-push to main
- Release without green quality gates
- Skip milestone review

---

## Sprint process

### Sprint lifecycle

```text
Backlog approved (docs/backlog/SPR-NNN-*.md)
        ↓
Story-by-story delivery (one story at a time)
        ↓
Owner review after each story (stop condition)
        ↓
Quality gates per story
        ↓
Sprint closeout (final story)
        ↓
Architecture + milestone reviews
        ↓
Owner approval for next sprint
```

### Sprint artefacts

| Artefact            | Location                             |
| ------------------- | ------------------------------------ |
| Sprint guide        | `docs/sprint/SPR-NNN-*.md`           |
| Engineering backlog | `docs/backlog/SPR-NNN-*-backlog.md`  |
| Technical specs     | `docs/specs/`                        |
| Completion reports  | `docs/sprint/*-completion-report.md` |
| Closeout            | `docs/sprint/SPR-NNN-closeout.md`    |

### Phased review gates (ADR-0017)

Large sprints may use phases with phase reports and owner approval between phases. Story-level gates remain mandatory.

---

## Story process

### Story workflow

```text
1. Technical Specification (docs/specs/ or backlog section)
2. Implementation (single PR, single concern)
3. Tests (unit / integration / E2E per story definition)
4. Documentation (guides, CHANGELOG if user-visible)
5. Code review (baseline + acceptance criteria)
6. Completion report (docs/sprint/{ID}-completion-report.md)
7. Owner review → next story
```

### Story principles

| Principle                | Meaning                              |
| ------------------------ | ------------------------------------ |
| Independently buildable  | No dependency on unmerged later work |
| Independently testable   | Tests pass with prior stories merged |
| Independently reviewable | PR scope = one story                 |
| Independently mergeable  | Green CI without feature flags       |

### Story ID conventions

| Prefix        | Sprint                                    |
| ------------- | ----------------------------------------- |
| AF-NNN        | Action Framework (SPR-004)                |
| DF-NNN        | Knowledge & Discovery Framework (SPR-005) |
| Phase reports | SPR-00N-phase-N-report.md                 |

### Effort scale

| Label | Estimate  |
| ----- | --------- |
| S     | 0.5–1 day |
| M     | 1–2 days  |
| L     | 2–3 days  |

---

## Code review standards

### Review checklist

- [ ] Complies with Architecture Baseline v1.0 and Platform Reference Architecture
- [ ] No layer violations (dependency direction)
- [ ] No engine bypass from capabilities or surfaces
- [ ] Manifest changes validated with tests
- [ ] Permission keys declared where applicable
- [ ] Tests added/updated; coverage maintained
- [ ] Documentation updated if user-visible or architectural
- [ ] ADR filed if required
- [ ] No scope creep into adjacent stories

### Review authority

- Peer review required for all merges
- Architecture-sensitive changes require reference to ADR or spec
- Baseline exceptions require accepted ADR before merge

---

## Testing standards

### Quality gates (every story / PR)

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm test:coverage
pnpm test:e2e          # when UI or integration affected
```

### Coverage thresholds

- Monorepo: ≥ 80% statements (enforced in vitest.config.ts)
- Package-specific thresholds for platform-runtime, workbench-framework, command-framework subsystems

### Test layers

| Layer         | Tool         | Focus                                 |
| ------------- | ------------ | ------------------------------------- |
| Unit          | Vitest       | Subsystems, pure logic                |
| Component     | Vitest + RTL | UI components                         |
| Integration   | Vitest       | Bootstrap chains, hydration           |
| E2E           | Playwright   | Authenticated shell, health, a11y     |
| Accessibility | axe-core     | No critical violations on login/shell |

### Platform 2.0 baseline

**672** unit tests · **19** E2E tests · **91.46%** statement coverage

---

## Documentation standards

### Required documentation

| Change type          | Documentation                            |
| -------------------- | ---------------------------------------- |
| New subsystem        | Architecture doc in `docs/architecture/` |
| New package          | README in package root                   |
| User-visible feature | CHANGELOG entry                          |
| New pattern          | Governance or architecture note          |
| Sprint completion    | Completion report                        |
| Sprint closeout      | Closeout + reviews                       |

### Document hierarchy

```text
Document 000 (Constitution) — supreme authority
        ↓
Architecture Baseline v1.0 (frozen)
        ↓
Platform Reference Architecture (v2.0 consolidation)
        ↓
Foundation docs 001–029
        ↓
ADRs, specs, sprint guides, governance guides
```

Undocumented features are **incomplete**.

---

## Definition of Done

A story is **Done** when all criteria are met:

### Implementation

- [ ] Acceptance criteria satisfied
- [ ] Scope limited to story definition — no adjacent features
- [ ] No layer violations or baseline exceptions without ADR
- [ ] Code merged to main branch

### Testing

- [ ] Unit tests pass
- [ ] Integration tests pass (if applicable)
- [ ] E2E tests pass (if UI/integration affected)
- [ ] Coverage thresholds maintained
- [ ] No regression in existing tests

### Quality

- [ ] `pnpm lint` pass
- [ ] `pnpm typecheck` pass
- [ ] `pnpm build` pass

### Documentation

- [ ] Completion report filed
- [ ] User-visible changes in CHANGELOG
- [ ] Architecture/governance docs updated if pattern changed
- [ ] Spec cross-references accurate

### Review

- [ ] Code review completed
- [ ] Owner story review approved
- [ ] Technical debt registered if deferred work introduced

### Sprint closeout (final story only)

- [ ] Closeout report
- [ ] Architecture review
- [ ] Milestone review
- [ ] Release notes prepared
- [ ] Owner approval for next sprint

---

## Related documents

| Document                                                                                     | Topic                      |
| -------------------------------------------------------------------------------------------- | -------------------------- |
| [Engineering Handbook](./APZHUB-Engineering-Handbook.md)                                     | Day-to-day engineering     |
| [Platform Reference Architecture](../architecture/APZHUB-Platform-Reference-Architecture.md) | Architecture consolidation |
| [Platform Roadmap v2](../roadmap/APZHUB-Platform-Roadmap-v2.md)                              | Future milestones          |

---

_APZHUB Platform Governance — Version 2.0._
