# Changelog

All notable changes to APZHUB are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.3.0-workbench-framework] — Milestone 3 Complete

See [Milestone 3 review](./docs/reviews/MILESTONE-003-workbench-framework-review.md) and [release notes](./docs/releases/v0.3.0-workbench-framework.md).

## [0.6.0-event-notification-framework] — Milestone 6 Complete

See [Milestone 6 review](./docs/reviews/MILESTONE-006-event-notification-framework-review.md) and [release notes](./docs/releases/v0.6.0-event-notification-framework.md).

### Added (Sprint 006 summary)

- `@apzhub/event-notification-framework` — Event Registry, Event Bus, Notification Registry, Mapper, Service, Presentation Layer
- Notification Experiences — Badge and Panel; Action audit → in-app notifications
- ADRs 0030–0032 · 1098 unit tests, 30 E2E tests, 90.75% coverage
- [SPR-006 closeout](./docs/sprint/SPR-006-closeout.md)

## [Unreleased] — M16 Platform Engineering Review + LAW-015 Trust Accounting (Closed)

### Added (M16 — Platform Stabilisation & Engineering Review — documentation only)

- [APZHUB Platform Engineering Review](./docs/reviews/APZHUB-Platform-Engineering-Review.md) — subsystem ratings across M1–M7 + Law + Trust
- [APZHUB Platform Dependency Review](./docs/architecture/APZHUB-Platform-Dependency-Review.md) — package boundaries, layering, platform vs product
- [APZHUB Platform Duplication Review](./docs/architecture/APZHUB-Platform-Duplication-Review.md) — consolidation recommendations
- [APZHUB Platform Naming Review](./docs/architecture/APZHUB-Platform-Naming-Review.md) — naming standards
- [APZHUB Platform Security Review](./docs/architecture/APZHUB-Platform-Security-Review.md) — security area ratings
- [APZHUB Platform Performance Review](./docs/architecture/APZHUB-Platform-Performance-Review.md) — optimisation recommendations
- [APZHUB Platform Testing Review](./docs/architecture/APZHUB-Platform-Testing-Review.md) — test pyramid and CI readiness
- [APZHUB Platform Documentation Review](./docs/architecture/APZHUB-Platform-Documentation-Review.md) — documentation gaps
- [APZHUB Platform Technical Debt Register](./docs/architecture/APZHUB-Platform-Technical-Debt-Register.md) — consolidated cross-platform debt
- [APZHUB Platform Roadmap Review](./docs/architecture/APZHUB-Platform-Roadmap-Review.md) — updated roadmap
- [APZHUB Commercial Readiness Assessment](./docs/reviews/APZHUB-Commercial-Readiness-Assessment.md) — deployment tier ratings
- [APZHUB v6.0 Architecture Review](./docs/reviews/APZHUB-v6.0-Architecture-Review.md) — **Verdict: VERY GOOD**
- [APZHUB v6.0 Platform Review](./docs/releases/APZHUB-v6.0-Platform-Review.md) — engineering review release (no tag)
- [M16 completion report](./docs/sprint/M16-completion-report.md)
- **Verdict:** M16 COMPLETE — await owner approval before M8, refactoring, or new implementation
- **Baseline tag:** `v6.0-platform-review` — preserve before M8
- **No production code** — analysis and governance only

### Added (LAW-015-01 — documentation only)

- [LAW Trust Accounting Reference Architecture](./docs/architecture/LAW-Trust-Accounting-Reference-Architecture.md) — canonical trust subsystem architecture
- [LAW Trust Domain Model](./docs/architecture/LAW-Trust-Domain-Model.md) — entities, aggregates, immutability, lifecycles
- [LAW Trust Accounting Specification](./docs/specs/LAW-Trust-Accounting-Specification.md) — posting rules, compliance profiles
- [LAW Trust Events](./docs/specs/LAW-Trust-Events.md) — `legal.trust.*` event catalogue
- [LAW Trust Permissions](./docs/specs/LAW-Trust-Permissions.md) — `legal.trust.*` permission keys
- [LAW Trust Workbench Planning](./docs/specs/LAW-Trust-Workbench-Planning.md) — future workbench modules
- [LAW-015 Backlog](./docs/backlog/LAW-015-Trust-Accounting-Backlog.md) — LAW-015-02 through LAW-015-15
- [LAW-015 Readiness Review](./docs/reviews/LAW-015-Trust-Accounting-Readiness.md) — APPROVED FOR IMPLEMENTATION PLANNING
- [LAW Architecture Index](./docs/architecture/LAW-Architecture-Index.md) — Law Platform architecture registry
- ADRs 0036–0039 — trust capability, immutable journal, matter segregation, compliance profiles
- **Verdict:** PLANNING COMPLETE — await owner approval before LAW-015-02 (Trust Ledger Engine)
- **No production code** — UI, persistence, APIs, calculations not implemented

### Added (LAW-015-02 — in-memory Trust Ledger Engine)

- `apps/law-platform/lib/trust/` — TrustLedgerService, InMemoryTrustLedgerRepository, double-entry posting, balance projection, diagnostics
- Foundation transaction types: opening_balance, deposit, withdrawal, adjustment, reversal
- In-memory domain events: `legal.trust.ledger.opened`, `legal.trust.transaction.posted`, `legal.trust.transaction.reversed`
- 14 unit tests · [LAW-015-02 completion report](./docs/sprint/LAW-015-02-completion-report.md)
- **Verdict:** IN-MEMORY LEDGER ENGINE COMPLETE — await owner approval before LAW-015-03
- No UI, APIs, persistence, reconciliation, interest, or reporting

### Added (LAW-015-03 — Trust Transaction Workflow)

- `TrustTransactionWorkflowService` — draft lifecycle, validation, idempotent post, reversal, audit
- In-memory draft and audit repositories; workflow domain events
- 11 workflow unit tests (25 total trust module) · [LAW-015-03 completion report](./docs/sprint/LAW-015-03-completion-report.md)
- **Verdict:** WORKFLOW LAYER COMPLETE — await owner approval before LAW-015-04

### Added (LAW-015-04 — Trust Allocations)

- `TrustAllocationService` — client/matter/split/unallocated/adjustment/reversal allocations
- Append-only allocation repository; balance projections; allocation diagnostics
- In-memory domain events: `legal.trust.allocation.created`, `.updated`, `.reversed`
- 13 allocation unit tests (38 total trust module) · [LAW-015-04 completion report](./docs/sprint/LAW-015-04-completion-report.md)
- **Verdict:** ALLOCATION LAYER COMPLETE — await owner approval before LAW-015-05
- No UI, APIs, persistence, reconciliation, interest, or reporting

