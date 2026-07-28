# APZ QEP — Functional & UX Requirements

> **Programme:** APZQEP-REQ-001 · IDs: FR-* · UX-*  
> **Terminology:** Prefer _verification_; classical test cases are a form of verification procedure.

## Functional Requirements

| ID     | Area                     | Requirement                                                                                 | Priority | Risk     | Acceptance criteria                                      |
| ------ | ------------------------ | ------------------------------------------------------------------------------------------- | -------- | -------- | -------------------------------------------------------- |
| FR-001 | Projects / contexts      | Manage QEP projects/workspaces linking quality scope to APZHUB product or customer contexts | P0       | High     | CRUD; permission-filtered; no engine brands              |
| FR-002 | Requirements Management  | Capture, import, version, and approve quality-relevant requirements                         | P0       | Critical | Requirement lifecycle; approval state; search            |
| FR-003 | Requirements Management  | Link requirements to products, releases, risks, and verifications                           | P0       | Critical | Bidirectional links; coverage gaps visible               |
| FR-004 | Verification Management  | Create and version verification plans (objectives, scope, schedule)                         | P0       | High     | Plan CRUD; lifecycle status                              |
| FR-005 | Verification Management  | Organise verification suites under plans with ownership and ordering                        | P0       | High     | Suite CRUD under plan                                    |
| FR-006 | Manual Verification      | Author manual verification procedures (steps, expected results, tags, priority)             | P0       | Critical | Procedure CRUD; steps model; filter/search               |
| FR-007 | Automated Verification   | Link procedures to external automation identifiers/paths                                    | P0       | High     | Automation refs; runners remain external                 |
| FR-008 | Automated Verification   | Ingest/record automated results via Platform Services                                       | P0       | High     | Results attach without module→CI client                  |
| FR-009 | AI-assisted Verification | Accept AI-drafted procedures/reviews only after human accept (AIR-*)                        | P1       | High     | Draft→accept path; AI default OFF                        |
| FR-010 | Verification Libraries   | Reusable library of procedures/suites across projects (with copy/link policy)               | P1       | Medium   | Library browse + reuse                                   |
| FR-011 | Verification Templates   | Templates for common verification patterns and industries                                   | P1       | Medium   | Template apply creates draft                             |
| FR-012 | Test Execution / Runs    | Execute manual runs with pass/fail/blocked/skip + comments                                  | P0       | Critical | Run UI/API; results persisted                            |
| FR-013 | Test Execution / Runs    | Represent automated/continuous execution instances with results                             | P0       | High     | Run types: manual/automated/continuous                   |
| FR-014 | Traceability             | Requirements ↔ verifications ↔ runs ↔ defects ↔ evidence ↔ releases                         | P0       | Critical | Matrix view/API; gap reporting                           |
| FR-015 | Defect Management        | Raise/track defects linked to verifications/runs/requirements                               | P0       | High     | Defect lifecycle; bidirectional links                    |
| FR-016 | Risk Management          | Capture risks; risk-based prioritisation and coverage views                                 | P1       | Medium   | Risk entity; link to requirements/verifications          |
| FR-017 | Release Readiness        | Aggregate gates, coverage, open defects, evidence completeness                              | P0       | Critical | Readiness view; go/no-go signals                         |
| FR-018 | Continuous Certification | Certification states with human sign-off; re-cert signals on change                         | P0       | Critical | Explicit approve/reject; audited; never silent auto-cert |
| FR-019 | Evidence Repository      | Evidence metadata + storage refs (screenshots, logs, artefacts)                             | P0       | Critical | Attach to runs/certs; retention-aware                    |
| FR-020 | Document Repository      | Link/store packs via Platform Documents patterns                                            | P1       | Medium   | Document refs; no mandatory Paperless for MVP            |
| FR-021 | Workflow                 | Approval workflows via Platform Workflow when execute authorised                            | P2       | Medium   | Integrate only when Platform unlocks                     |
| FR-022 | Notifications            | Publish domain events for Attention Engine (no product SMTP)                                | P0       | High     | Events: run complete, cert pending, defect assigned      |
| FR-023 | Dashboards               | Role-appropriate quality/executive/engineering/release/compliance dashboards                | P0       | High     | See RPT-*; permission-filtered                           |
| FR-024 | Reporting                | Operational/management reports + export                                                     | P0       | High     | Standard reports + export formats                        |
| FR-025 | Analytics                | Quality analytics / trends (Platform Analytics adjacency)                                   | P1       | Medium   | Metrics publication; no Metabase chrome                  |
| FR-026 | Search                   | Register Search providers for requirements, verifications, defects, evidence metadata       | P0       | High     | Permission-filtered unified search                       |
| FR-027 | Administration           | Product admin: enablement, configuration, entitlements, retention defaults                  | P0       | High     | Admin surfaces permission-gated                          |
| FR-028 | RBAC                     | Permissions via Platform PermissionService; no backend roles in UI                          | P0       | Critical | QEP permission catalogue; server-authoritative           |
| FR-029 | API Platform             | Versioned REST under APZHUB Gateway (e.g. `/api/v1/qep/*` or successor)                     | P0       | Critical | OpenAPI; authz; response envelope                        |
| FR-030 | Integration Framework    | External systems only via connectors (CI/ALM/AI/MCP)                                        | P0       | Critical | No module→engine                                         |
| FR-031 | Audit                    | Privileged mutations and certification decisions audited                                    | P0       | Critical | Platform Audit immutable                                 |
| FR-032 | Versioning               | Version requirements, plans, procedures, templates, prompts                                 | P0       | High     | Version history; compare intent                          |
| FR-033 | Knowledge Base           | Quality playbooks, standards, reusable verification knowledge                               | P1       | Medium   | KB articles linked to procedures                         |
| FR-034 | Quality Intelligence     | Non-AI and AI-assisted insights (coverage, flaky signals, trends)                           | P1       | Medium   | Permissioned EI surfaces                                 |
| FR-035 | Regression               | Identify/schedule regression suites from prior failures/releases                            | P1       | Medium   | Regression selection/suggestions                         |
| FR-036 | Quality gates            | Configurable gates for release readiness                                                    | P1       | Medium   | Gate evaluation visible                                  |
| FR-037 | Approvals / sign-off     | Multi-role approval for certification packages                                              | P0       | High     | Approver roles; rejection reason                         |
| FR-038 | Coverage                 | Requirement and risk coverage views                                                         | P0       | High     | Coverage % and gaps                                      |
| FR-039 | CI metadata              | Ingest CI pipeline metadata (read-oriented)                                                 | P0       | Medium   | Metadata visible; not full CI admin                      |
| FR-040 | Multi-tenancy            | Tenant-ready isolation for customer deployments                                             | P0       | Critical | Tenant context on all SoR access                         |
| FR-041 | MCP tools                | Expose governed MCP tool surface for IDE/agents (read/draft/gated-write)                    | P1       | High     | No autonomous certify tools                              |
| FR-042 | Continuous Verification  | Ingest ongoing verification signals from pipelines/monitors into SoR                        | P2       | Medium   | Continuous run type + dashboards                         |

