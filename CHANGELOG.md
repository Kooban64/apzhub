# Changelog

All notable changes to APZHUB are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **APZQEP-ENG-020D** Requirements Content Versioning — **ACCEPTED / CLOSED / COMPLETE** · `@apzhub/qep-requirements` **0.4.0** · migrations `0072`/`0073` · pack [requirements/versioning](./docs/products/apzqep/requirements/versioning/README.md) · evidence `20260725T160000Z-APZQEP-ENG-020D.json`
- **APZQEP-ENG-020E** Requirements Baselines (Parts 1–3) — **ACCEPTED / CLOSED / COMPLETE** · `@apzhub/qep-requirements` **0.7.0** · migrations `0074`/`0075`/`0076` · integrity fingerprinting (SHA-256, empty-lock rejection), `verifyBaselineIntegrity`, Workbench UI · pack [requirements/baselines](./docs/products/apzqep/requirements/baselines/README.md) · evidence `20260725T174800Z-APZQEP-ENG-020E-PART1.json`, `20260725T190000Z-APZQEP-ENG-020E-PART2.json`, `20260725T203000Z-APZQEP-ENG-020E.json` · acceptance `20260726T080000Z-APZQEP-ENG-020E-ACCEPTANCE.json`
- **APZQEP-ARCH-005** Requirements Relationship Architecture — **ACCEPTED / CLOSED / COMPLETE** (Authoritative Architecture) · pack [architecture/requirements-relationship](./docs/products/apzqep/architecture/requirements-relationship/README.md) · evidence `20260726T073000Z-APZQEP-ARCH-005.json` · acceptance `20260726T075000Z-APZQEP-ARCH-005-ACCEPTANCE.json`
- **APZQEP-ENG-020F Parts 1–2** Requirements Relationship Engine (domain + backend) — **ACCEPTED / CLOSED / COMPLETE** · `@apzhub/qep-requirements` **0.9.0** · migrations `0077`/`0078` · pack [requirements/relationships](./docs/products/apzqep/requirements/relationships/README.md)
- **APZQEP-ARCH-006** Requirements Workbench Architecture — **ACCEPTED / CLOSED / COMPLETE** · pack [architecture/requirements-workbench](./docs/products/apzqep/architecture/requirements-workbench/README.md) · acceptance `20260726T095000Z-APZQEP-ARCH-006-ACCEPTANCE.json`
- **APZQEP-ENG-020F Part 3** Requirements Relationship Workbench — **ACCEPTED / CLOSED / COMPLETE** · evidence `20260726T100000Z-APZQEP-ENG-020F-PART3.json` · acceptance `20260726T103000Z-APZQEP-ENG-020F-PART3-ACCEPTANCE.json`
- **APZQEP-REQ-001** Requirements Capability Certification & Baseline — **ACCEPTED / CLOSED / COMPLETE** · `@apzhub/qep-requirements` **1.0.0 CERTIFIED / FROZEN** · acceptance `20260726T120000Z-APZQEP-REQ-001-ACCEPTANCE.json`
- **APZQEP-ARCH-007** Requirements Traceability Architecture — **ACCEPTED / CLOSED / COMPLETE** · acceptance `20260726T130000Z-APZQEP-ARCH-007-ACCEPTANCE.json`
- **APZQEP-ENG-030A Part 1** Traceability Engine Domain — **ACCEPTED / CLOSED / COMPLETE** · acceptance `20260726T140000Z-APZQEP-ENG-030A-PART1-ACCEPTANCE.json`
- **APZQEP-ENG-030A Part 2** Traceability Engine Backend — **ACCEPTED / CLOSED / COMPLETE** · `@apzhub/qep-traceability` **0.2.0** · migrations `0079`/`0080` · pack [engine](./docs/products/apzqep/traceability/engine/README.md) · acceptance `20260726T153000Z-APZQEP-ENG-030A-PART2-ACCEPTANCE.json`
- **APZQEP-ARCH-008** Traceability Workbench Architecture — **ACCEPTED / CLOSED / COMPLETE** · pack [traceability-workbench](./docs/products/apzqep/architecture/traceability-workbench/README.md) · acceptance `20260726T154500Z-APZQEP-ARCH-008-ACCEPTANCE.json`
- **APZQEP-ENG-030C** Traceability Workbench UI — **ACCEPTED / CLOSED / COMPLETE** · pack [workbench](./docs/products/apzqep/traceability/workbench/README.md) · acceptance `20260726T164000Z-APZQEP-ENG-030C-ACCEPTANCE.json`
- **APZQEP-TRACE-001** Traceability Capability Certification & Baseline — **ACCEPTED / CLOSED / COMPLETE** · `@apzhub/qep-traceability` **1.0.0 CERTIFIED / FROZEN** · acceptance `20260726T172000Z-APZQEP-TRACE-001-ACCEPTANCE.json`
- **APZQEP-ARCH-009** Verification Capability Architecture — **ACCEPTED** · pack [architecture/verification](./docs/products/apzqep/architecture/verification/README.md) · acceptance `20260726T174500Z-APZQEP-ARCH-009-ACCEPTANCE.json`
- **APZQEP-ENG-040A** Verification Engine Domain — **ACCEPTED** · `@apzhub/qep-verification` **0.1.0** domain baseline · pack [verification/engine-domain](./docs/products/apzqep/verification/engine-domain/README.md) · acceptance `20260726T180000Z-APZQEP-ENG-040A-ACCEPTANCE.json`
- **APZQEP-ENG-040B** Verification Infrastructure — **ACCEPTED / CLOSED / COMPLETE** · `@apzhub/qep-verification` infrastructure · migrations `0081`/`0082` · REST `/api/v1/qep/verifications/*` · pack [verification/engine](./docs/products/apzqep/verification/engine/README.md) · acceptance `20260726T190000Z-APZQEP-ENG-040B-ACCEPTANCE.json`
- **APZQEP-ARCH-010** Verification Workbench Architecture — **ACCEPTED / CLOSED / COMPLETE** · pack [architecture/verification-workbench](./docs/products/apzqep/architecture/verification-workbench/README.md) · acceptance `20260726T193000Z-APZQEP-ARCH-010-ACCEPTANCE.json`
- **APZQEP-ENG-040C** Verification Workbench — **ACCEPTED / CLOSED / COMPLETE** · pack [verification/workbench](./docs/products/apzqep/verification/workbench/README.md) · acceptance `20260726T200000Z-APZQEP-ENG-040C-ACCEPTANCE.json`
- **APZQEP-CERT-040D** Verification Capability Certification — **ACCEPTED / CLOSED / COMPLETE** · `@apzhub/qep-verification` **1.0.0 CERTIFIED / FROZEN** · class **PRODUCTION_READY_WITH_LIMITATIONS** · pack [capability-certification](./docs/products/apzqep/verification/capability-certification/README.md) · acceptance `20260726T205000Z-APZQEP-CERT-040D-ACCEPTANCE.json`
- **APZQEP-ARCH-011** Test Specifications Capability Architecture — **ACCEPTED / CLOSED / COMPLETE** · pack [architecture/test-specifications](./docs/products/apzqep/architecture/test-specifications/README.md) · evidence `20260726T210000Z-APZQEP-ARCH-011.json` · acceptance `20260726T212000Z-APZQEP-ARCH-011-ACCEPTANCE.json`
- **APZQEP-ENG-050A** Test Specifications Domain Model — **ACCEPTED / CLOSED / COMPLETE** · pack [test-specifications/engine-domain](./docs/products/apzqep/test-specifications/engine-domain/README.md) · evidence `20260726T214500Z-APZQEP-ENG-050A.json`
- **APZQEP-ENG-050B** Test Specifications Infrastructure — **IMPLEMENTED / AWAITING OWNER ACCEPTANCE** · `@apzhub/qep-test-specifications` **0.2.0** · migrations **0083/0084** · REST `/api/v1/qep/specifications` · pack [test-specifications/engine](./docs/products/apzqep/test-specifications/engine/README.md) · evidence `20260726T223000Z-APZQEP-ENG-050B.json`
- **APZQEP-ENG-060B** Test Plans Infrastructure Engineering — **IMPLEMENTED / AWAITING ENGINEERING COMPLETION REVIEW (ECR)** · `@apzhub/qep-test-plans` **0.2.0** · migrations **0085/0086** · REST `/api/v1/qep/plans` · pack [test-plans/infrastructure](./docs/products/apzqep/test-plans/infrastructure/README.md) · evidence `20260727T182000Z-APZQEP-ENG-060B.json`
- **OES-000** APZOR Owner Engineering Specification Standard — **ACCEPTED / APPROVED / FROZEN** · [OES-000](./docs/engineering/oes/OES-000-Owner-Engineering-Specification-Standard.md) · acceptance `20260726T233500Z-OES-000-ACCEPTANCE.json`
- **OES-001** APZOR Engineering Writing Standard — **AUTHORISED** · [OES-001](./docs/engineering/oes/OES-001-Engineering-Writing-Standard.md)
- **APZQEP-OES-ARCH-012** Test Specifications Workbench Architecture — **IN DRAFT** Part 1 filed · `COMPLETE.md` not ready · [OES-ARCH-012](./docs/engineering/oes/APZQEP/OES-ARCH-012-Test-Specifications-Workbench-Architecture/README.md)

### Changed

- Governance: OES-000 methodology **FROZEN**. OES-001 writing standard authorised. OES-ARCH-012 Part 1 filed under COMPLETE.md pack layout. Workbench Engineering **NOT AUTHORISED** until `COMPLETE.md` Accepted. ENG-050B awaiting Acceptance. Evidence / Coverage / Impact / Certification Engine / AI / MCP **NOT AUTHORISED**.

## [Platform-1.3-CERT-001] — 2026-07-22 — AWAITING OWNER CERTIFICATION ACCEPTANCE

Platform 1.3 Certification & Release Readiness (certification only). Pack: [engineering/platform-1.3-cert-001](./docs/engineering/platform-1.3-cert-001/README.md). Evidence: [20260722T192600Z-PLATFORM-1.3-CERT-001.json](./docs/operations/evidence/portfolio-recert/20260722T192600Z-PLATFORM-1.3-CERT-001.json).

### Certification result

- Recommendation: **NOT READY FOR PRODUCTION**
- Blocking: `pnpm build` FAIL (notification inbox) · `pnpm typecheck` FAIL (observe-core)
- Architecture compliance: PASS · OpenAPI validate: PASS · Lint: PASS
- ENG-004 recorded **ACCEPTED** (Owner Decision CERT-001 bootstrap)

### Not changed

- No feature remediation under CERT-001 · No Platform 1.4 · Integration SDK **1.0.0** remains frozen

## [Platform-1.3-ENG-004] — 2026-07-22 — ACCEPTED

Notification Delivery Phase A (P13-E04) under ADR-0071 Option D. Pack: [engineering/platform-1.3-eng-004](./docs/engineering/platform-1.3-eng-004/README.md). Evidence: [20260722T190500Z-PLATFORM-1.3-ENG-004-NOTIFICATION-DELIVERY.json](./docs/operations/evidence/portfolio-recert/20260722T190500Z-PLATFORM-1.3-ENG-004-NOTIFICATION-DELIVERY.json).

### Added

- Hybrid Central Notification Delivery Service (event + command intake)
- Delivery contracts (`@apzhub/notification-contracts` **0.3.0**) · migration **0065**
- In-app certified path · Workbench inbox · SSE wire events via ADR-0072
- Admin APIs: intents, deliveries, retry, dead-letter replay, delivery health/diagnostics, providers
- Deny-by-default `APZHUB_NOTIFICATION_*` delivery flags

### Changed

- ADR-0071 recorded **ACCEPTED**; realtime topic model includes `notifications`

### Deferred

- **SMTP DELIVERY DEFERRED** (no approved outbound path)

### Not changed

- Integration SDK **1.0.0** frozen · Email SoR excluded · FIN-001 STOP · Workflow Execute gated · No WebSockets · No CERT-001

## [Platform-1.3-ADR-0071] — 2026-07-22 — ACCEPTED

ADR-0071 Notification Delivery Providers and Routing Architecture. Canonical: [architecture/adr/ADR-0071-…](./docs/architecture/adr/ADR-0071-Notification-Delivery-Providers-and-Routing.md).

### Added

- Full ADR: Option D Hybrid (central Notification Delivery Service + event-driven + command intake)
- OWNER-ACCEPTANCE · PRECONDITION-VERIFICATION · RISK-REGISTER packs
- Explicit fences vs Email SoR · Realtime · Workflow Execute

### Changed

- Status **Accepted** (Owner Decision ENG-004 bootstrap)
- Implementation under ENG-004

## [Platform-1.3-ENG-003] — 2026-07-22 — ACCEPTED

Support Realtime (SSE) for P13-E03 under ADR-0072. Pack: [engineering/platform-1.3-eng-003](./docs/engineering/platform-1.3-eng-003/README.md). Evidence: [20260722T164000Z-PLATFORM-1.3-ENG-003-SUPPORT-REALTIME-SSE.json](./docs/operations/evidence/portfolio-recert/20260722T164000Z-PLATFORM-1.3-ENG-003-SUPPORT-REALTIME-SSE.json).

### Added

- `RealtimeSubscriptionService` SSE adapter (`@apzhub/platform-services`)
- Gateway `GET /api/v1/realtime/{stream,diagnostics,health}` + Support alias `/support/events/stream`
- Support Workbench EventSource live refresh (`SupportRealtimeProvider`)
- OpenAPI **1.13.0** Platform Realtime paths
- Feature flag `APZHUB_REALTIME_SSE_ENABLED` (deny-by-default) + capacity env vars

### Changed

- PL12-KL-05 **PARTIALLY REMEDIATED** (realtime SUP-03; attachment delete residual)
- ADR-0072 recorded **ACCEPTED**

### Confirmed non-goals

- No WebSocket · No Notification Delivery · No ADR-0071 · No Email SoR · No FIN-001 · Workflow Execute remains gated

## [Platform-1.3-ADR-0072] — 2026-07-22 — ACCEPTED

ADR-0072 Platform Realtime Transport Architecture. Canonical: [architecture/adr/ADR-0072-…](./docs/architecture/adr/ADR-0072-Platform-Realtime-Transport.md). Evidence: [20260722T160600Z-PLATFORM-1.3-ADR-0072.json](./docs/operations/evidence/portfolio-recert/20260722T160600Z-PLATFORM-1.3-ADR-0072.json).

### Added

- Full ADR: SSE Phase A behind Realtime Subscription transport abstraction; WebSocket deferred
- Programme OWNER-ACCEPTANCE pack

### Changed

- Platform-1.3-ENG-002 recorded **ACCEPTED**
- No application source modifications

### Not changed

- Realtime runtime · Support Realtime (ENG-003) · ADR-0071 · Notification delivery · Email SoR · FIN-001 · Workflow Execute

## [Platform-1.3-ENG-002] — 2026-07-22 — ACCEPTED

Observe Live Alerts Phase A (P13-E02 / ADR-0070). Pack: [engineering/platform-1.3-eng-002](./docs/engineering/platform-1.3-eng-002/README.md). Evidence: [docs/operations/evidence/portfolio-recert/20260722T133800Z-PLATFORM-1.3-ENG-002-OBSERVE-LIVE-ALERTS.json](./docs/operations/evidence/portfolio-recert/20260722T133800Z-PLATFORM-1.3-ENG-002-OBSERVE-LIVE-ALERTS.json).

### Added

- Observe alert evaluation domain (metadata signals), fingerprint dedup, ack/resolve/suppress
- Events `observe.alert.*` + delivery hook seam (no providers)
- Deny-by-default `APZHUB_OBSERVE_ALERT_EVALUATION_ENABLED`
- Additive `/api/v1/observe/alert-evaluation*` and lifecycle routes · OpenAPI paths
- ENG-002 unit suite (18 tests)

### Changed

- ADR-0070 recorded **ACCEPTED**; PL12-KL-02 **PARTIALLY REMEDIATED**

### Not changed

- Notification delivery providers · ADR-0071/0072 · Email SoR · FIN-001 · Workflow Execute · Integration SDK

## [Platform-1.3-ADR-0070] — 2026-07-22 — ACCEPTED

ADR-0070 Observe Live Alert Evaluation and Delivery. Canonical: [architecture/adr/ADR-0070-…](./docs/architecture/adr/ADR-0070-Observe-Live-Alert-Evaluation-and-Delivery.md).

### Added

- Full ADR defining Observe alert evaluation/delivery plane (lifecycle, rules, suppression, delivery hooks, Phase A/B)
- Programme pack under `docs/architecture/adr/`

### Changed

- Platform-1.3-ENG-001 recorded **ACCEPTED**
- Owner Decision ACCEPTED under Platform-1.3-ENG-002 bootstrap

### Not changed (by ADR programme alone)

- Observe runtime remained unmodified until ENG-002

## [Platform-1.3-ENG-001] — 2026-07-22 — ACCEPTED

Search Live Drain (P13-E01). Pack: [engineering/platform-1.3-eng-001](./docs/engineering/platform-1.3-eng-001/README.md). Evidence: [20260722T092506Z-PLATFORM-1.3-ENG-001-SEARCH-LIVE-DRAIN.json](./docs/operations/evidence/portfolio-recert/20260722T092506Z-PLATFORM-1.3-ENG-001-SEARCH-LIVE-DRAIN.json).

### Added

- Time/Law composition-root Search publication wiring · shared orchestration runtime · optional Meilisearch mirror sink
- Unit evidence for Time + Law live drain

### Changed

- Platform-1.3-ARCH-001 recorded **ACCEPTED** · PL12-KL-01 **CLOSED**
- Env examples document `APZHUB_SEARCH_ORCHESTRATION_ENABLED`

### Not changed

- Integration SDK · platform-services sources · ADR-0070/0071/0072 · other 1.3 epics

## [Platform-1.3-ARCH-001] — 2026-07-22 — ACCEPTED

Platform 1.3 Architecture Confirmation. Pack: [architecture/platform-1.3-confirmation](./docs/architecture/platform-1.3-confirmation/README.md). Evidence: [20260722T084543Z-PLATFORM-1.3-ARCH-001-CONFIRMATION.json](./docs/operations/evidence/portfolio-recert/20260722T084543Z-PLATFORM-1.3-ARCH-001-CONFIRMATION.json).

### Added

- Architecture review · epic assessment · dependency review · programme confirmation
- Proposed ADR-0070 (Observe live evaluation) · ADR-0071 (Notify delivery ≠ Email SoR) · ADR-0072 (Platform realtime transport)

### Changed

- PLAN-001 recorded **ACCEPTED** · no architectural redesign required · no application source modifications

## [APZHUB-PLAN-001] — 2026-07-22 — ACCEPTED

Platform 1.3 Product Portfolio, Roadmap and Delivery Plan. Pack: [strategy/platform-1.3](./docs/strategy/platform-1.3/README.md). Evidence: [20260722T072958Z-APZHUB-PLAN-001-PORTFOLIO-ROADMAP.json](./docs/operations/evidence/portfolio-recert/20260722T072958Z-APZHUB-PLAN-001-PORTFOLIO-ROADMAP.json).

### Added

- Official Product Portfolio · maturity · roadmap 1.3/1.4/2.0 · epics P13-E01…E12 · programme sequence ENG-001…011 + CERT-001

### Changed

- Platform 1.2 programme recorded **CLOSED** · OPS-002 **ACCEPTED**
- Planning only — no application source modifications

## [APZHUB-OPS-002] — 2026-07-22 — ACCEPTED (READY FOR OWNER PRODUCTION ACCEPTANCE)

Platform 1.2.0 production readiness implementation (OPS-001 actions A1–A8). Pack: [platform-1.2.0-production-readiness](./docs/operations/platform-1.2.0-production-readiness/README.md). Evidence: [20260722T060500Z-APZHUB-OPS-002-PRODUCTION-READINESS.json](./docs/operations/evidence/portfolio-recert/20260722T060500Z-APZHUB-OPS-002-PRODUCTION-READINESS.json).

### Added

- Production Dockerfile (`apps/web`) · compose stack · Caddy TLS configs · `.env.production.example`
- Backup/capacity scripts · go-live/rollback/on-call documentation pack
- Verified `apzhub/web:1.2.0` image build **PASS**

### Changed

- Next.js `output: "standalone"` for container images (no user-facing behaviour change)
- Records APZHUB-OPS-001 **ACCEPTED**
- Workflow Execute remains gated

## [APZHUB-OPS-001] — 2026-07-22 — ACCEPTED (PRODUCTION READY WITH ACTIONS)

Platform 1.2.0 operational readiness assessment. Pack: [platform-1.2.0-operational-readiness](./docs/operations/platform-1.2.0-operational-readiness/README.md). Evidence: [20260722T053224Z-APZHUB-OPS-001-OPERATIONAL-READINESS.json](./docs/operations/evidence/portfolio-recert/20260722T053224Z-APZHUB-OPS-001-OPERATIONAL-READINESS.json).

### Added

- Operational readiness pack covering deployment, infrastructure, security, backup, monitoring, performance, runbooks, risks
- Before-production action list **A1–A8**

### Changed

- Records APZHUB-RELEASE-001 **ACCEPTED**
- Classification **PRODUCTION READY WITH ACTIONS**
- No application source modifications

## [APZHUB-RELEASE-001] — 2026-07-22 — ACCEPTED (READY FOR OWNER RELEASE ACCEPTANCE)

Platform 1.2.0 baseline freeze & release approval. Pack: [platform-1.2.0](./docs/releases/platform-1.2.0/README.md). Evidence: [20260722T051228Z-APZHUB-RELEASE-001-BASELINE-FREEZE.json](./docs/operations/evidence/portfolio-recert/20260722T051228Z-APZHUB-RELEASE-001-BASELINE-FREEZE.json).

### Added

- Official freeze pack `docs/releases/platform-1.2.0/` (architecture, quality, certification, packages, products, KL, risks)
- Complete workspace package inventory (2 apps · 8 integrations · 74 packages)

### Changed

- Declares Platform **1.2.0** repository-certified baseline freeze (**PRODUCTION READY WITH LIMITATIONS**)
- Records APZHUB-QA-CERT-004 **ACCEPTED** (Owner Decision)
- No application source modifications

## [APZHUB-QA-CERT-004] — 2026-07-21 — ACCEPTED (READY FOR OWNER VISUAL ACCEPTANCE)

Platform 1.2.0 visual certification review of Support Analytics snapshot. Pack: [platform-1.2.0-visual-review](./docs/quality/platform-1.2.0-visual-review/README.md). Evidence: [20260721T194900Z-APZHUB-QA-CERT-004-VISUAL-REVIEW.json](./docs/operations/evidence/portfolio-recert/20260721T194900Z-APZHUB-QA-CERT-004-VISUAL-REVIEW.json).

### Changed

- Decision **B**: incorrect baseline (Home placeholder) vs correct Support Analytics render — not a product regression
- Updated Playwright snapshot only: `support-analytics-chromium-linux.png` (1280×1064)
- Visual suite verify **3/3 PASS**; no application source modifications

## [APZHUB-QA-CERT-003] — 2026-07-21 — Awaiting Certification Acceptance (CERTIFICATION FAILED)

Platform 1.2.0 final portfolio certification. Pack: [platform-1.2.0-certification](./docs/quality/platform-1.2.0-certification/README.md). Evidence: [20260721T193500Z-APZHUB-QA-CERT-003-SUMMARY.json](./docs/operations/evidence/portfolio-recert/20260721T193500Z-APZHUB-QA-CERT-003-SUMMARY.json).

### Changed

- APZHUB-ENG-0022 recorded **ACCEPTED / CLOSED**
- Gates: lint **PASS**; typecheck **PASS**; Vitest **PASS** (5013); OpenAPI **PASS**; path **PASS**; Playwright full **FAIL** (119 pass · 1 hard · 6 flaky)
- No source code modifications under this programme

## [APZHUB-ENG-0022] — 2026-07-21 — ACCEPTED / CLOSED (READY FOR FINAL PLATFORM CERTIFICATION)

Platform 1.2 final certification punch list (QA-CERT-002 residuals). Pack: [APZHUB-ENG-0022](./docs/engineering/APZHUB-ENG-0022/README.md). Evidence: [20260721T190028Z-APZHUB-ENG-0022-CERTIFICATION-PUNCHLIST.json](./docs/operations/evidence/portfolio-recert/20260721T190028Z-APZHUB-ENG-0022-CERTIFICATION-PUNCHLIST.json).

### Changed

- Lint: remove `no-useless-escape` in workflow foundation audit script
- Zammad: align `discoverCapabilities()` test to authoritative **11** core services
- Workbench: longest-prefix view resolution for product deep links; Personalisation persist flush
- Configuration / SPR-003 Playwright: cell locator + deterministic layout PUT wait
- Law API DX routes verified in `apps/web` (no duplication) — affected suite green
- Full lint **PASS**; affected Playwright **19/19 PASS**

## [APZHUB-QA-CERT-002] — 2026-07-21 — Awaiting Certification Acceptance (CERTIFICATION FAILED)

Platform 1.2 final portfolio re-certification after Engineering Wave 2. Pack: [final-certification](./docs/quality/final-certification/README.md). Evidence: [20260721T183157Z-APZHUB-QA-CERT-002-SUMMARY.json](./docs/operations/evidence/portfolio-recert/20260721T183157Z-APZHUB-QA-CERT-002-SUMMARY.json).

### Changed

- APZHUB-ENG-0021 recorded **ACCEPTED / CLOSED**; Engineering Wave 2 **COMPLETE**
- Final gates: typecheck **PASS**; path **PASS**; lint **FAIL** (2); Vitest **FAIL** (1/5011); Playwright full **FAIL** (115 pass · 10 fail · 1 flaky)
- No source code modifications under this programme

## [APZHUB-ENG-0021] — 2026-07-21 — ACCEPTED / CLOSED (RG-TESTING-ARCH)

Wave 2 Step 6 (final) — Testing CI/CD architecture boundary. Pack: [APZHUB-ENG-0021](./docs/engineering/APZHUB-ENG-0021/README.md). Evidence: [20260721T170044Z-APZHUB-ENG-0021-RG-TESTING-ARCH.json](./docs/operations/evidence/portfolio-recert/20260721T170044Z-APZHUB-ENG-0021-RG-TESTING-ARCH.json).

### Changed

- APZHUB-ENG-0020 recorded **ACCEPTED / CLOSED**
- CI/CD boundary test forbids live provider SDKs/HTTP only (not `@apzhub/integration-*`); excludes `*.test.ts` from production-layer scan
- Architecture boundary Vitest **13/13 PASS** (QA2-V-082 cleared)
- All repository-approved remediation groups complete

## [APZHUB-ENG-0020] — 2026-07-21 — ACCEPTED / CLOSED (RG-SUPPORT-CERT + RG-OBSERVE-WB + RG-VISUAL-INBOX)

Wave 2 Step 5 — Support certification residual, Observe workbench locators, Support inbox visual baseline. Pack: [APZHUB-ENG-0020](./docs/engineering/APZHUB-ENG-0020/README.md). Evidence: [20260721T164923Z-APZHUB-ENG-0020-SUPPORT-OBSERVE-VISUAL.json](./docs/operations/evidence/portfolio-recert/20260721T164923Z-APZHUB-ENG-0020-SUPPORT-OBSERVE-VISUAL.json).

### Changed

- APZHUB-ENG-0019 recorded **ACCEPTED / CLOSED**
- Support terminal API errors no longer auto-retried; detail keeps cached UI on refetch; article create invalidates articles only
- Observe workbench `hc_pw`/`md_pw` cell locators; Support inbox screenshot baseline refreshed
- Scoped Playwright **20/20 PASS** (QA2-F-001 · QA2-F-009…015)

## [APZHUB-ENG-0017] — 2026-07-21 — Awaiting Acceptance (RG-CERT-PIN-DRIFT)

Wave 2 Step 2 — certification SemVer / OpenAPI pin refresh. Pack: [APZHUB-ENG-0017](./docs/engineering/APZHUB-ENG-0017/README.md). Evidence: [20260721T135822Z-APZHUB-ENG-0017-RG-CERT-PIN-DRIFT.json](./docs/operations/evidence/portfolio-recert/20260721T135822Z-APZHUB-ENG-0017-RG-CERT-PIN-DRIFT.json).

### Changed

- APZHUB-ENG-0016 recorded **ACCEPTED / CLOSED**
- Frozen pins aligned: platform-services **0.30.0**, platform-service-contracts **0.18.0**, workflow-contracts **0.4.2**, integration-zammad **0.8.0**, OpenAPI **1.12.0**
- `PLATFORM_SERVICES_VERSION` constant aligned to **0.30.0**
- Pin-scope certification Vitest **280/280 PASS** (was 50 failing)

