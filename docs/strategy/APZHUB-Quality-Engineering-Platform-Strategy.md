# APZHUB Quality Engineering Platform Strategy

> **Status:** **SUPERSEDED for product identity** — use **[APZQEP Enterprise Quality Engineering Platform](./APZQEP-ENTERPRISE-QUALITY-ENGINEERING-PLATFORM.md)** and parent **[APZOR Commercial Pillars](./APZOR-COMMERCIAL-PILLARS.md)**. TCMS capabilities are a subset of APZQEP, not the whole product. Historical: [APZ TCMS Product Vision](./APZHUB-APZ-TCMS-Product-Vision.md). Retained as planning predecessor only.

**Milestone:** OSS-002  
**Status:** Approved strategy — planning only; implementation via QE-001+ _(delivery IDs superseded by APZTCMS)_  
**Type:** Native APZHUB capability (Wave 5)  
**Supersedes:** Kiwi TCMS integration plan (OSS-001 Wave 5)

---

## Vision

APZHUB Quality Engineering is a **native platform capability** that unifies manual and automated testing, release certification, and quality analytics in one coherent Workbench experience — deeply integrated with Platform Core, Playwright-first, and AI-ready.

Users see **Quality Engineering**. They do not see Kiwi TCMS or any external test management engine.

---

## Strategic rationale

| Driver                        | Detail                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| **Platform coherence**        | One APZHUB UX for requirements → tests → execution → gates → release                    |
| **Playwright-first**          | APZHUB already mandates Playwright (015); quality platform owns execution lifecycle     |
| **AI-native**                 | Test generation, failure analysis, and coverage insights as governed platform features  |
| **Platform Core integration** | Events, search, notifications, activity, governance, provisioning — no adapter sync lag |
| **Release certification**     | Quality gates block releases across Projects, Automation, and CI (M17)                  |
| **Commercial potential**      | Standalone quality tier for APZHUB SaaS and enterprise offerings                        |

---

## Scope

### In scope (Quality Engineering Platform)

- Requirements and traceability
- Test case, suite, plan, and cycle management
- Manual test execution with evidence
- Automated execution (Playwright primary)
- API, visual regression, and accessibility testing orchestration
- Defect linking to Projects and Support
- Release gates and certification workflows
- Quality dashboard and analytics
- AI test generation and failure analysis (governed, phased)
- Platform PostgreSQL as System of Record

### Out of scope (this strategy)

- Replacing M17 CI/CD pipeline ownership — QE **integrates with** M17
- Replacing Plane/Projects — QE **links to** Projects
- Kiwi TCMS integration — **superseded**
- Production implementation — **QE-001+ only after owner approval**

---

## Capability classification

| Attribute        | Value                                |
| ---------------- | ------------------------------------ |
| User-facing name | Quality Engineering                  |
| Module ID        | `quality-engineering`                |
| Platform Service | `QualityEngineeringService`          |
| Engine           | APZHUB native (platform PostgreSQL)  |
| Wave             | 5 (replaces OSS Wave 5 Kiwi)         |
| Type             | Native product module                |
| Adapter          | None — internal engine boundary only |

---

## Platform Core consumption

| Capability          | Usage                                          |
| ------------------- | ---------------------------------------------- |
| Identity & tenant   | Tenant-scoped test assets                      |
| Authorization       | QE permissions; role-based test execution      |
| Governance          | Feature enablement; commercial tier gating     |
| Provisioning        | Tenant QE workspace seed                       |
| Lifecycle           | Product registration; maintenance behaviour    |
| Operations          | Health, queue depth, runner status             |
| Events (029)        | Test run completed, gate failed, defect linked |
| Notifications (021) | Run failures, gate blocks, assignment          |
| Activity (007)      | Execution and certification timeline           |
| Search (020)        | Test cases, plans, results index               |
| Knowledge (020)     | Link tests to docs and requirements            |
| Personalisation     | Workbench layout, filters, dashboards          |
| Security            | API guards, audit, evidence access control     |

---

## Playwright-first execution model

- Playwright is the **primary automated execution engine** (015 alignment)
- Execution runs via **platform workers** (PCv2-02) — not in request handlers
- Results, traces, screenshots, and videos stored in platform object storage (S3-compatible)
- M17 CI invokes QE APIs for pipeline gates and result ingestion
- Reuse existing Playwright configs and test pyramid discipline

---

## AI-native roadmap (governed)

| Phase  | AI capability                     | Governance                              |
| ------ | --------------------------------- | --------------------------------------- |
| QE-010 | Test generation from requirements | Human review required; audit trail      |
| QE-011 | Failure analysis and grouping     | No auto-close defects; suggestions only |
| Future | Coverage gap analysis             | Permission-gated; tenant data isolation |

All AI features follow [AI Strategy](./APZHUB-AI-Strategy.md) — no silent automation of certification decisions.

---

## Release certification

Quality Engineering owns **release gate evaluation**:

- Gate rules defined per tenant/project
- Manual sign-off + automated pass thresholds
- Integration with Projects milestones and Automation workflows
- Block release promotion when gates fail — surfaced in notifications and control plane

---

## Commercial product potential

| Tier             | Capability                                                                |
| ---------------- | ------------------------------------------------------------------------- |
| **Bundled**      | Basic test management + manual execution                                  |
| **Professional** | Playwright automation + release gates                                     |
| **Enterprise**   | AI generation/analysis + advanced analytics + multi-project certification |

Entitlements via Platform Governance — not separate product login.

---

## Dependencies

| Dependency                              | Required for                           |
| --------------------------------------- | -------------------------------------- |
| Platform Core v2 certified              | Foundation                             |
| PCv2-02 Workers                         | Async execution, outbox                |
| M17 CI/CD                               | Pipeline integration, gate enforcement |
| Wave 1 Projects (OSS-101)               | Defect and milestone linking           |
| OSS-002 Capability Abstraction Standard | Pattern compliance                     |

---

## Exit and replacement

As a native capability, exit strategy is **platform export** (test assets, results, evidence metadata). No external engine decommission required. Future commercial TMS integration would require migration tooling — not planned.

---

## Implementation path

Phased delivery via [Quality Engineering Backlog](../backlog/APZHUB-Quality-Engineering-Backlog.md):

QE-001 → QE-015 ending in production readiness.

**Stop condition:** Await owner approval before **QE-001 Foundation**.

---

## Related

- [Quality Engineering Reference Architecture](../architecture/APZHUB-Quality-Engineering-Reference-Architecture.md)
- [OSS vs Native Decision Model](../architecture/APZHUB-OSS-vs-Native-Capability-Decision-Model.md)
- [Capability Abstraction Standard](../architecture/APZHUB-Capability-Abstraction-Standard.md)
