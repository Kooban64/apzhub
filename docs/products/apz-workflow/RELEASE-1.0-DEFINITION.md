# APZ Workflow — Release 1.0 Definition

> **Programme:** APZ-WORKFLOW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Target SemVer (naming only):** **1.0.0** — not authorised until Owner Acceptance of a future release/certification programme

---

## 1. Product identity

| Field            | Value                                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| User-facing name | **APZ Workflow**                                                                                                        |
| Purpose          | Enterprise Workflow Automation Platform                                                                                 |
| Commercial role  | Suite / Enterprise automation attach ([Commercial Catalogue](../../product-management/COMMERCIAL-PRODUCT-CATALOGUE.md)) |
| Primary provider | **n8n** CE — brand masked                                                                                               |
| Future providers | Temporal · Camunda · Flowable · Azure Logic Apps · Power Automate · others — **not** Release 1.0                        |
| Request path     | Module → Gateway → Auth → Authz → Platform Workflow Service → Adapter → Engine                                          |

---

## 2. Release 1.0 intent

Deliver the first **commercial APZ Workflow product SemVer (1.0.0)** that lets operators and leaders govern, observe, and (where Owner-authorised) operate automation through APZHUB branding — without exposing n8n (or other engines) as the primary user experience.

Release 1.0 builds on the existing frozen platform foundation (Workflow SoR + n8n Reference Adapter) and extends toward governed execution capabilities under Architecture Frozen rules (ADR + Owner required).

---

## 3. Target users (Release 1.0)

| Persona        | Primary use                                                                               |
| -------------- | ----------------------------------------------------------------------------------------- |
| Executives     | Catalogue visibility · governance posture · health                                        |
| Managers       | Template adoption · run outcomes · approvals                                              |
| Operations     | Executions · schedules · failures · retries · diagnostics                                 |
| Support        | Ticket-triggered / related automations (integration)                                      |
| Compliance     | Audit · approval trails · retention-oriented history                                      |
| Finance        | Controlled automation over finance-adjacent processes (integration, not a finance engine) |
| Projects       | Project lifecycle automations (integration)                                               |
| Developers     | Templates · variables · diagnostics · compatibility                                       |
| Administrators | Credentials refs · health · permissions · provider config                                 |

---

## 4. In scope (Release 1.0)

### 4.1 Foundation capabilities (already on disk — productise / package)

| Capability                                       | Description                                              | Disk evidence                                                        |
| ------------------------------------------------ | -------------------------------------------------------- | -------------------------------------------------------------------- |
| **Workflow Catalogue (SoR)**                     | Governed workflow metadata lifecycle                     | `/api/v1/workflows` · `/workspace/workflows` · packages `workflow-*` |
| **Workflow Templates**                           | Template catalogue / management (SoR)                    | SoR HTTP + Workbench                                                 |
| **Categories / Folders / Versions / Validation** | Organisation & lifecycle                                 | SoR certified wave                                                   |
| **Engine Discovery**                             | Read-only engine workflows/templates/tags/users/projects | `/api/v1/workflows/engine/*` · `/workspace/workflow-engine`          |
| **Health / Diagnostics / Compatibility**         | Provider + platform health surfaces                      | Engine + SoR stubs/surfaces as certified                             |
| **Permissions & Navigation**                     | Permission-filtered Workbench                            | AuthZ + manifests                                                    |
| **n8n Provider (primary)**                       | Reference Adapter metadata path                          | `@apzhub/integration-n8n` **0.1.0**                                  |

### 4.2 Release 1.0 product capabilities (planned — not authorised by this programme)