## [APZHUB-ENG-0016] — 2026-07-21 — ACCEPTED / CLOSED (RG-LAW-SUITE-SCOPE + RG-LAW-HOST-QUALITY)

Wave 2 Step 1 residual remediation. Pack: [APZHUB-ENG-0016](./docs/engineering/APZHUB-ENG-0016/README.md). Evidence: [20260721T132122Z-APZHUB-ENG-0016-WAVE2.json](./docs/operations/evidence/portfolio-recert/20260721T132122Z-APZHUB-ENG-0016-WAVE2.json).

### Changed

- APZHUB-QA-RECERT-002 recorded **ACCEPTED / CLOSED** (Wave 2 plan authorised)
- Main Playwright config ignores `law-015-trust-workflow.spec.ts` (Law suite retained under `test:e2e:law` — 7/7 PASS)
- Law host unused-import lint + TS2493 boundary-test hygiene cleared
- Full `pnpm lint` PASS; `@apzhub/law-platform` typecheck PASS

## [APZHUB-QA-RECERT-002] — 2026-07-21 — ACCEPTED / CLOSED (READY FOR OWNER REVIEW → Accepted)

Residual Portfolio Certification Failure Analysis (analysis only). Pack: [residual-analysis](./docs/quality/residual-analysis/README.md). Evidence: [20260721T125415Z-APZHUB-QA-RECERT-002-ANALYSIS.json](./docs/operations/evidence/portfolio-recert/20260721T125415Z-APZHUB-QA-RECERT-002-ANALYSIS.json).

### Changed

- APZHUB-QA-CERT-001 recorded **ACCEPTED / CLOSED** (result **CERTIFICATION FAILED**)
- Classified residual CERT-001 failures: 19 PW hard · 30 flaky · 1 lint · 1 TS · 82 Vitest (28 unit · 7 integration · 47 regression)
- Created 10 root-cause remediation groups and new ENGINEERING-PLAN (6 suggested ENG programmes)
- Owner Accepted analysis; Engineering Wave 2 authorised (ENG-0016 first)

## [APZHUB-QA-CERT-001] — 2026-07-21 — ACCEPTED / CLOSED (CERTIFICATION FAILED)

Platform 1.2 portfolio full re-certification & remediation engineering closure. Evidence: [portfolio-recertification](./docs/quality/portfolio-recertification/README.md).

### Changed

- APZHUB-ENG-0015 recorded **ACCEPTED / CLOSED**
- Playwright Remediation engineering initiative formally **CLOSED** (no OPEN Orders 1–6 groups)
- Portfolio full re-cert evidence: **FAIL** (84 passed · 19 failed · 30 flaky)
- Lint / typecheck / Vitest gates recorded **FAIL** (no engineering fixes under this programme)
- Owner Accepted certification result as FAIL (not silent GA)

## [APZHUB-ENG-0015] — 2026-07-21 — ACCEPTED / CLOSED (RG-VISUAL)

Order 6 Support visual residual — refreshed detail + analytics Chromium Linux screenshot baselines. Evidence: [APZHUB-ENG-0015](./docs/engineering/APZHUB-ENG-0015/IMPLEMENTATION-SUMMARY.md).

### Fixed

- Support visual Playwright certs for detail and analytics match current UI baselines

### Changed

- APZHUB-ENG-0014 recorded **ACCEPTED / CLOSED**
- RG-VISUAL marked **REMEDIATED** (2/2 PASS)
- Playwright Remediation Programme (Orders 1–6) engineering complete — no OPEN groups remain

## [APZHUB-ENG-0014] — 2026-07-21 — ACCEPTED / CLOSED (RG-WORKFLOW-WB)

Order 6 Workflow Engine workbench residual — exact `/api/v1/workflows/engine` list/detail mock paths. Evidence: [APZHUB-ENG-0014](./docs/engineering/APZHUB-ENG-0014/IMPLEMENTATION-SUMMARY.md).

### Fixed

- Workflow Engine Playwright certs show READ-ONLY ENGINE overview and workflow list + definition viewer after corrected HTTP mocks

### Changed

- APZHUB-ENG-0013 recorded **ACCEPTED / CLOSED**
- RG-WORKFLOW-WB marked **REMEDIATED** (2/2 PASS)

## [APZHUB-ENG-0013] — 2026-07-21 — ACCEPTED / CLOSED (RG-TCMS-WB)

Order 6 TCMS workbench residual — mock `/api/v1/testing` dashboard + certification for APZTCMS-010. Evidence: [APZHUB-ENG-0013](./docs/engineering/APZHUB-ENG-0013/IMPLEMENTATION-SUMMARY.md).

### Fixed

- Testing workbench Playwright certs mount `testing-dashboard-stats` and certification detail `testing-page` / gates / advisory after HTTP mocks

### Changed

- APZHUB-ENG-0012 recorded **ACCEPTED / CLOSED**
- RG-TCMS-WB marked **REMEDIATED** (2/2 PASS)

## [APZHUB-ENG-0012] — 2026-07-21 — ACCEPTED / CLOSED (RG-METRICS-WB)

Order 6 Metrics workbench residual — authenticate before mocked metrics navigation. Evidence: [APZHUB-ENG-0012](./docs/engineering/APZHUB-ENG-0012/IMPLEMENTATION-SUMMARY.md).

### Fixed

- Metrics workbench Playwright certs mount `metrics-page` / `metrics-unavailable` after DEV `signIn`

### Changed

- APZHUB-ENG-0011 recorded **ACCEPTED / CLOSED**
- RG-METRICS-WB marked **REMEDIATED** (2/2 PASS)

## [APZHUB-ENG-0011] — 2026-07-21 — ACCEPTED / CLOSED (RG-SELECTORS)

Playwright strict-mode locator hygiene — role-based cell/row selectors. Evidence: [APZHUB-ENG-0011](./docs/engineering/APZHUB-ENG-0011/IMPLEMENTATION-SUMMARY.md).

### Fixed

- Documents / Search / TCMS pipelines / Observe workbench Playwright specs avoid ambiguous `getByText` collisions

### Changed

- APZHUB-ENG-0010 recorded **ACCEPTED / CLOSED**
- RG-SELECTORS marked **REMEDIATED** (4/4 PASS; 1 flaky residual)

## [APZHUB-ENG-0010] — 2026-07-21 — ACCEPTED / CLOSED (RG-PW-API)

Playwright API hygiene — `getByLabelText` → `getByLabel`. Evidence: [APZHUB-ENG-0010](./docs/engineering/APZHUB-ENG-0010/IMPLEMENTATION-SUMMARY.md).

### Fixed

- Reporting and TCMS Engineering Intelligence Playwright specs use `page.getByLabel`

### Changed

- APZHUB-ENG-0009 recorded **ACCEPTED / CLOSED**
- RG-PW-API marked **REMEDIATED** (3/3 PASS; 1 flaky residual)

## [APZHUB-ENG-0009] — 2026-07-21 — ACCEPTED / CLOSED (RG-MOCK-FETCH)

Playwright HTTP mock hygiene — absolute `baseURL` origin for `page.evaluate` fetch. Evidence: [APZHUB-ENG-0009](./docs/engineering/APZHUB-ENG-0009/IMPLEMENTATION-SUMMARY.md).

### Fixed

- Administration / Identity / Metrics / Observe `*-003` Playwright mock-fetch specs (relative fetch on `about:blank`)

### Changed

- APZHUB-ENG-0008 recorded **ACCEPTED / CLOSED**
- RG-MOCK-FETCH marked **REMEDIATED** (4/4 PASS)

## [APZHUB-ENG-0008] — 2026-07-21 — ACCEPTED / CLOSED (RG-A11Y-CONTRAST)

Design-system contrast remediation for login + Support axe certs. Evidence: [APZHUB-ENG-0008](./docs/engineering/APZHUB-ENG-0008/IMPLEMENTATION-SUMMARY.md).

### Fixed

- Primary button text uses `--color-primary-foreground` (theme CSS contract + Tailwind `@source` for `packages/ui`)
- Light `--color-success` / `--color-warning` text tokens meet WCAG AA on surface/white

### Changed

- APZHUB-ENG-0007 recorded **ACCEPTED / CLOSED**
- RG-A11Y-CONTRAST marked **REMEDIATED** (4/4 PASS)

## [APZHUB-ENG-0007] — 2026-07-21 — ACCEPTED / CLOSED (RG-LAW-DNS)

Law Trust Playwright remediation — keep `pg` off the Law client bundle and preserve trust deep links. Evidence: [APZHUB-ENG-0007](./docs/engineering/APZHUB-ENG-0007/IMPLEMENTATION-SUMMARY.md).

### Fixed

- Law-platform client import graph no longer pulls `pg` / `dns` (memory singletons; no persistence barrel on client)
- Workbench deep-link rewind under active view routes (trust sub-routes)
- Law Playwright harness (env merge, globalSetup, API DEV sign-in)

### Changed

- APZHUB-ENG-0006 recorded **ACCEPTED / CLOSED**
- RG-LAW-DNS marked **REMEDIATED** (7/7 PASS)

## [APZHUB-ENG-0006] — 2026-07-20 — ACCEPTED / CLOSED (RG-HEALTH-503 → RG-AUTH-SHELL)

Portfolio Playwright health/auth remediation. Evidence: [APZHUB-ENG-0006](./docs/engineering/APZHUB-ENG-0006/IMPLEMENTATION-SUMMARY.md).

### Fixed

- `integrations/n8n/integration.yaml` documentation field so `n8n` discovers and runtime bootstrap succeeds (`/api/health` 200)
- Playwright `webServer.env` merge + globalSetup deterministic DEV auth

### Changed

- APZHUB-QA-RECERT-001 recorded **ACCEPTED / CLOSED**
- PL12-KL-06 narrowed (health path green; auth root cause closed; 4 residual shell UI fails)

## [APZHUB-QA-RECERT-001] — 2026-07-20 — ACCEPTED / CLOSED (analysis)

Platform 1.2 portfolio Playwright failure analysis & remediation planning. Evidence: [playwright-remediation](./docs/quality/playwright-remediation/README.md).

### Added

- Analysis pack under `docs/quality/playwright-remediation/` (55 failures + 1 flaky classified; 11 remediation groups; 6 suggested ENG programmes)

### Changed

- APZHUB-ENG-0005 recorded **ACCEPTED / CLOSED**
- No product code, packages, APIs, or Platform **1.2.0** packaging changes

## [APZHUB-ENG-0005] — 2026-07-20 — ACCEPTED / CLOSED (R12-QA-01)

Portfolio Playwright/Docker re-cert path. Evidence: [APZHUB-ENG-0005](./docs/engineering/APZHUB-ENG-0005/IMPLEMENTATION-SUMMARY.md).

### Added

- `pnpm ops:portfolio-recert` (`path` · `docker` · `playwright` · `full`) + runbook + evidence directory
- `@apzhub/platform-operations` **0.1.4** portfolio re-cert audit helpers

### Changed

- APZHUB-ENG-0004 recorded **ACCEPTED / CLOSED**
- PL12-KL-06 narrowed (path executed; host Playwright suite residual FAIL classified)

## [APZHUB-ENG-0004] — 2026-07-20 — ACCEPTED / CLOSED (R12-SUP-02)

Support binary attachments (Zammad CE). Evidence: [APZHUB-ENG-0004](./docs/engineering/APZHUB-ENG-0004/IMPLEMENTATION-SUMMARY.md).

### Added

- Binary upload (base64 on note/reply create) and download via `GET .../articles/{articleId}/attachments/{attachmentId}`
- `@apzhub/integration-zammad` **0.8.0**; `@apzhub/platform-service-contracts` **0.18.0**; `@apzhub/platform-services` **0.30.0**
- Support UI attach + download

### Changed

- APZHUB-ENG-0003 recorded **ACCEPTED / CLOSED**
- PL12-KL-05 narrowed (Theme E webhook + binary closed; delete/realtime residual)

## [APZHUB-ENG-0003] — 2026-07-20 — ACCEPTED / CLOSED (R12-SUP-01)

Support webhook ingress (Zammad CE). Evidence: [APZHUB-ENG-0003](./docs/engineering/APZHUB-ENG-0003/IMPLEMENTATION-SUMMARY.md).

### Added

- `createZammadWebhookVerifier` / ingress pipeline in `@apzhub/integration-zammad` **0.7.0**
- `POST /api/v1/integrations/zammad/webhooks` (HMAC-SHA1 / `X-Hub-Signature`)
- Support catalogue domain-event fan-out from accepted ingress events

### Changed

- APZHUB-ENG-0002 recorded **ACCEPTED / CLOSED**
- PL12-KL-05 narrowed (webhook ingress done; binary attachments remain)

## [APZHUB-ENG-0002] — 2026-07-20 — ACCEPTED / CLOSED (R12-PERSIST-02)

Law activity/notification session stores PostgreSQL System of Record. Evidence: [APZHUB-ENG-0002](./docs/engineering/APZHUB-ENG-0002/IMPLEMENTATION-SUMMARY.md).

### Added

- Drizzle migrations `0063_apz_platform_law_session_stores` + `0064_*_rls`
- Postgres session snapshot adapters in ATF/ENF (`/server`)
- Platform API `GET/PUT /api/platform/v1/law/session/{activity|notification}`
- Client dual-write storage (localStorage L1 + API → Postgres SoR)

### Changed

- APZHUB-ENG-0001 recorded **ACCEPTED / CLOSED**
- PL12-KL-04 Theme D Law session residual closed under ENG-0002 (Awaiting Acceptance)

## [APZHUB-ENG-0001] — 2026-07-20 — ACCEPTED / CLOSED (R12-PERSIST-01)

Automation execution journal PostgreSQL System of Record. Evidence: [APZHUB-ENG-0001](./docs/engineering/APZHUB-ENG-0001/IMPLEMENTATION-SUMMARY.md).

### Added

- Drizzle migrations `0061_apz_platform_automation_execution_journal` + `0062_*_rls`
- `createPostgresAutomationExecutionJournal` / `createProductionAutomationExecutionJournal` in `@apzhub/platform-services` **0.29.0**

### Changed

- `AutomationExecutionJournal` / `AutomationFoundation.listExecutions` are async
- Server automation bootstrap uses Postgres journal when `DATABASE_URL` is set
- APZHUB-BACKLOG-001 recorded **ACCEPTED**; R12-PERSIST-01 marked implemented (awaiting ENG-0001 Acceptance)
- PL12-KL-04 narrowed (automation journal SoR done; Law session residual remains)

## [APZHUB-BACKLOG-001] — 2026-07-20 — ACCEPTED (Backlog Assessment)

Release backlog assessment & engineering recommendation (documentation only). Recommendation: **READY FOR OWNER BACKLOG SELECTION**. Evidence: [backlog](./docs/product-lifecycle/backlog/README.md).

### Added

- `docs/product-lifecycle/backlog/` assessment pack

### Changed

- APZHUB-PRODUCT-LIFECYCLE-001 recorded **ACCEPTED / CLOSED**

## [APZHUB-PRODUCT-LIFECYCLE-001] — 2026-07-20 — ACCEPTED / CLOSED (Continuous Product Lifecycle)

Transition from project delivery to continuous product delivery (documentation only). Recommendation: **CONTINUOUS PRODUCT LIFECYCLE READY**. Evidence: [product-lifecycle](./docs/product-lifecycle/README.md).

### Added

- `docs/product-lifecycle/` — continuous backlog, intake, engineering workflow, release trains, hotfix/versioning/LTS/EOL, continuous certification, Owner Approval

### Changed

- APZHUB-POST-IMPLEMENTATION-001 recorded **ACCEPTED / CLOSED**
- Future routine trains intended to be backlog-driven (after Owner Acceptance of this lifecycle)

## [APZHUB-POST-IMPLEMENTATION-001] — 2026-07-20 — ACCEPTED / CLOSED (Platform 1.2.0 PIR)

Post-Implementation Review for Platform **1.2.0** (documentation only). Evidence: [post-implementation](./docs/releases/platform/1.2.0/post-implementation/README.md).

### Added

- `docs/releases/platform/1.2.0/post-implementation/` — PIR, lessons, metrics, timeline, process improvements, recommendations

### Changed

- APZHUB-1.2-009 / Platform **1.2.0** recorded **ACCEPTED / CLOSED** as Production Baseline
- Release 1.2 closed; baseline content unchanged by PIR

## [APZHUB-1.2-009] — 2026-07-20 — ACCEPTED / CLOSED (Platform 1.2.0 Certification)

Platform Release 1.2 Portfolio Packaging & Certification (documentation only). Class: **PRODUCTION_READY_WITH_LIMITATIONS**. Evidence: [platform/1.2.0](./docs/releases/platform/1.2.0/README.md).

### Added

- `docs/releases/platform/1.2.0/` — portfolio certification pack (notes, catalogues, matrices, KL, risks, ops/prod readiness, manifest, acceptance)

### Changed

- APZHUB-1.2-008 recorded **ACCEPTED / CLOSED**
- Platform Production Baseline **1.1.0 → 1.2.0**

## [APZHUB-1.2-008] — 2026-07-20 — ACCEPTED / CLOSED (Release 1.2 Readiness)

Release 1.2 Readiness Review & Certification Planning (documentation only). Evidence: [readiness pack](./docs/releases/1.2/readiness/README.md).

### Added

- `docs/releases/1.2/readiness/` — readiness assessment, exec/scope/quality/risk/KL, operational & production readiness, completion & acceptance reports

### Changed

- APZHUB-1.2-007 recorded **ACCEPTED / CLOSED**
- Engineering paused; authorised Platform 1.2.0 certification programme

## [APZHUB-1.2-007] — 2026-07-20 — ACCEPTED / CLOSED (R12-TCMS-01)

GitLab CI Reference Adapter (metadata). Evidence: [APZHUB-1.2-007](./docs/releases/1.2/APZHUB-1.2-007/IMPLEMENTATION-SUMMARY.md).

### Added

- `@apzhub/integration-gitlab-ci` **0.1.0** — GitLab CI read-only reference adapter (`audit:gitlab-ci`)
- Platform providers + `createPlatformServicesWithGitLabCi` / `registerGitLabCiProviders` (additive)

### Changed

- APZHUB-1.2-006 recorded **ACCEPTED / CLOSED**
- TCMS Known Limitations / Integrations — GitLab CI metadata adapter present (dispatch/rerun/cancel/download still unsupported)

## [APZHUB-1.2-006] — 2026-07-20 — ACCEPTED / CLOSED (R12-SEARCH-02)

Law Search Publication Adapter (engineering). Evidence: [APZHUB-1.2-006](./docs/releases/1.2/APZHUB-1.2-006/IMPLEMENTATION-SUMMARY.md).

### Added

- `@apzhub/search-law` **0.1.0** — Law → Search Integration publication adapter (`audit:search-law`)
- Additive Search product id **`law`** in `@apzhub/search-contracts` **0.4.0** catalogue

### Changed

- APZHUB-1.2-005 recorded **ACCEPTED / CLOSED**
- Law Known Limitations KL-LAW-11 — `search-law` adapter present (composition hooks / live drain still limited; no financial publication)

## [APZHUB-1.2-005] — 2026-07-20 — ACCEPTED / CLOSED (R12-SEARCH-01)

Time Search Publication Adapter (engineering). Evidence: [APZHUB-1.2-005](./docs/releases/1.2/APZHUB-1.2-005/IMPLEMENTATION-SUMMARY.md).

### Added

- `@apzhub/search-time` **0.1.0** — Time → Search Integration publication adapter (`audit:search-time`)
- Additive Search product id **`time`** in `@apzhub/search-contracts` **0.4.0** catalogue

### Changed

- APZHUB-1.2-004 recorded **ACCEPTED / CLOSED**
- Time Known Limitations — `search-time` adapter present (composition hooks / live drain still limited)

## [APZHUB-1.2-004] — 2026-07-20 — ACCEPTED / CLOSED (R12-OPS-03)

Host coexistence capacity controls (engineering). Evidence: [APZHUB-1.2-004](./docs/releases/1.2/APZHUB-1.2-004/IMPLEMENTATION-SUMMARY.md).

### Added

- `@apzhub/platform-operations` host coexistence port catalogue + capacity thresholds + audit (`ops:host-coexistence-audit`)
- Ops HOST-COEXISTENCE-CONTROLS + coexistence runbook + evidence (OPS-R-01)

### Changed

- APZHUB-1.2-003 recorded **ACCEPTED / CLOSED**

## [APZHUB-1.2-003] — 2026-07-20 — ACCEPTED / CLOSED (R12-OPS-02)

Alert strategy / Observe runbook depth (engineering). Recommendation: **READY FOR OWNER ACCEPTANCE**. Evidence: [APZHUB-1.2-003](./docs/releases/1.2/APZHUB-1.2-003/IMPLEMENTATION-SUMMARY.md).

### Added

- `@apzhub/platform-operations` alert strategy catalogue + audit (`ops:alert-strategy-audit`)
- Minimum Production runbooks under `docs/operations/runbooks/`
- Deepened monitoring/alerting strategy (OPS-R-05)

### Changed

- APZHUB-1.2-002 recorded **ACCEPTED / CLOSED**

## [APZHUB-1.2-002] — 2026-07-20 — ACCEPTED / CLOSED (R12-OPS-01)

Backup restore drill + recovery evidence (engineering). Recommendation: **READY FOR OWNER ACCEPTANCE**. Evidence: [APZHUB-1.2-002](./docs/releases/1.2/APZHUB-1.2-002/README.md).

### Added

- `@apzhub/platform-operations` backup restore drill module + tests
- `pnpm ops:backup-restore-drill` runner (dry-run + live isolated DB)
- Ops runbook + recovery evidence records (OPS-R-04)

### Changed

- APZHUB-1.2-001 Release 1.2 Planning recorded **ACCEPTED / CLOSED**

## [APZHUB-1.2-001] — 2026-07-20 — ACCEPTED / CLOSED (Release 1.2 Planning)

Release 1.2 Implementation Planning & Prioritisation (documentation only). **ACCEPTED**. Evidence: [docs/releases/1.2-planning/](./docs/releases/1.2-planning/README.md).

### Added

- Release 1.2 planning pack (scope, backlog, priorities, product/platform roadmaps, KL disposition, deferred/STOP, sequence, programmes)

### Changed

- APZHUB-STRATEGY-001 Commercialisation Strategy recorded **ACCEPTED / CLOSED**

## [APZHUB-STRATEGY-001] — 2026-07-20 — ACCEPTED / CLOSED (Commercialisation & GTM)

Commercialisation & Go-To-Market Strategy (documentation only). **ACCEPTED**. Evidence: [docs/strategy/commercial/](./docs/strategy/commercial/README.md).

### Added

- Commercial execution pack (executive strategy, GTM, pricing/packaging/licensing, sales, partners, CS, launch, revenue, KPIs, risk)

### Changed

- APZHUB-GOVERNANCE-001 Enterprise Operating Model recorded **ACCEPTED / CLOSED**

## [APZHUB-GOVERNANCE-001] — 2026-07-20 — ACCEPTED / CLOSED (Enterprise Operating Model)

Enterprise Operating Model for APZOR around APZHUB (documentation only). **ACCEPTED**. Evidence: [docs/governance/](./docs/governance/README.md).

### Added

- Enterprise Operating Model catalogue (org, RACI, committees, product/portfolio/change/risk/compliance/knowledge/AI governance, cadence)

### Changed

- APZHUB-OPERATIONS-001 Platform Operations Framework recorded **ACCEPTED / CLOSED**
- Prior Engineering Governance Dashboard Spec retained (no UI)

## [APZHUB-OPERATIONS-001] — 2026-07-20 — ACCEPTED / CLOSED (Platform Operations Framework)

Platform Operations Framework (documentation only). **ACCEPTED**. Evidence: [docs/operations/](./docs/operations/README.md).

## [APZHUB-1.1-006] — 2026-07-20 — ACCEPTED / CLOSED

APZHUB Platform Release **1.1.0** Portfolio Packaging & Certification (documentation only). **ACCEPTED** as Production Baseline · **PRODUCTION_READY_WITH_LIMITATIONS**. Evidence: [platform/1.1.0](./docs/releases/platform/1.1.0/README.md) · [completion](./docs/sprint/APZHUB-1.1-006-completion-report.md).

## [APZHUB-1.1-005] — 2026-07-20 — ACCEPTED / CLOSED

Release **1.1** — Readiness Review & Certification Planning (documentation only). Accepted via Owner Decision authorising **APZHUB-1.1-006**. Evidence: [readiness pack](./docs/releases/1.1/readiness/README.md) · [completion](./docs/sprint/APZHUB-1.1-005-completion-report.md).

### Added

- `docs/releases/1.1/readiness/` — assessment, executive summary, scope, quality, risk, known limitations, completion/acceptance

### Changed

- APZHUB-1.1-004 recorded **ACCEPTED / CLOSED**
- Platform KL rows PL-KL-02 / PL-KL-09 refreshed for ACCEPTED 1.1 closures

## [APZHUB-1.1-004] — 2026-07-20 — ACCEPTED / CLOSED

Release **1.1** — Cross-Product Automation Foundation. Accepted via Owner Decision authorising **APZHUB-1.1-005**. Evidence: [APZHUB-1.1-004](./docs/releases/1.1/APZHUB-1.1-004/README.md) · [completion](./docs/sprint/APZHUB-1.1-004-completion-report.md).

### Added

- Platform `AutomationFoundation` — registration, handlers, idempotent journal
- Event-driven automation wire (`wireEventAutomation`) on server domain Event Bus
- Workflow-triggered automation path (deferred while execute gated)
- Default Support → `automation.journal` registrations
- `services/platform-automation/service.yaml` · `events/platform/automation-executed/event.yaml`
- Programme evidence pack `docs/releases/1.1/APZHUB-1.1-004/`

### Changed

- PL-KL-02 / R11-XPR-01 / P0-4: foundation delivered (product AU-* remain Owner-gated)

## [APZHUB-1.1-003] — 2026-07-20 — ACCEPTED / CLOSED

Release **1.1** — Cross-Platform Event Bus & Notification Foundation. Accepted via Owner Decision authorising **APZHUB-1.1-004**. Evidence: [APZHUB-1.1-003](./docs/releases/1.1/APZHUB-1.1-003/README.md) · [completion](./docs/sprint/APZHUB-1.1-003-completion-report.md).

### Added

- Platform `DomainEventPublisher` port + Support domain event publish (fail-soft)
- Support event manifests `events/support/**`
- ENF `wireDomainEventNotifications` reusable helper
- apps/web Support event/notification registration + Attention wire + client bridge
- Programme evidence pack `docs/releases/1.1/APZHUB-1.1-003/`

### Changed

- Support Known Limitations: Event Bus publish + in-app ENF notifications closed (realtime still out)

## [APZHUB-1.1-002] — 2026-07-19 — ACCEPTED / CLOSED

Release **1.1** — Law Operational Hardening (**OBS-LAW-02**). Recommendation: **READY FOR OWNER ACCEPTANCE**. Evidence: [APZHUB-1.1-002](./docs/releases/1.1/APZHUB-1.1-002/README.md) · [completion](./docs/sprint/APZHUB-1.1-002-completion-report.md). Accepted via Owner Decision authorising **APZHUB-1.1-003**.

### Changed

- Law client shell uses durable platform ENF/ATF session stores scoped by tenant/user
- Known Limitations: KL-LAW-04 / OBS-LAW-02 closed

### Added

- `PersistedActivitySessionStore` / `PersistedNotificationSessionStore` (platform-owned)
- Programme evidence pack `docs/releases/1.1/APZHUB-1.1-002/`
- Operational persistence regression tests

## [APZHUB-1.1-001] — 2026-07-19 — ACCEPTED / CLOSED

Release **1.1** — Law Authorization Hardening (**OBS-LAW-01**). Recommendation: **READY FOR OWNER ACCEPTANCE**. Evidence: [APZHUB-1.1-001](./docs/releases/1.1/APZHUB-1.1-001/README.md) · [completion](./docs/sprint/APZHUB-1.1-001-completion-report.md). Accepted via Owner Decision authorising **APZHUB-1.1-002**.

### Changed

- Law Platform hydration + client shell force Workbench auth adapter with session AuthorizationService grants
- Law API `resolveLawApiPermissions` — no empty-grant `*` injection; always `mode: "auth"`
- `AuthWorkbenchPermissionAdapter` honors `*` / `namespace.*` patterns
- Known Limitations: KL-LAW-03 / OBS-LAW-01 closed

### Added

- Programme evidence pack `docs/releases/1.1/APZHUB-1.1-001/`
- AuthZ regression tests for pattern match and no `*` injection

## [APZHUB-RELEASE-001] — 2026-07-19 — ACCEPTED / CLOSED

