# APZHUB Engineering Handbook

> **Audience:** Engineers joining the project  
> **Authority:** [Architecture Baseline v1.0](../architecture/APZHUB-Architecture-Baseline-v1.0.md) · [Document 000](../000-apzhub-engineering-constitution.md)  
> **Status:** Active — permanent engineering reference

---

## Welcome

APZHUB is an enterprise operating platform built as a TypeScript monorepo. You will work across three primary layers:

1. **Platform Runtime** — starts and registers capabilities (no React)
2. **Workbench Framework** — orchestrates the desktop shell (React)
3. **Capabilities** — manifests + services that deliver features

Read [Document 000](../000-apzhub-engineering-constitution.md) first. This handbook explains **how we build**.

---

## How APZHUB is built

### Monorepo layout

```text
apps/web/              Next.js application
packages/
  platform-runtime/    Runtime engine
  workbench-framework/ Workbench layer
  command-framework/   Action Framework (M4)
  ui/                  Design system
  workspace/           Desktop Shell
  auth/                Authentication
  sdk/                 Platform SDK
services/              Platform services (YAML manifests)
integrations/          Integration adapters
events/                Platform events
docs/                  Foundation docs, ADRs, architecture, governance
testing/               Playwright E2E, fixtures
```

### Build order (non-negotiable)

```text
Design System + Desktop Shell (SPR-001)
        ↓
Platform Runtime (SPR-002)
        ↓
Workbench Framework (SPR-003)
        ↓
Action Framework (SPR-004)
        ↓
Platform Capabilities (Sprint 005+)
        ↓
Business Capabilities (Milestone 9+)
```

Never skip layers. Never add business modules before platform infrastructure is ready.

### Daily commands

```bash
pnpm install
pnpm dev          # Start Next.js
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm build
```

See [getting-started.md](../developer/getting-started.md).

---

## How new capabilities are added

1. **Write the manifest** — YAML declaring id, kind, version, dependencies, workbench blocks.
2. **Place in discovery root** — `packages/`, `services/`, `integrations/`, or `events/`.
3. **Implement capability code** — service logic in Platform Services; UI via Workbench API only.
4. **Declare permissions** — permission keys in manifest; no hardcoded checks.
5. **Add tests** — unit for logic; E2E if user-visible navigation changes.
6. **Document** — architecture note, developer guide update if pattern is new.
7. **ADR if needed** — new kind, API change, or baseline exception.

Capabilities **never**:

- Import Workbench engines directly
- Call backend engines from React components
- Hardcode navigation or permissions
- Bypass the Request Bus

See [Capability Development Guide](./APZHUB-Capability-Development-Guide.md).

---

## How manifests work

Manifests are the **source of truth** for capability registration.

- **Format:** YAML on filesystem
- **Validation:** Manifest Engine (Zod schemas)
- **Normalisation:** Platform Manifest Envelope internally
- **Workbench blocks:** `workbench.navigation`, `workbench.view`, `workbench.actions`, `workbench.toolbar`

Runtime discovers manifests at bootstrap. Workbench hydrates from **permission-filtered registry DTO** on the server. Action Framework hydrates from **permission-filtered Action Registry DTO** in parallel (AF-020).

Extension rules: optional fields only for backward compatibility; breaking changes need ADR and schema version bump.

See [platform-manifest-specification.md](../architecture/platform-manifest-specification.md).

---

## How testing works

| Layer            | Test focus                                                      |
| ---------------- | --------------------------------------------------------------- |
| Runtime          | Subsystem unit tests, bootstrap integration                     |
| Workbench        | Engine tests, API tests, session restore                        |
| Action Framework | Registry, executor, bridge, surfaces, app wiring                |
| App              | E2E — login, shell, navigation, palette, actions, accessibility |
| Capability       | Service unit tests, manifest validation                         |

All PRs must pass quality gates. Coverage thresholds enforced on platform packages.

Accessibility: axe checks on login and desktop shell (no critical violations).

---

## How documentation works

| Type             | Location             |
| ---------------- | -------------------- |
| Foundation specs | `docs/001–029`       |
| Constitution     | `docs/000`           |
| Architecture     | `docs/architecture/` |
| ADRs             | `docs/adr/`          |
| Governance       | `docs/governance/`   |
| Sprints          | `docs/sprint/`       |
| Reviews          | `docs/reviews/`      |
| Releases         | `docs/releases/`     |

**Rule:** A feature without documentation is incomplete. Update CHANGELOG for user-visible changes.

---

## How reviews work

Sprints follow phased delivery (ADR-0017):

```text
Phase N implementation → Phase N report → Owner approval → Phase N+1
```

At sprint closeout:

- Architecture review (subsystem compliance)
- Milestone review (verdict: PASS / PASS WITH OBSERVATIONS / FAIL)
- Release notes and CHANGELOG

Baseline changes require ADR — not informal doc edits to the frozen baseline.

---

## How releases work

1. Sprint closeout complete
2. All quality gates pass
3. Release notes prepared (`docs/releases/v{version}-{theme}.md`)
4. Owner approves
5. Tag created (owner instruction only) — e.g. `v0.3.0-workbench-framework`

Do not tag without owner approval.

---

## Which guide to read

| You are working on…           | Read                                                                                                                              |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Runtime subsystems            | [Runtime Development Guide](./APZHUB-Runtime-Development-Guide.md)                                                                |
| Workbench / shell             | [Workbench Development Guide](./APZHUB-Workbench-Development-Guide.md)                                                            |
| Actions / palette / shortcuts | [Action Framework architecture](../architecture/command-framework.md) · [Onboarding](../developer/action-framework-onboarding.md) |
| New capability                | [Capability Development Guide](./APZHUB-Capability-Development-Guide.md)                                                          |
| Architecture decisions        | [Architecture Baseline v1.0](../architecture/APZHUB-Architecture-Baseline-v1.0.md)                                                |
| Sprint planning               | `docs/sprint/SPR-NNN-*.md`                                                                                                        |

---

## Quick reference — API layers

```text
Runtime API     →  server bootstrap, ops
Workbench API   →  shell UI, capability views
Capability API  →  manifests, services, SDKs
```

Capabilities publish **Workbench Requests**. They do not call engines.

---

_APZHUB Engineering Handbook — for engineers building the platform._