| Capability                      | Description                                                                     | Disk today                                                                |
| ------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Workflow Executions / Runs**  | Start/observe runs via Platform Services                                        | **Absent** (frozen non-goal)                                              |
| **Execution History**           | Historical run list with correlation                                            | **Absent**                                                                |
| **Logs**                        | Run/step logs (masked, permissioned)                                            | **Absent** as product surface                                             |
| **Failures / Retries**          | Failure classification · retry actions                                          | **Absent**                                                                |
| **Workflow Scheduling**         | Cron/calendar schedules under APZHUB                                            | **Absent**                                                                |
| **Approvals**                   | Human approval steps in flows                                                   | **Absent**                                                                |
| **Manual Tasks / Forms**        | Operator task inbox · simple forms                                              | **Absent**                                                                |
| **Variables**                   | Governed workflow variables                                                     | **Absent** / limited                                                      |
| **Credentials**                 | Credential **references** (never plain secrets in UI/logs)                      | **Absent** as product credential UX                                       |
| **Notifications**               | Workflow events → Platform Notification Framework                               | Event path limited; product wiring **not** Release-certified              |
| **Unified Product Workbench**   | Single commercial Workflow product UX (vs dual platform facets)                 | Dual surfaces exist; commercial packaging **absent**                      |
| **Cross-product integrations**  | Projects · Support · Time · Documents · Analytics · Identity · Email · Calendar | Strategy documented; product integrations **not** shipped as Workflow 1.0 |
| **Search**                      | Index workflow/template titles & descriptions                                   | Search platform frozen; Workflow product provider TBD                     |
| **Commercial SemVer packaging** | `docs/releases/workflow/1.0.0/` evidence pack                                   | **Absent**                                                                |

---

## 5. Non-goals / boundary (mandatory)

| Adjacent capability                       | Relationship to APZ Workflow 1.0                                          |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| Platform Event Bus / Outbox               | Consume for async — **do not redesign**                                   |
| Platform Notifications SoR                | Delivery only via Notification Framework — modules do not notify directly |
| Platform Search                           | Register providers — no standalone Workflow search engine                 |
| Metrics / Observe / Reporting / Analytics | Distinct products/SoRs — may consume signals; not substitutes             |
| Law / TCMS “workflow” naming collisions   | Unrelated domain state machines — not this product                        |

---

## 6. Known exclusions (Release 1.0)

Explicitly **out of scope** for commercial Release **1.0.0**:

- Secondary engines as primary: Temporal · Camunda · Flowable · Azure Logic Apps · Power Automate
- Visual drag-and-drop workflow designer as primary UX
- Direct n8n (or other engine) login for standard users
- Engine brand exposure in UI
- Arbitrary end-user script/code injection
- Unmanaged webhook sprawl outside platform Event Bus rules
- AI workflow generation / AI agent orchestration product
- Multi-tenant public marketplace of workflows
- Hosted SaaS-only Workflow SKU (self-hosted first)
- Breaking the Architecture Frozen Workflow Engine wave without ADR + Owner

---

## 7. Deployment & licensing (commercial framing)

| Field         | Release 1.0 posture                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Deployment    | Self-hosted (APZHUB + optional n8n CE)                                                                                                     |
| Licensing     | Commercial APZHUB Workflow + Open Source n8n where used                                                                                    |
| Edition floor | Enterprise emphasis; Community may retain metadata-only — see [PRODUCT-EDITION-MATRIX](../../product-management/PRODUCT-EDITION-MATRIX.md) |
| Prices        | None in-repo                                                                                                                               |

---

## 8. Architecture note (documentation only)

Release 1.0 **documents** the intended layered path and provider abstraction. It does **not** create ADRs and does **not** change frozen architecture.

Any expansion beyond the frozen APZWORKFLOW engine wave (execute, schedule, mutate engine state, credentials runtime, webhooks) requires **separate ADR + Owner Approval** programmes.

---

## 9. Success criteria (Release 1.0 — when eventually shipped)

1. Users operate Workflow only via APZHUB Workbench (engine branding masked).
2. All traffic Module → Gateway → Platform Service → Adapter → Engine.
3. Permissions filter catalogue, runs, approvals, and admin surfaces.
4. Secrets never appear in logs/UI; credentials are references only.
5. Certification evidence under `docs/releases/workflow/1.0.0/` (future programme).
6. QA-002 PRODUCTION READY retained; Architecture Frozen rules respected.

---

## Related

- [FEATURE-CATALOGUE.md](./FEATURE-CATALOGUE.md)
- [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)
- [IMPLEMENTATION-READINESS.md](./IMPLEMENTATION-READINESS.md)