APZHUB Release **1.1** Planning & Roadmap (**documentation only**). Recommendation: **READY TO START RELEASE 1.1**. Evidence: [1.1-planning](./docs/releases/1.1-planning/README.md) · [completion](./docs/sprint/APZHUB-RELEASE-001-completion-report.md). Accepted via Owner Decision authorising **APZHUB-1.1-001**.

### Added

- Release 1.1 planning pack `docs/releases/1.1-planning/`
- Classification register · product/platform roadmaps · customer/debt/security/compliance/ops/performance backlogs · Owner priorities
- APZHUB Platform **1.0.0** marked **ACCEPTED / CLOSED** (Production Baseline)
- No production code, packages, tests, or builds

## [APZHUB-PORTFOLIO-001 Platform 1.0] — 2026-07-19 — ACCEPTED / CLOSED

APZHUB Platform Release **1.0.0** portfolio certification (**documentation only**). Recommendation: **PRODUCTION READY**. Certification class: **PRODUCTION_READY_WITH_LIMITATIONS**. Evidence: [1.0.0](./docs/releases/platform/1.0.0/README.md) · [completion](./docs/sprint/APZHUB-PORTFOLIO-001-platform-1.0-completion-report.md). Accepted via Owner Decision authorising APZHUB-RELEASE-001.

### Added

- Platform release pack `docs/releases/platform/` + SemVer evidence `1.0.0/`
- Portfolio catalogues · matrices · guides · KL/risk registers · readiness · certification reports
- APZ-LAW-002 · APZ-ANALYTICS-002 · APZ-WORKFLOW-002 marked **ACCEPTED / CLOSED**
- No production code, packages, tests, or builds

## [APZ-LAW-002] — 2026-07-19 — ACCEPTED / CLOSED

APZ Law Platform Release **1.0.0** certification (**product packaging** — no platform rebuild). Recommendation: **PRODUCTION READY**. Certification class: **PRODUCTION_READY_WITH_LIMITATIONS**. Evidence: [1.0.0](./docs/releases/law/1.0.0/README.md) · [completion](./docs/sprint/APZ-LAW-002-completion-report.md). Accepted via Owner Decision authorising APZHUB-PORTFOLIO-001 (Platform 1.0).

### Added

- Release pack `docs/releases/law/` + SemVer evidence `1.0.0/`
- Certification · Completion · Acceptance reports · Product/Admin/Practitioner guides · licensing · quality/ops/production readiness
- Product `RELEASES.md` · portfolio release register · catalogue updates
- APZ-LAW-001 marked **ACCEPTED / CLOSED**
- No production code, packages, tests, or builds

## [APZ-LAW-001] — 2026-07-19 — ACCEPTED / CLOSED

APZ Law Platform Release **1.0** Planning (**documentation only**). Recommendation: **READY WITH CONDITIONS**. Delivery path: **Existing Platform → Commercial Packaging**. Evidence: [pack](./docs/products/apz-law/README.md) · [completion](./docs/sprint/APZ-LAW-001-completion-report.md). Accepted via Owner Decision authorising APZ-LAW-002.

### Added

- Commercial planning pack `docs/products/apz-law/`
- Delivery-path determination · repository assessment · integrations · editions · IR · KL · certification/testing/ops strategies · roadmap
- Completion + Acceptance reports for APZ-LAW-001
- APZ-TCMS-002 marked **ACCEPTED / CLOSED**
- No production code, packages, tests, or builds

## [APZ-TCMS-002] — 2026-07-19 — ACCEPTED / CLOSED

APZ TCMS Release **1.0.0** certification (**product packaging** — no platform rebuild). Recommendation: **PRODUCTION READY**. Certification class: **PRODUCTION_READY_WITH_LIMITATIONS**. Evidence: [1.0.0](./docs/releases/tcms/1.0.0/README.md) · [completion](./docs/sprint/APZ-TCMS-002-completion-report.md). Accepted via Owner Decision authorising APZ-LAW-001.

### Added

- Release pack `docs/releases/tcms/` + SemVer evidence `1.0.0/`
- Certification · Completion · Acceptance reports · Product/Admin/Tester guides · licensing · quality/ops/production readiness
- Product `RELEASES.md` · portfolio release register · catalogue updates
- APZ-TCMS-001 marked **ACCEPTED / CLOSED**
- No production code, packages, tests, or builds

## [APZ-TCMS-001] — 2026-07-19 — ACCEPTED / CLOSED

APZ TCMS Release **1.0** Planning (**documentation only**). Recommendation: **READY WITH CONDITIONS**. Delivery path: **Existing Platform → Commercial Packaging**. Evidence: [pack](./docs/products/apz-tcms/README.md) · [completion](./docs/sprint/APZ-TCMS-001-completion-report.md). Accepted via Owner Decision authorising APZ-TCMS-002.

### Added

- Commercial planning pack `docs/products/apz-tcms/`
- Delivery-path determination · repository assessment · cross-product integrations
- Completion + Acceptance reports for APZ-TCMS-001
- APZ-DOCUMENTS-002 marked **ACCEPTED / CLOSED**
- No production code, packages, tests, or builds

## [APZ-DOCUMENTS-002] — 2026-07-19 — ACCEPTED / CLOSED

APZ Documents Release **1.0.0** certification (**product packaging** — no platform rebuild). Recommendation: **PRODUCTION READY**. Certification class: **PRODUCTION_READY_WITH_LIMITATIONS**. Evidence: [1.0.0](./docs/releases/documents/1.0.0/README.md) · [completion](./docs/sprint/APZ-DOCUMENTS-002-completion-report.md). Accepted via Owner Decision authorising APZ-TCMS-001.

### Added

- Release pack `docs/releases/documents/` + SemVer evidence `1.0.0/`
- Certification · Completion · Acceptance reports · guides · licensing · quality/ops/production readiness
- Product `RELEASES.md` · portfolio release register · catalogue updates
- APZ-DOCUMENTS-001 marked **ACCEPTED / CLOSED**
- No production code, packages, tests, or builds

## [APZ-DOCUMENTS-001] — 2026-07-19 — ACCEPTED / CLOSED

APZ Documents Release **1.0** Planning (**documentation only**). Recommendation: **READY WITH CONDITIONS**. Evidence: [pack](./docs/products/apz-documents/README.md) · [completion](./docs/sprint/APZ-DOCUMENTS-001-completion-report.md). Accepted via Owner Decision authorising APZ-DOCUMENTS-002.

### Added

- Commercial planning pack `docs/products/apz-documents/`
- Platform alignment (Identity · Workflow · Analytics · Search · Integration)
- Completion + Acceptance reports for APZ-DOCUMENTS-001
- APZHUB-ENGINEERING-001 marked **ACCEPTED / CLOSED**
- No production code, packages, tests, or builds

## [APZHUB-ENGINEERING-001] — 2026-07-19 — ACCEPTED / CLOSED

APZHUB Platform Delivery Standard (**documentation only**). Recommendation: **STANDARD READY**. Evidence: [pack](./docs/engineering/platform-delivery/README.md) · [completion](./docs/sprint/APZHUB-ENGINEERING-001-completion-report.md). Accepted via Owner Decision authorising APZ-DOCUMENTS-001.

### Added

- `docs/engineering/platform-delivery/` — lifecycle, stage gates, quality gates, programme governance, package standards, best practices, examples, templates
- Completion + Acceptance reports for APZHUB-ENGINEERING-001
- KF / handbook / AI workflow / repository guide index updates
- No production code, packages, tests, or builds

## [APZ-WORKFLOW-002] — 2026-07-19 — Awaiting Acceptance

APZ Workflow Release **1.0.0** certification (**production release** — packaging only). Recommendation: **PRODUCTION READY**. Certification class: **PRODUCTION_READY_WITH_LIMITATIONS**. Evidence: [1.0.0](./docs/releases/workflow/1.0.0/README.md) · [completion](./docs/sprint/APZ-WORKFLOW-002-completion-report.md).

### Added

- Release pack `docs/releases/workflow/` + SemVer evidence `1.0.0/`
- Product `RELEASES.md` · updated Known Limitations / portfolio / commercial catalogue / release register
- Quality Evidence · Compatibility · Operational/Production Readiness · Certification Report
- APZHUB-PLATFORM-WORKFLOW-006 marked **ACCEPTED / CLOSED**
- No new product features

## [APZHUB-PLATFORM-WORKFLOW-006] — 2026-07-19 — ACCEPTED / CLOSED

Workflow Workbench Module (**production code**). `/workspace/workflow/*` · HTTP OpenAPI **1.12.0**. Recommendation: **WORKBENCH READY**. Evidence: [completion](./docs/sprint/APZHUB-PLATFORM-WORKFLOW-006-completion-report.md) · [workbench](./docs/workbench/workflow/README.md). Accepted via Owner Decision authorising APZ-WORKFLOW-002.

### Added

- Manifests under `services/workflow/manifests/workflow*`
- Typed client `apps/web/lib/workflow` → `/api/v1/workflow/*` only
- Workbench views + `WorkflowWorkspaceRouter` mounted in shell
- Unit / component / navigation / boundary / Playwright tests
- Docs pack `docs/workbench/workflow/`
- APZHUB-PLATFORM-WORKFLOW-005 marked **ACCEPTED / CLOSED**
- No commercial APZ Workflow packaging (at 006 delivery)

## [APZHUB-PLATFORM-WORKFLOW-005] — 2026-07-19 — ACCEPTED / CLOSED

Workflow HTTP API (**production code**). OpenAPI **1.12.0** · `/api/v1/workflow/*` · platform-services **0.28.0** · workflow-contracts **0.4.2**. Recommendation: **HTTP API READY**. Evidence: [completion](./docs/sprint/APZHUB-PLATFORM-WORKFLOW-005-completion-report.md) · [http](./docs/http/workflow/README.md). Accepted via Owner Decision authorising APZHUB-PLATFORM-WORKFLOW-006.

### Added

- App Router routes under `apps/web/app/api/v1/workflow/**`
- Handlers calling `gateway.workflow.*` only (no `integration-n8n`)
- OpenAPI **1.12.0** `/workflow/*` paths, schemas, AuthZ annotations
- Tests `platform-api.workflow.v1.test.ts` (7) PASS
- HTTP docs pack `docs/http/workflow/`
- APZHUB-PLATFORM-WORKFLOW-004 marked **ACCEPTED / CLOSED**
- No Workflow Workbench / commercial APZ Workflow (at 005 delivery)

## [APZHUB-PLATFORM-WORKFLOW-004] — 2026-07-19 — ACCEPTED / CLOSED

Workflow Platform Services (**production code**). `gateway.workflow` runtime plane on platform-services **0.28.0**; contracts **0.4.1** (later **0.4.2** for HTTP). Recommendation: **SERVICES READY**. Evidence: [services](./docs/platform/workflow/WORKFLOW-PLATFORM-SERVICES.md) · [completion](./docs/sprint/APZHUB-PLATFORM-WORKFLOW-004-completion-report.md). Accepted via Owner Decision authorising APZHUB-PLATFORM-WORKFLOW-005.

### Added

- Runtime service impls (runs / schedules / tasks / approvals / notifications / capabilities / health)
- In-memory runtime registry + mock / n8n ops providers
- AuthZ mappings for runtime facets
- `services/workflow/service.yaml`
- Tests **41** workflow suite PASS; contracts **0.4.1**
- APZHUB-PLATFORM-WORKFLOW-003 marked **ACCEPTED / CLOSED**
- No Workflow HTTP / Workbench (at 004 delivery)

## [APZHUB-PLATFORM-WORKFLOW-003] — 2026-07-19 — ACCEPTED / CLOSED

Workflow Platform Contracts (**production code**). Package `@apzhub/workflow-contracts` **0.4.1** (from **0.3.0** via **0.4.0**). Recommendation: **CONTRACTS READY**. Evidence: [contracts](./docs/platform/workflow/WORKFLOW-CONTRACTS.md) · [completion](./docs/sprint/APZHUB-PLATFORM-WORKFLOW-003-completion-report.md). Accepted via Owner Decision authorising APZHUB-PLATFORM-WORKFLOW-004.

### Added

- Runtime IM models (`WorkflowRun`, schedules, tasks, secrets refs, health, capability, provider, …)
- Service interfaces: Run / Schedule / Task / Approval / Notification / Capability / Health
- `WorkflowCanonicalGateway` composition type
- Runtime permission keys + operation mappings
- Docs pack · tests **8** PASS
- APZHUB-INTEGRATION-N8N-001 marked **ACCEPTED / CLOSED**
- No Workflow Platform Services / HTTP / Workbench

## [APZHUB-INTEGRATION-N8N-001] — 2026-07-19 — ACCEPTED / CLOSED

n8n Integration Foundation (**production code**). Package `@apzhub/integration-n8n` **0.1.0**. Recommendation: **CERTIFIED_FOUNDATION**. Evidence: [cert](./docs/integrations/n8n/CERTIFICATION-REPORT.md) · [completion](./docs/sprint/APZHUB-INTEGRATION-N8N-001-completion-report.md). Accepted via Owner Decision authorising APZHUB-PLATFORM-WORKFLOW-003.

### Added

- Public `N8nClient` facade · version detection (headers / healthz / API capability)
- Certification pack under `docs/integrations/n8n/`
- Tests **22** PASS; typecheck/lint PASS
- PLATFORM-WORKFLOW-002 marked **ACCEPTED / CLOSED**
- No Workflow Contracts / Services / HTTP / Workbench

## [APZHUB-PLATFORM-WORKFLOW-002] — 2026-07-19 — ACCEPTED / CLOSED

Workflow Information Model (**documentation only**). Recommendation **FOUNDATION COMPLETE**. Evidence: [info model](./docs/platform/workflow/WORKFLOW-INFORMATION-MODEL.md) · [acceptance](./docs/foundation/completion-reports/APZHUB-PLATFORM-WORKFLOW-002-programme-acceptance-report.md). Accepted via Owner Decision authorising APZHUB-INTEGRATION-N8N-001.

### Added

- Information Model · Domain Model · Glossary · Entity Relationships · Contract Planning under `docs/platform/workflow/`
- Completion + acceptance reports; APZHUB-PLATFORM-WORKFLOW-001 marked **ACCEPTED / CLOSED**
- No code · no packages · no tests · no builds · APZWORKFLOW freeze held

## [APZHUB-PLATFORM-WORKFLOW-001] — 2026-07-19 — ACCEPTED / CLOSED

Workflow Platform Foundation (**documentation only**). Recommendation **FOUNDATION READY**. Evidence: [pack](./docs/platform/workflow/README.md) · [acceptance](./docs/foundation/completion-reports/APZHUB-PLATFORM-WORKFLOW-001-programme-acceptance-report.md). Accepted via Owner Decision authorising APZHUB-PLATFORM-WORKFLOW-002.

### Added

- `docs/platform/workflow/` — Platform · Architecture · Provider Strategy · Capabilities · Lifecycle · Execution · Security · Operational · Limitations · Compatibility
- [ADR-0068](./docs/adr/ADR-0068-workflow-platform-first-class-capability.md) · [ADR-0069](./docs/adr/ADR-0069-n8n-workflow-engine-provider.md) (**Accepted**)
- Completion + acceptance reports; APZ-WORKFLOW-001 marked **ACCEPTED / CLOSED**
- No code · no packages · no tests · no builds · APZWORKFLOW freeze held

## [APZ-WORKFLOW-001] — 2026-07-19 — ACCEPTED / CLOSED

APZ Workflow Release 1.0 Planning (**documentation only**). Commercial maturity **Planning** · recommendation **READY WITH CONDITIONS**. Evidence: [pack](./docs/products/apz-workflow/README.md) · [acceptance](./docs/foundation/completion-reports/APZ-WORKFLOW-001-programme-acceptance-report.md). Accepted via Owner Decision authorising APZHUB-PLATFORM-WORKFLOW-001.

### Added

- `docs/products/apz-workflow/` — Release Definition · Feature Catalogue · Release Plan · Roadmap · Backlog · Integrations · Testing · Certification · Operational Readiness · Known Limitations · Compatibility · Release Checklist · Implementation Readiness
- Completion + acceptance reports for APZ-WORKFLOW-001
- No code · no packages · no ADRs from this planning pack

## [APZ-ANALYTICS-002] — 2026-07-19 — Awaiting Acceptance

APZ Analytics Release 1.0 Certification & Production Readiness (**PRODUCTION RELEASE** — certification/packaging only). SemVer **1.0.0** · recommendation **PRODUCTION READY** · class **PRODUCTION_READY_WITH_LIMITATIONS**. Evidence: [1.0.0 pack](./docs/releases/analytics/1.0.0/README.md) · [acceptance](./docs/foundation/completion-reports/APZ-ANALYTICS-002-programme-acceptance-report.md).

### Added

- Release Notes, CHANGELOG entry, Known Limitations, Compatibility, Operational/Production Readiness, Quality Evidence, Certification Report, Completion/Acceptance reports
- Portfolio / commercial / EA catalogue promotion to Production **1.0.0** (Awaiting Acceptance)
- ANALYTICS-006 Owner Acceptance recorded (**ACCEPTED / CLOSED**)

### Fixed

- Web typecheck: `buildQuery` params spread for Analytics dashboard list client

## [APZHUB-PLATFORM-ANALYTICS-006] — 2026-07-19 — ACCEPTED / CLOSED

Analytics Workbench Module (**production code**). `/workspace/analytics/*` · manifest `analytics` **0.1.0**. Evidence: [completion](./docs/sprint/APZHUB-PLATFORM-ANALYTICS-006-completion-report.md) · [workbench](./docs/workbench/analytics/README.md). Accepted via Owner Decision with APZ-ANALYTICS-002.

### Added

- Workbench module UI, router, typed `/api/v1/analytics` client, navigation manifest
- Release 1.0 curated suite views + Saved / Datasets / Reports / Search / Health / Diagnostics
- Vitest + Playwright workbench coverage; docs under `docs/workbench/analytics/`
- No AI / predictive / external BI / custom SQL builders

## [APZHUB-PLATFORM-ANALYTICS-005] — 2026-07-19 — ACCEPTED / CLOSED

Analytics HTTP API (**production code**). OpenAPI **1.11.0** · `/api/v1/analytics/*` · platform-services **0.28.0** · analytics-contracts **0.1.1**. Evidence: [completion](./docs/sprint/APZHUB-PLATFORM-ANALYTICS-005-completion-report.md) · [http](./docs/http/analytics/README.md). Accepted via Owner Decision authorising APZHUB-PLATFORM-ANALYTICS-006.

### Added

- App Router routes + handlers + Zod schemas for Owner analytics endpoint set
- Gateway bootstrap `APZHUB_ANALYTICS_ENABLED` (Metabase or non-prod in-memory)
- OpenAPI paths/schemas/permissions; quality docs under `docs/http/analytics/`
- Pipeline permission propagation for HTTP empty-permissions pattern

## [APZHUB-PLATFORM-ANALYTICS-004] — 2026-07-19 — ACCEPTED / CLOSED

Analytics Platform Services (**production code**). `@apzhub/platform-services` **0.27.0** delivery (package now **0.28.0**). `services/analytics/service.yaml` **0.1.0**. Evidence: [completion](./docs/sprint/APZHUB-PLATFORM-ANALYTICS-004-completion-report.md) · [services](./docs/platform/analytics/ANALYTICS-PLATFORM-SERVICES.md). Accepted via Owner Decision authorising APZHUB-PLATFORM-ANALYTICS-005.

### Added

- Analytics `*ServiceImpl` + Metabase/mock providers + gateway.analytics + AuthZ map
- No Workbench / APZ Analytics (HTTP delivered separately as ANALYTICS-005)

## [APZHUB-PLATFORM-ANALYTICS-003] — 2026-07-19 — ACCEPTED / CLOSED

Analytics Platform Contracts (**production code**). Package `@apzhub/analytics-contracts` **0.1.0**. Evidence: [completion](./docs/sprint/APZHUB-PLATFORM-ANALYTICS-003-completion-report.md) · [contracts](./docs/platform/analytics/ANALYTICS-CONTRACTS.md).

### Added

- `packages/analytics-contracts/` — provider-neutral models, permissions, service interfaces, examples, tests
- Accepted via Owner Decision authorising APZHUB-PLATFORM-ANALYTICS-004

## [APZHUB-INTEGRATION-METABASE-001] — 2026-07-19 — ACCEPTED / CLOSED

Metabase Integration Foundation (**production code**). Package `@apzhub/integration-metabase` **0.1.0**. Recommendation: **CERTIFIED_FOUNDATION**. Evidence: [completion](./docs/sprint/APZHUB-INTEGRATION-METABASE-001-completion-report.md) · [cert](./docs/integrations/metabase/CERTIFICATION-REPORT.md).

### Added

- `integrations/metabase/` — adapter, client, auth, health, diagnostics, version/capability detection, mock, tests
- Certification pack under `docs/integrations/metabase/`
- Accepted via Owner Decision authorising APZHUB-PLATFORM-ANALYTICS-003

## [APZHUB-PLATFORM-ANALYTICS-002] — 2026-07-19 — ACCEPTED / CLOSED

Analytics Information Model (**documentation only**). Recommendation: **FOUNDATION COMPLETE**. Evidence: [completion](./docs/sprint/APZHUB-PLATFORM-ANALYTICS-002-completion-report.md) · [model](./docs/platform/analytics/ANALYTICS-INFORMATION-MODEL.md).

### Added

- Glossary · domain model · entity relationships · contract planning under `docs/platform/analytics/`
- Accepted via Owner Decision authorising APZHUB-INTEGRATION-METABASE-001

## [APZHUB-PLATFORM-ANALYTICS-001] — 2026-07-19 — ACCEPTED / CLOSED

Analytics Platform Foundation (**documentation only**). Recommendation: **FOUNDATION READY**. Evidence: [completion](./docs/sprint/APZHUB-PLATFORM-ANALYTICS-001-completion-report.md) · [pack](./docs/platform/analytics/README.md).

### Added

- `docs/platform/analytics/` — platform, services, capabilities, integration, roadmap, readiness
- [ADR-0066](./docs/adr/ADR-0066-analytics-platform-boundaries.md) · [ADR-0067](./docs/adr/ADR-0067-metabase-analytics-provider.md) (**Accepted**)
- No Metabase/Analytics implementation; no package or frozen-plane changes

## [APZ-ANALYTICS-001] — 2026-07-19 — ACCEPTED / CLOSED

APZ Analytics Release 1.0 Product Planning & Implementation Readiness (**documentation only**). Recommendation: **READY WITH CONDITIONS**. Maturity: **Planning**. Evidence: [completion](./docs/sprint/APZ-ANALYTICS-001-completion-report.md) · [pack](./docs/products/apz-analytics/README.md).

### Added

- `docs/products/apz-analytics/` Release Definition Pack (definition, plan, backlog, readiness, quality/test/cert plans, checklist, post-1.0 roadmap)
- No production code, Metabase adapter, package, or architecture changes

## [APZHUB-OWNER-001] — 2026-07-19 — ACCEPTED / CLOSED

Foundation Acceptance & Operational Transition (**documentation only**). Evidence: [completion](./docs/sprint/APZHUB-OWNER-001-completion-report.md) · [FOUNDATION-CLOSURE](./docs/foundation/FOUNDATION-CLOSURE.md) · [OWNER-ACCEPTANCE-REGISTER](./docs/foundation/OWNER-ACCEPTANCE-REGISTER.md).

### Changed

- Repository Foundation phase **CLOSED**; Operational Delivery **ACTIVE**
- Accepted / closed: ARCHITECTURE-001 · PRODUCT-MANAGEMENT-001 · PORTFOLIO-001 · RELEASES-001 · GOVERNANCE-001 · Support 1.0.0 packaging
- No production code, package, or architecture changes

## [APZHUB-PRODUCT-MANAGEMENT-001] — 2026-07-19 — ACCEPTED / CLOSED / Operational

Commercial Product Management Framework (**documentation only**). Accepted via [APZHUB-OWNER-001](./docs/foundation/OWNER-ACCEPTANCE-REGISTER.md). Evidence: [completion](./docs/sprint/APZHUB-PRODUCT-MANAGEMENT-001-completion-report.md) · [framework](./docs/product-management/README.md).

### Added

- `docs/product-management/` — handbook, lifecycle, editions, licensing, pricing principles, feature/roadmap/journey/personas/KPIs/GTM/release/competitors
- [COMMERCIAL-PRODUCT-CATALOGUE.md](./docs/product-management/COMMERCIAL-PRODUCT-CATALOGUE.md) · [PRODUCT-EDITION-MATRIX.md](./docs/product-management/PRODUCT-EDITION-MATRIX.md) · [COMMERCIAL-ROADMAP.md](./docs/product-management/COMMERCIAL-ROADMAP.md)
- No production code, package, architecture, pricing, or licensing enforcement

## [APZHUB-ARCHITECTURE-001] — 2026-07-19 — ACCEPTED / CLOSED / Operational

Enterprise Architecture Catalogue (**documentation only**). Accepted via [APZHUB-OWNER-001](./docs/foundation/OWNER-ACCEPTANCE-REGISTER.md). Evidence: [completion](./docs/sprint/APZHUB-ARCHITECTURE-001-completion-report.md) · [catalogue](./docs/architecture/ENTERPRISE-ARCHITECTURE-CATALOGUE.md).

### Added

- [ENTERPRISE-ARCHITECTURE-CATALOGUE.md](./docs/architecture/ENTERPRISE-ARCHITECTURE-CATALOGUE.md) and domain catalogues (platform, product, integration, infrastructure, observability, security, quality)
- [ARCHITECTURE-RELATIONSHIPS.md](./docs/architecture/ARCHITECTURE-RELATIONSHIPS.md) · [ARCHITECTURE-MATURITY-MATRIX.md](./docs/architecture/ARCHITECTURE-MATURITY-MATRIX.md)
- No production code, package, or architecture changes

## [APZHUB-GOVERNANCE-001] — 2026-07-19 — ACCEPTED / CLOSED / Operational

Engineering Governance Dashboard Specification (**documentation only**). Accepted via [APZHUB-OWNER-001](./docs/foundation/OWNER-ACCEPTANCE-REGISTER.md). Evidence: [completion](./docs/sprint/APZHUB-GOVERNANCE-001-completion-report.md) · [spec](./docs/governance/ENGINEERING-GOVERNANCE-DASHBOARD.md).

### Added

- `docs/governance/ENGINEERING-GOVERNANCE-DASHBOARD.md` and companion status / health / lifecycle / KPI / data-model specs
- No dashboard UI, Grafana, APIs, or monitoring

## [APZHUB-PORTFOLIO-001] — 2026-07-19 — ACCEPTED / CLOSED / Operational

Cross-Product Integration & Automation Strategy (**documentation only**). Accepted via [APZHUB-OWNER-001](./docs/foundation/OWNER-ACCEPTANCE-REGISTER.md). Evidence: [completion](./docs/sprint/APZHUB-PORTFOLIO-001-completion-report.md) · [strategy](./docs/products/PORTFOLIO-INTEGRATION-STRATEGY.md).

### Added

- [PORTFOLIO-INTEGRATION-STRATEGY.md](./docs/products/PORTFOLIO-INTEGRATION-STRATEGY.md)
- [PLATFORM-EVENT-CATALOGUE.md](./docs/products/PLATFORM-EVENT-CATALOGUE.md)
- [AUTOMATION-ROADMAP.md](./docs/products/AUTOMATION-ROADMAP.md)
- [PORTFOLIO-INTERACTION-DIAGRAM.md](./docs/products/PORTFOLIO-INTERACTION-DIAGRAM.md)

## [APZHUB-RELEASES-001] — 2026-07-19 — ACCEPTED / CLOSED / Operational

Portfolio Release Baseline Standardisation (**documentation only**). Accepted via [APZHUB-OWNER-001](./docs/foundation/OWNER-ACCEPTANCE-REGISTER.md). Evidence: [completion](./docs/sprint/APZHUB-RELEASES-001-completion-report.md) · [register](./docs/releases/PORTFOLIO-RELEASE-REGISTER.md).

### Added

- [PORTFOLIO-RELEASE-REGISTER.md](./docs/releases/PORTFOLIO-RELEASE-REGISTER.md)
- [RELEASE-GOVERNANCE-CHECKLIST.md](./docs/releases/RELEASE-GOVERNANCE-CHECKLIST.md) (mandatory before future Owner Acceptance)
- Support SemVer packaging **1.0.0** under `docs/releases/support/1.0.0/` (indexes OSS-110 Production — no code)

## [APZ Support 1.0.0] — 2026-07-19 — Packaging (APZHUB-RELEASES-001)

Current Production SemVer for APZ Support (documentation packaging of OSS-110-12/14). Evidence: [docs/releases/support/1.0.0/](./docs/releases/support/1.0.0/README.md).

### Added

- Product `RELEASES.md`, Release Notes, Compatibility, Quality Evidence, Baseline Confirmation
- No production code, package, or architecture changes