### Added (LAW-015-05 — Trust Reconciliation Engine)

- `TrustReconciliationService` — read-only ledger vs allocation reconciliation, variance detection, immutable run records
- Pure reconciliation engine; append-only run repository; reconciliation diagnostics
- In-memory domain events: `legal.trust.reconciliation.started`, `.completed`, `.failed`
- 12 reconciliation unit tests (50 total trust module) · [LAW-015-05 completion report](./docs/sprint/LAW-015-05-completion-report.md)
- **Verdict:** RECONCILIATION ENGINE COMPLETE — await owner approval before LAW-015-06
- No UI, APIs, persistence, bank feed import, interest, or reporting

### Added (LAW-015-06 — Trust Interest)

- `TrustInterestService` — interest calculation policies, accrual engine, draft → approved → posted workflow
- Pure accrual engine (`simple_daily`, `simple_monthly`); rule and posting repositories; interest diagnostics
- Ledger `interest` transaction type with expense/liability postings; per-line allocation on post
- In-memory domain events: `legal.trust.interest.accrued`, `.approved`, `.posted`
- 12 interest unit tests (62 total trust module) · [LAW-015-06 completion report](./docs/sprint/LAW-015-06-completion-report.md)
- **Verdict:** INTEREST ENGINE COMPLETE — await owner approval before LAW-015-07
- No UI, APIs, persistence, bank integration, reporting, or external rate sources

### Added (LAW-015-07 — Trust Transfer Engine)

- `TrustTransferService` — controlled fund movement via draft → approve → post workflow with reversal and cancellation
- Paired `transfer_out` / `transfer_in` ledger postings through `TrustLedgerService`; append-only allocation updates
- Transfer types: matter↔matter, client↔client, account↔account, allocation correction, reversal
- In-memory domain events: `legal.trust.transfer.created`, `.approved`, `.posted`, `.reversed`
- 12 transfer unit tests (74 total trust module) · [LAW-015-07 completion report](./docs/sprint/LAW-015-07-completion-report.md)
- **Verdict:** TRANSFER ENGINE COMPLETE — await owner approval before LAW-015-08
- No UI, APIs, persistence, bank integration, reporting, or external accounting integration

### Added (LAW-015-08 — Trust Reporting Engine)

- `TrustReportingService` — immutable read-only report projections from accounting services only
- Ten report types: trial balance, ledger, journal, transactions, client/matter statements, allocation/interest/transfer/reconciliation summaries
- Pure report builders; in-memory report repository; reporting diagnostics
- Ledger read query methods: `listAccounts`, `getAccount`, `listTransactions`, `getBalances`
- In-memory domain event: `legal.trust.report.generated`
- 20 reporting unit tests (94 total trust module) · [LAW-015-08 completion report](./docs/sprint/LAW-015-08-completion-report.md)
- **Verdict:** REPORTING ENGINE COMPLETE — await owner approval before LAW-015-09
- No UI, APIs, persistence, PDF/Excel/CSV export, scheduled reports, email, or printing

### Added (LAW-015-09 — Trust Dashboard & Workbench UI)

- Trust Accounting workbench module — dashboard, accounts, transactions, allocations, reconciliation, interest, transfers, reports, diagnostics
- `TrustWorkbenchService` + `TrustWorkflowProvider` wiring over in-memory trust engine
- Manifest `legal-trust`, command palette actions, knowledge help, unified search source
- Routes under `/workspace/law/trust/*` using Law UX Foundation components
- 9 UI unit tests (103 total trust module) · [LAW-015-09 completion report](./docs/sprint/LAW-015-09-completion-report.md)
- **Verdict:** TRUST WORKBENCH UI COMPLETE — await owner approval before LAW-015-10
- No APIs, persistence, exports, bank integration, or Financial Engine extraction

### Added (LAW-015-10 — Trust Approvals & Operational Controls)

- `TrustApprovalService` — configurable approval governance over trust financial actions
- Approval types: transaction, transfer, interest posting, allocation adjustment
- Rule modes: no approval, single, dual, threshold-based, role-based
- Append-only approval history; in-memory events (`legal.trust.approval.*`)
- Integration gate on workflow, transfer, and interest services
- 15 approval unit tests (118 total trust module) · [LAW-015-10 completion report](./docs/sprint/LAW-015-10-completion-report.md)
- **Verdict:** TRUST APPROVAL GOVERNANCE COMPLETE — await owner approval before LAW-015-11
- No APIs, persistence, email notifications, workflow designer, or bank integration

### Added (LAW-015-12 — Trust Reports Export Pack)

- CSV and print-friendly HTML export for all ten Trust report types via `trust-report-export.ts`
- REST export route `GET /api/law/v1/trust/reports/{reportId}/export?format=csv|html` (PDF placeholder returns 422)
- Trust Reports workbench: Export CSV and Print View buttons
- 28 new tests (export serializers, API, UI) · [LAW-015-12 completion report](./docs/sprint/LAW-015-12-completion-report.md)
- **Verdict:** TRUST REPORT EXPORTS COMPLETE — await owner approval before bank integration, scheduled reporting, outbox workers, or Financial Engine extraction
- No PDF/Excel engines, scheduled reports, email delivery, bank feeds, or accounting integration

### Added (LAW-015-11 — Trust Persistence & REST APIs)

- PostgreSQL persistence for trust accounts, transactions, journal entries, balances, drafts, allocations, transfers, approvals, interest, reconciliation, reports
- Migrations `0009_law_trust`, `0010_law_trust_rls`; Drizzle schema and `PostgresTrustStore`
- REST API under `/api/law/v1/trust/*` — accounts, transactions, allocations, reconciliation, interest, transfers, approvals, reports, diagnostics
- Outbox rows for `legal.trust.account.*` and `legal.trust.transaction.*` (no workers)
- Memory mode preserved via `LAW_REPOSITORY_MODE=memory`
- 14 new tests (Trust API, parity, postgres isolation/outbox) · [LAW-015-11 completion report](./docs/sprint/LAW-015-11-completion-report.md)
- **Verdict:** TRUST PERSISTENCE AND REST APIs COMPLETE — await owner approval before exports, bank integration, outbox workers, or Financial Engine extraction
- No PDF/Excel exports, bank feeds, payment gateway, or accounting integration

### Added (LAW-015-12 — Trust Reports Export Pack)

