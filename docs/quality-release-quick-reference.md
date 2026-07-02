# APZHUB quality & release quick reference

Derived lookup for [015](./015-software-quality-testing-qa-cicd-release-management-framework.md).

> **Document Version:** 1.0 · **Classification:** Core Engineering Standard · **Status:** Mandatory  
> For full lifecycle, release management, defect tracking, metrics, and acceptance criteria, read the complete document.

## Philosophy

Quality is a **platform capability** — begins before development; testing is part of development, not a separate phase. **Skipping lifecycle stages is prohibited.**

## Feature lifecycle (mandatory sequence)

Requirements → Architecture → Design → Implementation → Unit → Component → Integration → API → E2E → Regression → Performance → Security → Documentation → Approval → Release

## Definition of Done (all required)

Requirements + architecture approved · code complete + reviewed · unit/integration/API/Playwright/regression pass · accessibility verified · docs complete · no critical defects · merged to main

## Test pyramid (majority at bottom)

Unit → Component → Integration → API → E2E → Manual (when required)

## Unit tests

Every business rule · fast · independent · repeatable · deterministic · no external deps · mock externals (003 domain/application, 009 services)

## Component tests

Every reusable Design System component in isolation — buttons, tables, forms, dialogs, panels, tabs, command palette, notifications (006, `/packages` 004)

## Integration tests

Module · service · connector · PostgreSQL · Redis · search · auth — realistic scenarios (007, 008)

## API tests (every endpoint)

Success · validation · permission · failure · rate limit · version · authentication — stable contracts (010, 013)

## Playwright E2E (every critical journey)

Login/logout/password reset · create project · assign task · upload document · support request · workflow approval · search · notifications · role changes · provisioning — permission-driven UI (005), SSO (007)

## Regression

Full pyramid re-run every release — **failures block release**

## Accessibility (release gate)

Keyboard · focus order · ARIA · contrast · screen readers · reduced motion — WCAG AA (004, 006)

## Performance testing

API latency · DB · connectors · large datasets · bulk ops · search · dashboards · background jobs — detect regressions (014)

## Security testing (continuous)

Auth · permissions · CSRF · XSS · input validation · dependency scan · secret detection (013)

## Test data

Repeatable · version controlled · independent · anonymised · disposable — **never production data directly**

## Environments

Development · integration · QA · UAT · staging · production — consistent; respect legacy host coexistence ([ENVIRONMENT.md](../ENVIRONMENT.md))

## CI (every commit — no failing build on main)

Dependency validation · format · lint · typecheck · build · unit · integration · API · Playwright · security checks · artifacts (004: pnpm, ESLint, Prettier, TS strict)

## CD

Dev · test · staging · prod · rollback · blue-green/canary (future) — repeatable

## Code review (every PR)

Architecture · readability · maintainability · security · testing · performance · documentation — **no direct commits to protected main** — compliance with docs 001–014

## Quality gates (mandatory)

Build · lint · types · tests · security · docs updated · architecture compliance

## Branch strategy

`main` · `develop` · `feature/*` · `bugfix/*` · `release/*` · `hotfix/*` — branch protection

## Versioning

SemVer platform release; **independent** module and connector versions (008, 010)

## Release package

Release notes · migration notes · DB/config changes · known issues · rollback procedure · approval — reproducible (011 migrations)

## Defects (record all)

Severity · priority · module/service/connector · steps · expected/actual · root cause · resolution

## Technical debt (explicit only)

Reason · impact · owner · effort · target resolution — no hidden debt (004)

## Documentation per feature

Requirements · architecture · API · user · admin · developer · testing — sync with code (`docs/` suite)

## Production release checklist (none skippable)

All tests · security · docs · migration verified · rollback tested · monitoring configured · health validated · approval (014)

## Quality metrics

Coverage · build success · deployment frequency · lead time · change failure rate · MTTR · defect density · test duration

## Self-hosted OSS tooling (no mandatory commercial CI/CD)

Playwright · Vitest · ESLint · self-hosted GitHub Actions runners · Kiwi TCMS (test mgmt OSS) · SonarQube CE (optional) · OpenTelemetry — Kiwi TCMS engine vs APZHUB Testing module UX (002, 008)

## Acceptance (summary)

Full lifecycle enforced · automated protection of critical paths · repeatable auditable releases · quality gates on main · docs in sync · OSS self-hosted toolchain · continuous quality measurement