### Compatibility

- `@apzhub/integration-zammad` **0.6.0** unchanged · Integration SDK **1.0.0** unchanged

## [APZ Time 1.0.0] — 2026-07-19 — ACCEPTED / CLOSED

Current Production Release for APZ Time (Phase 1 Workbench). Evidence: [docs/releases/time/1.0.0/](./docs/releases/time/1.0.0/README.md).

### Added

- Time Workbench module manifest (`services/time/manifests/time/module.yaml`)
- Typed Time client `apps/web/lib/time` (Platform HTTP `/api/v1/time/*` only)
- Workbench views: overview, timesheets, activities, customers, tags, search, health, diagnostics
- Session defaults for last timesheet / customer
- Playwright certification `apzhub-time-1.0-*.spec.ts`
- Release docs under `docs/releases/time/`

### Compatibility

- `@apzhub/integration-kimai` **0.2.0** unchanged · Integration SDK **1.0.0** unchanged · Time services **0.26.1** / HTTP **1.10.0** unchanged

## [APZ Projects 1.1.0] — 2026-07-19 — ACCEPTED / CLOSED

Current Production Release for APZ Projects. Evidence: [docs/releases/projects/1.1.0/](./docs/releases/projects/1.1.0/README.md).

### Added

- Workbench task status transition and priority update via existing `/api/v1/tasks` HTTP
- Workbench task assignee set/clear via existing assignees HTTP
- Project edit and archive UI on project detail
- My Work defaults: session user assignee + last project (`sessionStorage`)
- Roadmap / Sprint honesty labels; Search empty-state guidance + health links
- Typed Projects client methods for task get/update/transition/assign
- Playwright certification `apzhub-projects-1.1-ui-certification.spec.ts`
- Release docs under `docs/releases/projects/` (notes, compatibility, quality evidence)

### Changed

- APZ Projects product version **1.1.0** established as Production baseline (extends Phase 1 Workbench)
- [KNOWN-LIMITATIONS](./docs/products/projects/KNOWN-LIMITATIONS.md) updated for 1.1 residual gaps

### Compatibility

- `@apzhub/integration-plane` **0.6.0** unchanged · Integration SDK **1.0.0** unchanged · no Platform Services redesign

## [0.3.0-workbench-framework] — Milestone 3 Complete

See [Milestone 3 review](./docs/reviews/MILESTONE-003-workbench-framework-review.md) and [release notes](./docs/releases/v0.3.0-workbench-framework.md).

## [0.6.0-event-notification-framework] — Milestone 6 Complete

See [Milestone 6 review](./docs/reviews/MILESTONE-006-event-notification-framework-review.md) and [release notes](./docs/releases/v0.6.0-event-notification-framework.md).

### Added (Sprint 006 summary)

- `@apzhub/event-notification-framework` — Event Registry, Event Bus, Notification Registry, Mapper, Service, Presentation Layer
- Notification Experiences — Badge and Panel; Action audit → in-app notifications
- ADRs 0030–0032 · 1098 unit tests, 30 E2E tests, 90.75% coverage
- [SPR-006 closeout](./docs/sprint/SPR-006-closeout.md)

## [Unreleased] — PCS-001 Platform Core Strategy + Platform Core v1.0 Certified

### Added (OSS-100-11 — Integration SDK v1.0.0 Wave Certification & Architecture Freeze)

- `@apzhub/integration-sdk` promoted **0.9.0 → 1.0.0** (no breaking API changes); `INTEGRATION_SDK_VERSION` aligned
- Architecture Freeze Notice · Reference Standard · Provider Development / Compatibility / Operational Readiness guides
- Security Review · Quality Evidence · v1.0.0 Release Notes · ADR-0065 · Completion Report
- Commands `pnpm certify:integration-sdk` · `pnpm audit:integration-sdk-wave`
- Scoped coverage: lines **91.82%** · functions **93.09%** · branches **84.47%** (LIMITED vs 95% target; non-blocking)
- Knowledge Foundation: Integration SDK marked **Version 1.0.0** · **Architecture Frozen**
- **Classification:** **PRODUCTION_READY_WITH_LIMITATIONS** retained
- **Verdict:** OSS-100-11 COMPLETE — await owner selection for next programme (provisioning / Event Bus / ingress / PCv2-02 / roadmap items)

### Added (APZSEARCH-019 — Search Publication Wave Certification & Architecture Freeze)

- Governance closeout only — **no runtime changes**
- Architecture Freeze Notice · Reference Standard · Operational Readiness (wave-final) · Future Publication Guide (roadmap only)
- Security Confirmation · Wave Certification · Quality Evidence · Programme Summary · Wave Closeout · Completion Report
- Audit `pnpm audit:search-publication-wave`
- Knowledge Foundation: Search Publication programme marked **Architecture Frozen**
- **Classification:** **PRODUCTION_READY_WITH_LIMITATIONS** retained
- **Verdict:** APZSEARCH-019 COMPLETE — programme closed; await owner selection for next platform programme (do not invent APZSEARCH-020)

### Added (APZSEARCH-018 — Publication Reliability Certification & Operational Readiness)

- Certification command `pnpm certify:search-publication` + `pnpm audit:search-publication-reliability`
- Harness `testing/search-publication-reliability` · docs pack (Certification / Operational Readiness / Reliability guides; Architecture / Security / Quality / Certification reviews; Completion Report)
- Re-pinned 015 certification versions for `search-integration` **0.2.0** and orchestrator/admin packages
- Scoped publication coverage: lines **97.43%** · functions **99.59%** · branches **85.76%**
- **Classification:** **PRODUCTION_READY_WITH_LIMITATIONS** (no runtime feature delta)
- **Verdict:** APZSEARCH-018 COMPLETE — await owner for **APZSEARCH-019 — Search Publication Wave Certification & Architecture Freeze** only

### Added (APZSEARCH-017 — Search Publication Operations & Administration)

- `@apzhub/search-publication-admin` **0.1.0** — gateway, service, permissions, audit, DLQ markers
- HTTP `/api/v1/search/publication/*` + dedicated typed client
- Search Workbench **Publication Ops** (`/workspace/search/publication`)
- Audit `pnpm audit:search-publication-admin` · harness `testing/search-publication-admin` · Playwright journey
- Docs: Administration Architecture, Operations/Retry/DLQ/Diagnostics guides, Developer Guide, Completion Report
- **Verdict:** APZSEARCH-017 COMPLETE — await owner for **APZSEARCH-018 — Publication Reliability Certification & Operational Readiness** only

### Added (APZSEARCH-016 — Product Indexing Orchestration Framework)

- `@apzhub/search-orchestrator` **0.1.0** — durable PostgreSQL publication journal, retry, batching, dedupe, diagnostics
- `@apzhub/search-integration` **0.2.0** — orchestration consumer marker; sink docs for 016 handoff
- Migrations **0058** / **0059** (`platform_search_publication_journal` + RLS)
- Composition product hooks (create/update/archive/restore/delete) — platform-services unmodified
- Bootstrap gate `APZHUB_SEARCH_ORCHESTRATION_ENABLED` (deny-by-default)
- Audit `pnpm audit:search-orchestrator` · harness `testing/search-orchestrator`
- Docs: Product Indexing Architecture, Journal/Retry/Lifecycle/Failure Recovery guides, Developer Guide, Completion Report
- Re-pinned publication audit: `search-integration` **0.2.0**, `platform-services` **0.25.0**
- **Verdict:** APZSEARCH-016 COMPLETE — await owner for **APZSEARCH-017 — Search Publication Operations & Administration** only

### Fixed (Knowledge Foundation — Search roadmap correction)

- Removed erroneous post-Metrics recommendation of **APZSEARCH-001** (already complete 2026-07-13)
- Restated Search completed state at **APZSEARCH-015** (**PRODUCTION_READY_WITH_LIMITATIONS**)
- Recommended next Search milestone: **APZSEARCH-016 — Product Indexing Orchestration Framework** only (await owner)

### Added (APZMETRICS-006 — Metrics Wave Certification & Architecture Freeze)

- Architecture Freeze Notice + Platform Metrics Reference Standard
- Wave Operational Readiness + Future Metrics Platform Guide (roadmap only)
- `pnpm audit:metrics-wave` PASS — docs/governance only; no runtime changes
- Programme **closed/frozen** — **PRODUCTION_READY_WITH_LIMITATIONS** retained
- **Verdict:** APZMETRICS-006 COMPLETE — Metrics programme closed/frozen. Roadmap correction: next Search is **APZSEARCH-016** (APZSEARCH-001–015 already complete; do not re-implement 001)

### Added (APZMETRICS-005 — Metrics Vertical Certification & Production Readiness)

- Composite `pnpm certify:metrics-vertical` + `pnpm audit:metrics-vertical`
- Certification harness (10 journeys) + evidence pack under `docs/reviews/APZMETRICS-005-*`
- Classification: **PRODUCTION_READY_WITH_LIMITATIONS**
- Scoped coverage: lines **97.32%** · functions **99.04%** · branches **73%**
- **Verdict:** APZMETRICS-005 COMPLETE — await owner for **APZMETRICS-006 — Metrics Wave Certification & Architecture Freeze** only

### Added (APZMETRICS-004 — Metrics Administration Workbench)

- `/workspace/metrics` Workbench via `platform-metrics` manifests (Activity Bar order **55**, `metrics.read`)
- `apps/web/components/metrics` — typed-client-only metadata UI (all facets + diagnostics)
- Capability limitation banners; `METRICS_SERVICE_UNAVAILABLE` disabled-service state
- Quality: `pnpm audit:metrics-workbench` PASS; coverage lines **99.40%** / functions **95.83%**
- **Verdict:** APZMETRICS-004 COMPLETE — await owner for **APZMETRICS-005 — Metrics Vertical Certification & Production Readiness** only

### Added (APZMETRICS-003 — Metrics HTTP API & Production Typed Client)

- `/api/v1/metrics/*` handlers → `gateway.metrics.*` (metadata only)
- `apps/web/lib/metrics` — `createHttpMetricsClient()`, mock client, `metricsQueryKeys`
- Platform OpenAPI **1.9.0** — tag **Platform Metrics Administration**
- Bootstrap: `APZHUB_METRICS_ENABLED` → `503 METRICS_SERVICE_UNAVAILABLE` when disabled
- Quality: `pnpm audit:metrics-http-client` PASS; coverage lines **99.73%** / functions **99.63%**
- **Verdict:** APZMETRICS-003 COMPLETE — await owner for **APZMETRICS-004 — Metrics Administration Workbench** only

### Added (APZMETRICS-002 — Platform Services, Gateway & Authorization)

- **`@apzhub/metrics-contracts` / `metrics-core` 0.2.0** — gateway facets + `createPlatformMetricsService`
- **`@apzhub/platform-services` 0.25.0** — `gateway.metrics.*`, RequestPipeline, `metricsPlatformOps`, `APZHUB_METRICS_ENABLED` bootstrap
- Diagnostics: readiness / persistence / registration metadata only (no providers)
- Quality: `pnpm audit:metrics-platform-services` PASS; coverage lines **95.22%** / functions **98.95%**
- **Verdict:** APZMETRICS-002 COMPLETE — await owner for **APZMETRICS-003 — Metrics HTTP API & Production Typed Client** only

### Added (APZMETRICS-001 — Platform Metrics Foundation)

- **`@apzhub/metrics-contracts` / `metrics-core` / `metrics-persistence` 0.1.0** — metric definitions & KPI governance SoR (metadata only)
- Domain: Metric, MetricDefinition, MetricVersion, taxonomy, dimensions/labels/units, formulas/aggregations/thresholds (metadata), ownership/consumers, retention/classification, dependencies, KPI/KPIGroup/KPITarget, relationships, metadata
- Permissions catalogue: `metrics.*`, `metrics.read`, `metrics.manage`, `metrics.kpi`, `metrics.definition`, `metrics.metadata`, `metrics.classification`, `metrics.retention`
- Persistence: `platform_metrics_*` tables; migrations **0056** / **0057** (RLS); no silent in-memory fallback
- Quality: `pnpm audit:metrics-foundation` PASS; coverage lines **95.43%** / functions **99.04%**
- Docs: Platform Metrics Architecture, Domain Model, KPI/Governance/Lifecycle/Validation guides, Developer Guide, Completion Report
- **Verdict:** APZMETRICS-001 COMPLETE — await owner for **APZMETRICS-002 — Platform Services, Gateway & Authorization** only

### Added (APZOBSERVE-006 — Observability Wave Certification & Architecture Freeze)

- Programme **closed/frozen**; classification **PRODUCTION_READY_WITH_LIMITATIONS** retained
- Architecture Freeze Notice + Platform Observability Reference Standard
- Final Operational Readiness Guide + Future Observability Platform Guide (roadmap only)
- Security Confirmation · Wave Certification · Quality Evidence · Programme Summary
- Audit: `pnpm audit:observe-wave`
- **Verdict:** APZOBSERVE-006 COMPLETE — await owner for **APZMETRICS-001 — Platform Metrics Foundation** only

### Added (APZOBSERVE-005 — Observability Vertical Certification & Production Readiness)

- Classification: **PRODUCTION_READY_WITH_LIMITATIONS**
- `pnpm audit:observe-vertical` + `pnpm certify:observe-vertical`
- Certification harness: `testing/observe-vertical/apzobserve-005-certification.test.ts` (10 journeys)
- Scoped coverage: lines **98.22%** · functions **96.97%** · branches **76.52%**
- Review pack under `docs/reviews/APZOBSERVE-005-*` + completion report
- Playwright certification **LIMITED** (pre-existing Testing slug conflict)
- **Verdict:** APZOBSERVE-005 COMPLETE — await owner for **APZOBSERVE-006 — Observability Wave Certification & Architecture Freeze** only

### Added (APZOBSERVE-004 — Observability Administration Workbench)

- Manifest-driven Workbench `platform-observability` at `/workspace/observability`
- UI over typed client only (`apps/web/components/observe` → `apps/web/lib/observe`)
- All canonical metadata facets + Overview + Diagnostics + capability limitation banners
- Audit: `pnpm audit:observe-workbench`
- Vitest Workbench coverage: lines **99.65%**, functions **100%**, branches **95.55%**
- Playwright mock-routed journey: `testing/playwright/e2e/apzobserve-004-observe-workbench.spec.ts` (**LIMITED** live webServer — pre-existing testing/traceability slug conflict)
- Docs: Workbench architecture, navigation, views catalogue, health/status, forms, authz UI, limitations, testing, developer guide, completion report
- **Verdict:** APZOBSERVE-004 COMPLETE — await owner for **APZOBSERVE-005 — Observability Vertical Certification & Production Readiness** only

### Added (APZOBSERVE-003 — Observability HTTP API & Production Typed Client)

- `/api/v1/observe/*` thin handlers over `gateway.observe.*` (19 facets + diagnostics)
- OpenAPI **1.8.0** — tag **Platform Observability Administration**
- `apps/web/lib/observe` — `createHttpObserveClient()`, mock client, `observeQueryKeys`
- Bootstrap 503: `OBSERVE_SERVICE_UNAVAILABLE` when `APZHUB_OBSERVE_ENABLED` is false
- Audit: `pnpm audit:observe-http-client`
- Playwright mock HTTP: `testing/playwright/e2e/apzobserve-003-observe-http.spec.ts`
- Docs: HTTP API architecture, route catalogue, typed client / security / consumer guides, completion report
- **Verdict:** APZOBSERVE-003 COMPLETE

### Added (APZOBSERVE-002 — Platform Services, Gateway & Authorization)

- Nested `gateway.observe.*` on canonical `PlatformServiceGateway` (19 metadata facets + diagnostics)
- `@apzhub/observe-contracts` / `@apzhub/observe-core` **0.2.0** — gateway contracts + domain service
- `@apzhub/platform-services` **0.24.0** — observe factories, RequestPipeline wrap, production Authz (`observePlatformOps`)
- Bootstrap: `APZHUB_OBSERVE_ENABLED` + PostgreSQL required (no silent memory)
- Audit: `pnpm audit:observe-platform-services`
- Docs: Platform Services Architecture, Gateway / Authorization / Bootstrap / Metadata guides, developer guide, completion report
- **Verdict:** APZOBSERVE-002 COMPLETE — superseded next by APZOBSERVE-003 (complete)

### Added (APZOBSERVE-001 — Platform Observability Foundation)

- `@apzhub/observe-contracts` **0.1.0** — domain models, permissions (`observe.*`), service ports
- `@apzhub/observe-core` **0.1.0** — validation, lifecycle, repository ports, foundation factory
- `@apzhub/observe-persistence` **0.1.0** — in-memory + PostgreSQL adapters; no silent memory fallback
- Migrations **0054** / **0055** (`platform_observe_*` + RLS)
- Architecture audit `pnpm audit:observe-foundation`
- Docs: Platform Observability Architecture, domain/health/metrics/logs/traces/alerts models, diagnostics + developer guides, completion report
- **Verdict:** APZOBSERVE-001 COMPLETE — await owner for **APZOBSERVE-002 — Platform Services, Gateway & Authorization** only

### Added (APZIDENTITY-006 — Identity Administration Wave Certification & Architecture Freeze)

- Wave audit `pnpm audit:identity-wave` (re-validates vertical 001–005 + closeout artefacts)
- Architecture Freeze Notice · Identity Reference Standard · final Operational Readiness Guide · Future Identity Platform Guide
- Wave closeout harness `testing/identity-vertical/apzidentity-006-wave-closeout.test.ts`
- Review pack `docs/reviews/APZIDENTITY-006-*` · programme summary · wave closeout · completion report
- **Classification retained:** **PRODUCTION_READY_WITH_LIMITATIONS** — Identity Administration programme **closed/frozen**
- **Verdict:** APZIDENTITY-006 COMPLETE — await owner for **APZOBSERVE-001 — Platform Observability Foundation** only

### Added (APZIDENTITY-005 — Identity Administration Vertical Certification)

- Vertical audit `pnpm audit:identity-vertical` (re-executes 001–004 + full-path boundary scans)
- Composite certification command `pnpm certify:identity-vertical` (audits + OpenAPI + harness + scoped coverage)
- Certification harness `testing/identity-vertical/apzidentity-005-certification.test.ts` — Journeys 1–10
- Review pack `docs/reviews/APZIDENTITY-005-*` (plan, vertical certification, architecture/permission/route/contract traceability, security, persistence, operational readiness, known limitations, coverage, production readiness, quality evidence)
- Completion report `docs/sprint/APZIDENTITY-005-completion-report.md`
- **Classification:** **PRODUCTION_READY_WITH_LIMITATIONS** (metadata administration plane; authentication / provisioning / directory sync excluded by design)
- **Verdict:** APZIDENTITY-005 COMPLETE — await owner for **APZIDENTITY-006 — Identity Administration Wave Certification & Architecture Freeze** only

### Added (APZIDENTITY-004 — Identity Administration Workbench)

- Identity Administration Workbench at `/workspace/identity` — `IdentityWorkspaceRouter` + `PlatformIdentityView`, consuming only `apps/web/lib/identity` typed client
- Manifest-driven Activity Bar `platform-identity` + sixteen sidebar sections (Overview, Users, Groups, Roles, Organisations, Tenants, Departments, Positions, Memberships, Service Assignments, Invitations, Policies, Audit, History, References, Diagnostics), all `identity.read`
- Per-user Memberships and Service Assignments panels (metadata only)
- Capability banners: `AUTHENTICATION NOT MANAGED HERE`, `PROVISIONING NOT AVAILABLE`, `DIRECTORY SYNC NOT AVAILABLE`, `NO EMAIL DELIVERY — INVITATION METADATA ONLY`
- Audit `pnpm audit:identity-workbench`; harness `testing/identity-workbench`; Playwright mock spec `apzidentity-004-identity-workbench.spec.ts`
- Docs: Identity Workbench architecture, Navigation Guide, Views Catalogue, Forms & Validation Guide, Authorization-Aware UI Guide, Service Assignments Workbench Guide, Testing Guide, Developer Guide, completion report, coverage baseline, quality evidence
- **Verdict:** APZIDENTITY-004 COMPLETE — await owner for **APZIDENTITY-005 — Identity Vertical Certification & Production Readiness** only

### Added (APZIDENTITY-003 — Identity HTTP API & Production Typed Client)

- `/api/v1/identity/*` — thin handlers over `gateway.identity.*` (all management-plane facets)
- Typed client `apps/web/lib/identity` — `createHttpIdentityClient`, mock, query keys, runtime accessor
- OpenAPI **1.7.0** — Platform Identity Administration tag + facet paths
- Bootstrap gate `APZHUB_IDENTITY_ENABLED` → controlled HTTP 503; no silent fallback
- Audit `pnpm audit:identity-http-client`; Playwright mock HTTP (no Workbench)
- Docs: Identity HTTP API Architecture, Route Catalogue, Typed Client / Security / Consumer guides, completion report
- **Verdict:** APZIDENTITY-003 COMPLETE — await owner for **APZIDENTITY-004 — Identity Administration Workbench** only

### Added (APZIDENTITY-002 — Platform Services, Gateway & Authorization)

- `@apzhub/identity-contracts` / `identity-core` **0.2.0** — `IdentityPlatformGateway` facets + `createPlatformIdentityService`
- `@apzhub/platform-services` **0.23.0** — `gateway.identity.*`, RequestPipeline, `identityPlatformOps`, `PLATFORM_IDENTITY_PERMISSIONS`
- Bootstrap `APZHUB_IDENTITY_ENABLED`; production PostgreSQL required; no silent in-memory fallback
- Service assignment metadata includes `workflow-engine`; diagnostics metadata-only (no IdP probes)
- Audit `pnpm audit:identity-platform-services`; Vitest harness `testing/identity-platform-services`
- Docs: Identity Platform Services Architecture, Gateway/Authorization/Bootstrap/Service Assignment guides, developer guide, completion report
- **Verdict:** APZIDENTITY-002 COMPLETE — await owner for **APZIDENTITY-003 — Identity HTTP API & Production Typed Client** only

### Added (APZIDENTITY-001 — Identity Administration Foundation)

- Packages `@apzhub/identity-contracts` / `identity-core` / `identity-persistence` **0.1.0** — Identity Administration SoR (metadata only; not authentication)
- PostgreSQL migrations **0052** / **0053** (`platform_iam_*`) + Drizzle `platform-iam-schema.ts`
- Permission catalogue `identity.*`; domain models for users, groups, roles, orgs, tenants, memberships, service assignments, audit/history
- Audit `pnpm audit:identity-foundation`; Vitest harness `testing/identity-foundation`
- Docs: Platform Identity Architecture, domain/user/group/role/org/tenant models, membership/assignment/permission guides, developer guide, completion report
- **Verdict:** APZIDENTITY-001 COMPLETE — await owner for **APZIDENTITY-002 — Platform Services, Gateway & Authorization** only

### Added (APZADMIN-006 — Administration Wave Certification & Architecture Freeze)

- `pnpm audit:administration-wave` — programme closeout audit (re-validates APZADMIN-001–005; 0 violations)
- Architecture Freeze Notice · Administration Reference Standard · Operational Readiness Guide · Future Administration Platform Guide
- Programme Summary · Wave Closeout Report · Wave Certification · Quality Evidence · Security Confirmation
- Classification retained: **PRODUCTION_READY_WITH_LIMITATIONS**; Administration SoR wave **closed/frozen**
- **Verdict:** APZADMIN-006 COMPLETE — await owner for **APZIDENTITY-001** only (roadmap — do not implement)

### Added (APZADMIN-005 — Administration Vertical Certification & Production Readiness)

- Vertical audit `pnpm audit:administration-vertical` (re-executes APZADMIN-001–004; 0 violations)
- Vitest certification harness `testing/administration-vertical`
- Review pack `docs/reviews/APZADMIN-005-*` + completion report
- Classification **PRODUCTION_READY_WITH_LIMITATIONS** (metadata governance plane; coverage 99.37% lines / 99.43% functions)
- Certification-only consistency: admin-contracts/core version test pins **0.2.0**
- **Verdict:** APZADMIN-005 COMPLETE — await owner for **APZADMIN-006 — Administration Wave Certification & Architecture Freeze** only

### Added (APZADMIN-004 — Administration Workbench)

- Administration SoR Workbench at `/workspace/administration` — typed-client facades only (`platform-admin` manifests)
- Platform Operations (M8-03) relocated to `/workspace/operations` (parent id `platform-administration` retained)
- Views: overview, modules, categories, sections, registrations, capabilities, actions, permissions, policies, navigation, shortcuts, dashboards, widgets, references, audit, history, diagnostics
- Audit `pnpm audit:administration-workbench`; Vitest harness + component tests; Playwright mock E2E
- Docs: workbench architecture, navigation/views/governance/capability/navigation-metadata/dashboard-widget/security/accessibility/developer guides, completion report
- **Verdict:** APZADMIN-004 COMPLETE — await owner for **APZADMIN-005 — Administration Vertical Certification** only

### Added (APZADMIN-003 — Administration HTTP API & Production Typed Client)

- HTTP surface `/api/v1/administration/*` — handlers call `gateway.administration.*` only
- Typed client `apps/web/lib/administration` (HTTP-only; mock + query keys + facades)
- Platform OpenAPI **1.6.0** — `Platform Administration` tags/paths; management-plane only
- Audit `pnpm audit:administration-http-client`; Playwright mock HTTP smoke
- Docs: HTTP API architecture, route catalogue, typed client / security / consumer guides, coverage baseline, completion report
- **Verdict:** APZADMIN-003 COMPLETE — await owner for **APZADMIN-004 — Administration Workbench** only

### Added (APZADMIN-002 — Platform Services, Gateway & Authorization)

- `@apzhub/admin-contracts` / `admin-core` **0.2.0** — `AdministrationPlatformGateway` + `createPlatformAdministrationService`
- `@apzhub/platform-services` **0.22.0** — `gateway.administration.*`, RequestPipeline, `administrationPlatformOps`, `PLATFORM_ADMIN_PERMISSIONS`
- Bootstrap: `APZHUB_ADMINISTRATION_ENABLED` + production PostgreSQL factory
- Audits: `pnpm audit:administration-platform-services` (foundation audit still passes)
- Docs: platform-services architecture, gateway/authz/bootstrap guides, developer guide, coverage baseline, completion report
- **Verdict:** APZADMIN-002 COMPLETE — await owner for **APZADMIN-003 — HTTP API & Production Typed Client** only

### Added (APZADMIN-001 — Platform Administration Foundation)

- Packages: `@apzhub/admin-contracts` / `admin-core` / `admin-persistence` **0.1.0**
- Canonical module registrations (identity → configuration + future); capability / navigation / action / dashboard metadata
- Permissions: `admin.*` · `admin.read` · `admin.manage` · `admin.audit` · `admin.policy` · `admin.diagnostics` · `admin.navigation` · `admin.registration`
- Migrations **0050/0051**; schema `platform_admin_*`; audit `pnpm audit:admin-foundation`
- Docs: architecture, domain model, registration/capability/permission guides, developer guide, completion report
- **Verdict:** APZADMIN-001 COMPLETE — await owner for **APZADMIN-002** only (no HTTP / Gateway / Workbench)

### Added (APZCONFIG-006 — Configuration Wave Certification & Architecture Freeze)

- `pnpm audit:configuration-wave` — programme closeout audit (re-validates APZCONFIG-001–005; 0 violations)
- Architecture Freeze Notice · Configuration Reference Standard · Operational Readiness Guide · Future Configuration Platform Guide
- Programme Summary · Wave Closeout Report · Wave Certification · Quality Evidence · Security Confirmation
- Classification retained: **PRODUCTION_READY_WITH_LIMITATIONS**; Configuration SoR wave **closed/frozen**
- **Verdict:** APZCONFIG-006 COMPLETE — await owner for **APZCONFIG-007** only (roadmap — do not implement runtime)

### Added (APZCONFIG-005 — Configuration Vertical Certification & Production Readiness)

- `pnpm audit:configuration-vertical` — end-to-end boundary audit (0 violations); re-executes APZCONFIG-001–004
- Certification reviews under `docs/reviews/APZCONFIG-005-*`
- Classification: **PRODUCTION_READY_WITH_LIMITATIONS**
- Architecture frozen — metadata plane only (no runtime/secrets/flags)
- **Verdict:** APZCONFIG-005 COMPLETE — await owner for **APZCONFIG-006** only

### Added (APZCONFIG-004 — Configuration Workbench)

- `/workspace/configuration` — manifest-driven Configuration Workbench (typed-client only)
- Views: Overview, Configurations, Namespaces, Groups, Versions, Overrides, Scopes, Validation, References, Audit, Diagnostics
- `pnpm audit:configuration-workbench` — boundary audit (0 violations)
- Playwright mocked HTTP spec for Workbench navigation
- **Verdict:** APZCONFIG-004 COMPLETE — await owner for **APZCONFIG-005** only