- CSV and print-friendly HTML export for all ten Trust report types via `trust-report-export.ts`
- REST export route `GET /api/law/v1/trust/reports/{reportId}/export?format=csv|html` (PDF returns 422 placeholder)
- Trust Reports workbench: Export CSV and Print View buttons after report generation
- 28 new tests (export serializers, API, UI) · [LAW-015-12 completion report](./docs/sprint/LAW-015-12-completion-report.md)
- **Verdict:** TRUST REPORT EXPORTS COMPLETE — await owner approval before bank integration, scheduled reporting, outbox workers, or Financial Engine extraction
- No PDF/Excel engines, scheduled reports, email delivery, bank feeds, or accounting integration

### Added (LAW-015-13 — Trust Accounting E2E Validation)

- Playwright trust workflow spec (`law-015-trust-workflow.spec.ts`) and law-platform config (`playwright.law.config.ts`)
- REST workflow validation test chaining account → transaction → reconciliation → interest → transfer → report → export
- API, UI, and E2E validation matrices · [LAW-015-13 completion report](./docs/sprint/LAW-015-13-completion-report.md)
- Route fix: unified `[trustTransactionId]` for post + reverse endpoints
- Workbench client bundle fix: in-memory repositories in browser executor path
- **Verdict:** TRUST E2E VALIDATION DELIVERED — Playwright execution blocked by environment (law-platform client bundle)

### Added (LAW-015-14 — Trust Accounting Milestone Closeout)

- [LAW Trust Reference Architecture](./docs/architecture/LAW-Trust-Reference-Architecture.md) — final as-built reference (ledger, workflow, allocations, reconciliation, interest, transfers, reporting, approvals, APIs, workbench)
- [LAW Trust Domain Reference](./docs/architecture/LAW-Trust-Domain-Reference.md) — canonical aggregates, entities, value objects, events, state machines
- [LAW Trust Developer Guide](./docs/developer/LAW-Trust-Developer-Guide.md) — service boundaries, repository model, API usage, extension points
- [LAW Trust Operations Guide](./docs/operator/LAW-Trust-Operations-Guide.md) — daily ops, reconciliation, approvals, diagnostics, troubleshooting
- [LAW-015 Trust Accounting Review](./docs/reviews/LAW-015-Trust-Accounting-Review.md) — **Verdict: PASS WITH OBSERVATIONS**
- [LAW Trust v1.0 release notes](./docs/releases/LAW-Trust-v1.0.md) — milestone summary (no release tag)
- [LAW-015-14 completion report](./docs/sprint/LAW-015-14-completion-report.md)
- **Verdict:** TRUST ACCOUNTING MILESTONE CLOSED — await owner approval before Financial Engine extraction, banking, Phase 2, or new implementation
- **No production code** — documentation and governance only

### Added (FIN-001 — APZOR Financial Engine architecture extraction — planning only)

- [APZOR Financial Engine Reference Architecture](./docs/architecture/APZOR-Financial-Engine-Reference-Architecture.md) — purpose, layering, boundaries, extension model
- [APZOR Financial Engine Domain Model](./docs/architecture/APZOR-Financial-Engine-Domain-Model.md) — canonical generic financial domain
- [APZOR Financial vs Law Separation](./docs/architecture/APZOR-Financial-vs-Law-Separation.md) — complete component separation matrix
- [APZOR Financial Integration Model](./docs/architecture/APZOR-Financial-Integration-Model.md) — Law, Bank, Exchange, Wallet, Escrow integration patterns
- [APZOR Financial Extraction Plan](./docs/architecture/APZOR-Financial-Extraction-Plan.md) — phased migration plan (not executed)
- [FIN-001 Architecture Review](./docs/reviews/FIN-001-Architecture-Review.md) — **Verdict: DEFER EXTRACTION**
- [FIN-001 completion report](./docs/sprint/FIN-001-completion-report.md)
- **No production code** — no packages, refactoring, APIs, UI, persistence, or Platform changes

## [Platform Validation Phase 1] — Law Firm Platform Planning

See [Law Platform v1.0](./docs/releases/APZHUB-Law-Platform-v1.0.md) · [Law Platform Readiness](./docs/reviews/APZHUB-Law-Platform-Readiness.md) · [Law Platform Backlog](./docs/backlog/LAW-Platform-Backlog.md).

### Added (Phase 1 planning — documentation only)

- Law Firm Platform v1.0 planning baseline
- Law Platform reference architecture and capability map
- Law Platform validation strategy with measurable framework goals
- LAW-001 foundation sprint plan and LAW-001–LAW-012 backlog
- Law Platform readiness review — APPROVED FOR PRODUCT VALIDATION
- Platform 5.0 remains frozen; Milestone 8 not started

### Added (LAW-012 Persistence Foundation — LAW-012-02 through LAW-012-08)

- PostgreSQL persistence for Client, Matter, Document, Task, Calendar, Time, Invoice (migrations 0001–0008)
- Dual-mode repositories (`LAW_REPOSITORY_MODE=memory|postgres`), tenant context, RLS, transactional outbox
- [LAW-012-07 closeout](./docs/sprint/LAW-012-07-completion-report.md) · [LAW-012-08 quality gate fix](./docs/sprint/LAW-012-08-completion-report.md) · [Foundation review](./docs/reviews/LAW-012-persistence-foundation-review.md)
- Reference architecture, data model, technical debt register, and Phase 2 roadmap
- **1538** tests passing; primary quality gates green (lint, typecheck, build, test, coverage)
- **Verdict:** PERSISTENCE FOUNDATION CLOSED WITH OBSERVATIONS — ready for next-phase planning; not commercial GA
- E2E not completed — Playwright Chromium unavailable in current environment (environmental limitation, not a code regression)

## [Platform Version 5.0] — Permanent Architectural Baseline

See [APZHUB Platform v5.0](./docs/releases/APZHUB-Platform-v5.0.md) · [Platform v5.0 Review](./docs/reviews/APZHUB-v5.0-Platform-Review.md) · [Capability Matrix](./docs/architecture/APZHUB-Platform-Capability-Matrix.md) · [Product Validation Strategy](./docs/strategy/APZHUB-Product-Validation-Strategy.md).

### Added (Platform 5.0 declaration)

- Platform Version 5.0 release document — M1–M7 collective baseline
- Activity & Timeline Framework included in permanent baseline
- Updated Platform Reference Architecture (v5.0)
- APZHUB Platform Capability Matrix — cross-framework pattern reference
- APZHUB Product Validation Strategy — Law Firm Platform planning
- APZHUB Platform v5.0 Review — APPROVED FOR PRODUCT VALIDATION
- Milestone 8 planning — Platform Identity, Administration & UX (SPR-008)
- Platform Roadmap updated — M7 complete, M8 objectives renamed

