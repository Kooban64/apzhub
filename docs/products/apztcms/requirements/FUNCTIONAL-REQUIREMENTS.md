# APZ TCMS — Functional & UX Requirements

> **Programme:** APZTCMS-REQ-001 · IDs: FR-* · UX-*

## Functional Requirements

| ID     | Area                      | Requirement                                                                                  | Priority | Risk     | Acceptance criteria                                                |
| ------ | ------------------------- | -------------------------------------------------------------------------------------------- | -------- | -------- | ------------------------------------------------------------------ |
| FR-001 | Projects                  | Manage TCMS projects/workspaces linking quality scope to APZHUB product or customer contexts | P0       | High     | CRUD projects; permission-filtered; no engine project brands in UI |
| FR-002 | Test Plans                | Create and version test plans with objectives, scope, and schedule metadata                  | P0       | High     | Plan CRUD; link to project; status lifecycle                       |
| FR-003 | Test Suites               | Organise suites under plans with ordering and ownership                                      | P0       | High     | Suite CRUD; nest under plan                                        |
| FR-004 | Test Cases                | Author manual-first test cases (steps, expected results, tags, priority)                     | P0       | Critical | Case CRUD; steps model; search/filter                              |
| FR-005 | Test Cases                | Support automated case linkage (external test id / path references)                          | P0       | High     | Cases can reference automation identifiers                         |
| FR-006 | Test Runs                 | Execute manual runs with pass/fail/blocked/skip and comments                                 | P0       | Critical | Run execution UI/API; results persisted                            |
| FR-007 | Test Runs                 | Record automated run results ingested via Platform Services                                  | P0       | High     | Automated results attach to runs without module→CI client          |
| FR-008 | Defects                   | Raise and track defects linked to cases/runs/requirements                                    | P0       | High     | Defect lifecycle; links bidirectional                              |
| FR-009 | Requirements Traceability | Trace requirements ↔ cases ↔ runs ↔ defects ↔ releases                                       | P0       | Critical | Matrix view/API; coverage gaps visible                             |
| FR-010 | Release Management        | Represent releases/versions and associate plans/runs/certification                           | P0       | High     | Release entity; readiness aggregation                              |
| FR-011 | Evidence Repository       | Store evidence metadata and storage references (screenshots, logs, artefacts)                | P0       | Critical | Evidence attach to runs/certs; retention-aware                     |
| FR-012 | Certification             | Certification states with human sign-off (never automatic silent cert)                       | P0       | Critical | Explicit approve/reject; actor audited                             |
| FR-013 | Regression                | Identify and schedule regression suites from prior releases/failures                         | P1       | Medium   | Regression suite suggestions or selection                          |
| FR-014 | Automation                | Orchestrate/record automation without becoming the runner                                    | P0       | High     | Results import/link; runners remain external                       |
| FR-015 | Dashboards                | QA and executive dashboards for coverage, defects, readiness                                 | P0       | High     | Role-appropriate dashboards                                        |
| FR-016 | Notifications             | Publish domain events for Attention Engine (no product-owned SMTP)                           | P0       | High     | Events for run complete, cert pending, defect assigned             |
| FR-017 | Workflow                  | Optional workflow adjacency for approvals (Platform Workflow; execute gated)                 | P2       | Medium   | Integrate when Platform Workflow execute authorised                |
| FR-018 | Search                    | Register Search providers for cases, defects, evidence metadata                              | P0       | High     | Permission-filtered unified search                                 |
| FR-019 | Document Management       | Link/store documents via Platform Documents patterns for evidence packs                      | P1       | Medium   | Document refs; no Paperless requirement for MVP                    |
| FR-020 | Audit                     | Audit privileged mutations and certification decisions                                       | P0       | Critical | Immutable audit via Platform Audit                                 |
| FR-021 | Reporting                 | Operational and management reports; export                                                   | P0       | High     | Standard reports + export                                          |
| FR-022 | API                       | Versioned REST under APZHUB Gateway `/api/v1/testing/*` (or successor)                       | P0       | Critical | OpenAPI; authz; envelope                                           |
| FR-023 | Multi-tenancy             | Tenant-ready isolation for customer deployments                                              | P0       | Critical | Tenant context on all SoR access                                   |
| FR-024 | Role Management           | Product permissions via Platform PermissionService (no backend roles in UI)                  | P0       | Critical | Catalogue of TCMS permissions; RBAC                                |
| FR-025 | AI Assistance             | AI features per AIR-* only; never auto-certify                                               | P1       | High     | AI off by default until authorised programme                       |
| FR-026 | Quality gates             | Configurable quality gates for release readiness                                             | P1       | Medium   | Gate evaluation visible                                            |
| FR-027 | Approvals / sign-off      | Multi-role approval for certification packages                                               | P0       | High     | Approver roles; rejection reason                                   |
| FR-028 | Coverage                  | Requirement and risk coverage views                                                          | P0       | High     | Coverage % and gaps                                                |
| FR-029 | Engineering Intelligence  | Engineering intelligence insights (non-AI and AI-assisted)                                   | P1       | Medium   | EI surfaces permissioned                                           |
| FR-030 | CI metadata               | Ingest CI pipeline metadata (GHA/GitLab read-only paths)                                     | P0       | Medium   | Metadata visible; not full CI admin                                |

## UX Requirements

| ID     | Topic                  | Requirement                                                                      | Priority | Risk     | Acceptance criteria                          |
| ------ | ---------------------- | -------------------------------------------------------------------------------- | -------- | -------- | -------------------------------------------- |
| UX-001 | Navigation             | TCMS workbench navigation follows DEF shell (Activity Bar → Sidebar → Workspace) | P0       | High     | No isolated page layout; module registration |
| UX-002 | Role-based experiences | UI surfaces filtered by permissions                                              | P0       | Critical | Unauthorized actions hidden + server denied  |
| UX-003 | Accessibility          | WCAG AA for TCMS UI                                                              | P0       | High     | a11y checks in certification criteria        |
| UX-004 | Responsive behaviour   | Usable on desktop-first; tablet acceptable; mobile read-mostly                   | P1       | Medium   | Breakpoints documented in Definition         |
| UX-005 | Brand consistency      | APZ TCMS branding; tokens only; no Plane/GitHub/GitLab/Jira chrome               | P0       | Critical | Brand-mask tests                             |
| UX-006 | Landing / dashboard    | Role-aware landing with readiness and work queue                                 | P1       | Medium   | Default home for TCMS module                 |
| UX-007 | Theme support          | Light/dark via Platform Presentation Engine                                      | P1       | Low      | Uses platform themes                         |