### Added (APZCONFIG-003 — Configuration HTTP API & Production Typed Client)

- `/api/v1/configuration/*` — thin HTTP handlers over `gateway.configuration.*` only
- `apps/web/lib/configuration` — production typed client, mock client, query keys
- Platform OpenAPI **1.5.0** — Configuration tags and paths; runtime routes explicitly omitted
- `pnpm audit:configuration-http-client` — boundary audit (0 violations)
- **Verdict:** APZCONFIG-003 COMPLETE — await owner for **APZCONFIG-004** only

### Added (APZCONFIG-002 — Configuration Platform Services, Gateway & Authorization)

- `gateway.configuration.*` facets; `createConfigurationPlatformServices*`; `configurationPlatformOps`
- `@apzhub/configuration-contracts` / `configuration-core` **0.2.0**; audit `pnpm audit:configuration-platform-services`
- RequestPipeline + Production Authorization; bootstrap `APZHUB_CONFIGURATION_ENABLED`
- **Verdict:** APZCONFIG-002 COMPLETE — await owner for **APZCONFIG-003** only

### Added (APZCONFIG-001 — Platform Configuration Foundation)

- Packages: `@apzhub/configuration-contracts` / `configuration-core` / `configuration-persistence` **0.1.0**
- Migrations **0048/0049**; audit `pnpm audit:configuration-foundation`
- Hierarchy, lifecycle, validation metadata, versioning, permissions — no HTTP/Gateway/Workbench/runtime/secrets
- **Verdict:** APZCONFIG-001 COMPLETE — await owner for **APZCONFIG-002** only

### Added (APZNOTIFY-006 — Notification Wave Certification & Architecture Freeze)

- Wave closeout: `pnpm audit:notification-wave` + harness
- Architecture Freeze Notice · Operational Readiness Guide · Future Delivery Framework Guide
- Programme Summary · Wave Closeout Report · Wave Certification · Quality Evidence
- Classification retained: **PRODUCTION_READY_WITH_LIMITATIONS**; Notification SoR wave **closed/frozen**
- **Verdict:** APZNOTIFY-006 COMPLETE — await owner for **APZNOTIFY-007** only (roadmap — do not implement delivery)

### Added (APZNOTIFY-005 — Notification Vertical Certification & Production Readiness)

- Certification harness: `pnpm audit:notification-vertical` + `testing/notification-vertical/`
- Review pack: architecture/dependency/boundary audits, HTTP/typed-client/workbench certifications, authorization/security reviews, performance + coverage baselines, production readiness
- Classification: **PRODUCTION_READY_WITH_LIMITATIONS** (metadata plane; no delivery/Event Bus/workers/realtime)
- Consolidated coverage: **98.42%** lines · **96.95%** functions
- **Verdict:** APZNOTIFY-005 COMPLETE — Notification vertical frozen — await owner for **APZNOTIFY-006** only — no delivery

### Added (APZNOTIFY-004 — Notification Workbench)

- `/workspace/notifications` metadata Workbench (typed client only)
- Manifests `platform-notifications*` (Activity Bar + Sidebar)
- Audit: `pnpm audit:notification-workbench`
- Docs: workbench architecture, navigation/views/commands/UX/developer guides, completion report
- **Verdict:** APZNOTIFY-004 COMPLETE — await owner for **APZNOTIFY-005** only — no delivery

### Added (APZNOTIFY-003 — Notification HTTP API & Production Typed Client)

- `/api/v1/notifications/*` management-plane HTTP (gateway.notification.* only)
- OpenAPI **1.4.0** — Platform Notifications tags + schemas
- Typed client `apps/web/lib/notifications` (HTTP + mock + query keys)
- Audit: `pnpm audit:notification-http-client`
- Docs: HTTP API architecture, route catalogue, typed client, security/tenancy, lifecycle API, privacy, error model, consumer guide, completion report
- **Verdict:** APZNOTIFY-003 COMPLETE — await owner for **APZNOTIFY-004** (Workbench) only — no delivery

### Added (APZNOTIFY-002 — Notification Platform Services, Gateway & Authorization)

- `gateway.notification.*` nested facets on PlatformServiceGateway (RequestPipeline + Production Authorization)
- `@apzhub/notification-contracts` **0.2.0** — gateway facet contracts
- `@apzhub/notification-core` **0.2.0** — `createPlatformNotificationService` domain service
- `@apzhub/platform-services` **0.21.0** — thin wrappers, bootstrap, op-map, permission catalogue
- Env gate `APZHUB_NOTIFICATION_ENABLED`; audit `pnpm audit:notification-platform-services`
- Docs: Platform Services Architecture, Gateway / Authorization / Bootstrap / Developer guides, Completion Report
- **Verdict:** APZNOTIFY-002 COMPLETE — await owner for **APZNOTIFY-003** only

### Added (APZNOTIFY-001 — Platform Notification Foundation)

- `@apzhub/notification-contracts` **0.1.0** — domain models, lifecycle enums, permission catalogue, service port
- `@apzhub/notification-core` **0.1.0** — lifecycle transitions, validation, foundation factory
- `@apzhub/notification-persistence` **0.1.0** — in-memory + PostgreSQL metadata repositories (no silent fallback)
- Migrations **0046** / **0047** (RLS) for `platform_notification*` tables
- Audit: `pnpm audit:notification-foundation`
- Docs: Architecture, Domain Model, Lifecycle, Permissions, Developer Guide, Completion Report
- **Verdict:** APZNOTIFY-001 COMPLETE — await owner for **APZNOTIFY-002** only (Workflow programme remains closed; **APZSEARCH-016** deferred)

### Added (APZWORKFLOW-011 — Workflow Engine Wave Certification & Reference Adapter Closeout)

- Declared **`@apzhub/integration-n8n` 0.1.0** the official APZHUB Workflow Engine Reference Adapter
- Architecture freeze for Platform + Engine patterns (Gateway, HTTP, typed client, Workbench, Integration SDK, n8n adapter)
- Docs: Reference Adapter Standard, Final Architecture, Freeze Notice, Operational Readiness, Future Adapter Guide, Programme Summary, Wave Closeout, Completion Report
- Audit: `pnpm audit:workflow-engine-wave` (re-runs SoR + Engine verticals)
- Certification defect fixes only: SoR audits 001/005 scoped/version pins for engine coexistence
- **Verdict:** APZWORKFLOW-011 COMPLETE — wave **frozen** — await owner for **APZWORKFLOW-012** only (roadmap; **APZSEARCH-016** deferred)

### Added (APZWORKFLOW-010 — Workflow Engine Vertical Certification)

- Classification: **PRODUCTION_READY_WITH_LIMITATIONS** (read-only engine vertical; frozen)
- Consolidated audit: `pnpm audit:workflow-engine-vertical` (re-runs 006–009)
- Harness: `testing/workflow-engine-vertical/`
- Review pack: Vertical / Architecture / Dependency / Boundary / HTTP / Typed Client / Workbench / Authorization / Security / Performance / Coverage / Production Readiness
- Certification defect corrections: 006 `premature-wiring` post-007 skip; 007 `web-no-direct-n8n` allow gateway bootstrap only (008+)
- **Verdict:** APZWORKFLOW-010 COMPLETE — await owner approval before **APZWORKFLOW-011** only (**APZSEARCH-016** deferred)

### Added (APZWORKFLOW-009 — n8n Workbench Integration)

- Workflow Engine Workbench at `/workspace/workflow-engine` (presentation only)
- Manifest-driven Activity Bar + Sidebar (`platform-workflow-engine*`)
- Views: Overview, Workflows (+ read-only definition viewer), Templates, Projects, Users, Tags, Capabilities, Health, Diagnostics, Compatibility
- Commands: Refresh, View Details, Copy ID, Open API Metadata, Validate Connection
- React Query via `workflowEngineQueryKeys`; consumes `engine-api` / `createHttpWorkflowEngineClient()` only
- Audit: `pnpm audit:workflow-engine-workbench`
- **Verdict:** APZWORKFLOW-009 COMPLETE — await owner approval before **APZWORKFLOW-010** only (**APZSEARCH-016** deferred)

### Added (APZWORKFLOW-008 — n8n HTTP API & Production Typed Client)

- `/api/v1/workflows/engine/*` read-only HTTP → `gateway.workflow.engine.*`
- OpenAPI Platform API **1.3.0** · tag **Workflow Engine**
- Typed client `createHttpWorkflowEngineClient()` + mock + `workflowEngineQueryKeys` + engine facades
- Bootstrap optional engine wiring via `APZHUB_WORKFLOW_ENGINE_ENABLED` (explicit config; no silent mock)
- Audit: `pnpm audit:workflow-engine-http`
- **Verdict:** APZWORKFLOW-008 COMPLETE — await owner approval before **APZWORKFLOW-009** only (**APZSEARCH-016** deferred)

### Added (APZWORKFLOW-007 — n8n Platform Services Integration)

- `@apzhub/workflow-contracts` **0.3.0** — `WorkflowEngineGateway` + `workflow.engine.*` permissions
- `@apzhub/platform-services` **0.20.0** — thin `gateway.workflow.engine.*` façade over certified `@apzhub/integration-n8n` **0.1.0**
- Production Authorization: `workflowEngineOps`; RequestPipeline wrap; production/test engine factories
- Audit: `pnpm audit:workflow-n8n-platform-services` · scoped engine coverage **100%**
- Docs: Platform Services Architecture, Gateway/Authorization/Bootstrap/Error guides, Developer Guide, Completion Report
- **Verdict:** APZWORKFLOW-007 COMPLETE — await owner approval before **APZWORKFLOW-008** only (**APZSEARCH-016** deferred)

### Added (APZWORKFLOW-006 — n8n Reference Adapter Foundation)

- `@apzhub/integration-n8n` **0.1.0** — read-only Workflow Engine Reference Adapter (`IntegrationAdapterBase`)
- Auth: API key / PAT / Basic; OAuth placeholder; injected fetch REST client (no official n8n SDK)
- Canonical metadata mapping; health / diagnostics / compatibility; capability registry
- Audit: `pnpm audit:n8n-adapter` · Vitest coverage ≥95% (scoped)
- **Verdict:** APZWORKFLOW-006 COMPLETE — await owner approval before **APZWORKFLOW-007** only (**APZSEARCH-016** deferred)

### Added (APZWORKFLOW-005 — Workflow Vertical Certification)

- Vertical audit `pnpm audit:workflow-vertical` (re-executes 001–004; 0 violations)
- Certification harness `testing/workflow-vertical/`
- Review pack under `docs/reviews/APZWORKFLOW-005-*` + completion report
- **Classification:** **PRODUCTION_READY_WITH_LIMITATIONS** (management plane; no execution/n8n)
- **Verdict:** APZWORKFLOW-005 COMPLETE — architecture frozen; await owner approval before **APZWORKFLOW-006** only (**APZSEARCH-016** deferred)

### Added (APZWORKFLOW-004 — Workflow Workbench)

- Metadata-only Workflow Workbench at `/workspace/workflows` (overview, library, versions, templates, categories, folders, validation, audit, diagnostics)
- Manifests `platform-workflows*` · Definition Viewer / Graph · version compare · audit timeline · metadata export
- Shell mount `WorkflowsWorkspaceRouter` · TanStack Query via `workflowQueryKeys`
- Audit: `pnpm audit:workflow-workbench`
- **Verdict:** APZWORKFLOW-004 COMPLETE — await owner approval before **APZWORKFLOW-005** only (**APZSEARCH-016** deferred)

### Added (APZWORKFLOW-003 — Workflow HTTP API & Production Typed Client)

- `/api/v1/workflows` HTTP routes mapped 1:1 to `gateway.workflow.*` (metadata/lifecycle only)
- Typed client `createHttpWorkflowClient()` in `apps/web/lib/workflows/` (+ mock + facades)
- OpenAPI tag **Platform Workflow**; info version **1.2.0**
- Bootstrap wires `createWorkflowPlatformServicesForProduction` when `APZHUB_WORKFLOW_ENABLED` + `DATABASE_URL`
- Audit: `pnpm audit:workflow-http-client`
- Docs: HTTP API, OpenAPI, Typed Client, Consumer Integration, Security, completion report
- **Verdict:** APZWORKFLOW-003 COMPLETE — await owner approval before **APZWORKFLOW-004** only (**APZSEARCH-016** deferred)

### Added (APZWORKFLOW-002 — Workflow Platform Services, Gateway & Authorization)

- Nested `gateway.workflow.{workflows,versions,templates,categories,folders,validation,audit}` on existing `PlatformServiceGateway`
- `@apzhub/workflow-contracts` **0.2.0** — `WorkflowPlatformGateway` + `workflow.validation` permission
- `@apzhub/workflow-core` **0.1.1** — `createPlatformWorkflowService` domain implementation
- `@apzhub/workflow-persistence` **0.1.1** — `createWorkflowPersistenceForTest`
- `@apzhub/platform-services` **0.19.0** — workflow factories, thin impls, `workflowPlatformOps`, catalogue spread
- `@apzhub/platform-service-contracts` **0.16.0** — workflow stub
- Audit: `pnpm audit:workflow-platform-services`
- **Verdict:** APZWORKFLOW-002 COMPLETE — await owner approval before **APZWORKFLOW-003** only (**APZSEARCH-016** deferred)

### Added (APZWORKFLOW-001 — Platform Workflow Foundation)

- `@apzhub/workflow-contracts` **0.1.0** — domain models, permission catalogue, service ports (no execute)
- `@apzhub/workflow-core` **0.1.0** — lifecycle transitions, structural/reference/parameter/version/lifecycle validation, foundation factory
- `@apzhub/workflow-persistence` **0.1.0** — in-memory + Drizzle Postgres repositories
- Migrations **0044** / **0045** (`platform_workflow*`) + RLS; schema `platform-workflow-schema.ts`
- Audit `pnpm audit:workflow-foundation`; harness `testing/workflow-foundation`
- **Verdict:** APZWORKFLOW-001 COMPLETE — await owner approval before **APZWORKFLOW-002** only (**APZSEARCH-016** deferred)

### Added (APZSEARCH-015 — Cross-Product Search Publication Certification)

- Certification-only milestone: audit `pnpm audit:search-publication`, harness `testing/search-publication` (**19** tests), review pack under `docs/reviews/APZSEARCH-015-*`
- Re-certified Framework **0.1.0** + Projects/Support/Documents/Reporting **0.1.0** + Testing **0.1.1**; frozen platform stack unchanged
- Classification: **PRODUCTION_READY_WITH_LIMITATIONS** (in-memory journals, hooks unwired, ADR-0064, Playwright LIMITED, indexing → 016)
- **Verdict:** APZSEARCH-015 COMPLETE — await owner approval before **APZSEARCH-016** (Product Indexing Orchestration Framework) only

### Added (APZSEARCH-014 — Reporting Search Publication Adapter)

- `@apzhub/search-reporting` **0.1.0** — Reporting → Search Integration Framework (metadata-only; template/category/definition/generation/output/catalogue entities)
- Explicit safe-field allowlist; rendered body / parametersJson / checksum hex rejection; classification never-downgrade (fail-closed confidential)
- Production factories require explicit publication sink; `*ForTest` uses in-memory sink
- Audit `pnpm audit:search-reporting`; coverage **96.72%** lines/statements
- **Verdict:** APZSEARCH-014 COMPLETE — await owner approval before **APZSEARCH-015** (Cross-Product Search Publication Certification)

### Added (APZSEARCH-013 — APZ TCMS Search Publication Adapter)

- `@apzhub/search-testing` **0.1.1** — APZ TCMS → Search Integration Framework (metadata-only; **40** entity types)
- Orchestrator `TestingSearchPublisher` + specialised publishers: Manual, Automation, Certification, Release, Engineering Intelligence, Quality, Reporting Metadata, Pipeline
- Explicit safe-field allowlist; evidence/report-binary / pipeline artifact / storage / credential rejection; classification never-downgrade
- Production factories require explicit publication sink; `*ForTest` uses in-memory sink
- Audit `pnpm audit:search-testing`; coverage **98.06%** lines/statements
- **Verdict:** APZSEARCH-013 COMPLETE — await owner approval before **APZSEARCH-014** (Reporting Search Publication Adapter)

### Added (APZSEARCH-012 — Documents Search Publication Adapter)

- `@apzhub/search-documents` **0.1.0** — Documents → Search Integration Framework (metadata-only; document/version/folder/collection/category/tag)
- Explicit safe-field allowlist; storage key / binary / OCR rejection; classification mapping without downgrade
- Production factories require explicit publication sink; `*ForTest` uses in-memory sink
- Audit `pnpm audit:search-documents`; coverage **97.03%** lines/statements
- Certification fix: Document foundation harness platform-services pin **0.18.0**
- **Verdict:** APZSEARCH-012 COMPLETE — await owner approval before **APZSEARCH-013** (APZ TCMS Search Publication Adapter)

### Added (APZSEARCH-011 — Support Search Publication Adapter)

- `@apzhub/search-support` **0.1.0** — Support → Search Integration Framework (support_request/article/organisation/group/user)
- Zammad identifier rejection; tenant isolation; explicit lifecycle hooks; Support Request ≠ Project Task
- Audit `pnpm audit:search-support`; coverage **97.61%** lines/statements
- **Verdict:** APZSEARCH-011 COMPLETE — await owner approval before **APZSEARCH-012** (Documents Search Publication Adapter)

### Added (APZSEARCH-010 — Projects Search Publication Adapter)

- `@apzhub/search-projects` **0.1.0** — Projects → Search Integration Framework publication (Workspace/Project/Task/Sprint/Milestone/Module/Team)
- Plane identifier rejection; tenant isolation; explicit lifecycle hooks (no workers/Event Bus)
- Audit `pnpm audit:search-projects`; coverage **97.58%** lines/statements
- **Verdict:** APZSEARCH-010 COMPLETE — await owner approval before **APZSEARCH-011** (Support Search Publication Adapter)

### Added (APZSEARCH-009 — Cross-Product Search Integration Framework)

- `@apzhub/search-integration` **0.1.0** — canonical entity publication framework (publisher, mapper, validator, lifecycle, diagnostics/metrics/logger/errors)
- Product contracts only: Projects, Support, Documents, Testing (APZ TCMS), Reporting — **no adapters**
- In-memory / noop publication sinks — Search Platform unchanged / frozen
- Audit `scripts/apzsearch-009-search-integration-audit.mjs` / `pnpm audit:search-integration`
- Coverage **95.95%** lines/statements · **97.14%** functions · **87.74%** branches
- **Verdict:** APZSEARCH-009 COMPLETE — await owner approval before **product search publication adapters**. No workers / Event Bus / OCR / AI / Search Platform changes.

### Added (APZSEARCH-008 — Search Vertical Certification & Production Readiness)

- Classification **PRODUCTION_READY_WITH_LIMITATIONS** (same class as Documents)
- Vertical audit `scripts/apzsearch-008-search-vertical-audit.mjs` / `pnpm audit:search-vertical` — **0 violations**
- Certification harness `testing/search-vertical/apzsearch-008-certification.test.ts`
- Review pack under `docs/reviews/APZSEARCH-008-*.md` + completion report APZSEARCH-008-CR
- Certified package floor unchanged: contracts **0.4.0**, persistence **0.2.0**, SDK **0.1.0**, meilisearch **0.1.0**, platform-services **0.18.0**
- Certification-only pin updates so historical 001/003 foundation harnesses and APZSEARCH-003 audit accept the certified stack versions
- Scoped vertical coverage re-measure: **97.04%** lines/statements · **97.57%** functions · **89.33%** branches
- Documented Next.js Testing slug conflict as external LIMITATION for Playwright (predates Search; not a Search defect)
- **Verdict:** APZSEARCH-008 COMPLETE — await owner approval before **APZSEARCH-009** (Cross-Product Search Integration Framework). No new Search functionality.

### Added (APZSEARCH-006 — Meilisearch Platform Integration & Search Execution Gateway)

- `@apzhub/search-contracts` **0.4.0** — execution service interfaces, granular permissions, `PlatformSearchExecutionProvider`, security/tenant isolation types
- `@apzhub/platform-services` **0.18.0** — `services/search-execution/` (`MeilisearchSearchProvider`, resolver, mandatory tenant filters, factories, gateway facets)
- Consumes `@apzhub/integration-meilisearch` **0.1.0** public API only (mock fetch; no live engine)
- ADR-0061/0062/0063 — tenant isolation, canonical ID mapping, provider resolution precedence
- Audit `scripts/apzsearch-006-search-execution-audit.mjs` / `pnpm audit:search-execution`
- **Verdict:** APZSEARCH-006 COMPLETE — await owner approval before **APZSEARCH-007** (Search HTTP API, Typed Client & Workbench). No HTTP/OpenAPI/Workbench in this milestone.

### Added (APZSEARCH-005 — Meilisearch Reference Adapter)

- `@apzhub/integration-meilisearch` **0.1.0** — Meilisearch CE reference search adapter (`SearchIntegrationAdapterBase`, raw RestClient, mock REST, `NOT_SUPPORTED` for semantic/vector/fuzzy/AI/OCR)
- Depends on `@apzhub/integration-sdk` + `@apzhub/integration-search-sdk` **0.1.0** + `@apzhub/search-contracts` **0.3.0** (unchanged at the time)
- ADR-0060 — Meilisearch as first reference engine; OpenSearch remains future option
- Audit `scripts/apzsearch-005-meilisearch-adapter-audit.mjs` / `pnpm audit:meilisearch-adapter`
- Docs: architecture, capability/compatibility matrices, developer & configuration guides, completion report
- **Verdict:** APZSEARCH-005 COMPLETE — next became APZSEARCH-006 (execution gateway; not HTTP).

### Added (APZSEARCH-004 — Search Integration SDK)

- `@apzhub/integration-search-sdk` **0.1.0** — vendor-neutral Search Integration SDK (`SearchIntegrationAdapterBase`, factory, capabilities, `NOT_IMPLEMENTED` operation runner, mock adapter)
- Depends on `@apzhub/integration-sdk` **0.9.0** + `@apzhub/search-contracts` **0.3.0** (unchanged)
- Audit `scripts/apzsearch-004-search-integration-sdk-audit.mjs` / `pnpm audit:search-integration-sdk`
- Docs: Search Integration SDK architecture, capability/compatibility models, adapter guides, completion report
- **Verdict:** APZSEARCH-004 COMPLETE — await owner approval before **APZSEARCH-005** (Meilisearch Reference Adapter Evaluation & Certification). No HTTP/Workbench/engines/indexing/execution.

### Added (APZSEARCH-003 — Search Platform Services, Gateway & Authorization Integration)

- `@apzhub/platform-services` **0.17.0** — Search platform factories, RequestPipeline-wrapped gateway facets, production authz operation map, `SEARCH_SERVICE_ENABLED` bootstrap
- `@apzhub/search-contracts` **0.3.0** — 14-facet `SearchPlatformGateway`, granular permissions, management-plane readiness, `SearchDomainError`
- `@apzhub/search-persistence` **0.2.0** — full management thin services; migration `0043_apz_platform_search_management`
- Audit `scripts/apzsearch-003-platform-services-audit.mjs` / `pnpm audit:search-platform-services`
- Docs: Search Platform Service Architecture, gateway/contracts/permission/operation-map guides, completion report
- **Verdict:** APZSEARCH-003 COMPLETE — await owner approval before **APZSEARCH-004**. No HTTP/Workbench/engines/indexing/execution.

### Added (APZSEARCH-002 — Search Persistence & Provider Framework)

- `@apzhub/search-persistence` **0.1.0** — PostgreSQL + in-memory metadata repos; provider registry; stub managed provider; thin platform services; production/test factories (no silent memory fallback)
- `@apzhub/search-contracts` **0.2.0** — managed provider lifecycle + configuration validation; health status `available`
- Migrations `0041_apz_platform_search` / `0042_apz_platform_search_rls` — 16 metadata tables + RLS
- Audit `scripts/apzsearch-002-search-persistence-audit.mjs` / `pnpm audit:search-persistence`
- Docs: persistence architecture, registry/configuration/security guides, developer guide, completion report
- **Verdict:** APZSEARCH-002 COMPLETE — await owner approval before **APZSEARCH-003**. No HTTP/Workbench/engines/indexing/execution.

### Added (APZSEARCH-001 — Platform Search Foundation)

- `@apzhub/search-contracts` **0.1.0** — canonical search models, provider/adapter/service interfaces, query validation, security helpers, diagnostics/configuration
- Permissions: `search.*`, `search.query`, `search.provider`, `search.diagnostics`, `search.configuration`, `search.audit` (additive with legacy `search.execute|list|read`)
- Audit `scripts/apzsearch-001-search-foundation-audit.mjs` / `pnpm audit:search-foundation`
- Foundation harness `testing/search-foundation/apzsearch-001-foundation.test.ts`
- Docs: architecture, query model, provider abstraction, product adapter guide, security, permissions, developer guide, completion report
- **Verdict:** APZSEARCH-001 COMPLETE — await owner approval before **APZSEARCH-002**. No HTTP/Workbench/engines/indexing/OCR/AI/Event Bus.

### Added (APZDOCS-006 — Document Vertical Certification & Production Readiness)

- Classification **PRODUCTION_READY_WITH_LIMITATIONS** — architecture frozen at APZDOCS-005
- Vertical audit `scripts/apzdocs-006-document-vertical-audit.mjs` / `pnpm audit:document-vertical` — **0 violations**
- Certification harness `testing/document-vertical/apzdocs-006-certification.test.ts`
- Certification pack: vertical certification, architecture/dependency/boundary, API, workbench, storage, security, coverage, performance, production readiness, consumer guide update, completion report
- Playwright Document Workbench recorded **LIMITED** (unrelated Next.js slug conflict)
- **Verdict:** APZDOCS-006 COMPLETE — await owner approval before **APZSEARCH-001**. No uploads/downloads/OCR/AI/search/new features.

### Added (APZDOCS-005 — Document Workbench)

- Product-neutral `/workspace/documents` workbench — Overview through Diagnostics/Metadata
- Manifests `platform-documents*` (activity bar + sidebar) with `document.*` permissions
- `PlatformDocumentsView` + `DocumentsWorkspaceRouter` over `document-api` / `createHttpDocumentClient()` only
- Read-only commands: Refresh, View Metadata/Versions/Relationships/Retention/Audit, Open Folder/Collection, Inspect Diagnostics, Copy IDs
- Audit script `scripts/apzdocs-005-document-workbench-audit.mjs` — **PASS**
- Playwright `apzdocs-005-platform-documents-workbench.spec.ts` (mocked HTTP)
- Docs: Workbench architecture, navigation/views/commands guides, developer guide, completion report
- **Verdict:** APZDOCS-005 COMPLETE — await owner approval before **APZDOCS-006**. No uploads/downloads/OCR/AI/search engine/editing.

### Added (APZDOCS-004 — Document HTTP API & Typed Client)

- `/api/v1/documents` thin HTTP handlers via PlatformServiceGateway only (no document-core in handlers)
- OpenAPI tag **Platform Documents** + canonical document DTOs in `APZHUB-Platform-OpenAPI-v1.yaml`
- `createHttpDocumentClient()` + mock client (`apps/web/lib/documents/`)
- Storage key / reconciliation hint redaction at HTTP boundary; diagnostics safe metadata only
- Audit script `scripts/apzdocs-004-document-http-audit.mjs` — **PASS**
- Docs: HTTP API, OpenAPI Guide, Typed Client Guide, Consumer Integration Guide, Security Guide, completion report
- **Verdict:** APZDOCS-004 COMPLETE — await owner approval before **APZDOCS-005** (Document Workbench). No Workbench/uploads/downloads/OCR/AI/search engine.

### Added (APZDOCS-003 — Document Platform Services, Gateway & Authorization Integration)

- `@apzhub/document-contracts` **0.3.0** — `DocumentPlatformGateway` facets; additive `document.tag.*` / `folder.*` / `collection.*` / metadata permissions
- `@apzhub/document-core` **0.3.0** — `assignFolder`, `assignCollection`, `applyRetention`
- `@apzhub/platform-services` **0.16.0** — `createDocumentPlatformServices` / `ForProduction` / `ForTest`; gateway document facets; RequestPipeline + `documentPlatformOps`; `PLATFORM_DOCUMENT_PERMISSIONS` in catalogue
- Thin wrappers only — no binary transfer via gateway; no storage provider access from platform services
- Audit script `scripts/apzdocs-003-platform-services-audit.mjs` — **0 violations**
- Docs: platform services architecture, gateway/authorization/developer/consumer guides, completion report
- **Verdict:** APZDOCS-003 COMPLETE — await owner approval before **APZDOCS-004**. No REST/Workbench/OCR/AI/search engine/Event Bus/workers.