## [0.7.0-activity-timeline-framework] — Milestone 7 Complete

See [Milestone 7 review](./docs/reviews/MILESTONE-007-activity-timeline-framework-review.md) and [release notes](./docs/releases/v0.7.0-activity-timeline-framework.md).

### Added (Sprint 007 summary)

- `@apzhub/activity-timeline-framework` — Activity Registry, Timeline Registry, Activity Mapper, Service, Presentation Layer, Timeline Experiences
- Context Panel Activity tab — `WorkbenchActivityTimeline` in `@apzhub/workspace`
- Action audit → in-app activity timeline (parallel to notifications)
- ADRs 0033–0035 · 1308 unit tests, 36 E2E tests, 90.58% coverage
- [SPR-007 closeout](./docs/sprint/SPR-007-closeout.md) · [Activity Timeline onboarding](./docs/developer/activity-timeline-onboarding.md)

## [Platform Version 4.0] — Permanent Architectural Baseline

See [APZHUB Platform v4.0](./docs/releases/APZHUB-Platform-v4.0.md) · [Platform v4.0 Review](./docs/reviews/APZHUB-v4.0-Platform-Review.md) · [Reference Patterns](./docs/architecture/APZHUB-Platform-Reference-Patterns.md).

### Added (Platform 4.0 declaration)

- Platform Version 4.0 release document — M1–M6 collective baseline
- Updated Platform Reference Architecture (v4.0)
- APZHUB Platform Reference Patterns — authoritative pattern reference
- Updated Platform Governance (v4.0)
- Milestone 7 planning — Activity & Timeline Framework (SPR-007 guide, backlog, readiness review)
- Platform Roadmap v2 updated — M6 complete, M7 objectives

## [Unreleased] — Platform Version 3.0 (historical)

### Added

- [APZHUB Platform v3.0 release](./docs/releases/APZHUB-Platform-v3.0.md) — M1–M5 collective baseline
- [Platform Design Patterns](./docs/architecture/APZHUB-Platform-Design-Patterns.md) — canonical Registry, DTO, Hydration, Service, Experience patterns
- [APZHUB v3.0 Platform Review](./docs/reviews/APZHUB-v3.0-Platform-Review.md) — PASS WITH OBSERVATIONS
- [SPR-006 Event & Notification sprint guide](./docs/sprint/SPR-006-event-notification-framework.md) — planning complete
- [SPR-006 backlog](./docs/backlog/SPR-006-event-notification-framework-backlog.md) — EN-001–EN-018
- [SPR-006 readiness review](./docs/reviews/SPR-006-readiness-review.md) — APPROVED FOR M6 PLANNING
- Platform Reference Architecture updated to v3.0
- Platform Governance updated to v3.0
- Platform Roadmap v2 — M5 complete, M6 Event & Notification Framework

## [0.5.0-knowledge-discovery-framework] — Milestone 5 Complete

See [Milestone 5 review](./docs/reviews/MILESTONE-005-knowledge-discovery-framework-review.md) and [release notes](./docs/releases/v0.5.0-knowledge-discovery-framework.md).

### Added (Sprint 005 summary)

- `@apzhub/knowledge-discovery-framework` — Knowledge Registry, providers, orchestrator, ranking engine, Knowledge Service
- Knowledge Presentation Layer — grouping, mapping, selection delegation in `@apzhub/workspace`
- Knowledge Experiences — Knowledge Overlay, Command Palette knowledge mode
- Client hydration — `KnowledgeDiscoveryProvider`, `useKnowledgeRegistry()`, `useKnowledgeService()`
- Server bootstrap — `bootstrapKnowledgeRegistry`, `filterKnowledgeSourceRegistryDto`, hydration diagnostics
- Application integration — `ActionWorkbenchShellProvider`, health `knowledge` field, dev diagnostics
- ADRs 0027–0029 — package boundaries, source model, execution routing
- 872 unit tests, 24 E2E tests, 91.55% coverage
- [SPR-005 closeout](./docs/sprint/SPR-005-closeout.md) · [Knowledge & Discovery architecture](./docs/architecture/knowledge-discovery-framework.md)

## [0.4.0-action-framework] — Milestone 4 Complete

See [Production readiness review](./docs/reviews/SPR-004-production-readiness-review.md) and [release notes](./docs/releases/v0.4.0-action-framework.md).

### Added (Sprint 004 summary)

- `@apzhub/command-framework` — ActionRegistry, DefaultActionExecutor, WorkbenchCommandBridge, ShortcutRegistry
- Workbench surfaces — Command Palette, global shortcuts, context menu, toolbar in Desktop Shell
- Platform Action Catalogue and manifest action extraction (`workbench.actions`, `workbench.toolbar`)
- Client hydration — `CommandRegistryProvider`, `useCommandRegistry`, read-only registry
- Server bootstrap — `bootstrapActionRegistry`, `filterActionRegistryDto`, hydration diagnostics
- Invocation sources and gateway stubs (AI, voice, automation)
- Application integration — `ActionWorkbenchShellProvider`, shared executor, health `commands` field
- 672 unit tests, 19 E2E tests, 91.46% coverage
- [AF-021 completion report](./docs/sprint/AF-021-completion-report.md) · [Action Framework architecture](./docs/architecture/command-framework.md)

## [0.4.0-action-framework] — Milestone 4 Complete

### Added

- [Knowledge Source Architecture](./docs/specs/SPR-005-KDF-knowledge-sources.md) — specification, taxonomy, registry integration, indexing/search overview, AI extension points
- [SPR-005 spec index](./docs/specs/SPR-005-spec-index.md)
- ADR-0027 — Knowledge & Discovery Framework package (`@apzhub/knowledge-discovery-framework`)
- ADR-0028 — Knowledge Source model and taxonomy
- ADR-0029 — Knowledge discovery execution routing (no new pipeline)
- [SPR-005 backlog](./docs/backlog/SPR-005-knowledge-discovery-framework-backlog.md) — renamed from Discovery Framework
- [DF-001 completion report](./docs/sprint/DF-001-completion-report.md)

## [Unreleased] — Sprint 004 AF-021

### Added

- [Action Framework architecture](./docs/architecture/command-framework.md)
- [Production readiness review](./docs/reviews/SPR-004-production-readiness-review.md) — READY WITH OBSERVATIONS
- [Developer onboarding — Action Framework](./docs/developer/action-framework-onboarding.md)
- [v0.4.0-action-framework release notes](./docs/releases/v0.4.0-action-framework.md)
- Governance guide updates — Engineering Handbook, Workbench, Capability, Runtime guides
- README and docs index — Milestone 4 complete
- [AF-021 completion report](./docs/sprint/AF-021-completion-report.md)

