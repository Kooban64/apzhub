# APZHUB AI Engineering Standards

> **Purpose:** Coding, architecture, documentation, testing, and review expectations for AI agents  
> **Audience:** AI coding agents  
> **Authoritative references:** [015 — Quality Framework](../015-software-quality-testing-qa-cicd-release-management-framework.md) · [004 — Technology Stack](../004-technology-stack-repository-standards-development-environment.md) · [AI-CONTEXT](./AI-CONTEXT.md)  
> **Related documents:** [AI-WORKFLOW](./AI-WORKFLOW.md) · [ENGINEERING-HANDBOOK](./ENGINEERING-HANDBOOK.md)  
> **Reading order:** After AI-CONTEXT  
> **Last updated:** 2026-07-10  
> **Current status:** Active

---

## Coding expectations

| Standard | Requirement |
|----------|-------------|
| Language | TypeScript strict — no `any` |
| Style | Match surrounding code — naming, imports, abstractions |
| Scope | Minimal diff — only change what the milestone requires |
| UI | Design tokens only; shadcn/ui + Tailwind; Lucide icons |
| Errors | Structured envelopes; safe to log; no secrets |
| Logging | Structured; correlation IDs; no credential values |
| Comments | Only for non-obvious business logic |
| Dependencies | Published SDKs only; no module-to-module coupling |

---

## Architecture expectations

| Rule | Enforcement |
|------|-------------|
| Layered architecture | No bypassing — see [003](../003-overall-system-architecture-design-principles.md) |
| Manifest first | YAML before code for modules, services, integrations, events |
| Platform Service boundary | Business logic in services only |
| Adapter boundary | Connectors translate; never expose raw engine errors |
| Credential boundary | Integration SDK owns auth; services never touch secrets |
| Event-driven side effects | Publish events; never direct notify/search/audit |
| Tenant isolation | Scope all connections and data operations |
| Permission-driven UI | Filter by PermissionService; server authoritative |

Before proposing new patterns, check existing architecture docs and ADRs.

---

## Documentation expectations

| Deliverable | When |
|-------------|------|
| Completion report | Every milestone — `docs/sprint/{ID}-completion-report.md` |
| Architecture update | When architecture changes |
| Spec update | When contracts change |
| Package README | When package API changes |
| Backlog status | Mark milestone complete |
| CHANGELOG entry | Significant releases |
| Index updates | `docs/README.md`, relevant indexes |

Every document must include: Purpose, Audience, Authoritative references, Related documents, Last updated, Status.

Prefer links over duplication. Identify canonical source.

---

## Testing expectations

| Level | Tool | Requirement |
|-------|------|-------------|
| Unit | Vitest | Every package — real behaviour, not trivial asserts |
| Component | Testing Library | UI packages |
| Integration | Vitest | Bootstrap, workflows, service paths |
| E2E | Playwright | Shell and critical user paths when UI affected |
| Coverage | vitest --coverage | Run at milestone completion |
| Regression | Existing suite | All tests must remain green |

Do not add tests that trivially assert the obvious unless requested.

---

## Review expectations

Before marking a milestone complete:

| Check | Action |
|-------|--------|
| Architecture compliance | No layer bypassing; manifest first |
| Security | No credential leakage; auth/authz present |
| Terminology | APZHUB names only in user-facing content |
| Backwards compatibility | Existing exports unchanged unless approved |
| Quality gates | lint, typecheck, build, test, coverage — all pass |
| Scope | Only approved milestone scope — nothing extra |
| Stop condition | Stop at sprint boundary; do not begin next milestone |

---

## Completion report expectations

Every completion report must include:

1. **Objective** — what was requested
2. **Delivered** — files, packages, exports, tests
3. **Completion review** — criteria table with pass/fail
4. **Constraints confirmed** — what was explicitly excluded
5. **Quality gates** — actual results
6. **Stop condition** — what awaits owner approval next
7. **Recommended next scope** — suggest but do not implement

Template: existing reports in `docs/sprint/`.

---

## AI-specific rules

| Rule | Detail |
|------|--------|
| Do not invent architecture | Capture current state; reference authoritative docs |
| Do not redesign | Consolidate and preserve, not reinterpret |
| Do not start blocked work | Check CURRENT-MILESTONE |
| Do not commit unless asked | User rule |
| Do not create PR unless asked | User rule |
| Read skills when relevant | Cursor skills in `.cursor/skills-cursor/` |
| Run quality gates | Do not claim complete without running them |
| Report blockers honestly | Stop and report rather than improvising |