### Added (APZDOCS-002 — Production Persistence & Storage Providers)

- `@apzhub/document-contracts` **0.2.0** — content/version/integrity/reconciliation contracts; additive `document.storage.*` / `document.version.*` / `document.reconciliation.*` permissions
- `@apzhub/document-core` **0.2.0** — storage coordinator, SHA-256 integrity, storage config, `createDocumentPlatformFoundation`
- `@apzhub/document-persistence` **0.2.0** — PostgreSQL repositories + `createDocumentPersistenceForProduction` / `ForTest`
- `@apzhub/document-storage` **0.1.0** — filesystem, S3-compatible, memory test providers + production/test factories
- Drizzle migrations **0039/0040** (`platform_document_version`, `platform_document_storage_object`, RLS) — no binary columns
- Audit script `scripts/apzdocs-002-persistence-storage-audit.mjs` — **0 violations**
- Docs: persistence/storage architecture, operator guides, five ADRs, completion report
- **Verdict:** APZDOCS-002 COMPLETE — await owner approval before **APZDOCS-003**. No REST/UI/OCR/AI/search/Event Bus/workers.

### Added (APZDOCS-001 — Platform Document Foundation)

- `@apzhub/document-contracts` **0.1.0** — canonical models, `document.*` permissions, `PlatformDocumentService`
- `@apzhub/document-core` **0.1.0** — storage provider interfaces, lifecycle/classification rules, domain service
- `@apzhub/document-persistence` **0.1.0** — in-memory metadata repositories
- Drizzle schema + migrations **0037/0038** (`platform_document*`, RLS) — no binary columns
- Audit script `scripts/apzdocs-001-document-foundation-audit.mjs` — **0 violations**
- Docs: Architecture, Domain, Storage, Classification, Lifecycle, Permissions, Developer Guide, completion report
- **Verdict:** APZDOCS-001 COMPLETE — await owner approval before **APZDOCS-002**. No REST/UI/binary/OCR/AI/search.

### Added (APZREPORT-003 — Reporting Vertical Certification)

- Certified Reporting Platform end-to-end — **PRODUCTION_READY_WITH_LIMITATIONS**
- Architecture frozen at APZREPORT-002 surface (no new functionality)
- Automated audit: `scripts/apzreport-003-reporting-vertical-audit.mjs` — **0 violations**
- Certification harness: `testing/reporting-vertical/apzreport-003-certification.test.ts`
- Docs: Vertical Certification, architecture/dependency/boundary audit, API/workbench/security audits, performance + coverage baselines, production readiness, completion report
- Consumer onboarding guide updated for Projects / Support / Documents / Analytics / Workflow (document only)
- **Verdict:** APZREPORT-003 COMPLETE — await owner approval before **APZDOCS-001**. No scheduling/email/AI/binary storage.

### Added (APZREPORT-002 — Platform Reporting HTTP API & Workbench)

- HTTP `/api/v1/reporting` (formats, types, templates, validate, generate, preview, generations) → `gateway.reporting` only
- OpenAPI tag **Platform Reporting** — validated
- `createHttpReportingClient()` + mock + workbench `/workspace/reporting`
- TCMS consumes platform reporting client for template placeholders; `report.view` gating
- Playwright `apzreport-002-platform-reporting-workbench.spec.ts`
- Docs: HTTP API, Workbench, Typed Client, Consumer Integration, Security, completion report
- **Verdict:** APZREPORT-002 COMPLETE — await owner approval before **APZREPORT-003**. No scheduling/email/AI/binary storage.

### Added (APZREPORT-001 — Platform Reporting Foundation)

- New packages `@apzhub/reporting-contracts` **0.1.0** and `@apzhub/reporting-core` **0.1.0**
- Generic platform reporting engine extracted from APZ TCMS (APZTCMS-024)
- TCMS remains first consumer via ports + compatibility re-exports — no functional changes
- Platform permissions `PLATFORM_REPORT_PERMISSIONS`; `@apzhub/platform-services/reporting` re-export
- Docs: Platform Reporting Architecture, Migration, Developer, Consumer Integration, Package guides + completion report
- **Verdict:** APZREPORT-001 COMPLETE — await owner approval before **APZREPORT-002**. No REST/Workbench/scheduling/email.

### Added (APZTCMS-024 — Reporting & Document Generation Framework)

- Generic reporting framework in `@apzhub/testing-services` — template engine, 14 built-in templates, 6 output providers
- Domain `ReportingService` + canonical models in `@apzhub/testing-contracts` **0.11.0**
- Persistence `testing_report_template` + `testing_report_generation_metadata` — migrations 0035/0036
- `PlatformServiceGateway.testing.reporting` — full facet (generate/preview/validate/templates/metadata)
- Permissions `report.*` + `testingReportingOps` authorization map
- Vitest focused green; scoped coverage **~97.5%** lines on reporting modules
- Docs: Reporting Architecture, Template Engine, Renderers, Output Providers, Metadata, Developer Guide, completion report
- **Verdict:** APZTCMS-024 COMPLETE — await owner approval before **APZTCMS-025**. No REST/Workbench/scheduling/email.

### Added (APZTCMS-023 — Executive Dashboards)

- Testing workbench **Executive Dashboards** (`/workspace/testing/executive-dashboards`) — 12 read-only categories
- Presentation over existing EI typed client / HTTP / gateway only (shared React Query keys)
- Saved filters, search, product/release, date range, comparison, sort; read-only commands
- Manifest nav/commands; Vitest focused green; coverage **~96.5%+** lines on new modules
- Playwright spec `apztcms-023-executive-dashboards.spec.ts` (mock EI HTTP)
- Docs: Architecture + Executive/Engineering/QA/Release/Developer guides + completion report
- **Verdict:** APZTCMS-023 COMPLETE — await owner approval before **APZTCMS-024**. No reporting/PDF/AI/new analytics.

### Added (APZTCMS-022 — Engineering Intelligence HTTP API & Workbench)

- HTTP `/api/v1/testing/engineering-intelligence` (score/health/risk/snapshots/trends/benchmarks/baselines/historical) → PlatformServiceGateway only
- OpenAPI tag **Testing Engineering Intelligence** — `pnpm openapi:validate:platform` valid
- `createHttpEngineeringIntelligenceClient()` + mock client + workbench Engineering Intelligence section (read-only commands)
- Manifest nav/commands; `engineering.*` / `analytics.*` UI gating (server authoritative)
- Vitest focused suites green; new-module coverage **~97.1%** lines
- Playwright spec added (`apztcms-022-engineering-intelligence-workbench.spec.ts`) — requires app server baseURL
- Docs: HTTP/Typed Client/Workbench/User/OpenAPI guides + completion report
- **Verdict:** APZTCMS-022 COMPLETE — await owner approval before **APZTCMS-023**. No new analytics/AI/persistence/adapters.

### Added (APZTCMS-021 — Engineering Intelligence & Executive Quality Analytics)

- Engineering Intelligence domain models + services (quality scoring, health, trends, benchmarks, baselines, immutable historical snapshots)
- Migrations `0033`/`0034`; permissions `analytics.*` / `engineering.*` / `benchmark.*` / `trend.*` / `quality.score`
- Gateway facet `testing.engineeringIntelligence` via RequestPipeline
- Packages: testing-contracts/persistence/services **0.10.0**; platform-service-contracts/services **0.13.0**
- EI module coverage **96.15%** lines; docs under `docs/architecture/APZHUB-APZ-TCMS-Engineering-Intelligence-*`
- Domain services only — no REST/UI/AI/adapters

### Added (APZTCMS-020 — GitHub Actions Wave Certification & Reference Adapter Closeout)

- Declared `@apzhub/integration-github-actions` the **official APZHUB CI/CD Reference Adapter**
- Published mandatory [CI/CD Reference Adapter Standard](./docs/architecture/APZHUB-CICD-Reference-Adapter-Standard.md)
- Re-audit: architecture/dependency/boundary **0** violations; vertical Vitest **103**; OpenAPI valid
- Official coverage baselines recorded (adapter **95.62%**, providers **100%**, domain **98.35%**, presentation **97.13%** lines)
- Final classification: **PRODUCTION_READY_WITH_LIMITATIONS**
- Programme APZTCMS-015…020 closed
- **Verdict:** APZTCMS-020 COMPLETE — await owner approval before **APZTCMS-021** (GitLab CI Reference Adapter). No new functionality.

### Added (APZTCMS-019 — GitHub Actions Vertical Certification)

- Certification-only milestone — no new functionality
- Architecture / dependency / boundary audits: **0 violations**
- Vertical Vitest **103** passed; OpenAPI valid; adapter/providers/domain/presentation coverage ≥95% lines
- Classification: **PRODUCTION_READY_WITH_LIMITATIONS**
- Docs: `docs/architecture/APZHUB-APZ-TCMS-GitHub-Vertical-Certification.md` + `docs/reviews/APZTCMS-019-*`
- **Verdict:** APZTCMS-019 COMPLETE — await owner approval before **APZTCMS-020**. Playwright live limited (pre-existing Next.js slug conflict).

### Added (APZTCMS-018 — GitHub Actions User Experience)

- HTTP `/api/v1/testing/pipelines` (18 routes) → PlatformServiceGateway only
- OpenAPI Testing Pipelines paths — `pnpm openapi:validate:platform` valid
- `createHttpPipelineClient()` + mock client + workbench Pipelines section (views, read-only commands)
- Manifest nav/commands; `pipeline.*` UI gating (server authoritative)
- Vitest focused suites green; new-module coverage **~96.6%** lines
- Playwright spec added (`apztcms-018-pipeline-workbench.spec.ts`) — requires app server baseURL
- Docs: GitHub User Guide, Pipeline Workbench/HTTP/Client/Architecture guides
- **Verdict:** APZTCMS-018 COMPLETE — await owner approval before **APZTCMS-019**. No adapter/service/domain changes; no execution.

### Added (APZTCMS-017 — GitHub Actions Platform Service Integration)

- ProviderRegistry / ProviderResolver GitHub Actions providers (`adapter.core` only)
- Live gateway facets: `pipelineRepositories`, `pipelineWorkflows`, `pipelineRuns`, `pipelineArtifacts`, `pipelineJobs`, `pipelineSteps`, `pipelineSummaries`
- SoR enhancements: injectable `github_actions` parse adapter; `importFromProvider`; release `consumePipelineSummary`
- RequestPipeline + existing `pipeline.*` authorization (no new permission namespaces)
- Packages: contracts **0.12.0**, platform-services **0.12.0**, testing-services **0.9.0**
- Architecture docs: `docs/architecture/APZHUB-APZ-TCMS-GitHub-Platform-*` / Provider / Gateway / Traceability / Developer
- New module coverage **100%** lines/functions
- **Verdict:** APZTCMS-017 COMPLETE — await owner approval before **APZTCMS-018**. No REST, UI, execution, or Event Bus.

### Added (APZTCMS-016 — GitHub Actions Reference Adapter)

- `@apzhub/integration-github-actions` **0.1.0** — read-only GitHub Actions reference adapter (Integration SDK + APZTCMS-015 canonical mapping)
- PAT authentication; GitHub App / OAuth configuration placeholders only
- Core services: repositories, workflows, runs, jobs, steps, artifacts, logs metadata, approvals, summary, diagnostics, health, version
- Parse-only `createGitHubActionsPipelineResultAdapter()` (`kind: github_actions`)
- Mocked contract tests **32**; coverage **95.62%** lines / **99.31%** functions
- Docs: `integrations/github-actions/docs/*` + `docs/architecture/APZHUB-APZ-TCMS-GitHub-Actions-Adapter.md`
- **Verdict:** APZTCMS-016 COMPLETE — await owner approval before **APZTCMS-017**. No Platform Service, Gateway, HTTP, UI, execution, or binary downloads.

### Added (APZTCMS-015 — External CI/CD Integration Framework)

- Vendor-neutral CI/CD integration domain (canonical pipeline models; parse-only adapters; Generic CI)
- Import/link services (register, synchronise metadata, import run/summary, link artifacts/evidence/certifications/releases) — no pollers/schedulers
- Postgres persistence migrations **0031** / **0032** + repositories
- `gateway.testing.pipelines` via RequestPipeline + production authorization
- Permissions: `pipeline.read`, `pipeline.import`, `pipeline.archive`, `pipeline.audit`, `pipeline.providers` (+ `pipeline.link` / `pipeline.admin`)
- Packages: contracts **0.9.0**, persistence **0.9.0**, services **0.8.0**, platform **0.11.0**
- Architecture docs: `docs/architecture/APZHUB-APZ-TCMS-CICD-*` / Canonical Pipeline / Provider / Import / Artifact / Developer guides
- Domain pipelines coverage **98.28%** lines; **24** focused tests
- **Verdict:** APZTCMS-015 COMPLETE — await owner approval before **APZTCMS-016** (GitHub Actions Reference Adapter). No live providers, runners, execution, HTTP, UI, Event Bus, or binary artifacts.

### Added (APZTCMS-014 — Release & Quality Governance Domain)

- TCMS-only Release & Quality Governance domain (state machine, human approvals, advisory readiness/risk aggregation)
- Postgres persistence migrations **0029** / **0030** + repositories
- `gateway.testing.releaseGovernance` via RequestPipeline + production authorization
- Permissions: `release.*`, `release.approvals.*`, `release.readiness.*`, `release.audit.*`, `release.risk.*`
- Packages: contracts **0.8.0**, persistence **0.8.0**, services **0.7.0**, platform **0.10.0**
- Architecture docs: `docs/architecture/APZHUB-APZ-TCMS-Release-*`
- Domain coverage **99.38%** lines
- **Owner note:** supersedes earlier Platform Quality Integration Layer / Product Registry interpretation of APZTCMS-014
- **Verdict:** APZTCMS-014 COMPLETE — await owner approval before **APZTCMS-015**. No CI/CD, Event Bus, UI, or HTTP.

### Added (APZTCMS-013 — Testing Vertical-Slice Certification & Production Readiness)

- Certified APZ TCMS vertical slice Workbench → Typed Client → HTTP → Gateway → RequestPipeline → Platform Services → Domain → Persistence → PostgreSQL
- Architecture / dependency / boundary audits: **0 violations**
- Quality evidence: TCMS Vitest **478** passed; related regression **417** passed; OpenAPI validated; domain typecheck/lint passed
- Classification: **PRODUCTION_READY_WITH_LIMITATIONS** (Playwright live not run this session; apps/web outside V8 coverage include; explicit product exclusions remain)
- Certification docs: [Vertical-Slice Certification](./docs/architecture/APZHUB-APZ-TCMS-Vertical-Slice-Certification.md), [Production Readiness](./docs/reviews/APZTCMS-013-production-readiness.md), audits under `docs/reviews/APZTCMS-013-*`, [Completion Report](./docs/sprint/APZTCMS-013-completion-report.md)
- **Verdict:** APZTCMS-013 COMPLETE — await owner approval before **APZTCMS-014**. No new APIs/UI/domain behaviour in this milestone.

### Added (APZTCMS-012 — Testing HTTP API, OpenAPI & Production Typed Client)

- `/api/v1/testing/**` route surface backed by `handlers/testing.ts` and 69 route files under `apps/web/app/api/v1/testing/`
- OpenAPI paths for Testing plans, requirements, executions, evidence, automation, coverage, quality, certification, release readiness, traceability, approvals, and dashboard
- `createHttpTestingClient()` as the default workbench transport outside `NODE_ENV=test`; mock client retained for tests
- API, HTTP client, architecture boundary, and mock-routed Playwright coverage; focused Vitest **139** passed
- Architecture docs: [Testing HTTP API](./docs/architecture/APZHUB-Testing-HTTP-API.md), [Testing Typed Client Architecture](./docs/architecture/APZHUB-Testing-Typed-Client-Architecture.md), [Production Client Migration](./docs/architecture/APZHUB-Testing-Workbench-Production-Client-Migration.md), [Security Privacy Guide](./docs/architecture/APZHUB-Testing-API-Security-Privacy-Guide.md), [Certification API Guide](./docs/architecture/APZHUB-Testing-Certification-API-Guide.md)
- Domain packages unchanged: contracts **0.6.0**, persistence **0.7.0**, services **0.5.0**; platform packages remain **0.8.0**
- No AI, binary evidence upload, live runners, Event Bus, webhook ingress, notifications, or automatic certification decisions
- [APZTCMS-012 Completion Report](./docs/sprint/APZTCMS-012-completion-report.md)
- **Verdict:** APZTCMS-012 COMPLETE — await owner approval before **APZTCMS-013** (Vertical-Slice Certification & Production Readiness). AI Assist deferred after 013 or later.

### Added (APZTCMS-011 — Testing Platform Services & Gateway Integration)

- `@apzhub/platform-service-contracts` **0.8.0** — seventeen testing platform service interfaces + `TestingPlatformGateway`
- `@apzhub/platform-services` **0.8.0** — `Testing*ServiceImpl`, `gateway.testing.*`, error mapping, readiness indicators, operation authz map
- Bootstrap: `createTestingPlatformServices`, `ForProduction`, `ForTest`; env **`TESTING_SERVICE_ENABLED`**
- No silent in-memory production fallback; no silent allow-all authz in production
- Architecture pack: [Testing Platform Service Architecture](./docs/architecture/APZHUB-Testing-Platform-Service-Architecture.md) · [Contracts](./docs/architecture/APZHUB-Testing-Platform-Service-Contracts.md) · [Gateway Reference](./docs/architecture/APZHUB-Testing-Gateway-Reference.md) · [Permission Catalogue](./docs/architecture/APZHUB-Testing-Permission-Catalogue.md) · [Operation Permission Map](./docs/architecture/APZHUB-Testing-Operation-Permission-Map.md) · [Bootstrap Guide](./docs/architecture/APZHUB-Testing-Bootstrap-Configuration-Guide.md) · [Health Readiness](./docs/architecture/APZHUB-Testing-Health-Readiness-Guide.md) · [Error Model](./docs/architecture/APZHUB-Testing-Error-Model.md) · [Security Tenancy](./docs/architecture/APZHUB-Testing-Security-Tenancy-Guide.md) · [Domain-Platform Boundary](./docs/architecture/APZHUB-Testing-Domain-Platform-Boundary-Guide.md)
- Quality: **33** targeted platform Vitest tests; testing domain regression **204** green
- Domain packages **unchanged**: contracts **0.6.0**; persistence **0.7.0**; services **0.5.0**
- Workbench mock client **unchanged** — no HTTP, Event Bus, AI, binary evidence, or runners
- [APZTCMS-011 Completion Report](./docs/sprint/APZTCMS-011-completion-report.md)
- **Verdict:** APZTCMS-011 COMPLETE — await owner approval before **APZTCMS-012** (HTTP API & typed client). AI Assist deferred after 012.

### Added (APZTCMS-010 — Workbench UI)

- Testing workbench **presentation-only** UI — `apps/web/lib/testing` typed client + mock transport; `apps/web/components/testing` views
- Module **enabled** — parent `testing` + 15 child manifests under `services/testing/manifests/`
- Shell wiring — `workbench-page.tsx` → `TestingWorkspaceRouter` on `/workspace/testing` routes
- Architecture pack: [Testing Workbench Architecture](./docs/architecture/APZHUB-APZ-TCMS-Testing-Workbench-Architecture.md) · [Navigation Guide](./docs/architecture/APZHUB-APZ-TCMS-Testing-Navigation-Guide.md) · [View Catalogue](./docs/architecture/APZHUB-APZ-TCMS-Testing-View-Catalogue.md) · [Command Catalogue](./docs/architecture/APZHUB-APZ-TCMS-Testing-Command-Catalogue.md) · [UX Guide](./docs/architecture/APZHUB-APZ-TCMS-Testing-UX-Guide.md)
- Quality: **117** Vitest tests; Playwright `apztcms-010-testing-workbench.spec.ts`; coverage ~**98.89%** lines (scoped)
- Domain packages **unchanged**: contracts **0.6.0**; persistence **0.7.0**; services **0.5.0**
- **No** HTTP APIs, DB access from UI, Event Bus, AI, binary upload, or reporting engine
- [APZTCMS-010 Completion Report](./docs/sprint/APZTCMS-010-completion-report.md)
- **Verdict:** APZTCMS-010 COMPLETE — await owner approval before **APZTCMS-011** (AI Assist — advisory)

### Added (APZTCMS-009 — Certification Engine)

- `@apzhub/testing-contracts` **0.6.0** — certification workflow statuses, gate outcomes, certification service contracts; permissions `certification.create|review|approve|reject|override|audit`
- `@apzhub/testing-persistence` **0.7.0** — migrations `0027`/`0028` (certification engine tables + RLS)
- `@apzhub/testing-services` **0.5.0** — `createCertificationEngineServices` (lifecycle, gates, recommendations, human approvals, evidence, validation, audit/history)
- Architecture pack: [Certification Engine Architecture](./docs/architecture/APZHUB-APZ-TCMS-Certification-Engine-Architecture.md) · [Workflow](./docs/architecture/APZHUB-APZ-TCMS-Certification-Workflow.md) · [Gate Evaluation](./docs/architecture/APZHUB-APZ-TCMS-Gate-Evaluation-Model.md) · [Recommendation Model](./docs/architecture/APZHUB-APZ-TCMS-Recommendation-Model.md) · [Approval Model](./docs/architecture/APZHUB-APZ-TCMS-Certification-Approval-Model.md) · [Audit Model](./docs/architecture/APZHUB-APZ-TCMS-Certification-Audit-Model.md)
- Quality: typecheck/lint **PASS**; **213** tests; certification coverage ~**96.57%** lines
- **No** HTTP, UI, dashboards, AI recommendations, automatic approval, Event Bus, email, or CI/CD
- [APZTCMS-009 Completion Report](./docs/sprint/APZTCMS-009-completion-report.md)
- **Verdict:** APZTCMS-009 COMPLETE — await owner approval before **APZTCMS-010** (Workbench UI)

### Added (APZTCMS-008 — Quality Intelligence Domain)

- `@apzhub/testing-contracts` **0.5.0** — defect/coverage/quality service contracts; permissions `quality.*` / `coverage.*` / `defects.*` / `release.*`
- `@apzhub/testing-persistence` **0.6.0** — migrations `0025`/`0026` (defect links, quality snapshots, regression analysis; expanded coverage kinds + RLS)
- `@apzhub/testing-services` **0.4.0** — `createQualityIntelligenceServices` (defects, coverage, intelligence, trends, regression analysis, release/cert readiness, risk aggregation, summaries)
- Architecture pack: [Quality Intelligence Architecture](./docs/architecture/APZHUB-APZ-TCMS-Quality-Intelligence-Architecture.md) · [Coverage Model](./docs/architecture/APZHUB-APZ-TCMS-Coverage-Model.md) · [Defect Model](./docs/architecture/APZHUB-APZ-TCMS-Defect-Model.md) · [Release Readiness Guide](./docs/architecture/APZHUB-APZ-TCMS-Release-Readiness-Guide.md) · [Regression Analysis Guide](./docs/architecture/APZHUB-APZ-TCMS-Regression-Analysis-Guide.md)
- Quality: typecheck/lint **PASS**; **195** tests; quality coverage ~**97.61%** lines
- **No** HTTP, UI, dashboards, external defect sync, Event Bus, or AI
- [APZTCMS-008 Completion Report](./docs/sprint/APZTCMS-008-completion-report.md)
- **Verdict:** APZTCMS-008 COMPLETE — await owner approval before **APZTCMS-009** (Certification Engine)

### Added (APZTCMS-007 — Automation Result Ingestion Domain)

- `@apzhub/testing-contracts` **0.4.0** — canonical automation model, adapter interface, ingestion services, permissions (`automation.import|view|history|adapters|coverage`)
- `@apzhub/testing-persistence` **0.5.0** — migrations `0023`/`0024` (imports, automated executions, runs, history, coverage snapshots + RLS)
- `@apzhub/testing-services` **0.3.0** — `createAutomationIngestionServices` / `createTestingDomainServices`; adapters: Vitest, Playwright, JUnit XML, Generic JSON, TAP, Allure metadata
- Architecture pack: [Ingestion Architecture](./docs/architecture/APZHUB-APZ-TCMS-Automation-Ingestion-Architecture.md) · [Adapter Guide](./docs/architecture/APZHUB-APZ-TCMS-Automation-Adapter-Guide.md) · [Canonical Model](./docs/architecture/APZHUB-APZ-TCMS-Canonical-Automation-Model.md) · [Normalization Rules](./docs/architecture/APZHUB-APZ-TCMS-Normalization-Rules.md) · [Coverage Ingestion](./docs/architecture/APZHUB-APZ-TCMS-Coverage-Ingestion-Guide.md)
- Quality: typecheck/lint **PASS**; **181** tests; automation coverage ~**96.25%** lines
- **No** HTTP, UI, workers, CI/CD, Event Bus, or framework runners
- [APZTCMS-007 Completion Report](./docs/sprint/APZTCMS-007-completion-report.md)
- **Verdict:** APZTCMS-007 COMPLETE — await owner approval before **APZTCMS-008** (Defects, Coverage & Dashboards)

### Added (APZTCMS-006 — Manual Execution & Evidence Domain Engine)

- `@apzhub/testing-contracts` **0.3.0** — expanded execution statuses, evidence lifecycle, `EvidenceStorageProvider` / `ObjectStorageProvider` contracts, multi-stage approval config
- `@apzhub/testing-persistence` **0.4.0** — migration `0022_apz_tcms_execution_engine.sql` (status CHECKs, evidence lifecycle columns, approval stages, step nest/params)
- `@apzhub/testing-services` **0.2.0** — formal execution/step/evidence/approval engines; in-memory storage provider; unimplemented object-storage stub; immutable execution history
- Architecture pack: [Manual Execution Engine](./docs/architecture/APZHUB-APZ-TCMS-Manual-Execution-Engine.md) · [Execution State Machine](./docs/architecture/APZHUB-APZ-TCMS-Execution-State-Machine.md) · [Evidence Architecture](./docs/architecture/APZHUB-APZ-TCMS-Evidence-Architecture.md) · [Evidence Lifecycle](./docs/architecture/APZHUB-APZ-TCMS-Evidence-Lifecycle.md) · [Approval Engine](./docs/architecture/APZHUB-APZ-TCMS-Approval-Engine.md) · [Execution History](./docs/architecture/APZHUB-APZ-TCMS-Execution-History.md)
- Quality: typecheck/lint **PASS**; **167** tests across testing packages; services coverage ~**95.63%** lines
- **No** HTTP APIs, Workbench UI, S3/MinIO/Azure SDK, Event Bus, or automation runners
- [APZTCMS-006 Completion Report](./docs/sprint/APZTCMS-006-completion-report.md)
- **Verdict:** APZTCMS-006 COMPLETE — await owner approval before **APZTCMS-007** (Automation Result Ingestion)

### Added (APZTCMS-005 — APZ TCMS Production Persistence Completion)

- `@apzhub/testing-persistence` **0.3.0** — first-class PostgreSQL repositories for **all** Manual Testing aggregates; production factory has **no** in-memory fallback
- Migrations `0020_apz_tcms_persistence_completion.sql` / `0021_apz_tcms_persistence_completion_rls.sql` — plan/suite version tables + approval history (+ RLS)
- Shared Postgres `generic-crud` + junction sync + manual step-actual dual write; expanded row mappers
- Architecture pack: [Persistence Completion Guide](./docs/architecture/APZHUB-APZ-TCMS-Persistence-Completion-Guide.md) · [Schema Update Guide](./docs/architecture/APZHUB-APZ-TCMS-Schema-Update-Guide.md) · updated Repository / Schema / Migration / Developer guides
- Quality: typecheck/lint **PASS**; **108** tests across testing packages (persistence **62**); coverage ~**92.45%** lines overall; Postgres ~**97%**; validation/mappers **100%**
- **No** HTTP APIs, Workbench UI, evidence blob upload, or Playwright product deps — owner brief: persistence only
- [APZTCMS-005 Completion Report](./docs/sprint/APZTCMS-005-completion-report.md)
- **Verdict:** APZTCMS-005 COMPLETE — await owner approval before **APZTCMS-006** (Manual Execution & Evidence delivery)

### Added (APZTCMS-004 — APZ TCMS Manual Test Management / domain services)