## [Unreleased] — Sprint 004 AF-020

### Added

- Action Framework application integration in `apps/web` — `ActionWorkbenchShellProvider` wires `WorkbenchProvider`, `CommandRegistryProvider`, and shared `DefaultActionExecutor`
- Parallel server hydration — `loadWorkbenchRegistryDto()` + `loadActionRegistryDto()` in `(platform)/layout`
- Workbench surfaces enabled on `DesktopShell` — Command Palette, Global Shortcuts, Context Menu, Toolbar
- `createAppActionExecutorBundle` — shared executor for Workbench API and command registry
- `WorkbenchProvider.resolveActionExecutor` hook in `@apzhub/workbench-framework`
- `createWorkbenchActionExecutorFromActionExecutor` adapter in `@apzhub/command-framework`
- Developer diagnostics — `ActionFrameworkDiagnostics` component (dev only)
- Health endpoint — `commands` field with Action Framework hydration summary (`ActionFrameworkHealthSummary`)
- Production transpilation — `@apzhub/command-framework`, `@apzhub/workbench-framework` in `next.config.ts`
- E2E suite — `spr-004-action-framework.spec.ts`
- 4 new unit tests; monorepo total **672 tests**
- [AF-020 completion report](./docs/sprint/AF-020-completion-report.md)

## [Unreleased] — Sprint 004 AF-019

### Added

- Platform Asset manifests — `platform.theme.toggle` + toolbar in `theme.yaml`; `platform.home.navigate` in `platform-home/module.yaml`
- `workbench.toolbar` schema in `@apzhub/platform-runtime` manifest engine
- `extractToolbarRegionsFromCapabilities` — toolbar extraction with orphan filtering
- Auto toolbar extraction wired into `bootstrapActionRegistryFromCapabilities`
- Hydration diagnostics — `toolbarRegionCount`, `toolbarItemCount`, `registeredShortcutCount`
- Platform asset fixtures under `packages/command-framework/fixtures/manifests/`
- Integration test — `Runtime.bootstrap()` → manifest actions, toolbar, shortcuts
- 7 new unit/integration tests; monorepo total **668 tests**
- [AF-019 completion report](./docs/sprint/AF-019-completion-report.md)
- [Platform Asset specification](./docs/specs/SPR-004-AF-platform-assets.md)
- [Platform Asset integration summary](./docs/specs/SPR-004-AF-platform-asset-integration.md)

## [Unreleased] — Sprint 004 AF-018

### Added

- Invocation Source abstraction — `SUPPORTED_INVOCATION_SOURCES`, `PLANNED_INVOCATION_SOURCES`, `resolveInvocationSourceFromActor` in `@apzhub/command-framework`
- Gateway interfaces and stubs — `AiActionGateway`, `VoiceActionGateway`, `AutomationCommandGateway`
- `createDefaultInvocationGatewayRegistry` — DI bundle for gateway stubs
- `DefaultActionExecutor` routes `ai-agent` and `voice` actors through gateways with `phase: "gateway"` diagnostics
- `ActionFrameworkContext.gateways` — composition root gateway injection
- Executor and gateway diagnostics (`buildInvocationGatewayDiagnostics`)
- 11 new unit tests; monorepo total **661 tests**
- [AF-018 completion report](./docs/sprint/AF-018-completion-report.md)
- [Invocation Source specification](./docs/specs/SPR-004-AF-invocation-sources.md)
- [Gateway architecture notes](./packages/command-framework/src/gateways/GATEWAY-ARCHITECTURE.md)

## [Unreleased] — Sprint 004 AF-017

### Added

- Toolbar region filtering — `filterToolbarRegionItems`, `sortToolbarItems` in `@apzhub/command-framework`
- `CommandRegistryProvider` exposes hydrated `toolbar` DTO; `useCommandRegistry()` adds `toolbar` and `get()`
- `Toolbar` presentational component in `@apzhub/ui`
- `ToolbarProvider`, `WorkbenchToolbar` Workbench Surface in `@apzhub/workspace`
- `DesktopShell.enableToolbar` with region and execution callback props
- `buildToolbarDiagnostics` and `TOOLBAR_SURFACE` catalogue entry
- Workbench Surface Pattern documentation (`docs/architecture/APZHUB-Workbench-Surface-Pattern.md`)
- 21 new unit/component tests; monorepo total **650 tests**
- [AF-017 completion report](./docs/sprint/AF-017-completion-report.md)
- [Toolbar specification](./docs/specs/SPR-004-AF-toolbar.md)

## [Unreleased] — Sprint 004 AF-016

### Added

- Context-aware action filtering — `filterActionsByContext`, `matchesActionContextPredicate` in `@apzhub/command-framework`
- Typed `ActionRegistry.list({ surface, selection, context })` options
- `ContextMenu` presentational component in `@apzhub/ui`
- `ContextMenuProvider`, `WorkbenchContextMenu` Workbench Surface in `@apzhub/workspace`
- `DesktopShell.enableContextMenu` with selection/context snapshot props
- `buildContextMenuDiagnostics` and `CONTEXT_MENU_SURFACE` catalogue entry
- Action Visibility extension notes (documentation only)
- 25 new unit/component tests; monorepo total **630 tests**
- [AF-016 completion report](./docs/sprint/AF-016-completion-report.md)
- [Context Menu specification](./docs/specs/SPR-004-AF-context-menu.md)

## [Unreleased] — Sprint 004 AF-015

### Added

- Global shell shortcut listener — `useGlobalShortcuts` in `@apzhub/workspace`
- `DesktopShell.enableGlobalShortcuts` — ShortcutRegistry integration via `GlobalShortcutsLayer`
- React context wiring — `shortcuts`, `shortcutDiagnostics`, `shortcutConflicts` in `CommandRegistryProvider`
- `useShortcutRegistry()` hook in `@apzhub/command-framework/react`
- `buildGlobalShortcutShellDiagnostics` — shell shortcut surface reporting
- `KEYBOARD_SHORTCUT_SURFACE` — workbench surface marked implemented
- APZHUB Registry Pattern documentation (`docs/architecture/APZHUB-Registry-Pattern.md`)
- 12 new unit/component tests; monorepo total **605 tests**
- [AF-015 completion report](./docs/sprint/AF-015-completion-report.md)
- [Shortcut integration summary](./docs/specs/SPR-004-AF-shortcut-integration.md)

## [Unreleased] — Sprint 004 AF-014

### Added

