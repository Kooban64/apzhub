# APZHUB BUILD-001 quick reference

Derived lookup for [BUILD-001](./build/BUILD-001-repository-bootstrap-guide.md).

> **Build Guide 001 · Approved for Execution**  
> **Before:** nothing · **After:** SPR-001 · **Constitution:** [000](./000-apzhub-engineering-constitution.md)

## Objective

Monorepo skeleton only — **no business features**, no auth/DB/Docker/shell (those are SPR-001)

## Repo name

`apzhub` (pnpm workspace)

## Folder structure

```
apps/ packages/ services/ integrations/ events/ infrastructure/ testing/ scripts/
docs/{architecture,developer,sdk,sprint,build,decisions,diagrams}/ .github/
```

## Package manager

**pnpm only** (004)

## Workspace files

package.json · pnpm-workspace.yaml · tsconfig.base.json · .editorconfig · .gitignore · README.md

## Workspace globs

`apps/*` `packages/*` `services/*` `integrations/*` `events/*`

## App

`apps/web` — Next.js · React · TS · App Router · Tailwind

## Package shells (empty)

ui · types · config · theme · auth · sdk · workspace · events · search · notifications · shared — each: package.json · src/index.ts · README.md

## Infrastructure folders (empty)

docker · caddy · postgres · redis under `infrastructure/`

## Testing folders

playwright · fixtures · accessibility · performance under `testing/`

## Root scripts

dev · build · lint · typecheck · test · test:e2e · format · storybook

## GitHub scaffold

PR template · ISSUE_TEMPLATE · workflows/

## Doc migration (Section 13 — on execution)

Move 000–023 → `docs/architecture/` · 024–029 → `docs/sdk/` · sprints → `docs/sprint/` · build → `docs/build/` — update links/index; until then files stay at `docs/` root

## Cursor must do

1. Structure 2. pnpm 3. Next.js app 4. package shells 5. TS base 6. lint/format 7. READMEs 8. **STOP**

## Cursor must NOT do

Auth · DB · Redis · Docker · shell · modules · integrations · business logic

## Done when

Structure exists · pnpm works · apps/web builds · package shells exist · TS/lint/scripts exist · doc folders exist · `pnpm install` + `pnpm build` succeed · zero business functionality