- `@apzhub/testing-contracts` **0.2.0** — expanded enums, domain models, named service interfaces
- `@apzhub/testing-persistence` **0.2.0** — manual execution + case version tables (migrations `0018`/`0019`); in-memory repos; Postgres factory still falls back to in-memory for new aggregates (accepted technical debt)
- `@apzhub/testing-services` **0.1.0** — twelve domain services via `createManualTestingServices` (incl. `ManualExecutionService`; evidence **metadata** only)
- Architecture pack: [Manual Testing Domain](./docs/architecture/APZHUB-APZ-TCMS-Manual-Testing-Domain.md) · [Service Architecture](./docs/architecture/APZHUB-APZ-TCMS-Service-Architecture.md) · [Lifecycle Guide](./docs/architecture/APZHUB-APZ-TCMS-Lifecycle-Guide.md) · [State Machines](./docs/architecture/APZHUB-APZ-TCMS-State-Machines.md) · [Validation Rules](./docs/architecture/APZHUB-APZ-TCMS-Validation-Rules.md) · [Traceability Guide](./docs/architecture/APZHUB-APZ-TCMS-Traceability-Guide.md)
- Quality: typecheck/lint **PASS** (contracts, persistence, services); **74** tests across testing packages; `testing-services` coverage ~**96.45%** lines (lifecycle/validation **100%**; services ~**96%**)
- **No** HTTP APIs, Workbench UI, evidence blob upload, or Playwright product deps — owner override: APIs/UI deferred vs older backlog wording for 004
- [APZTCMS-004 Completion Report](./docs/sprint/APZTCMS-004-completion-report.md)
- **Verdict:** APZTCMS-004 COMPLETE — await owner approval before **APZTCMS-005** (Manual Execution & Evidence — binary pipeline + delivery layer + Postgres completion)

### Added (APZTCMS-003 — APZ TCMS Domain Persistence & Permissions)

- `@apzhub/testing-persistence` **0.1.0** — repositories (in-memory + Postgres), authz asserts, persistence validation, row mappers
- SoR schema `packages/config/src/db/testing-schema.ts` + migrations `0016_apz_tcms.sql` / `0017_apz_tcms_rls.sql`
- Platform Authorization namespaces + seed wildcards for `testing` / `certification` / `evidence` / `traceability` / `automation` / `reporting` / `approval` / `dashboard`
- Architecture pack: [Persistence Architecture](./docs/architecture/APZHUB-APZ-TCMS-Persistence-Architecture.md) · [Schema Guide](./docs/architecture/APZHUB-APZ-TCMS-Schema-Guide.md) · [Repository Guide](./docs/architecture/APZHUB-APZ-TCMS-Repository-Guide.md) · [Authorization Guide](./docs/architecture/APZHUB-APZ-TCMS-Authorization-Guide.md) · [Migration Guide](./docs/architecture/APZHUB-APZ-TCMS-Migration-Guide.md)
- Quality: typecheck/lint **PASS**; **61** tests (persistence + contracts + foundation + platform-authorization); persistence alone **28**; coverage ~**95.27%** lines/stmts
- **No** UI, HTTP authoring APIs, full runners, execution-result tables, or Playwright/JUnit/Allure product deps
- [APZTCMS-003 Completion Report](./docs/sprint/APZTCMS-003-completion-report.md)
- **Verdict:** APZTCMS-003 COMPLETE — await owner approval before **APZTCMS-004** (Manual Test Management)

### Added (APZTCMS-002 — APZ TCMS Core Platform Foundation)

- `@apzhub/testing-contracts` **0.1.0** — domain models, enums, service interfaces, events, permissions, config
- `@apzhub/testing-foundation` **0.1.0** — in-memory registries + validation helpers
- Manifests: `services/testing/service.yaml`, `services/certification/service.yaml`, `services/testing/manifests/testing/module.yaml` (module **disabled**, nav declared)
- Architecture pack: [Foundation Architecture](./docs/architecture/APZHUB-APZ-TCMS-Foundation-Architecture.md) · [Package Guide](./docs/architecture/APZHUB-APZ-TCMS-Package-Guide.md) · [Service Contracts](./docs/architecture/APZHUB-APZ-TCMS-Service-Contracts.md) · [Domain Contracts](./docs/architecture/APZHUB-APZ-TCMS-Domain-Contracts.md) · [Permission Catalogue](./docs/architecture/APZHUB-APZ-TCMS-Permission-Catalogue.md) · [Module Registration Guide](./docs/architecture/APZHUB-APZ-TCMS-Module-Registration-Guide.md) · [Developer Guide](./docs/architecture/APZHUB-APZ-TCMS-Developer-Guide.md)
- Quality: typecheck/lint **PASS**; **24** tests (15 contracts + 9 foundation); runtime coverage **100%** lines/stmts/funcs; ~**96%** branches
- **No** DB/migrations (deferred to APZTCMS-003), UI routes, service implementations, or Playwright/JUnit/Allure package deps
- [APZTCMS-002 Completion Report](./docs/sprint/APZTCMS-002-completion-report.md)
- **Verdict:** APZTCMS-002 COMPLETE — await owner approval before **APZTCMS-003** (Domain Persistence & Permissions)

### Added (APZTCMS-001 — APZ TCMS Product Vision, Architecture & Foundation)

- **APZ TCMS** (APZHUB Test & Certification Management System) established as a **native** APZHUB product — orchestrates testing; does **not** fork Kiwi TCMS; does **not** wrap Playwright/Vitest as the product
- Documentation pack: [Product Vision](./docs/strategy/APZHUB-APZ-TCMS-Product-Vision.md) · [Reference Architecture](./docs/architecture/APZHUB-APZ-TCMS-Reference-Architecture.md) · [Domain Model](./docs/architecture/APZHUB-APZ-TCMS-Domain-Model.md) · [Module Catalogue](./docs/architecture/APZHUB-APZ-TCMS-Module-Catalogue.md) · [UI Architecture](./docs/architecture/APZHUB-APZ-TCMS-UI-Architecture.md) · [Integration Strategy](./docs/architecture/APZHUB-APZ-TCMS-Integration-Strategy.md) · [Technology Decisions](./docs/architecture/APZHUB-APZ-TCMS-Technology-Decisions.md) · [User Personas](./docs/product/APZHUB-APZ-TCMS-User-Personas.md)
- [ADR-0059](./docs/adr/ADR-0059-apz-tcms-native-product-architecture.md) · [APZTCMS Backlog](./docs/backlog/APZTCMS-Backlog.md) · [Milestone Roadmap](./docs/backlog/APZTCMS-Milestone-Roadmap.md) · [APZTCMS-001 Completion Report](./docs/sprint/APZTCMS-001-completion-report.md)
- QE strategy / architecture / backlog marked **superseded** for product identity and delivery IDs; Kiwi SoR path remains superseded
- **Docs only** — no backend, frontend, DB, APIs, runners, or integrations
- **Verdict:** APZTCMS-001 COMPLETE — await owner approval before **APZTCMS-002** (Core Platform Foundation)

### Added (OSS-100-10 — Integration SDK v1.0 Certification & Release Readiness)

- Formal certification pack under `packages/integration-sdk/docs/`: [SDK-V1-CERTIFICATION](./packages/integration-sdk/docs/SDK-V1-CERTIFICATION.md) · [SDK-API-AUDIT](./packages/integration-sdk/docs/SDK-API-AUDIT.md) · [SDK-SECURITY-AUDIT](./packages/integration-sdk/docs/SDK-SECURITY-AUDIT.md) · [SDK-RELEASE-READINESS](./packages/integration-sdk/docs/SDK-RELEASE-READINESS.md) · [SDK-PUBLIC-API](./packages/integration-sdk/docs/SDK-PUBLIC-API.md) · [SDK-COMPATIBILITY](./packages/integration-sdk/docs/SDK-COMPATIBILITY.md)
- Architecture index [APZHUB-Integration-SDK-V1-Certification](./docs/architecture/APZHUB-Integration-SDK-V1-Certification.md) · ADR [0058](./docs/adr/ADR-0058-integration-sdk-v1-readiness-limitations.md) · [OSS-100-10 Completion Report](./docs/sprint/OSS-100-10-completion-report.md)
- Owner numbering: **OSS-100-10 = v1.0 Certification** ✅; provisioning deferred to **100-11+**
- Package remains `@apzhub/integration-sdk` **0.9.0** — **not** bumped to 1.0.0
- Quality: typecheck/lint **PASS**; SDK **185** + sdk-v1 **7** = **192**; Plane+Zammad **223**; Wave1/2 + support-vertical + platform-service-contracts **105**; Plane **15** caps / **0** arch fails; Zammad **11** / **0**
- Re-cert suite: `testing/sdk-v1/integration-sdk-v1-recertification.test.ts`
- **Outcome:** `PRODUCTION_READY_WITH_LIMITATIONS` · Hard blockers: **none**
- Limitations: no Event Bus, no webhook ingress, no provisioning, no durable checkpoint/dedup stores, PlaceholderVault only, large root barrel (prefer subpaths)
- **Recommendation:** Promote to `@apzhub/integration-sdk` **v1.0.0** after owner accepts limitations and API freeze — **do not auto-promote**
- **Verdict:** OSS-100-10 COMPLETE — await owner for 1.0.0 promotion / Event Bus / ingress / provisioning / next domain adapter

### Added (OSS-100-09 — Adapter Development Harness & Certification Framework)

- `@apzhub/integration-sdk` **v0.9.0** — Adapter Development Harness & Certification (`@apzhub/integration-sdk/harness`)
- `AdapterHarness`, `AdapterCertification` (Architecture→QualityGates), `AdapterCompliance`, contract suite, boundary validator
- `AdapterMockHarness`, `scaffoldAdapter` / `REFERENCE_ADAPTER_TEMPLATE`, quality reports, documentation generator, CI helpers
- Compatibility + performance (measure-only) helpers; aggregating `AdapterValidator`
- Plane/Zammad remain **0.6.0** — thin wrappers (`create*AdapterHarness`, `certify*WithSdkHarness`, `get*HarnessMetadata`); operations APIs unchanged (ADR-0057)
- **No** provisioning, Event Bus, HTTP ingress, workers/schedulers, or new domain adapters
- Backlog renumber: **OSS-100-09 = Harness & Certification** (complete); Provisioning deferred/relocated (was older 09 label)
- ADR [0057](./docs/adr/ADR-0057-sdk-harness-vs-adapter-operations-certification.md)
- Docs: [ADAPTER-HARNESS.md](./packages/integration-sdk/docs/ADAPTER-HARNESS.md) · companions · [Architecture index](./docs/architecture/APZHUB-Integration-SDK-Adapter-Harness.md) · [OSS-100-09 Completion Report](./docs/sprint/OSS-100-09-completion-report.md)
- Tests: SDK **185** passed; Plane+Zammad **223**; Wave1/2/Support/platform regressions **262**; harness coverage ~98.73% stmts/lines · ~88.46% branches · ~99.22% funcs; certification ~99%; compliance/boundary/mock **100%**; typecheck/lint **PASS**
- **SDK maturity:** Release Candidate (not Production Ready; not v1.0)
- **Verdict:** OSS-100-09 COMPLETE — await owner approval before SDK v1.0, Platform Event Bus, webhook ingress, provisioning (if deferred), or next business-domain integration

### Added (OSS-100-08 — Webhook & Polling Contracts)

- `@apzhub/integration-sdk` **v0.8.0** — Webhook & polling contracts (`@apzhub/integration-sdk/events`)
- `IntegrationSourceEvent` envelope, identity precedence, dedup/replay (in-memory test stores), schema versioning `1.0.0`
- `WebhookManager` / `asWebhookManager`, verification, `WebhookProcessingPipeline`
- `PollingSource` / `createPollingSourceFromSync`, cursors, checkpoints (propose/ack), `PollingExecutionPipeline`
- Diagnostics, metrics, capability helpers, mocks, `IntegrationEventEnvelope` bridge
- Plane/Zammad remain **0.6.0** — thin wrappers (`as*WebhookManager`, `translate*WebhookToSourceEvent`, `create*PollingSource`); public APIs unchanged
- **No** HTTP ingress, Event Bus publish, workers, or schedulers
- ADRs [0052](./docs/adr/ADR-0052-canonical-source-event-envelope.md)–[0056](./docs/adr/ADR-0056-adapter-polling-vs-platform-scheduling.md)
- Docs: [EVENT-ENVELOPE.md](./packages/integration-sdk/docs/EVENT-ENVELOPE.md) · [WEBHOOK-POLLING-MIGRATION.md](./packages/integration-sdk/docs/WEBHOOK-POLLING-MIGRATION.md) · [Architecture index](./docs/architecture/APZHUB-Integration-SDK-Webhook-Polling.md) · [OSS-100-08 Completion Report](./docs/sprint/OSS-100-08-completion-report.md)
- Tests: SDK **160** passed; Plane+Zammad **217**; Wave1/2/Support/platform regressions **262**; events coverage ~97.77% stmts/lines · ~86.25% branches · ~98.68% funcs; critical paths (webhook pipeline 100%, polling ~99%, cursor/checkpoint/dedup/diagnostics 100%, replay ~98%); architecture-boundary + secret-redaction checks PASS
- **Verdict:** OSS-100-08 COMPLETE — await owner approval before OSS-100-09+ (provisioning/harness) or platform webhook-ingress / Event Bus

### Added (OSS-100-07 — Mapping Provider Framework)

- `@apzhub/integration-sdk` **v0.7.0** — Mapping Provider Framework (`@apzhub/integration-sdk/mapping`)
- `MappingProvider`, `MappingRegistry`, `MappingPipeline`, profiles/definitions/context/result/error/diagnostics/capabilities
- `FieldMapper`, `ValueTransformer`, `RelationshipMapper`, `CollectionMapper`, `EnumMapper`, `IdentityMapper`
- Plane/Zammad remain **0.6.0** — IdentityMapper/EnumMapper wrappers; `createPlaneMappingRegistry` / `createZammadMappingRegistry` on adapter init; provisional ID format unchanged
- Platform EntityMappingStore / MappingOrchestrator **UNTOUCHED** (ADR-0049) — SDK mapping ≠ durable ID store
- Docs: [MAPPING-FRAMEWORK.md](./packages/integration-sdk/docs/MAPPING-FRAMEWORK.md) · [MAPPING-PROFILES.md](./packages/integration-sdk/docs/MAPPING-PROFILES.md) · [MAPPING-REGISTRY.md](./packages/integration-sdk/docs/MAPPING-REGISTRY.md) · [MAPPING-TRANSFORMERS.md](./packages/integration-sdk/docs/MAPPING-TRANSFORMERS.md) · [MAPPING-MIGRATION.md](./packages/integration-sdk/docs/MAPPING-MIGRATION.md) · [Architecture index](./docs/architecture/APZHUB-Integration-SDK-Mapping-Framework.md) · [OSS-100-07 Completion Report](./docs/sprint/OSS-100-07-completion-report.md)
- Tests: mapping **25** (~98.7% lines); full SDK **123**; Plane+Zammad **211**; combined wave1/2/support + platform mapping **358**; lint + typecheck SDK PASS
- **Verdict:** OSS-100-07 COMPLETE — await owner approval before OSS-100-08 (Webhook & polling contracts)

### Added (OSS-100-06 — Shared HTTP Transport Layer)

- `@apzhub/integration-sdk` **v0.6.0** — shared HTTP transport (`@apzhub/integration-sdk/transport`)
- `TransportClient` / `createTransportClient`, policies (retry default disabled, timeout, TLS, compression, redirects, rate-limit stub), optional circuit-breaker interceptor
- `createHttpIntegrationClient` bridge — Plane/Zammad migrated (`errorLabel` Plane/Zammad); public adapter APIs unchanged; adapter versions remain **0.6.0**
- `MockTransportClient` / `createMockTransport` for future adapters
- Docs: [HTTP-TRANSPORT.md](./packages/integration-sdk/docs/HTTP-TRANSPORT.md) · [TRANSPORT-POLICIES.md](./packages/integration-sdk/docs/TRANSPORT-POLICIES.md) · [TRANSPORT-PIPELINE.md](./packages/integration-sdk/docs/TRANSPORT-PIPELINE.md) · [TRANSPORT-DIAGNOSTICS.md](./packages/integration-sdk/docs/TRANSPORT-DIAGNOSTICS.md) · [TRANSPORT-MIGRATION.md](./packages/integration-sdk/docs/TRANSPORT-MIGRATION.md) · [Architecture index](./docs/architecture/APZHUB-Integration-SDK-HTTP-Transport.md) · [OSS-100-06 Completion Report](./docs/sprint/OSS-100-06-completion-report.md)
- Tests: SDK **99**; Plane+Zammad **211**; transport coverage ~97%+ lines; policies ~95%+
- Backlog: OSS-100-06 corrected to HTTP Transport (complete); webhook/polling relocated to planned **OSS-100-08**; next **OSS-100-07** Mapping providers
- **Verdict:** OSS-100-06 COMPLETE — await owner approval before OSS-100-07

### Added (OSS-110-14 — Support Module UI Certification)

- Support Module UI certified **PRODUCTION_READY_WITH_LIMITATIONS** — full UI→`/api/v1`→gateway→services→mapping→provider→adapter chain (mocked; no live Zammad)
- Audits: architecture PASS; `scripts/support-ui-certification-audit.mjs` PASS 17/17; boundary PASS; vertical dependency PASS 0/36
- Playwright `oss-110-14-support*`: **23 passed** (functional, a11y axe critical/serious clean, responsive 4 viewports, visual baselines, perf measurement)
- Vitest Support UI **72 passed**; coverage ~94.9% lines / 87.7% branches / 80.3% functions / 94.9% statements; `support-api` 100% lines
- Docs: [SUPPORT-UI-CERTIFICATION.md](./docs/architecture/SUPPORT-UI-CERTIFICATION.md) · [OSS-110-14 Completion Report](./docs/sprint/OSS-110-14-completion-report.md) · a11y / responsive / performance / visual companion reports
- Certification defect corrections (minimal): Input `useId` label association; shell overflow-x; VisibilityBadge contrast
- **Verdict:** OSS-110-14 COMPLETE — stop; await next domain / platform milestone; **no Event Bus/ingress/binary/notifications/realtime**; no zammad/platform-services/contracts version bumps

### Added (OSS-110-13 — Support Module UI)

- Support workbench UI — Activity Bar **Support**, workspace routes under `/workspace/support`, inbox/detail/create, conversation, internal notes vs customer replies, commands, orgs/groups/users, search, analytics
- Typed client `apps/web/lib/support/*` → `/api/v1/support-*` only; TanStack Query keys; permission-aware controls
- Manifests: `services/support/service.yaml` + `services/support/manifests/*`
- Boundary audit: `scripts/support-ui-boundary-audit.mjs`
- Docs: [APZHUB-Support-Module-UI.md](./docs/architecture/APZHUB-Support-Module-UI.md) · [Support User Guide](./docs/guides/APZHUB-Support-User-Guide.md) · [OSS-110-13 Completion Report](./docs/sprint/OSS-110-13-completion-report.md)
- **Verdict:** OSS-110-13 COMPLETE — await owner approval before OSS-110-14; **no Event Bus/ingress/binary/notifications/realtime**; no zammad/platform-services/contracts version bumps

### Added (OSS-110-12 — Support Vertical Slice Certification & Closeout)

- Support vertical **CERTIFIED_WITH_LIMITATIONS** — HTTP → Gateway → Services → Mapping → Zammad providers → adapter (mocked E2E)
- Audits: architecture, dependency (`scripts/support-vertical-dependency-audit.mjs`)
- [SUPPORT-VERTICAL-CERTIFICATION.md](./docs/architecture/SUPPORT-VERTICAL-CERTIFICATION.md)
- [OSS-110-12 Completion Report](./docs/sprint/OSS-110-12-completion-report.md) · [Wave Index](./docs/sprint/OSS-110-12-Wave-Index.md)
- **Verdict:** OSS-110-12 COMPLETE — await owner approval before OSS-110-13; **no UI/Event Bus/ingress/binary**

### Added (OSS-110-11 — Support HTTP API Surface)

- Platform HTTP `/api/v1/support-*` — Support Requests, articles (notes/replies), organisations, groups, users, search, history, analytics
- Thin handlers → `PlatformServiceGateway` only; OpenAPI 3.1 Support paths validated
- [OSS-110-11 Completion Report](./docs/sprint/OSS-110-11-completion-report.md)
- [Support HTTP API](./docs/architecture/APZHUB-Support-HTTP-API.md)
- **Verdict:** OSS-110-11 COMPLETE — await owner approval before OSS-110-12; **no UI/Event Bus/ingress/binary**

### Added (OSS-110-10 — Support Platform Services, Providers & Mapping)

- `@apzhub/platform-service-contracts` **0.7.0** — Support service contracts (8 interfaces) + `PLATFORM_SERVICE_IDS`
- `@apzhub/platform-services` **0.7.0** — Zammad providers, mapping (`sreq`/`sorg`/`sgrp`/`suser`/`sart`), `Support*ServiceImpl`, gateway, `support.*` authz, `createPlatformServicesWithZammad`
- [OSS-110-10 Completion Report](./docs/sprint/OSS-110-10-completion-report.md)
- [Support Platform Service Architecture](./docs/architecture/APZHUB-Support-Platform-Service-Architecture.md)
- **Verdict:** OSS-110-10 COMPLETE — await owner approval before OSS-110-11; **no HTTP/UI/Event Bus/ingress**

### Added (OSS-102-08 — Zammad Wave 2 Certification & Closeout)

- Wave 2 formally **CLOSED** — `@apzhub/integration-zammad` **v0.6.0** **CERTIFIED_WITH_LIMITATIONS**
- [OSS-102-08 Wave 2 Certification](./docs/sprint/OSS-102-08-Wave2-Certification.md) · [Wave 2 Index](./docs/sprint/OSS-102-08-Wave2-Index.md)
- Architecture / dependency / capability / mapping audits; mocked E2E + performance baseline
- **Verdict:** Wave 2 COMPLETE — await owner approval before OSS-110-10; **no PlatformService/HTTP/UI**

### Added (OSS-102-07 — Zammad Operations, Diagnostics & Certification)

- `@apzhub/integration-zammad` **v0.6.0** — `adapter.operations` certification, compatibility, readiness, health, feature detection, operational reports
- [ZAMMAD-OPERATIONS.md](./integrations/zammad/docs/ZAMMAD-OPERATIONS.md)
- [OSS-102-07 Completion Report](./docs/sprint/OSS-102-07-completion-report.md)
- **Verdict:** OSS-102-07 COMPLETE — await owner approval before OSS-102-08; **no PlatformService/HTTP/UI/Event Bus/ingress**

### Added (OSS-102-06 — Zammad Synchronisation, Events & Webhooks)

- `@apzhub/integration-zammad` **v0.5.0** — `adapter.core.synchronisation` / `events` / `webhooks`
- `@apzhub/platform-service-contracts` **v0.6.0** — Support event resources/types (additive)
- [ZAMMAD-SYNC.md](./integrations/zammad/docs/ZAMMAD-SYNC.md) · [ZAMMAD-EVENTS.md](./integrations/zammad/docs/ZAMMAD-EVENTS.md) · [ZAMMAD-WEBHOOKS.md](./integrations/zammad/docs/ZAMMAD-WEBHOOKS.md)
- [OSS-102-06 Completion Report](./docs/sprint/OSS-102-06-completion-report.md)
- **Verdict:** OSS-102-06 COMPLETE — await owner approval before OSS-102-07; **no PlatformService/HTTP/UI/Event Bus/ingress**

### Added (OSS-102-05 — Zammad Search, History & Support Intelligence)

- `@apzhub/integration-zammad` **v0.4.0** — `adapter.core.search` / `history` / `analytics`
- `@apzhub/platform-service-contracts` **v0.5.0** — Support search/history/intelligence DTOs
- [ZAMMAD-SEARCH.md](./integrations/zammad/docs/ZAMMAD-SEARCH.md) · [ZAMMAD-HISTORY.md](./integrations/zammad/docs/ZAMMAD-HISTORY.md) · [ZAMMAD-ANALYTICS.md](./integrations/zammad/docs/ZAMMAD-ANALYTICS.md)
- [OSS-102-05 Completion Report](./docs/sprint/OSS-102-05-completion-report.md)
- **Verdict:** OSS-102-05 COMPLETE — await owner approval before OSS-102-06; **no PlatformService/HTTP/UI/sync/webhooks**

### Added (OSS-102-04 — Zammad Articles & Attachment Metadata)

- `@apzhub/integration-zammad` **v0.3.0** — `adapter.core.articles` (notes, replies, metadata)
- `@apzhub/platform-service-contracts` **v0.4.0** — `SupportArticle*` DTOs
- [ZAMMAD-ARTICLES.md](./integrations/zammad/docs/ZAMMAD-ARTICLES.md)
- [OSS-102-04 Completion Report](./docs/sprint/OSS-102-04-completion-report.md)
- **Verdict:** OSS-102-04 COMPLETE — await owner approval before OSS-102-05; **no binary/PlatformService/HTTP/UI**

### Added (OSS-102-03 — Zammad Core Support Services)

- `@apzhub/integration-zammad` **v0.2.0** — `adapter.core` support / organizations / groups / users
- `@apzhub/platform-service-contracts` **v0.3.0** — vendor-neutral Support DTOs
- [ZAMMAD-ADAPTER.md](./integrations/zammad/docs/ZAMMAD-ADAPTER.md) updated
- [OSS-102-03 Completion Report](./docs/sprint/OSS-102-03-completion-report.md)
- **Verdict:** OSS-102-03 COMPLETE — await owner approval before OSS-102-04; **no PlatformService/HTTP/UI/articles/sync**

### Added (OSS-102-02 — Zammad Integration Foundation)

- `@apzhub/integration-zammad` v0.1.0 — adapter foundation (lifecycle, diagnostics, REST probe, error mapper, placeholder capabilities)
- [ZAMMAD-ADAPTER.md](./integrations/zammad/docs/ZAMMAD-ADAPTER.md)
- [OSS-102-02 Completion Report](./docs/sprint/OSS-102-02-completion-report.md)
- **Verdict:** OSS-102-02 COMPLETE — await owner approval before OSS-102-03; **no ticket/Platform/HTTP/UI**

### Added (OSS-102-01 — Zammad Discovery & Architecture)

- Zammad/Support discovery pack: architecture, mapping, capability matrix, implementation plan, test plan
- [OSS-102 Backlog](./docs/backlog/OSS-102-Zammad-Integration-Backlog.md)
- [OSS-102-01 Completion Report](./docs/sprint/OSS-102-01-completion-report.md)
- **Verdict:** OSS-102-01 COMPLETE (docs only) — await owner approval before OSS-102-02; **no adapter code**

### Added (OSS-101-10 — Plane Wave 1 Certification & Closeout)

- Wave 1 formally complete — Plane certified as APZHUB **Reference Adapter**
- [REFERENCE-ADAPTER-STANDARD.md](./docs/architecture/REFERENCE-ADAPTER-STANDARD.md) — mandatory standard for future adapters
- [OSS-101-10 Wave 1 Certification](./docs/sprint/OSS-101-10-Wave1-Certification.md)
- Architecture / dependency / capability certification artefacts; mocked E2E + performance baseline suites
- **Verdict:** OSS-101-10 COMPLETE — architecture frozen for integration work; await owner approval before OSS-102 (Zammad)

### Added (OSS-101-09 — Plane Operations, Diagnostics & Certification)

- `@apzhub/integration-plane` v0.6.0 — capability certification, compatibility matrix, readiness, health classification, feature detection, operational reports
- Reference adapter patterns documented for future integrations (Zammad, Kimai, Paperless, etc.)
- [Plane Operations](./integrations/plane/docs/PLANE-OPERATIONS.md) · updated [PLANE-ADAPTER.md](./integrations/plane/docs/PLANE-ADAPTER.md)
- [OSS-101-09 Completion Report](./docs/sprint/OSS-101-09-completion-report.md)
- **Verdict:** OSS-101-09 COMPLETE — proceeded to OSS-101-10 with owner approval

### Added (OSS-101-08 — Plane Synchronisation, Events & Production Readiness)

- `@apzhub/integration-plane` v0.5.0 — `PlaneWebhookService`, `PlaneEventService`, `PlaneSyncService`
- Additive contracts: `IntegrationEventEnvelope`, webhook registration DTOs, `SyncStatus` / sync run types
- Capability registration: `webhooks`, `events`, `synchronisation`
- [Plane Sync & Events](./integrations/plane/docs/PLANE-SYNC-EVENTS.md) · updated [PLANE-ADAPTER.md](./integrations/plane/docs/PLANE-ADAPTER.md)
- [OSS-101-08 Completion Report](./docs/sprint/OSS-101-08-completion-report.md)
- **Verdict:** OSS-101-08 COMPLETE — await owner approval before OSS-101-09 (or UI / later milestones)

### Added (OSS-101-07 — Plane Collaboration & Project Intelligence)

