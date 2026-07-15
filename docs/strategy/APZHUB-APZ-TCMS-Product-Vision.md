# APZ TCMS — Product Vision

**Product:** APZ TCMS (APZHUB Test & Certification Management System)  
**User-facing module:** Testing (Certification views within module)  
**Milestone:** APZTCMS-001 — Product Vision, Architecture & Foundation  
**Status:** Approved product vision — **documentation only**; no implementation in APZTCMS-001  
**Supersedes product identity:** “Quality Engineering” → **APZ TCMS** / **Testing & Certification**  
**Authority:** [000 Constitution](../000-apzhub-engineering-constitution.md) · [ADR-0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md) · Documents 003–015, 024–029

---

## Explicit exclusions (APZTCMS-001)

No backend, frontend, database migrations, APIs, runners, integrations, notifications, realtime, or mobile in this milestone. Await owner approval for **APZTCMS-002**.

---

## Vision

**APZ TCMS** is APZHUB’s native Test & Certification Management System. It is the single workbench for requirements traceability, manual and automated test orchestration, evidence, defects, coverage, quality gates, and formal release certification.

**Philosophy:** APZ TCMS **orchestrates** testing. Execution engines (Vitest, Playwright, Jest, JUnit, Allure, axe, Lighthouse, ZAP, k6, and others) remain **independent**. TCMS **consumes results** through Integration SDK–pattern result adapters — it does not become those engines, and it is not a fork of Kiwi TCMS or a wrapper around Playwright/Vitest.

Users see **Testing** and **Certification**. They never see Kiwi, Playwright, Vitest, or other engine brand names in the product UI.

---

## Product identity

| Context             | Name                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| Product             | **APZ TCMS**                                                                                     |
| User-facing module  | **Testing** (Activity Bar); Certification views inside the module                                |
| Module ID           | `testing`                                                                                        |
| Platform Services   | `TestingService`, `CertificationService`                                                         |
| Connectors (future) | Result ingestion only — e.g. `VitestResultAdapter`, `PlaywrightResultAdapter`, `JUnitXmlAdapter` |
| Packages (planned)  | `@apzhub/testing` (module), services in `@apzhub/platform-services`                              |

---

## Lifecycle (end-to-end)

```text
Requirement / Risk
       ↓
Test Plan → Suites → Cases (manual steps first-class)
       ↓
Execution (ManualExecution | AutomatedExecution → TestRun → TestResult)
       ↓
Evidence · Attachments · Defect links
       ↓
Coverage · Quality gates
       ↓
Certification states → Approvals · Signatures · Audit
       ↓
Release decision (Production Ready / Certified / Conditional / Failed)
```

Manual testing is first-class: steps, expected vs actual, evidence capture, approvals, and digital sign-off.

---

## Differentiators

| Differentiator                              | Detail                                                                                                                        |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Native APZHUB product**                   | Platform PostgreSQL System of Record; workbench-native UX; not an embedded third-party TCMS                                   |
| **Orchestration, not execution ownership**  | Engines stay independent; adapters ingest results                                                                             |
| **Certification engine inside the product** | Formal certification states, gates, approvals, signatures — not a bolt-on report                                              |
| **Manual + automated parity**               | Manual execution is equal to automation in the domain model                                                                   |
| **Layered architecture compliance**         | Module → Platform Service → Connector → Engine (003, 008, 009)                                                                |
| **AI assists; humans certify**              | AI suggestions never auto-certify or bypass gates                                                                             |
| **Self-hosted OSS first**                   | Result formats and scanners from OSS ecosystems; no mandatory commercial SaaS engines                                         |
| **Orthogonal to SDK harness**               | Integration SDK certification harness certifies **adapters**; APZ TCMS manages **product quality** — coexistence, not overlap |

---

## Relationship to prior planning

| Artefact                                                                                          | Relationship                                                                          |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [QE Platform Strategy](./APZHUB-Quality-Engineering-Platform-Strategy.md)                         | Planning predecessor — **product identity superseded** by APZ TCMS                    |
| [QE Reference Architecture](../architecture/APZHUB-Quality-Engineering-Reference-Architecture.md) | Planning predecessor — superseded by APZ TCMS architecture pack                       |
| [QE Backlog](../backlog/APZHUB-Quality-Engineering-Backlog.md)                                    | Planning predecessor — superseded by [APZTCMS-Backlog](../backlog/APZTCMS-Backlog.md) |
| Kiwi TCMS OSS Wave 7                                                                              | Remains **superseded** as product SoR / user-facing TCMS                              |
| Integration SDK certification harness (OSS-100-09/10)                                             | **Orthogonal** — adapter certification ≠ product test management                      |

---

## Commercial positioning

| Aspect                | Position                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------- |
| **Offering**          | Bundled APZHUB suite capability; future enterprise / regulated certification tier         |
| **Buyer**             | Organisations needing unified testing + formal release certification in one workbench     |
| **Value**             | Traceability, evidence, gates, and auditable certification without exposing engine sprawl |
| **Competitive frame** | Not “another open-source TCMS”; a platform-native orchestration and certification product |
| **Go-to-market**      | Complements Law, Projects, Support; strengthens release governance narrative              |

---

## Platform consumption

| Platform capability      | APZ TCMS usage                                                  |
| ------------------------ | --------------------------------------------------------------- |
| Identity & tenant        | Tenant-scoped test and certification assets                     |
| Authorization            | Permission-driven Testing module and Certification actions      |
| Workbench (005, 016–019) | Activity Bar **Testing**; permission-filtered sidebar views     |
| Events (012, 029)        | Run completed, gate failed, certification state changed         |
| Notifications (021)      | Delivery of TCMS events — modules never send directly           |
| Search (020)             | Cases, plans, runs, certification records                       |
| Audit (011, 013)         | Immutable audit for mutations and sign-offs                     |
| Object storage           | Evidence blobs (S3-compatible); metadata in platform PostgreSQL |
| Integration SDK (026)    | Result adapters only — never module→engine                      |

---

## Architecture principle (encoded)

```text
Engines (Vitest / Playwright / Jest / JUnit / Allure / a11y / perf / security)
  → Result Adapters (Integration SDK pattern)
  → TestingService / CertificationService
  → Workbench Module + Dashboards + Certification + Release decision
```

Workers process ingestion and heavy jobs asynchronously (012). Modules never call engines. AI suggests only; humans certify.

---

## Success criteria (product-level)

1. One workbench for manual and automated test management and certification
2. Platform PostgreSQL is SoR for TCMS domain metadata; evidence in object storage
3. External runners remain replaceable via adapters
4. Certification states and approvals are first-class and auditable
5. Delivery follows Document 015 quality gates across APZTCMS milestones

---

## Next milestone

**APZTCMS-002 — Core Platform Foundation** (recommended; owner approval required): manifests, service contracts/shell, domain types, schema design/migration start, permission stubs, module shell registration — still no full UI or runners.

See [APZTCMS-Milestone-Roadmap](../backlog/APZTCMS-Milestone-Roadmap.md) · [Completion Report](../sprint/APZTCMS-001-completion-report.md).