- `ShortcutRegistry` in `@apzhub/command-framework` — chord → action id mapping with conflict detection
- Chord normalisation (`normaliseChord`, `chordFromKeyboardEvent`) — canonical `Alt+Ctrl+Meta+Shift+Key` form
- `registerShortcutsFromActions` / `bootstrapShortcutRegistry` — manifest `shortcut` field support
- `ActionFrameworkContext.shortcuts` — dependency injection root
- Shortcut hydration in `bootstrapActionRegistry` and `createCommandRegistryFromDto`
- Workbench API integration helpers — `resolveShortcutActionId`, `executeShortcutViaWorkbenchApi`
- Input Framework extension notes (`packages/command-framework/src/shortcuts/INPUT-FRAMEWORK.md`)
- 17 new unit/integration tests; monorepo total **593 tests**
- [AF-014 completion report](./docs/sprint/AF-014-completion-report.md)
- [Shortcut Registry specification](./docs/specs/SPR-004-AF-shortcut-registry.md)

## [Unreleased] — Sprint 004 AF-013

### Added

- Command Palette presentation enhancement — icons, descriptions, shortcut badges, disabled rows, group separators
- Optional pinned actions via `pinnedActionIds` on `WorkbenchCommandPalette`
- Enhanced empty and loading states (`CommandPaletteEmptyState`, `CommandPaletteLoadingState`)
- `buildCommandPaletteRows` — pinned and group section layout in `@apzhub/ui`
- `description` and `disabled` optional fields on `ActionDescriptor` and workbench manifest schema
- Ranking strategy extension documentation (`packages/workspace/src/command-palette/RANKING-STRATEGY.md`)
- 15 new unit/component tests; monorepo total **576 tests**
- [AF-013 completion report](./docs/sprint/AF-013-completion-report.md)

## [Unreleased] — Sprint 004 AF-012

### Added

- Global Command Palette shortcut — `Ctrl+Shift+P` (Windows/Linux) / `Cmd+Shift+P` (macOS)
- `useCommandPaletteShortcut` with focus/input safety for unrelated editable fields
- Fuzzy search ranking (`searchActionDescriptors`) in `@apzhub/command-framework`
- Debounced palette query filtering (`COMMAND_PALETTE_QUERY_DEBOUNCE_MS = 75`)
- 17 new unit/component tests; monorepo total 561 tests
- [AF-012 completion report](./docs/sprint/AF-012-completion-report.md)

## [Unreleased] — Sprint 004 AF-011

### Added

- `CommandPalette` presentational component in `@apzhub/ui` — modal, listbox, keyboard navigation
- `WorkbenchCommandPalette` Workbench Surface in `@apzhub/workspace` — consumes `useCommandRegistry()`
- `useCommandPaletteState` — open/close and query state (controlled/uncontrolled)
- `buildCommandPaletteDiagnostics` — surface execution and registry reporting
- `WORKBENCH_SURFACES` catalogue — Command Palette implemented; toolbar/context menu/etc. planned
- `DesktopShell.enableCommandPalette` — optional palette mount
- 18 new unit/component tests; monorepo total 527 tests
- Post-review correction: +17 workbench-framework branch tests; monorepo total **544 tests**; all coverage gates pass
- [AF-011 completion report](./docs/sprint/AF-011-completion-report.md)

## [Unreleased] — Sprint 004 AF-010

### Added

- `createCommandRegistryFromDto()` — hydrate read-only client registry from server DTO
- `ClientActionRegistry` / `ReadOnlyActionRegistry` — no register, replace, or mutation APIs
- `CommandRegistryProvider` + `useCommandRegistry()` React hook (`commands`, `list`, `execute`, `isReady`)
- Client registry diagnostics with platform/capability split and synchronisation extension points
- DTO validation with structured error reporting for invalid payloads
- 19 new unit/component tests; monorepo total 509 tests
- [AF-010 completion report](./docs/sprint/AF-010-completion-report.md)

## [Unreleased] — Sprint 004 AF-009

### Added

- Platform Action Catalogue — 8 built-in workbench actions from `REQUEST_COMMAND_MAP`
- `registerPlatformActionCatalogue` / `bootstrapActionRegistry` — automatic platform bootstrap
- Platform vs capability action distinction in registry and hydration diagnostics
- `version` metadata on `ActionDescriptor` (platform release or capability version)
- `recordPlatformCatalogue` registry diagnostics (`platformActionCount`, `platformActionIds`, etc.)
- 12 new unit tests; monorepo total 490 tests
- [AF-009 completion report](./docs/sprint/AF-009-completion-report.md)

## [Unreleased] — Sprint 004 AF-008

### Added

- Optional `WorkbenchActionExecutor` injection in `createWorkbenchAPI` and `createWorkbenchRequestBus`
- `ActionInvocationService` foundation with documented extension points
- `createWorkbenchActionExecutorAdapter` — bridge + executor + bus publication wiring
- `executeSync` on `DefaultActionExecutor` for synchronous Workbench API contract
- Action execution and invocation diagnostics on `WorkbenchDiagnosticsSnapshot`
- 21 new unit tests; monorepo total 478 tests
- [AF-008 completion report](./docs/sprint/AF-008-completion-report.md)

## [Unreleased] — Sprint 004 AF-007

### Added

- `DefaultWorkbenchCommandBridge` — maps all `REQUEST_COMMAND_MAP` action ids to Workbench actions/requests
- `ActionWorkbenchCommandBridge` interface with `toRequest`, `supports`, diagnostics
- Canonical execution pipeline documentation
- 14 new unit tests; monorepo total 471 tests
- [AF-007 completion report](./docs/sprint/AF-007-completion-report.md)

## [Unreleased] — Sprint 004 AF-006

### Added

- `DefaultActionExecutor` — registry lookup, permission gate, handler dispatch, audit hook
- Structured `ActionResult` with status, code, payload, diagnostics, duration, auditReference
- `ActionContext` extension points (tenant, correlation, trace, locale, timezone, cancellation)
- Actor model: `user` and `system` (allow list); `ai-agent` / `voice` stubs
- 9 new unit tests; monorepo total 457 tests
- [AF-006 completion report](./docs/sprint/AF-006-completion-report.md)

## [Unreleased] — Sprint 004 AF-005

### Added

- `filterActionRegistryDto()` — permission-aware server filter via `WorkbenchPermissionAdapter`
- `bootstrapActionRegistryFromCapabilities()`, `mapPlatformCapabilitiesToActionRecords()`
- `buildActionRegistryHydrationDiagnostics()` — registered, filtered, manifest capability counts
- `apps/web/lib/command-hydration.ts` — bootstrap integration mirroring workbench hydration
- Stable action identity registry contract (documentation)
- 12 new unit tests; monorepo total 448 tests
- [AF-005 completion report](./docs/sprint/AF-005-completion-report.md)

