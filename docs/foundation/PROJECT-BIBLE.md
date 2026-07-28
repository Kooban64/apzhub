# APZHUB Project Bible

> **Purpose:** Historical record of how APZHUB evolved — milestones, decisions, and lessons  
> **Audience:** All stakeholders — the programme's narrative reference  
> **Authoritative references:** [docs/sprint/](../sprint/) completion reports · [docs/reviews/](../reviews/) · [000](../000-apzhub-engineering-constitution.md)  
> **Related documents:** [PROJECT-INDEX](./PROJECT-INDEX.md) · [DECISION-REGISTER](./DECISION-REGISTER.md) · [APZHUB-MASTER-BRIEF](./APZHUB-MASTER-BRIEF.md)  
> **Reading order:** After Master Brief; for historical context  
> **Last updated:** 2026-07-22  
> **Current status:** Active — living historical record · Platform **1.2.0** baseline freeze [APZHUB-RELEASE-001](../releases/platform-1.2.0/README.md)

---

## Prologue — Why APZHUB exists

Organisations run dozens of open-source tools — project management, documents, time tracking, support, analytics — each with its own login, UI, and terminology. APZHUB was conceived to unify these behind one enterprise workbench: users see **Projects**, not Plane; **Time Tracking**, not Kimai.

The founding insight (documented in [001](../001-project-vision-and-guiding-principles.md)): APZHUB is not a portal of links. It is an application layer that uses OSS engines as sources of truth while owning identity, permissions, navigation, and user experience.

---

## Chapter 1 — Foundation (Documents 000–029)

Before any significant code, the programme established **30 foundation documents** (000 Constitution + 001–029) covering vision, architecture, technology stack, desktop framework, design system, IAM, modules, services, APIs, data, events, security, observability, quality, and four SDK specifications.

**Why:** Cursor and AI-assisted development require authoritative standards before code generation. The Constitution (000) became supreme authority — sprint guides implement it but never override it.

**Key decision:** Manifest-first development — every module, service, integration, and event starts with YAML before TypeScript.

---

## Chapter 2 — Repository bootstrap (BUILD-001, SPR-001)

| Milestone     | What happened                                                                 |
| ------------- | ----------------------------------------------------------------------------- |
| **BUILD-001** | Monorepo scaffold — pnpm workspace, Next.js app, empty packages, CI scaffold  |
| **SPR-001**   | Foundation environment — BetterAuth, PostgreSQL, Redis, Docker, minimal shell |

**Outcome:** `v0.1.0-foundation` — reviewed PASS WITH OBSERVATIONS. A minimal desktop shell (Header, Activity Bar, Sidebar, Workspace, Status Bar) with dark/light themes and `GET /api/health`.

**Lesson:** Shell before modules. Design system before business UI. No shortcuts.

---

## Chapter 3 — Platform Runtime (SPR-002, Milestone 2)

SPR-002 delivered `@apzhub/platform-runtime` — manifest discovery, capability registry, dependency graph, health manager, bootstrap lifecycle.

**Why registry-first:** ADR-0004 established that all capabilities register via manifests rather than hardcoded imports. This enables auto-discovery, dependency validation, and fail-fast bootstrap.

**Outcome:** Milestone 2 — PASS. Platform can discover and initialise capabilities from the monorepo filesystem.

---

## Chapter 4 — Workbench Framework (SPR-003, Milestone 3)

SPR-003 delivered `@apzhub/workbench-framework` — Workbench Manager, eight engines (Navigation, View, Session, Layout, Context, Selection, Presentation, Request Bus), manifest extensions for navigation and sessions.

**Why a separate framework layer:** Runtime orchestrates capabilities; Workbench orchestrates the desktop UX. Clean separation prevents React dependencies in the runtime engine.

**Outcome:** Milestone 3 — PASS WITH OBSERVATIONS. `v0.3.0-workbench-framework` prepared.

---

## Chapter 5 — Cross-cutting frameworks (M4–M7)

Four framework milestones established the platform's interaction model:

| Milestone        | Framework             | Core capability                             |
| ---------------- | --------------------- | ------------------------------------------- |
| **M4 (SPR-004)** | Action / Command      | Ctrl+Shift+P command palette, action engine |
| **M5 (SPR-005)** | Knowledge & Discovery | Unified search, knowledge providers         |
| **M6 (SPR-006)** | Event & Notification  | Event bus, notification routing, attention  |
| **M7 (SPR-007)** | Activity & Timeline   | Activity stream, timeline experiences       |

**Why events drive everything:** Modules publish events; the platform decides notifications, search indexing, audit, and activity. No module-to-module coupling.

**Outcome:** Platform v4.0 → v5.0 baseline. All four frameworks production-ready with observations.

**Lesson:** Each framework got its own package, ADRs (0024–0035), specs, backlog, architecture review, and production readiness review. The phased review gate (ADR-0017) proved essential.

---

## Chapter 6 — Platform Core M8 (SPR-008, PC-001)

Milestone 8 delivered the operational backbone:

| Phase | Capability                | Package                            |
| ----- | ------------------------- | ---------------------------------- |
| M8-01 | Identity & Tenants        | `@apzhub/platform-identity`        |
| M8-02 | Authorization / RBAC      | `@apzhub/platform-authorization`   |
| M8-03 | Operations Console        | `@apzhub/platform-operations`      |
| M8-04 | Personalisation           | `@apzhub/platform-personalisation` |
| M8-05 | Governance & Provisioning | `@apzhub/platform-governance`      |
| M8-06 | Security & Resilience     | `@apzhub/platform-security`        |

**Why Platform-owned IAM:** BetterAuth handles authentication only. APZHUB owns permissions, roles, provisioning, and audit. Backend engine roles are never exposed in UI.

**Outcome:** PC-001 — Platform Core **CERTIFIED WITH OBSERVATIONS**.

---

## Chapter 7 — Law Platform validation

While Platform Core matured, the **Law Platform** (`apps/law-platform`) validated the architecture through a real vertical product:

- Matters, Clients, Documents, Tasks, Time Entries, Invoices, Calendar
- Full workflow integration: commands → events → notifications → activities → search
- Law-specific API design standard and OpenAPI specification

**Why Law first:** Regulated industry validates tenant isolation, audit, trust, and compliance patterns that benefit all future products.

**Outcome:** [Law Platform Readiness](../reviews/APZHUB-Law-Platform-Readiness.md) — APPROVED FOR PRODUCT VALIDATION.

---

## Chapter 8 — Trust Accounting (LAW-015)

Trust Accounting became the most complex Law Platform capability:

- Immutable trust journal (ADR-0037)
- Matter trust balance segregation (ADR-0038)
- Jurisdiction-adaptive compliance profiles (ADR-0039)
- Full subsystem: accounts, transactions, allocations, reconciliation, interest, transfers, reports, approvals

**Why native, not OSS:** Trust fund management requires jurisdiction-specific compliance that no OSS engine provides. Built as a Law Platform capability consuming Platform Core.

**Outcome:** LAW-015 milestone closed. [LAW Trust v1.0](../releases/LAW-Trust-v1.0.md).

**Lesson:** Not everything should be OSS-integrated. Native build is correct when compliance and domain specificity demand it.

---

## Chapter 9 — Platform Core v2 (PCv2-01, PRH-000–011)

PCv2-01 addressed production readiness gaps identified after PC-001:

| Story       | Focus                                   |
| ----------- | --------------------------------------- |
| PRH-001     | Bootstrap consolidation                 |
| PRH-002–003 | CSP audit, HTTP security headers        |
| PRH-004     | Configuration & secrets governance      |
| PRH-005–006 | Traffic governance, session security    |
| PRH-007     | Tenant isolation validation             |
| PRH-008     | Operations Control Plane                |
| PRH-009     | Lifecycle Management                    |
| PRH-010     | Reliability & failure validation        |
| PRH-011     | Architecture compliance & certification |

**Why a dedicated hardening sprint:** Certification without production readiness is meaningless. PRH-000 froze the contractual baseline before implementation began.

**Outcome:** Platform Core v2 — **CERTIFIED WITH OBSERVATIONS**. Reliability validation PASS.

**Lesson:** Owner approval gates (PRH-000) prevent scope creep and ensure frozen acceptance criteria.

---

## Chapter 10 — Strategy consolidation (PCS-001)

PCS-001 ratified the master strategy:

- Five-year Platform Core direction
- Product portfolio classification
- OSS integration master plan (OSS-001)
- Build vs Buy decisions
- Commercial roadmap tiers
- AI strategy

**Why now:** Platform Core was certified. The programme needed a definitive forward plan before resuming OSS integration implementation.

**Outcome:** Owner ratification (2026-07-08). Sequencing: PCv2-02 → M17 → OSS-100-03 → OSS-101-04 / QE-001.

---

## Chapter 11 — OSS integration planning (OSS-001, OSS-002, OSS-100, OSS-101)

| Milestone   | Deliverable                                                           |
| ----------- | --------------------------------------------------------------------- |
| **OSS-001** | Master architecture, nine-wave catalog, capability mapping, standards |
| **OSS-002** | Capability abstraction standard, adapter boundary, build/buy model    |
| **OSS-100** | Integration SDK architecture, adapter specs, connection lifecycle     |
| **OSS-101** | Projects/Plane architecture, ADR-0047, domain mapping, UX spec        |

**Why Integration SDK before adapters:** Every OSS engine shares auth, connection, health, error translation, and lifecycle patterns. Building adapters without shared SDK would duplicate code and violate the adapter boundary.

---

## Chapter 12 — Integration SDK implementation (OSS-100-01, OSS-100-02)

| Milestone      | Deliverable                                                                                                            |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **OSS-100-01** | `@apzhub/integration-sdk` v0.1.0 — types, interfaces, placeholder client/adapter                                       |
| **OSS-100-02** | v0.2.0 — AuthenticationProvider, CredentialResolver, ConnectionManager, ConnectionRegistry, ConnectionLifecycleService |