- `@apzhub/integration-plane` v0.4.0 — `PlaneCommentService`, `PlaneActivityService`, `PlaneWatcherService`, `PlaneAnalyticsService`
- Additive contracts: Watcher, ProjectStatistics, TaskStatistics, VelocitySnapshot, BurndownSnapshot, CycleProgressSnapshot, filters/inputs
- Capability registration: `comments`, `activity`, `watchers`, `analytics`
- [Plane Collaboration & Intelligence](./integrations/plane/docs/PLANE-COLLABORATION-INTELLIGENCE.md) · updated [PLANE-ADAPTER.md](./integrations/plane/docs/PLANE-ADAPTER.md)
- [OSS-101-07 Completion Report](./docs/sprint/OSS-101-07-completion-report.md)
- **Verdict:** OSS-101-07 COMPLETE — await owner approval before OSS-101-08 (or UI / later milestones)

### Added (OSS-110-09 — Task HTTP API Surface)

- `/api/v1/tasks` Next.js App Router surface over `PlatformServiceGateway.tasks` (list/create/get/update/archive/transition/assignees/labels/sprint/module/parent)
- Zod validation, standard API v1 envelope, existing permission mappings via RequestPipeline
- OpenAPI 3.1 Tasks tag + schemas; `RECONCILIATION_REQUIRED` → HTTP 409
- [Task HTTP API](./docs/architecture/APZHUB-Task-HTTP-API.md) · updated [Platform HTTP API](./docs/architecture/APZHUB-Platform-HTTP-API.md) · [OpenAPI](./docs/specs/APZHUB-Platform-OpenAPI-v1.yaml)
- [OSS-110-09 Completion Report](./docs/sprint/OSS-110-09-completion-report.md)
- **Verdict:** OSS-110-09 COMPLETE — await owner approval before OSS-101-07 (or task UI / later milestones)

### Added (OSS-110-08 — Platform Task Service, Mapping & Gateway Integration)

- `@apzhub/platform-services` v0.6.0 — `TaskServiceImpl`, Plane task provider, `gateway.tasks`
- `@apzhub/platform-service-contracts` v0.2.0 — additive `archiveTask`
- Task permissions (`task.*`), operation map, pipeline + production authz
- Stable APZHUB `task_{32-hex}` IDs via EntityMappingStore
- [OSS-110-08 Completion Report](./docs/sprint/OSS-110-08-completion-report.md)
- **Verdict:** OSS-110-08 COMPLETE — await owner approval before OSS-110-09 (task HTTP API)

### Added (OSS-101-06 — Plane Task / Issue Capability)

- `@apzhub/integration-plane` v0.3.0 — `PlaneTaskService` on `adapter.core.tasks`
- Canonical Task mapping (Plane issues internal); soft-archive; state transition; assignees/labels/cycle/module
- Additive Task contract fields on `@apzhub/platform-service-contracts`
- [Plane Task Service](./integrations/plane/docs/PLANE-TASK-SERVICE.md) · updated [PLANE-ADAPTER.md](./integrations/plane/docs/PLANE-ADAPTER.md)
- [OSS-101-06 Completion Report](./docs/sprint/OSS-101-06-completion-report.md)
- **Verdict:** OSS-101-06 COMPLETE — await owner approval before OSS-110-08 (TaskServiceImpl / mapping / gateway)

### Added (OSS-110-07 — Platform HTTP API Surface)

- `/api/v1` Next.js App Router surface over `PlatformServiceGateway` (workspaces, projects, teams, health, readiness, openapi)
- HTTP foundation in `apps/web/lib/api/v1` — envelopes, Zod validation, error mapping, session→`ServiceRequestContext`, gateway bootstrap
- [ADR-0051](./docs/adr/ADR-0051-platform-http-api-surface.md) · [Platform HTTP API](./docs/architecture/APZHUB-Platform-HTTP-API.md) · [OpenAPI](./docs/specs/APZHUB-Platform-OpenAPI-v1.yaml)
- [OSS-110-07 Completion Report](./docs/sprint/OSS-110-07-completion-report.md)
- **Verdict:** OSS-110-07 COMPLETE — await owner approval before OSS-101-06 or TaskServiceImpl

### Added (OSS-110-06 — Production Authorisation & Policy Enforcement)

- `@apzhub/platform-services` v0.5.0 — `ProductionAuthorizationProvider`, production policies, permission catalogue, operation map, authz audit, bootstrap
- Authz error codes on `@apzhub/platform-service-contracts`
- [ADR-0050](./docs/adr/ADR-0050-production-authorisation-policy-enforcement.md) · [Platform Service Authorization](./docs/architecture/APZHUB-Platform-Service-Authorization.md) · [Permission Catalogue](./docs/specs/APZHUB-Platform-Permission-Catalogue.md)
- [OSS-110-06 Completion Report](./docs/sprint/OSS-110-06-completion-report.md)
- **Verdict:** OSS-110-06 COMPLETE — await owner approval before API routes or OSS-101-06

### Added (OSS-110-05 — Persistent Entity Mapping Store)

- `@apzhub/platform-services` v0.4.0 — `PostgresEntityMappingStore`, mapping bootstrap, shared contract tests
- `@apzhub/config` migration `0015_platform_entity_mapping` + Drizzle schema
- [ADR-0049](./docs/adr/ADR-0049-persistent-entity-mapping-store.md) · updated Entity Mapping Specification
- [OSS-110-05 Completion Report](./docs/sprint/OSS-110-05-completion-report.md)
- **Verdict:** OSS-110-05 COMPLETE — await owner approval before OSS-110-06 or OSS-101-06

### Added (OSS-110-04 — Platform Execution Layer)

- `@apzhub/platform-services` v0.3.0 — `RequestPipeline`, authorization abstraction, policy/middleware frameworks, gateway pipeline integration
- Additive `ServiceRequestContext` fields (`organisationId`, `requestId`, `featureFlags`, `impersonation`, `execution`)
- [Platform Execution Layer](./docs/architecture/APZHUB-Platform-Execution-Layer.md) · [Specification](./docs/specs/APZHUB-Platform-Execution-Layer.md)
- [OSS-110-04 Completion Report](./docs/sprint/OSS-110-04-completion-report.md)
- **Verdict:** OSS-110-04 COMPLETE — await owner approval before OSS-110-05 or OSS-101-06

### Added (APZHUB-000 — Project Knowledge Foundation)

- Knowledge Foundation — 22 documents in `docs/foundation/` across 6 layers
- [AI Context](./docs/foundation/AI-CONTEXT.md) — primary AI session entry point
- [Project Index](./docs/foundation/PROJECT-INDEX.md) — master navigation
- [Project Bible](./docs/foundation/PROJECT-BIBLE.md) — programme historical record
- [Decision Register](./docs/foundation/DECISION-REGISTER.md) · [ADR Catalogue](./docs/foundation/ADR-CATALOGUE.md)
- [Current State](./docs/foundation/CURRENT-STATE.md) · [Current Milestone](./docs/foundation/CURRENT-MILESTONE.md)
- [APZHUB-000 Completion Report](./docs/foundation/APZHUB-000-completion-report.md)
- **Verdict:** APZHUB-000 COMPLETE — await owner approval before OSS-100-03

### Added (OSS-100-05 — AdapterBase & Capability Registration)

- `@apzhub/integration-sdk` v0.5.0 — `IntegrationAdapterBase`, `AdapterContext`, `AdapterFactory`, `CapabilityRegistration`, `MockAdapter`
- [ADAPTER-FRAMEWORK.md](./packages/integration-sdk/docs/ADAPTER-FRAMEWORK.md)
- [OSS-100-05 Completion Report](./docs/sprint/OSS-100-05-completion-report.md)
- **Verdict:** OSS-100-05 COMPLETE — OSS-101-04 gate unlocked; await owner approval

### Added (OSS-100-04 — Error Translation & Observability)

- `@apzhub/integration-sdk` v0.4.0 — `ErrorTranslator`, circuit breaker, metrics contracts, `IntegrationLogger`
- Subpath exports `/resilience` and `/observability`
- Expanded runtime diagnostics API
- [ERROR-TRANSLATION-OBSERVABILITY.md](./packages/integration-sdk/docs/ERROR-TRANSLATION-OBSERVABILITY.md)
- [OSS-100-04 Completion Report](./docs/sprint/OSS-100-04-completion-report.md)
- **Verdict:** OSS-100-04 COMPLETE — await owner approval before OSS-100-05

### Added (OSS-100-03 — Health, Diagnostics, Version & Lifecycle)

- `@apzhub/integration-sdk` v0.3.0 — `HealthProvider`, `DiagnosticsProvider`, `VersionProvider`, `IntegrationLifecycleParticipant`
- Subpath exports `/health` and `/version`
- `createIntegrationOperationsStack` factory
- Platform lifecycle bridge types
- [HEALTH-DIAGNOSTICS-LIFECYCLE.md](./packages/integration-sdk/docs/HEALTH-DIAGNOSTICS-LIFECYCLE.md)
- [OSS-100-03 Completion Report](./docs/sprint/OSS-100-03-completion-report.md)
- **Verdict:** OSS-100-03 COMPLETE — await owner approval before OSS-100-04

### Added (OSS-100-02 — Integration Authentication & Connection Foundation)

- `@apzhub/integration-sdk` v0.2.0 — `AuthenticationProvider`, `CredentialResolver`, `ConnectionManager`, `ConnectionRegistry`, `ConnectionLifecycleService`
- Subpath exports `/auth` and `/connection`
- Structured SDK error codes and `SdkResult` type
- In-memory secret provider and connection registry
- [Package AUTHENTICATION.md](./packages/integration-sdk/docs/AUTHENTICATION.md)
- [Package CONNECTION-MANAGEMENT.md](./packages/integration-sdk/docs/CONNECTION-MANAGEMENT.md)
- [Integration Authentication Architecture](./docs/architecture/APZHUB-Integration-Authentication-Architecture.md)
- [Integration Connection Management Architecture](./docs/architecture/APZHUB-Integration-Connection-Management.md)
- [OSS-100-02 Completion Report](./docs/sprint/OSS-100-02-completion-report.md)
- **Verdict:** OSS-100-02 COMPLETE — await owner approval before OSS-100-03

### Added (OSS-100-01 — Integration SDK Package Scaffold)

- `@apzhub/integration-sdk` — core types, interfaces, placeholder client/adapter/diagnostics
- Subpath exports: `/client`, `/adapter`, `/diagnostics`, `/lifecycle`, `/errors`
- Smoke tests — `packages/integration-sdk/src/integration-sdk.test.ts`
- [Package README](./packages/integration-sdk/README.md)
- [OSS-100-01 Completion Report](./docs/sprint/OSS-100-01-completion-report.md)
- **Verdict:** OSS-100-01 COMPLETE — await owner approval before OSS-100-02

### Added (OSS-100 — Platform Integration SDK — documentation only)

- [Platform Integration SDK Architecture](./docs/architecture/APZHUB-Platform-Integration-SDK-Architecture.md) — **canonical** SDK for all OSS adapters
- [Adapter SDK Specification](./docs/specs/APZHUB-Adapter-SDK-Specification.md) — IntegrationClient, AdapterBase, and standard contracts
- [Base Adapter Pattern](./docs/architecture/APZHUB-Base-Adapter-Pattern.md)
- [Integration Connection Lifecycle](./docs/architecture/APZHUB-Integration-Connection-Lifecycle.md)
- [Integration Health & Diagnostics Model](./docs/architecture/APZHUB-Integration-Health-Diagnostics-Model.md)
- [Integration Error Translation Model](./docs/architecture/APZHUB-Integration-Error-Translation-Model.md)
- [OSS-100 Backlog](./docs/backlog/OSS-100-Platform-Integration-SDK-Backlog.md) — OSS-100-01…100-10 phases
- [OSS-100 Completion Report](./docs/sprint/OSS-100-completion-report.md)
- **Verdict:** OSS-100 COMPLETE — await owner approval before OSS-100-01 or OSS-101-04

### Added (OSS-101-03 — Projects Capability Manifest)

- Projects capability manifests — `project-service`, `projects` module, `plane` integration
- Eight canonical event manifests under `events/projects/`
- Manifest validation tests — `projects-manifests.test.ts`
- [Projects Manifest Notes](./docs/governance/APZHUB-Projects-Manifest-Notes.md)
- [Projects Capability Registration Notes](./docs/governance/APZHUB-Projects-Capability-Registration-Notes.md)
- [OSS-101-03 Completion Report](./docs/sprint/OSS-101-03-completion-report.md)
- **Verdict:** OSS-101-03 COMPLETE — await owner approval before OSS-101-04

### Added (OSS-101-02 — Plane Environment & Configuration)

- Plane configuration keys in `@apzhub/config` governance registry (`PLANE_*`)
- `getPlaneConfigurationDiagnostics()` — config-only scaffold (no HTTP probe)
- [Plane Configuration Notes](./docs/governance/APZHUB-Plane-Configuration-Notes.md)
- [Plane Environment Guide](./docs/governance/APZHUB-Plane-Environment-Guide.md)
- [Plane Diagnostics Design](./docs/architecture/APZHUB-Plane-Diagnostics-Design.md)
- [Plane Deployment Notes](./docs/governance/APZHUB-Plane-Deployment-Notes.md)
- [OSS-101-02 Completion Report](./docs/sprint/OSS-101-02-completion-report.md)
- **Verdict:** OSS-101-02 COMPLETE — await owner approval before OSS-101-03

### Added (OSS-101-01 — Projects Architecture & ADR — documentation only)

- [Projects Capability Architecture](./docs/architecture/APZHUB-Projects-Capability-Architecture.md) — **canonical** Projects contract
- [ProjectService Specification](./docs/specs/APZHUB-ProjectService-Specification.md) — vendor-neutral interface
- [PlaneAdapter Specification](./docs/specs/APZHUB-PlaneAdapter-Specification.md) — translation boundary
- [Projects Domain Lifecycle Specification](./docs/specs/APZHUB-Projects-Domain-Lifecycle-Specification.md)
- [Projects Event Mapping Specification](./docs/specs/APZHUB-Projects-Event-Mapping-Specification.md)
- [ADR-0047 Projects / Plane Integration Architecture](./docs/adr/ADR-0047-projects-plane-integration-architecture.md) — **Accepted**
- [OSS-101-01 Completion Report](./docs/sprint/OSS-101-01-completion-report.md)
- **Verdict:** OSS-101-01 COMPLETE — await owner approval before OSS-101-02

### Added (OSS-101 — Projects / Plane Integration Planning — documentation only)

- [Projects Plane Reference Architecture](./docs/architecture/APZHUB-Projects-Plane-Reference-Architecture.md) — Wave 1 Projects capability architecture
- [Projects Domain Mapping](./docs/architecture/APZHUB-Projects-Domain-Mapping.md) — Plane → APZHUB concept map
- [Plane Adapter Design](./docs/architecture/APZHUB-Plane-Adapter-Design.md) — PlaneAdapter boundary design
- [Projects Workbench UX](./docs/specs/APZHUB-Projects-Workbench-UX.md) — native UI specification
- [OSS-101 Backlog](./docs/backlog/OSS-101-Plane-Integration-Backlog.md) — OSS-101-01…101-10 implementation phases
- [OSS-101 Readiness Review](./docs/reviews/OSS-101-Readiness-Review.md) — **READY** — planning gate
- [OSS-101 Completion Report](./docs/sprint/OSS-101-completion-report.md)
- **Verdict:** OSS-101 COMPLETE — await owner approval before OSS-101-01

### Added (OSS-002 — Capability Abstraction Standard — documentation only)

- [Capability Abstraction Standard](./docs/architecture/APZHUB-Capability-Abstraction-Standard.md) — mandatory pattern for all APZHUB capabilities
- [Adapter Boundary Pattern](./docs/architecture/APZHUB-Adapter-Boundary-Pattern.md) — OSS adapter contract
- [OSS vs Native Decision Model](./docs/architecture/APZHUB-OSS-vs-Native-Capability-Decision-Model.md) — build / integrate / buy / defer framework
- [Quality Engineering Platform Strategy](./docs/strategy/APZHUB-Quality-Engineering-Platform-Strategy.md) — Wave 5 native capability (replaces Kiwi TCMS)
- [Quality Engineering Reference Architecture](./docs/architecture/APZHUB-Quality-Engineering-Reference-Architecture.md)
- [Quality Engineering Backlog](./docs/backlog/APZHUB-Quality-Engineering-Backlog.md) — QE-001–QE-015 phased plan
- [OSS-002 Completion Report](./docs/sprint/OSS-002-completion-report.md)
- **Amended:** OSS-001 Wave 5 — Kiwi TCMS → native Quality Engineering Platform
- **Verdict:** OSS-002 COMPLETE — await owner approval before OSS-101 or QE-001

### Added (OSS-001 — OSS Integration Master Plan — documentation only)

- [OSS Integration Master Plan](./docs/strategy/OSS-001-APZHUB-OSS-Integration-Master-Plan.md) — definitive OSS integration strategy
- [OSS Integration Master Architecture](./docs/architecture/APZHUB-OSS-Integration-Master-Architecture.md)
- [OSS Product Integration Catalog](./docs/architecture/APZHUB-OSS-Product-Integration-Catalog.md)
- [OSS Wave Roadmap](./docs/strategy/APZHUB-OSS-Wave-Roadmap.md)
- [OSS Integration Standards](./docs/governance/APZHUB-OSS-Integration-Standards.md)
- [OSS Capability Mapping](./docs/architecture/APZHUB-OSS-Capability-Mapping.md)
- [OSS Integration Risk Register](./docs/governance/APZHUB-OSS-Integration-Risk-Register.md)
- [OSS-001 Engineering Estimates](./docs/strategy/OSS-001-Engineering-Estimates.md)
- [OSS-001 Acceptance Criteria](./docs/strategy/OSS-001-Acceptance-Criteria.md)
- [OSS-001 Completion Report](./docs/sprint/OSS-001-completion-report.md)
- **Verdict:** OSS-001 COMPLETE — await owner approval before OSS-101

- `CspPolicyService` and `CspViolationService` in `@apzhub/platform-security`
- `POST /api/platform/v1/security/csp-report` on web and law-platform
- Production enforced CSP; development Report-Only
- [PCv2-01 CSP Audit](./docs/security/PCv2-01-CSP-Audit.md)
- [CSP Violation Reporting](./docs/security/CSP-Violation-Reporting.md)
- [PRH-002 Completion Report](./docs/sprint/PRH-002-completion-report.md)
- **Verdict:** PRH-002 COMPLETE — OBS-PC01-03 closed in production; await owner approval before PRH-003

### Added (PRH-001 — Architecture Consolidation & ADR-0046)

- `@apzhub/platform-bootstrap` — canonical runtime bootstrap and operational diagnostics loader
- [ADR-0046 Production Readiness Bootstrap Consolidation](./docs/adr/ADR-0046-production-readiness-bootstrap-consolidation.md)
- [Platform Bootstrap Architecture](./docs/architecture/APZHUB-Platform-Bootstrap-Architecture.md)
- [PRH-001 Completion Report](./docs/sprint/PRH-001-completion-report.md)
- **Verdict:** PRH-001 COMPLETE — TD-M16-C01 closed; await owner approval before PRH-002
- **Not in scope:** CSP enforcement, rate limiting (deferred PRH-002+)

### Added (PRH-000 — Production Readiness Acceptance — governance only)

- [PRH-000 Owner Acceptance](./docs/reviews/PRH-000-Owner-Acceptance.md) — **APPROVED** — PCv2-01 implementation authorised
- [PRH-000 Implementation Baseline](./docs/reviews/PRH-000-Implementation-Baseline.md) — frozen architecture, backlog, acceptance criteria
- [PRH-000 Sprint Baseline](./docs/releases/PRH-000-Sprint-Baseline.md) — DoD, production-ready definition, success metrics
- [PRH-000 Completion Report](./docs/sprint/PRH-000-completion-report.md)
- **Verdict:** PRH-000 COMPLETE — PCv2-01 implementation authorised; await owner instruction before PRH-001

### Added (PCv2-01 — Production Readiness Planning — documentation only)

- [PCv2-01 Sprint Guide](./docs/sprint/PCv2-01-Production-Readiness-Sprint-Guide.md) — execution blueprint for Production Readiness & Operational Hardening
- [PCv2-01 Backlog](./docs/backlog/PCv2-01-Backlog.md) — PRH-001–PRH-018 engineering stories
- [PCv2-01 Production Readiness Architecture](./docs/architecture/PCv2-01-Production-Readiness-Architecture.md) — target production architecture
- [PCv2-01 Readiness Review](./docs/reviews/PCv2-01-Readiness-Review.md) — **READY WITH OBSERVATIONS**
- [PCv2-01 Planning Completion Report](./docs/sprint/PCv2-01-planning-completion-report.md)
- **Verdict:** PCv2-01 planning COMPLETE — **await owner approval** before PRH-001 implementation
- **Explicitly out of scope:** workers, gateway service, Vault, SOC/SIEM, HA, OSS integrations (planning dependencies only)

### Added (PCS-001 — Platform Core Strategy — documentation only)

- [Platform Core Strategy](./docs/strategy/APZHUB-Platform-Core-Strategy.md) — **master strategy** for APZHUB long-term direction
- [Platform Core v2 Strategy](./docs/strategy/APZHUB-Platform-Core-v2-Strategy.md)
- [Product Portfolio Strategy](./docs/strategy/APZHUB-Product-Portfolio-Strategy.md)
- [OSS Integration Strategy](./docs/strategy/APZHUB-OSS-Integration-Strategy.md)
- [Build vs Buy Strategy](./docs/strategy/APZHUB-Build-vs-Buy-Strategy.md)
- [Commercial Roadmap](./docs/strategy/APZHUB-Commercial-Roadmap.md)
- [Engineering Roadmap](./docs/strategy/APZHUB-Engineering-Roadmap.md)
- [AI Strategy](./docs/strategy/APZHUB-AI-Strategy.md)
- [PCS-001 Strategy Review](./docs/reviews/PCS-001-Strategy-Review.md)
- [PCS-001 completion report](./docs/sprint/PCS-001-completion-report.md)
- **Verdict:** PCS-001 COMPLETE — **owner approved 2026-07-08**; PCv2-01 authorized; sequencing PCv2-01 → PCv2-02 → M17 → OSS

### Owner approval (PCS-001 — 2026-07-08)

- [PCS-001 Owner Approval](./docs/strategy/PCS-001-owner-approval.md) — strategy ratified; sequencing amended
- **PCv2-01 Production SaaS Hardening** — authorized to proceed
- OSS Wave order: Plane → Kimai → Paperless → Zammad → **Quality Engineering (native)** → Metabase → n8n → Observability → Security
- **Not approved:** Financial Engine extraction, Banking, Exchange, new verticals

### Added (PC-001 — Platform Core Certification — documentation only)

- [Platform Core Certification](./docs/reviews/APZHUB-Platform-Core-Certification.md) — **CERTIFIED WITH OBSERVATIONS**
- [Platform Core Reference Architecture](./docs/architecture/APZHUB-Platform-Core-Reference-Architecture.md) — canonical Platform Core architecture
- [Platform Core Capability Reference](./docs/architecture/APZHUB-Platform-Core-Capability-Reference.md) — per-capability catalogue
- [Platform Core Commercial Assessment](./docs/reviews/APZHUB-Platform-Core-Commercial-Assessment.md)
- [Platform Core v1.0 Release Review](./docs/releases/APZHUB-Platform-Core-v1.0.md) — no tag
- [Platform Core v2 Roadmap](./docs/roadmap/APZHUB-Platform-Core-v2-Roadmap.md)
- [PC-001 completion report](./docs/sprint/PC-001-completion-report.md)
- **Verdict:** Platform Core Phase 1 certified — await owner approval before Financial Engine, Banking, or new products

### Added (M8-06 — Platform Security & Operational Resilience)

- `@apzhub/platform-security` — environment validation, API guard, rate limiting, resilience probes, consolidated diagnostics
- Platform APIs: `/security`, `/security/diagnostics`, `/system/health`, `/system/readiness`, `/system/liveness`
- Operations Console: Security and Resilience sections; consolidated Diagnostics
- [Platform Security Reference Architecture](./docs/architecture/APZHUB-Platform-Security-Reference-Architecture.md)
- [Operational Resilience Architecture](./docs/architecture/APZHUB-Operational-Resilience-Architecture.md)
- [ADR-0045 Platform Security & Operational Resilience](./docs/adr/ADR-0045-platform-security-operational-resilience.md)
- [M8-06 completion report](./docs/sprint/M8-06-completion-report.md)
- **Verdict:** M8-06 COMPLETE — Platform Core Phase 1 delivered

### Added (M8-05 — Governance & Provisioning Framework)

- `@apzhub/platform-governance` — governance, provisioning, capabilities, feature flags (foundation)
- PostgreSQL migration `0014_platform_governance`
- Platform APIs: `/governance`, `/provisioning`, `/feature-flags`, `/capabilities`
- [ADR-0044 Platform Governance & Provisioning](./docs/adr/ADR-0044-platform-governance-provisioning-framework.md)
- [M8-05 completion report](./docs/sprint/M8-05-completion-report.md)

### Added (M8-04 — Personalisation Framework)

- `@apzhub/platform-personalisation` — preferences, favorites, recent, workbench layout
- PostgreSQL migration `0013_platform_personalisation`
- [ADR-0043 Platform Personalisation Framework](./docs/adr/ADR-0043-platform-personalisation-framework.md)
- [M8-04 completion report](./docs/sprint/M8-04-completion-report.md)

## [Unreleased — prior] — M8-01 Identity & Tenant Foundation + M16 Platform Review + LAW-015 Trust Accounting (Closed)

### Added (M8-03 — Platform Operations Console)

- Platform Operations Workbench workspace — 14 sidebar sections (Dashboard through Feature Flags placeholder)
- Manifest-driven navigation under `platform-administration` activity bar (renamed Platform Operations)
- `OperationsWorkspaceRouter` — section pages using existing Card/table/diagnostics patterns
- Platform APIs: operations summary, configuration, users, modules, services, products, provisioning, audit
- [Platform Operations Reference Architecture](./docs/architecture/APZHUB-Platform-Operations-Reference-Architecture.md)
- [Platform Operations Console Guide](./docs/developer/APZHUB-Platform-Operations-Console-Guide.md)
- [Platform Operations UX Guide](./docs/governance/APZHUB-Platform-Operations-UX-Guide.md)
- [ADR-0042 Platform Operations Console](./docs/adr/ADR-0042-platform-operations-console.md)
- [M8-03 completion report](./docs/sprint/M8-03-completion-report.md)
- **Verdict:** M8-03 COMPLETE — await owner approval before M8-04 (User Preferences)

### Added (M8-02 — Authorization Framework / RBAC Phase 1)

- `@apzhub/platform-authorization` — AuthorizationService, PermissionService, RoleService, RoleAssignmentService, EffectivePermissionService
- PostgreSQL migration `0012_platform_authorization` — roles, permissions, assignments, role-permission grants
- Session authorization bridge — `resolveSessionAuthorization()` for Workbench and Law API
- Platform APIs: `/api/platform/v1/roles`, `/permissions`, `/assignments`, `/authorization/diagnostics`
- Law Platform + apps/web hydration wired to Platform AuthorizationService
- Platform events: `platform.authorization.role.*`, `platform.authorization.assignment.*`
- [Authorization Reference Architecture](./docs/architecture/APZHUB-Platform-Authorization-Reference-Architecture.md)
- [ADR-0041 Platform Authorization RBAC Phase 1](./docs/adr/ADR-0041-platform-authorization-rbac-phase-1.md)
- [M8-02 completion report](./docs/sprint/M8-02-completion-report.md)
- **Verdict:** M8-02 COMPLETE — await owner approval before M8-03 (Administration Console)

### Added (M8-01 — Identity & Tenant Foundation)

- `@apzhub/platform-identity` — tenant management service, membership repositories, session tenant resolver
- PostgreSQL migration `0011_platform_identity` — `platform_tenant`, `platform_user_tenant`, `user.active_tenant_id`
- Auth session tenant enrichment — `getValidatedSession()` returns `tenantId` and `tenantSource`
- First-login tenant provisioning via `provisionPlatformTenantForUser()`
- Platform API routes: `GET /api/platform/v1/tenants`, `GET /api/platform/v1/identity/diagnostics`
- Law persistence session-claim tenant binding — closes TD-P02 primary path
- [Platform Identity Reference Architecture](./docs/architecture/APZHUB-Platform-Identity-Reference-Architecture.md)
- [Platform Tenant Architecture](./docs/architecture/APZHUB-Platform-Tenant-Architecture.md)
- [ADR-0040 Platform Tenant Foundation](./docs/adr/ADR-0040-platform-tenant-foundation.md)
- [M8-01 completion report](./docs/sprint/M8-01-completion-report.md)
- **Verdict:** M8-01 COMPLETE — await owner approval before M8-02 (RBAC Framework)
- **Quality gates:** lint, typecheck, build, 1851 tests, coverage ≥80%

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