## UX Requirements

| ID     | Topic         | Requirement                                                          | Priority | Risk     | Acceptance criteria                      |
| ------ | ------------- | -------------------------------------------------------------------- | -------- | -------- | ---------------------------------------- |
| UX-001 | Navigation    | QEP workbench follows DEF shell (Activity Bar → Sidebar → Workspace) | P0       | High     | Module registration; no isolated layouts |
| UX-002 | Role-based UX | Surfaces filtered by permissions                                     | P0       | Critical | Hidden + server denied                   |
| UX-003 | Accessibility | WCAG AA                                                              | P0       | High     | a11y gate in product CERT                |
| UX-004 | Responsive    | Desktop-first; tablet OK; mobile read-mostly                         | P1       | Medium   | Breakpoints in Definition                |
| UX-005 | Brand         | APZ QEP branding; tokens only; no engine chrome                      | P0       | Critical | Brand-mask tests                         |
| UX-006 | Landing       | Role-aware landing with readiness and work queue                     | P1       | Medium   | Default QEP home                         |
| UX-007 | Theme         | Light/dark via Presentation Engine                                   | P1       | Low      | Platform themes                          |
| UX-008 | Terminology   | UI prefers Verification / Quality Engineering language               | P0       | Medium   | Glossary-aligned labels                  |
| UX-009 | AI UX         | AI outputs clearly labelled as suggestions; accept/reject controls   | P1       | High     | No silent SoR writes                     |