**Key architectural decision:** Credentials stay inside the integration boundary. Capability services never handle vendor secrets. Diagnostics and errors never expose tokens, passwords, or API keys.

**Outcome:** OSS-100-02 complete. Await owner approval for OSS-100-03.

---

## Chapter 13 — Projects manifests (OSS-101-03)

Projects capability manifests registered:

- `services/projects/` — ProjectService
- `modules/projects/` — Projects module
- `integrations/plane/` — Plane integration
- `events/projects/` — Canonical project events

**Why manifests before adapter code:** Platform Runtime discovers and validates contracts before implementation. Dependency graph ensures correct registration order.

**Outcome:** OSS-101-03 complete. Plane adapter (OSS-101-04) blocked until OSS-100-05 (AdapterBase).

---

## Chapter 14 — APZ TCMS (Testing & Certification)

**APZ TCMS** is APZHUB’s native Test & Certification Management System (product identity established in **APZTCMS-001**). It **orchestrates** testing and certification; execution engines (Vitest, Playwright, JUnit XML, scanners, etc.) remain independent and feed results via future adapters.

- **Not** a Kiwi TCMS fork; Kiwi wave-as-SoR/UI is superseded
- **Not** a Playwright/Vitest wrapper
- User-facing workbench module: **Testing** (`testing`); services: `TestingService`, `CertificationService`
- Delivery IDs: **APZTCMS-*** (QE-* backlog superseded for new work)

See [APZ TCMS Product Vision](../strategy/APZHUB-APZ-TCMS-Product-Vision.md) · [ADR-0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md) · [APZTCMS Backlog](../backlog/APZTCMS-Backlog.md).

Predecessor planning docs (superseded for identity/delivery): [QE Strategy](../strategy/APZHUB-Quality-Engineering-Platform-Strategy.md).

---

## Chapter 15 — Financial Engine (deferred)

FIN-001 evaluated extracting a shared Financial Engine from Law Platform billing/invoicing.

**Decision:** **DEFER EXTRACTION.** Law Platform validation takes priority. Premature extraction would destabilise the commercial product.

See [FIN-001 Architecture Review](../reviews/FIN-001-Architecture-Review.md).

---

## Lessons learned

| Lesson                           | Source                                                    |
| -------------------------------- | --------------------------------------------------------- |
| **Constitution before code**     | 000–029 prevented architectural drift across 2000+ tests  |
| **Manifest first**               | Registry discovery catches dependency errors at bootstrap |
| **Phase gates work**             | ADR-0017 review gates caught issues before production     |
| **Products validate platform**   | Law Platform proved Platform Core in real workflows       |
| **Not everything is OSS**        | Trust Accounting, QE, Financial Engine are native         |
| **Owner approval gates**         | PRH-000, PCS-001 prevented unauthorised scope             |
| **Credential boundary matters**  | OSS-100-02 established before any adapter code            |
| **Documentation is the product** | Knowledge Foundation (APZHUB-000) formalises this         |

---

## Chapter — Platform 1.2.0 certification train & baseline freeze (2026-07)

After Production packaging (APZHUB-1.2-009), Continuous Product Lifecycle, and Backlog Assessment, the repository executed Engineering Waves 1–2 (ENG-0001…0022), portfolio certification programmes (QA-CERT-001…003), and Visual Certification Review (QA-CERT-004 **ACCEPTED**). **APZHUB-RELEASE-001** (**ACCEPTED**) freezes Platform **1.2.0** as the official repository baseline. **APZHUB-OPS-001** assesses operational cutover readiness as **PRODUCTION READY WITH ACTIONS**. Packs: [platform-1.2.0](../releases/platform-1.2.0/README.md) · [operational-readiness](../operations/platform-1.2.0-operational-readiness/README.md).

## Future evolution

| Horizon         | Direction                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------- |
| **Near term**   | Owner ADR Acceptance of ADR-0070 — then named Platform-1.3-ENG-002 Approval                 |
| **Medium term** | Owner-authorised backlog items (Email SoR · FIN-001 · Workflow Execute · product residuals) |
| **Long term**   | Commercial GA, SaaS tier, Financial Engine extraction, new verticals                        |

See [APZHUB-VISION](./APZHUB-VISION.md) · [CURRENT-MILESTONE](./CURRENT-MILESTONE.md) · [platform-1.2.0 freeze](../releases/platform-1.2.0/README.md).

---

## How to use this document

This Bible is the **narrative** companion to the **technical** foundation docs. For implementation details, follow links to sprint completion reports, architecture documents, and ADRs. Do not treat this chapter summary as authoritative over those sources.

## Platform release baselines

- Platform **1.3** — **CLOSED** — **PRODUCTION READY WITH LIMITATIONS**
- Platform **1.4** — Architecture Confirmation in progress: [strategy/platform-1.4](../strategy/platform-1.4/README.md) (awaiting Owner Architecture Acceptance; no implementation)