## [Unreleased] — Sprint 004 AF-004

### Added

- `workbench.actions` manifest schema (canonical) with legacy `workbench.commands` alias
- `workbenchActionIdSchema` — dot-notation action ids distinct from capability ids
- `extractActionDescriptorsFromCapabilities`, `populateRegistryFromCapabilities`
- `registerManyAtomic` — atomic batch registration with structured validation errors
- Registry list sort contract: order → group → label → id
- 15 new unit tests; monorepo total 436 tests
- [AF-004 completion report](./docs/sprint/AF-004-completion-report.md)

## [Unreleased] — Sprint 004 AF-003

### Added

- `DefaultActionRegistry` — in-memory action index with validation, immutability, filtering, diagnostics
- `replace()`, `has()`, registry error types, `freezeActionDescriptor()`
- 25 new unit tests; monorepo total 421 tests
- [AF-003 completion report](./docs/sprint/AF-003-completion-report.md)

## [Unreleased] — Sprint 004 AF-002

### Added

- `@apzhub/command-framework` package scaffold — Action model interfaces, placeholder registry/executor, DI context
- 13 unit tests; monorepo total 396 tests
- [AF-002 completion report](./docs/sprint/AF-002-completion-report.md)

## [Unreleased] — Sprint 004 AF-001

### Added (Documentation — AF-001)

- ADR-0024 Command Framework package (`@apzhub/command-framework`)
- ADR-0025 Workbench commands and toolbar manifest extension
- ADR-0026 Command execution and actor model
- [SPR-004 technical spec index](./docs/specs/SPR-004-spec-index.md) and story specifications AF-002–AF-022
- [AF-001 completion report](./docs/sprint/AF-001-completion-report.md)

## [Unreleased] — Platform Baseline v1.0

### Added (Governance — documentation only)

- [Architecture Baseline v1.0](./docs/architecture/APZHUB-Architecture-Baseline-v1.0.md) — frozen architectural reference
- [Engineering Handbook](./docs/governance/APZHUB-Engineering-Handbook.md)
- [Capability Development Guide](./docs/governance/APZHUB-Capability-Development-Guide.md)
- [Workbench Development Guide](./docs/governance/APZHUB-Workbench-Development-Guide.md)
- [Runtime Development Guide](./docs/governance/APZHUB-Runtime-Development-Guide.md)
- [v1.0 Baseline Review](./docs/reviews/APZHUB-v1.0-Baseline-Review.md)
- [v1.0 Readiness Review](./docs/reviews/APZHUB-v1.0-readiness-review.md) — APPROVED FOR PLATFORM DEVELOPMENT
- [SPR-004 Action Framework planning guide](./docs/sprint/SPR-004-action-framework.md)

## [Unreleased] — Sprint 004 Planning

### Added (Planning — no code)

- Sprint 004 Command Framework extension points documented in [SPR-003 closeout](./docs/sprint/SPR-003-closeout.md)

## [0.3.0-workbench-framework] — Sprint 003 Closeout

- **`@apzhub/workbench-framework`** — Workbench Manager, Request Bus, eight engines, Workbench API v1.0
- **Registry-driven shell** — Activity Bar, sidebar, view activation from manifest `workbench.navigation` / `workbench.view`
- **Session Engine** — versioned localStorage persistence with permission re-validation on restore (ADR-0021)
- **Context & Selection engines** — scaffold state orchestration
- **Permission integration** — `AuthWorkbenchPermissionAdapter`, `filterWorkbenchRegistryDto()` (ADR-0023)
- **Document 000 §6.1** — Runtime / Workbench / Capability API layering model
- ADRs 0019–0023 accepted
- [SPR-003 closeout](./docs/sprint/SPR-003-closeout.md)
- [SPR-003 architecture review](./docs/reviews/SPR-003-architecture-review.md)
- [v0.3.0-workbench-framework release notes](./docs/releases/v0.3.0-workbench-framework.md)

**Recommended tag:** `v0.3.0-workbench-framework` (not created until owner instructs)

### Added (SPR-003 Phases 0–7)

- Phase 0: ADRs 0019–0023, architecture refinement
- Phase 1: Workbench Manager, Request Bus, Layout/Panel engines
- Phase 2: Navigation Engine, manifest validation
- Phase 3: Shell wiring — Activity Bar, sidebar, registry hydration
- Phase 4: View Engine, route mapping
- Phase 5: Session Engine, localStorage persistence
- Phase 6: Context Engine, Selection Engine, scaffold permission adapter
- Phase 7: Workbench API v1.0, auth permission adapter, server registry filter
- 383 unit tests, 15 E2E tests at closeout

## [0.2.0-platform-runtime] — Milestone 2 Complete

See [Milestone 2 review](./docs/reviews/MILESTONE-002-platform-runtime-review.md) and [release notes](./docs/releases/v0.2.0-platform-runtime.md).

## [0.2.0-platform-runtime] — Sprint 002 Closeout

- **Runtime integration** — unified `Runtime.bootstrap()` flow; capabilities transition to `active` at platform ready
- **Enhanced diagnostics** — configuration, discovery, manifest, dependency, lifecycle, and health summaries in `Runtime.getDiagnostics()`
- **`Runtime.health()`** and **`Runtime.configuration()`** convenience APIs
- **`PlatformRegistry` facade** — kind-specific getters (`getComponents()`, `getThemes()`, etc.) via `Runtime.registry()`
- **`apps/web` integration** — instrumentation bootstrap via `runtime-init.ts`
- Scaffold manifests: Activity Bar (TD-017), default theme, platform registry service, registry-ready event
- [SPR-002 Phase 9 report](./docs/sprint/SPR-002-phase-9-report.md)
- [SPR-002 architecture review](./docs/reviews/SPR-002-architecture-review.md)
- [v0.2.0-platform-runtime release notes](./docs/releases/v0.2.0-platform-runtime.md)

**Recommended tag:** `v0.2.0-platform-runtime` (not created until owner instructs)

### Added (SPR-002 Phase 8)

- **Runtime Health Manager** — provider-based health aggregation; built-in Runtime, Configuration, Registry, and Lifecycle providers
- APIs: `Health.registerProvider()`, `unregisterProvider()`, `check()`, `checkProvider()`, `snapshot()`, `getStatus()`, `getDiagnostics()`
- Runtime Orchestrator health step replaces placeholder; transitions capabilities to `healthy` after evaluation
- [SPR-002 Phase 8 report](./docs/sprint/SPR-002-phase-8-report.md)
- [Health Manager architecture](./docs/architecture/health-manager.md)

### Added (SPR-002 Phase 7)

- **Runtime Configuration Manager** — authoritative runtime configuration; sole `process.env` access point in platform-runtime
- Precedence: defaults → environment variables → runtime overrides
- APIs: `Configuration.load()`, `validate()`, `get()`, `has()`, `snapshot()`, `metadata()`, `getDiagnostics()`
- Runtime Orchestrator updated to load configuration exclusively via Configuration Manager
- [SPR-002 Phase 7 report](./docs/sprint/SPR-002-phase-7-report.md)
- [Configuration Manager architecture](./docs/architecture/configuration-manager.md)

### Added (SPR-002 Phase 6)

- **Runtime Orchestrator** — coordinates platform startup; replaces internal Bootstrap Engine naming
- **Configuration Engine (minimal)** — `loadRuntimeConfiguration()` for orchestrator options
- **`@apzhub/platform-runtime/server`** — `Runtime.bootstrap()`, `initialise()`, `getStatus()`, `getDiagnostics()`, placeholder `shutdown`/`restart`
- End-to-end pipeline: Discovery → Manifest → Dependency Graph → Registry → Lifecycle → Platform Ready
- Health Manager orchestrator step (placeholder)
- [SPR-002 Phase 6 report](./docs/sprint/SPR-002-phase-6-report.md)
- [Runtime Orchestrator architecture](./docs/architecture/runtime-orchestrator.md)

### Added (SPR-002 Phase 5)

- **Lifecycle Manager** — capability lifecycle transition validation, history, diagnostics, snapshots
- Failure states: `failed`, `disabled`, `degraded` on `CapabilityLifecycleState`
- APIs: `transition`, `canTransition`, `getState`, `getHistory`, `reset`, `markFailed`, `markDisabled`, `snapshot`
- [SPR-002 Phase 5 report](./docs/sprint/SPR-002-phase-5-report.md)
- [Lifecycle Manager architecture](./docs/architecture/lifecycle-manager.md)

### Added (SPR-002 Phase 4)

- **Capability Registry** — in-memory register, lookup, snapshot for `dependencies-resolved` capabilities
- Registration rules: lifecycle gate, manifest re-validation, platform version compatibility, duplicate rejection
- Batch registration with rollback; extension point hooks (`beforeRegister`, `afterUnregister`)
- [SPR-002 Phase 4 report](./docs/sprint/SPR-002-phase-4-report.md)
- [Capability Registry architecture](./docs/architecture/capability-registry.md)

### Added (SPR-002 Phase 3)

- **Discovery Engine** — recursive filesystem scan, YAML load, `discovered` capability definitions
- Configurable discovery roots and ignore rules
- Structured `DiscoveryResult` with diagnostics
- [SPR-002 Phase 3 report](./docs/sprint/SPR-002-phase-3-report.md)

### Added (SPR-002 Phase 2)

- **Capability** runtime abstraction — kind, manifest, metadata, dependencies, lifecycle, health, version
- **Dependency Graph** — missing dependency detection, cycle detection, topological ordering
- Platform seed capabilities (`identity`, `config`, `theme`)
- `resolveCapabilityDependencies()` gate: `VALIDATED` → `DEPENDENCIES_RESOLVED`
- [SPR-002 Phase 2 report](./docs/sprint/SPR-002-phase-2-report.md)

### Added (SPR-002 Phase 1)

- `@apzhub/platform-runtime` — Manifest Engine (14 capability kind schemas, YAML validation)
- Version Manager — semver and platform version constraint checks
- Unified envelope migration for 7 SPR-001 UI `component.yaml` files (ADR-0011)
- Registry test fixtures in `testing/fixtures/registry/`
- `@apzhub/sdk` re-exports capability manifest types and validators
- [SPR-002 Phase 1 report](./docs/sprint/SPR-002-phase-1-report.md)

### Added (SPR-002 Phase 0)

- ADR-0008 through ADR-0017 — Sprint 002 architectural decisions
- ADR-0018 — Platform Runtime package (supersedes ADR-0008)
- `packages/platform-runtime/` package charter
- Phased implementation review gate (ADR-0017)
- [SPR-002 Phase 0 report](./docs/sprint/SPR-002-phase-0-report.md)
- [Architecture update report ARCH-002](./docs/reviews/ARCH-002-platform-runtime-update.md)

### Changed

- Architecture update: `platform-core` renamed to `platform-runtime` (ADR-0018)
- Platform startup lifecycle extended (ADR-0014)
- SPR-002 planning docs aligned to approved decisions (platform-runtime, no REST API, unified manifest envelope)
- ESLint ignores `storybook-static/` build output

## [0.1.0-foundation] — 2026-06-29

### Added

- Docker Compose dev stack (PostgreSQL, Redis, Caddy) on approved ports
- Drizzle migrations and RBAC role seed scaffold
- Better Auth (email/password, sessions, dev registration gate)
- Server-side session validation in middleware (ADR-0003)
- Design tokens including semantic success/warning colours
- `@apzhub/ui` primitives and shell components with Storybook
- Minimal Desktop Shell (Header, Activity Bar, Sidebar, Workspace, Status Bar)
- `GET /api/health` platform health endpoint
- Vitest with 80% coverage gates, Playwright E2E, axe accessibility tests
- Storybook build validation in CI
- Husky pre-commit and commit-msg hooks (lint, typecheck, tests)
- CSP Report-Only and production HSTS security headers
- ADR-0001 through ADR-0007 in `docs/adr/`
- [SPR-001 architecture review](./docs/reviews/SPR-001-architecture-review.md)
- [SPR-001 closeout report](./docs/reviews/SPR-001-closeout.md)

### Changed

- Status Bar connection colours use theme tokens (no hardcoded Tailwind palette)
- Middleware validates sessions via Better Auth get-session (not cookie presence only)
- Root Git repository initialised; nested `apps/web/.git` removed

### Excluded (deferred to Sprint 002+)

- Business modules and OSS engine integrations
- Command palette, search, notifications, context panel, Event Bus runtime
- OAuth, SSO, enforced CSP, Redis session/rate-limit usage
- RBAC enforcement beyond schema

## [0.0.0] — SPR-001 initial

### Added

- Monorepo bootstrap per BUILD-001
- Foundation sprint implementation per SPR-001 guide

[0.1.0-foundation]: https://github.com/apzhub/apz-portal/releases/tag/v0.1.0-foundation
