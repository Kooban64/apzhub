# APZ QEP — Personas

> **Programme:** APZQEP-DEF-002  
> **Note:** Substantive expansion of APZQEP-DEF-001 persona baseline. Definition-level personas only — no architecture, API, or implementation detail. Extends REQ-001 PSN-* with enterprise workspace, workflow, and governance depth.

## Index

| ID         | Persona                 | Primary workspace      | Cert authority                        |
| ---------- | ----------------------- | ---------------------- | ------------------------------------- |
| PSN-DEF-01 | Executive               | Executive              | View only (default)                   |
| PSN-DEF-02 | Product Owner           | Product Owner          | Requirements; waivers per policy      |
| PSN-DEF-03 | Business Analyst        | Analyst                | Propose requirements                  |
| PSN-DEF-04 | Project Manager         | Delivery               | Limited                               |
| PSN-DEF-05 | QA Manager              | QA Leadership          | Verification / risk per policy        |
| PSN-DEF-06 | QA Engineer             | QA Engineering         | Peer review                           |
| PSN-DEF-07 | Manual Tester           | Manual Testing         | Session sign-off optional             |
| PSN-DEF-08 | Exploratory Tester      | Exploratory            | None typically                        |
| PSN-DEF-09 | Automation Engineer     | Automation             | Promote candidates                    |
| PSN-DEF-10 | Developer               | Developer              | None for certify                      |
| PSN-DEF-11 | Release Manager         | Release                | **Certify / reject / qualifications** |
| PSN-DEF-12 | Operations Engineer     | Operations             | Disable broken integrations           |
| PSN-DEF-13 | Support Agent           | Support                | None                                  |
| PSN-DEF-14 | Security Officer        | Security               | Sensitive policy changes              |
| PSN-DEF-15 | Compliance Officer      | Compliance             | Retention/compliance policies         |
| PSN-DEF-16 | Auditor                 | Auditor                | Independent — no certify by default   |
| PSN-DEF-17 | Customer Representative | Customer               | None                                  |
| PSN-DEF-18 | Third-party Integrator  | Integrator             | Cannot certify                        |
| PSN-DEF-19 | Platform Administrator  | Platform Admin         | High privilege admin                  |
| PSN-DEF-20 | Tenant Administrator    | Tenant Admin           | Tenant policies                       |
| PSN-DEF-21 | AI Agent                | Agent context (non-UI) | **Cannot certify**                    |

---

## PSN-DEF-01 — Executive

| Field                       | Definition                                                                                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Purpose**                 | Provide portfolio-level visibility into quality investment, release posture, and certification outcomes without operational tool noise                                                     |
| **Responsibilities**        | Oversee quality engineering programme health; sponsor release decisions informed by evidence; hold delivery and QA leadership accountable for measurable outcomes                          |
| **Goals**                   | Make confident go/no-go and investment decisions quickly; understand escaped-defect and certification trends; see exceptions before they become incidents                                  |
| **Business objectives**     | Reduce release surprises; align quality spend with business risk; demonstrate governance to board and customers                                                                            |
| **Success measures**        | Decision latency on release escalations; trend of escaped defects post-certification; percentage of releases certified on first attempt                                                    |
| **KPIs**                    | Mean time to executive briefing on critical quality events; portfolio readiness score variance week-over-week; waiver rate by product line                                                 |
| **Daily activities**        | Scan executive Home for certification and readiness exceptions; review top-risk widgets; acknowledge critical release alerts                                                               |
| **Weekly activities**       | Attend release readiness reviews; review quality intelligence summaries; compare portfolio KPIs against targets                                                                            |
| **Pain points**             | Fragmented status across ALM, CI, and spreadsheets; contradictory readiness narratives; inability to drill from headline to evidence                                                       |
| **Decision authority**      | Organisational go/no-go support; quality investment prioritisation; escalation resolution at portfolio level                                                                               |
| **Approval authority**      | Not a default certifier; may approve executive waivers only when explicitly configured in tenant policy                                                                                    |
| **Primary workspace**       | Executive                                                                                                                                                                                  |
| **Secondary workspaces**    | Delivery; Release (read-only); Customer (shared views)                                                                                                                                     |
| **Navigation journey**      | Home → Reporting → Certification (view) → Evidence pack summary → Release Readiness drill-down                                                                                             |
| **Dashboards**              | Portfolio readiness; certification status by product; top open risks; defect escape trend; waiver exposure                                                                                 |
| **Reports**                 | Executive quality packs; monthly certification summary; board-ready readiness snapshots                                                                                                    |
| **Notifications**           | Critical certification outcomes; rejected releases; high-severity escaped defects; executive waiver requests                                                                               |
| **Search requirements**     | Global search for release name, certification ID, and portfolio project; filtered to aggregated/read-only results                                                                          |
| **Collaboration**           | Release Manager; QA Manager; Product Owner; Compliance Officer for regulatory products                                                                                                     |
| **Inputs**                  | Aggregated readiness scores; certification statements; risk heatmaps; executive briefing requests                                                                                          |
| **Outputs**                 | Release sponsorship decisions; investment directives; escalation resolutions                                                                                                               |
| **Information consumed**    | Certification status; readiness gates; risk registers; quality intelligence narratives (non-authoritative)                                                                                 |
| **Information produced**    | Executive comments on waivers; sponsorship records; portfolio quality objectives                                                                                                           |
| **Related modules**         | Home; Reporting; Quality Intelligence; Certification (view); Release Readiness; Risk                                                                                                       |
| **Related workflows**       | Release readiness review; executive waiver escalation; portfolio quality review                                                                                                            |
| **Permissions**             | Read aggregated quality data; view certification statements; no mutate on verification or evidence                                                                                         |
| **Audit responsibilities**  | None operational; executive waiver actions audited when configured                                                                                                                         |
| **Security considerations** | No access to raw integration secrets; masked backend identifiers; read-only export of approved packs only                                                                                  |
| **AI interaction**          | Optional executive summary widgets when tenant enables AI; AI never authoritative for certification view                                                                                   |
| **MCP interaction**         | None by default; executives do not invoke MCP tools                                                                                                                                        |
| **Future evolution**        | Predictive portfolio risk overlays; natural-language portfolio queries with cited SoR sources                                                                                              |
| **Acceptance criteria**     | Executive Home loads portfolio readiness within role permissions; can navigate from exception to certification statement without admin assistance; no certification mutate actions exposed |

---

## PSN-DEF-02 — Product Owner

| Field                       | Definition                                                                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                 | Ensure product quality outcomes align with business priorities and that verification effort covers what matters most                   |
| **Responsibilities**        | Prioritise requirements for verification; approve scope for release; manage waivers affecting readiness; balance velocity with quality |
| **Goals**                   | Known coverage of priority requirements; transparent defect and readiness posture for owned products                                   |
| **Business objectives**     | Ship valuable features with defensible quality evidence; minimise rework from missed acceptance criteria                               |
| **Success measures**        | Percentage of priority requirements with approved verification linkage; waiver count trending down                                     |
| **KPIs**                    | Requirement approval cycle time; open defects on priority scope; readiness gate pass rate for owned releases                           |
| **Daily activities**        | Review requirement approval queue; check defect backlog on current release scope; respond to readiness blockers                        |
| **Weekly activities**       | Prioritise verification backlog with QA Manager; attend release scope reviews; validate traceability for committed scope               |
| **Pain points**             | Unknown verification coverage for committed scope; ambiguous requirements blocking verification design; late defect surprises          |
| **Decision authority**      | Release scope inclusion/exclusion; requirement approval; waiver initiation within policy                                               |
| **Approval authority**      | Requirements; acceptance criteria baselines; waivers per tenant policy; not certification                                              |
| **Primary workspace**       | Product Owner                                                                                                                          |
| **Secondary workspaces**    | Analyst; Delivery; Release (readiness view)                                                                                            |
| **Navigation journey**      | Home → Requirements → Traceability → Defects → Release Readiness → Certification (view)                                                |
| **Dashboards**              | Coverage by priority requirement; open defects on release scope; readiness gate status; waiver register                                |
| **Reports**                 | Scope readiness pack; requirement verification coverage; defect trend for owned products                                               |
| **Notifications**           | Requirement review requests; readiness gate failures on owned scope; critical defects; waiver approval chain updates                   |
| **Search requirements**     | Search requirements, defects, and releases within owned portfolio projects; saved filters for priority scope                           |
| **Collaboration**           | Business Analyst; QA Manager; Release Manager; Developer leads                                                                         |
| **Inputs**                  | Approved requirements; verification coverage reports; defect triage summaries; readiness assessments                                   |
| **Outputs**                 | Approved requirements and baselines; scope decisions; waiver requests with business justification                                      |
| **Information consumed**    | Traceability matrices; readiness snapshots; defect severity summaries                                                                  |
| **Information produced**    | Requirement approvals; scope change records; waiver justifications                                                                     |
| **Related modules**         | Requirements; Traceability; Defects; Release Readiness; Home; Reporting                                                                |
| **Related workflows**       | Requirement approval; scope readiness review; waiver request                                                                           |
| **Permissions**             | Author/approve requirements in owned projects; view verification and execution; initiate waivers                                       |
| **Audit responsibilities**  | Requirement approve/reject actions; waiver submissions                                                                                 |
| **Security considerations** | Project-scoped visibility; no access to tenant-wide admin or integration credentials                                                   |
| **AI interaction**          | Optional requirement testability hints when AI enabled; human must accept before SoR write                                             |
| **MCP interaction**         | None typical; may consume read-only MCP summaries if explicitly enabled for PO role                                                    |
| **Future evolution**        | AI-assisted scope impact analysis on readiness; what-if coverage simulations                                                           |
| **Acceptance criteria**     | Can approve requirements and view linked verification status; waiver workflow available per policy; cannot certify releases            |

---

## PSN-DEF-03 — Business Analyst

| Field                       | Definition                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                 | Produce clear, testable, approved requirements that form the authoritative foundation for verification design                   |
| **Responsibilities**        | Author and refine requirements; define acceptance criteria; maintain hierarchies and dependencies; support traceability         |
| **Goals**                   | Eliminate ambiguity before verification design; shorten approval cycles; maintain baselines aligned with product intent         |
| **Business objectives**     | Reduce defect cost from unclear requirements; enable reuse of verification assets through stable requirements                   |
| **Success measures**        | Approved requirement cycle time; percentage of requirements with complete acceptance criteria                                   |
| **KPIs**                    | Requirements returned from review; orphan requirements without downstream links; baseline drift incidents                       |
| **Daily activities**        | Draft and edit requirements; respond to review comments; link dependencies and risks                                            |
| **Weekly activities**       | Facilitate requirement review sessions; update baselines; reconcile ALM sync conflicts when integrations enabled                |
| **Pain points**             | Vague stakeholder input; late scope changes after verification design started; duplicate requirements across projects           |
| **Decision authority**      | Requirement structure and acceptance criteria content pending approval                                                          |
| **Approval authority**      | Propose requirements; cannot unilaterally approve own work unless policy allows self-approval                                   |
| **Primary workspace**       | Analyst                                                                                                                         |
| **Secondary workspaces**    | Product Owner; Traceability-focused Delivery views                                                                              |
| **Navigation journey**      | Home → Requirements → Traceability → Knowledge → Verification Design (read)                                                     |
| **Dashboards**              | Requirements in review; missing acceptance criteria; dependency conflicts; baseline status                                      |
| **Reports**                 | Requirement quality summary; traceability gap report for draft requirements                                                     |
| **Notifications**           | Review assignments; approval outcomes; dependency change alerts; import/sync conflicts                                          |
| **Search requirements**     | Full-text search on requirement text, IDs, tags; filter by status, type, and owner                                              |
| **Collaboration**           | Product Owner; QA Engineer; Compliance Officer for regulatory requirements                                                      |
| **Inputs**                  | Stakeholder needs; ALM imports; regulatory standards; review feedback                                                           |
| **Outputs**                 | Draft and approved requirements; acceptance criteria; baselines; traceability links                                             |
| **Information consumed**    | Verification coverage feedback; defect root-cause linked to requirements                                                        |
| **Information produced**    | Requirement versions; approval history; baseline exports                                                                        |
| **Related modules**         | Requirements; Traceability; Knowledge; Home                                                                                     |
| **Related workflows**       | Requirement authoring; review and approval; baseline creation; optional ALM sync                                                |
| **Permissions**             | Create/edit requirements; propose baselines; read verification linkage                                                          |
| **Audit responsibilities**  | All requirement edits and submission for review                                                                                 |
| **Security considerations** | Cannot view unrelated projects; sensitive requirements may be classification-gated                                              |
| **AI interaction**          | Optional ambiguity and testability analysis; accepted suggestions written to Requirements SoR only after human accept           |
| **MCP interaction**         | Read requirements via governed MCP when enabled; no silent writes                                                               |
| **Future evolution**        | AI-assisted duplicate detection across portfolios; regulatory clause mapping assistants                                         |
| **Acceptance criteria**     | Can complete requirement CRUD, acceptance criteria, and submit for approval; traceability links visible from requirement detail |

---

## PSN-DEF-04 — Project Manager

| Field                       | Definition                                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Purpose**                 | Track delivery progress of quality work across requirements, verification, defects, and release milestones               |
| **Responsibilities**        | Monitor blockers; coordinate cross-functional quality activities; report delivery status; manage project quality context |
| **Goals**                   | Predictable quality delivery timelines; visible blocker aging; aligned project and release schedules                     |
| **Business objectives**     | On-time quality milestones; reduced manual status reporting; early visibility of readiness risks                         |
| **Success measures**        | Blocker mean age; verification plan completion versus schedule; defect closure rate on critical path                     |
| **KPIs**                    | Requirements approved versus planned; sessions executed versus plan; readiness gate timeline adherence                   |
| **Daily activities**        | Review Home blockers; update project status; chase overdue verification sessions and defect fixes                        |
| **Weekly activities**       | Run delivery status reviews; update stakeholders; reconcile traceability gaps with QA Manager                            |
| **Pain points**             | Spreadsheet status; disconnected ALM and QEP views; late discovery of verification backlog                               |
| **Decision authority**      | Project scheduling and resource escalation within delivery remit                                                         |
| **Approval authority**      | Limited — project configuration and milestone sign-off per policy; not certification                                     |
| **Primary workspace**       | Delivery                                                                                                                 |
| **Secondary workspaces**    | Product Owner; QA Leadership (read); Release (schedule view)                                                             |
| **Navigation journey**      | Home → Portfolio/Projects → Traceability → Execution → Defects → Release Readiness                                       |
| **Dashboards**              | Blocker board; verification progress by sprint/milestone; defect burn-down; readiness timeline                           |
| **Reports**                 | Weekly delivery status; traceability completion; session execution summary                                               |
| **Notifications**           | Blocker escalations; overdue sessions; readiness gate schedule changes; critical defect assignments                      |
| **Search requirements**     | Search projects, milestones, defects, and sessions within assigned portfolios                                            |
| **Collaboration**           | QA Manager; Manual Tester leads; Developer leads; Release Manager                                                        |
| **Inputs**                  | Project plans; verification plans; defect lists; readiness gate schedules                                                |
| **Outputs**                 | Status reports; escalation records; updated project quality profiles                                                     |
| **Information consumed**    | Traceability matrices; execution summaries; readiness snapshots                                                          |
| **Information produced**    | Delivery commentary; milestone status; blocker logs                                                                      |
| **Related modules**         | Home; Portfolio and Projects; Traceability; Execution; Defects; Release Readiness                                        |
| **Related workflows**       | Delivery tracking; blocker escalation; release milestone coordination                                                    |
| **Permissions**             | Manage project context; read/write project metadata; read verification and defects                                       |
| **Audit responsibilities**  | Project configuration changes; milestone status updates                                                                  |
| **Security considerations** | Scoped to assigned projects; no tenant admin                                                                             |
| **AI interaction**          | Optional status narrative drafts; non-authoritative; human publishes reports                                             |
| **MCP interaction**         | Read project status via MCP if enabled for reporting integrations                                                        |
| **Future evolution**        | Automated blocker prediction; cross-tool milestone sync                                                                  |
| **Acceptance criteria**     | Delivery Home shows blockers and progress for assigned projects; can navigate to underlying verification and defects     |

---

## PSN-DEF-05 — QA Manager

| Field                       | Definition                                                                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                 | Govern the verification programme — standards, capacity, approvals, and risk posture across the organisation                       |
| **Responsibilities**        | Define verification standards; approve library assets and risk treatments; manage team capacity; enforce sign-off policies         |
| **Goals**                   | Consistent verification quality; adequate coverage of priority scope; controlled risk acceptance                                   |
| **Business objectives**     | Defensible verification practice; audit-ready processes; efficient reuse of verification assets                                    |
| **Success measures**        | Verification plan completion rate; library reuse rate; open high-risk items with treatment                                         |
| **KPIs**                    | Approval queue aging; session execution versus plan; defect escape rate pre-release                                                |
| **Daily activities**        | Review approval queues for verification and risk; monitor team workload; address escalations                                       |
| **Weekly activities**       | Capacity planning; standards reviews; readiness prep with Release Manager; audit sampling                                          |
| **Pain points**             | Inconsistent verification quality; untracked manual work; flaky automation masking real coverage gaps                              |
| **Decision authority**      | Verification standards; team assignments; risk treatment recommendations                                                           |
| **Approval authority**      | Verification library publish; verification design peer approvals; risk acceptance per policy; not sole certifier unless configured |
| **Primary workspace**       | QA Leadership                                                                                                                      |
| **Secondary workspaces**    | QA Engineering; Manual Testing; Release                                                                                            |
| **Navigation journey**      | Home → Verification Library → Verification Design → Execution → Risk → Release Readiness                                           |
| **Dashboards**              | Suite progress; approval queues; risk heatmap; team utilization; coverage gaps                                                     |
| **Reports**                 | Verification programme health; risk register summary; manual versus automated mix                                                  |
| **Notifications**           | Approval requests; high-risk escalations; session failures on critical suites; readiness blockers                                  |
| **Search requirements**     | Search verifications, suites, risks, sessions across governed projects; saved views for approval queues                            |
| **Collaboration**           | QA Engineers; Manual Testers; Automation Engineer; Release Manager; Compliance Officer                                             |
| **Inputs**                  | Verification plans; risk assessments; execution results; audit findings                                                            |
| **Outputs**                 | Approved verification assets; risk treatments; programme standards; readiness recommendations                                      |
| **Information consumed**    | Traceability coverage; automation health; defect trends                                                                            |
| **Information produced**    | Approval decisions; risk register updates; programme metrics                                                                       |
| **Related modules**         | Verification Library; Verification Design; Execution; Risk; Home; Release Readiness                                                |
| **Related workflows**       | Verification approval; risk review; readiness preparation; audit support                                                           |
| **Permissions**             | Approve verification assets; manage risk register; view all team execution within scope                                            |
| **Audit responsibilities**  | Verification approve/reject; risk acceptance; standards changes                                                                    |
| **Security considerations** | Separation from certification when same person holds multiple hats — policy enforced                                               |
| **AI interaction**          | Optional coverage gap analysis; AI suggestions require human approval before library write                                         |
| **MCP interaction**         | May invoke read MCP tools for coverage queries; mutating MCP requires human gate                                                   |
| **Future evolution**        | Programme-level quality intelligence; predictive capacity models                                                                   |
| **Acceptance criteria**     | Can approve verification assets and manage risk per policy; dashboards reflect team scope accurately                               |

---

## PSN-DEF-06 — QA Engineer

| Field                       | Definition                                                                                                        |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Purpose**                 | Design high-quality verification that traces to requirements and is reusable across execution cycles              |
| **Responsibilities**        | Author and peer-review verifications; analyse coverage gaps; maintain design quality; support traceability        |
| **Goals**                   | Reusable approved verification assets; closed traceability gaps; efficient handoff to manual and automation teams |
| **Business objectives**     | Reduce redundant verification design; improve first-pass execution success; support audit-ready traceability      |
| **Success measures**        | Library reuse rate; traceability completeness for owned designs; peer review turnaround                           |
| **KPIs**                    | Verifications approved per period; gap count on assigned scope; design rework rate                                |
| **Daily activities**        | Design and refine verifications; respond to peer review; link requirements and risks                              |
| **Weekly activities**       | Coverage reviews with BA and PO; promote candidates to library; support release readiness analysis                |
| **Pain points**             | Changing requirements after design; duplicate verifications; weak automation linkage metadata                     |
| **Decision authority**      | Verification design content pending approval                                                                      |
| **Approval authority**      | Peer review on colleagues' designs; cannot publish shared org templates without QA Manager                        |
| **Primary workspace**       | QA Engineering                                                                                                    |
| **Secondary workspaces**    | QA Leadership; Automation (linkage view)                                                                          |
| **Navigation journey**      | Home → Verification Design → Verification Library → Traceability → Execution (read)                               |
| **Dashboards**              | Design queue; coverage gaps; peer review inbox; reuse opportunities                                               |
| **Reports**                 | Coverage analysis for assigned scope; design throughput summary                                                   |
| **Notifications**           | Peer review requests; requirement changes affecting linked verifications; gap alerts                              |
| **Search requirements**     | Search verifications, requirements, and risks; filter by design status and project                                |
| **Collaboration**           | QA Manager; Manual Testers; Automation Engineer; Business Analyst                                                 |
| **Inputs**                  | Approved requirements; risk register; execution feedback; automation identifiers                                  |
| **Outputs**                 | Verification designs; library candidates; traceability links; peer review decisions                               |
| **Information consumed**    | Requirement baselines; session failure patterns; automation mapping status                                        |
| **Information produced**    | Verification versions; review comments; coverage notes                                                            |
| **Related modules**         | Verification Design; Verification Library; Traceability; Execution; Risk                                          |
| **Related workflows**       | Verification design; peer review; coverage analysis; library promotion                                            |
| **Permissions**             | Create/edit verifications; submit for approval; read execution results                                            |
| **Audit responsibilities**  | Design edits; peer review actions                                                                                 |
| **Security considerations** | Project-scoped write; no certification or tenant admin                                                            |
| **AI interaction**          | Optional draft verification generation when AI enabled; human accept before Library SoR                           |
| **MCP interaction**         | Governed MCP read for requirements/traceability; propose drafts via AI Workspace when entitled                    |
| **Future evolution**        | AI-assisted deduplication; hybrid manual/automation design assistants                                             |
| **Acceptance criteria**     | Can complete design workflow through peer review and library submission; traceability visible from design context |

---

## PSN-DEF-07 — Manual Tester

| Field                       | Definition                                                                                                                                                |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                 | Execute structured manual verification with accurate results, complete evidence, and timely defect reporting — first-class MVP user                       |
| **Responsibilities**        | Run assigned verification sessions; record steps and outcomes; attach evidence; log defects; optional session sign-off                                    |
| **Goals**                   | Complete assigned sessions with high-quality evidence; minimise ambiguous failures; maintain session integrity                                            |
| **Business objectives**     | Reliable manual verification throughput; audit-ready session records; early defect detection                                                              |
| **Success measures**        | Sessions completed per day with complete evidence; defect valid rate; session rework rate                                                                 |
| **KPIs**                    | Session completion versus assignment; evidence completeness score; time per session                                                                       |
| **Daily activities**        | Execute assigned verification sessions; capture screenshots and notes; log defects; update session status                                                 |
| **Weekly activities**       | Clear session backlog; participate in triage; review session assignment for upcoming releases                                                             |
| **Pain points**             | Unclear expected outcomes; missing environment data; evidence capture friction; duplicate defect entry                                                    |
| **Decision authority**      | Session step outcomes; pass/fail/block decisions within session                                                                                           |
| **Approval authority**      | Optional session sign-off when policy requires; cannot certify releases                                                                                   |
| **Primary workspace**       | Manual Testing                                                                                                                                            |
| **Secondary workspaces**    | Exploratory (when chartered); Evidence-focused views                                                                                                      |
| **Navigation journey**      | Home → Execution → Session detail → Evidence → Defects                                                                                                    |
| **Dashboards**              | Assigned sessions; overdue work; evidence completeness; environment availability                                                                          |
| **Reports**                 | Personal execution summary; session evidence completeness report                                                                                          |
| **Notifications**           | New session assignments; environment issues; defect duplicates; session reassignment                                                                      |
| **Search requirements**     | Quick search for session ID, verification name, project; filter my assignments                                                                            |
| **Collaboration**           | QA Engineer; Developer for reproduction; QA Manager for blockers                                                                                          |
| **Inputs**                  | Assigned verification sessions; environment references; test data pointers                                                                                |
| **Outputs**                 | Session results; evidence attachments; defect records; session comments                                                                                   |
| **Information consumed**    | Verification procedures; preconditions; expected outcomes; known limitations                                                                              |
| **Information produced**    | Session execution records; evidence artefacts; defect reports                                                                                             |
| **Related modules**         | Execution; Evidence; Defects; Home; Knowledge (known limitations)                                                                                         |
| **Related workflows**       | Manual verification session; evidence capture; defect logging                                                                                             |
| **Permissions**             | Execute assigned sessions; attach evidence; create defects; optional session sign-off                                                                     |
| **Audit responsibilities**  | Session result changes; evidence attachments; defect creation                                                                                             |
| **Security considerations** | No access to admin; evidence may contain sensitive data — handled per retention policy                                                                    |
| **AI interaction**          | AI default OFF; optional step hints when enabled — never auto-records results                                                                             |
| **MCP interaction**         | None typical for manual testers                                                                                                                           |
| **Future evolution**        | Voice/annotated evidence capture; mobile session execution                                                                                                |
| **Acceptance criteria**     | Manual session execution fully usable without automation or AI; evidence attach and defect log mandatory paths work offline-tolerant where product allows |

---

## PSN-DEF-08 — Exploratory Tester

| Field                       | Definition                                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                 | Discover unknown risks through charter-based exploratory verification beyond scripted coverage                                        |
| **Responsibilities**        | Execute charters; document observations; capture evidence of unexpected behaviour; feed findings into defects and knowledge           |
| **Goals**                   | Find high-impact issues early; enrich risk register; complement structured verification                                               |
| **Business objectives**     | Reduce unknown-unknown release risk; capture tribal knowledge as structured observations                                              |
| **Success measures**        | Issues found with evidence per charter; charter completion rate; valuable findings promoted to defects                                |
| **KPIs**                    | Charters completed; defect conversion rate from observations; time on charter versus findings                                         |
| **Daily activities**        | Run exploratory charters; record time-boxed notes; attach evidence; raise defects or observations                                     |
| **Weekly activities**       | Plan charters with QA Manager; debrief findings; update knowledge articles from discoveries                                           |
| **Pain points**             | Findings lost in informal notes; difficulty linking exploratory work to release scope; evidence not taken seriously without structure |
| **Decision authority**      | Charter scope adjustment within time box; severity assessment of findings                                                             |
| **Approval authority**      | None typically; observations require human triage before formal defect                                                                |
| **Primary workspace**       | Exploratory                                                                                                                           |
| **Secondary workspaces**    | Manual Testing; Knowledge                                                                                                             |
| **Navigation journey**      | Home → Execution (charter) → Evidence → Defects → Knowledge                                                                           |
| **Dashboards**              | Active charters; recent observations; findings pending triage                                                                         |
| **Reports**                 | Charter summary; exploratory findings report for release                                                                              |
| **Notifications**           | Charter assignments; triage outcomes on submitted findings                                                                            |
| **Search requirements**     | Search charters, observations, and related defects                                                                                    |
| **Collaboration**           | QA Manager; QA Engineer; Developer for reproduction                                                                                   |
| **Inputs**                  | Charter definitions; area maps; risk hints; environment access                                                                        |
| **Outputs**                 | Charter session records; observations; evidence; defect candidates                                                                    |
| **Information consumed**    | Risk register; known limitations; recent defect clusters                                                                              |
| **Information produced**    | Exploratory session logs; knowledge snippets; defect proposals                                                                        |
| **Related modules**         | Execution; Evidence; Defects; Knowledge; Risk                                                                                         |
| **Related workflows**       | Exploratory charter execution; finding triage; knowledge capture                                                                      |
| **Permissions**             | Create charter sessions; attach evidence; propose defects                                                                             |
| **Audit responsibilities**  | Charter session records; evidence attachments                                                                                         |
| **Security considerations** | Same as manual testing; may access broader environments per charter policy                                                            |
| **AI interaction**          | Optional charter suggestion when AI enabled; never replaces human observation                                                         |
| **MCP interaction**         | None typical                                                                                                                          |
| **Future evolution**        | Session replay linkage; AI clustering of observations pending human confirm                                                           |
| **Acceptance criteria**     | Charter workflow distinct from scripted sessions; evidence and observation capture supported without automation                       |

---

## PSN-DEF-09 — Automation Engineer

| Field                       | Definition                                                                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                 | Maintain healthy linkage between external automation assets and APZ QEP verification records — QEP does not run runners internally |
| **Responsibilities**        | Register automation assets; map identifiers; triage flaky runs; promote automation candidates; monitor ingest health               |
| **Goals**                   | Reliable automation result ingestion; accurate traceability from CI runs to verifications; reduced flaky noise                     |
| **Business objectives**     | Trustworthy automated verification signals in readiness; efficient sync with CI/CD ecosystems                                      |
| **Success measures**        | Percentage of automated runs linked to verifications; flaky rate trend; ingest MTTR                                                |
| **KPIs**                    | Unlinked run count; integration failure rate; time to map new automation                                                           |
| **Daily activities**        | Review ingest failures; map run identifiers; triage flaky results; update automation metadata                                      |
| **Weekly activities**       | Sync with QA Engineers on coverage gaps; review integration health with Operations; promote candidates                             |
| **Pain points**             | Orphan CI runs; identifier drift; false readiness from unlinked automation; integration outages                                    |
| **Decision authority**      | Automation mapping and metadata; flaky quarantine recommendations                                                                  |
| **Approval authority**      | Promote automation candidates to verification linkage; disable broken asset mappings per policy                                    |
| **Primary workspace**       | Automation                                                                                                                         |
| **Secondary workspaces**    | Operations; QA Engineering                                                                                                         |
| **Navigation journey**      | Home → Automation Management → Execution (run view) → Integrations → Traceability                                                  |
| **Dashboards**              | Ingest health; unlinked runs; flaky leaderboard; integration status                                                                |
| **Reports**                 | Automation linkage coverage; flaky trend; ingest error summary                                                                     |
| **Notifications**           | Ingest failures; new unlinked runs on critical suites; integration degradation                                                     |
| **Search requirements**     | Search by pipeline, run ID, verification identifier, repository                                                                    |
| **Collaboration**           | Operations Engineer; QA Engineer; Developer; Release Manager                                                                       |
| **Inputs**                  | CI/CD run payloads; verification identifiers; integration configs (refs only)                                                      |
| **Outputs**                 | Mapped automation links; quarantine decisions; candidate promotions                                                                |
| **Information consumed**    | Verification library automation fields; integration health                                                                         |
| **Information produced**    | Mapping records; ingest triage notes; flaky classifications                                                                        |
| **Related modules**         | Automation Management; Execution; Integration Centre; Traceability                                                                 |
| **Related workflows**       | Automation ingest triage; identifier mapping; flaky management                                                                     |
| **Permissions**             | Manage automation mappings; read integrations; cannot certify                                                                      |
| **Audit responsibilities**  | Mapping changes; quarantine actions                                                                                                |
| **Security considerations** | Integration credentials via platform refs only; no plain secrets in UI                                                             |
| **AI interaction**          | Optional flaky pattern hints when AI enabled; non-authoritative                                                                    |
| **MCP interaction**         | Governed MCP for CI metadata read; mutating mapping via MCP requires human approval                                                |
| **Future evolution**        | Self-healing identifier suggestions; cross-repo automation discovery                                                               |
| **Acceptance criteria**     | Can link external runs to verifications without executing runners inside QEP; ingest errors visible and actionable                 |

---

## PSN-DEF-10 — Developer

| Field                       | Definition                                                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                 | Resolve defects and support verification with quality context — fix, reproduce, and re-verify without certification authority     |
| **Responsibilities**        | Triage assigned defects; reproduce failures; implement fixes; support re-verification; use MCP for IDE-integrated quality context |
| **Goals**                   | Fast time-to-reproduce; clear fix verification; minimal back-and-forth with QA                                                    |
| **Business objectives**     | Shorter defect cycle time; fewer escaped fixes; integrated quality context in development flow                                    |
| **Success measures**        | Mean time to reproduce; defect fix verification pass rate; reopen rate                                                            |
| **KPIs**                    | Assigned defect aging; failed re-verification count; MCP query success rate when enabled                                          |
| **Daily activities**        | Work assigned defects; review failure evidence; update defect status; trigger or observe re-verification                          |
| **Weekly activities**       | Defect triage with QA; review automation failures on owned components                                                             |
| **Pain points**             | Incomplete reproduction steps; missing evidence; unclear requirement context; tool switching                                      |
| **Decision authority**      | Defect resolution approach; fix verification requests                                                                             |
| **Approval authority**      | None for certification; may confirm fix ready for re-verification                                                                 |
| **Primary workspace**       | Developer                                                                                                                         |
| **Secondary workspaces**    | Automation (read); Execution (read)                                                                                               |
| **Navigation journey**      | Home → Defects → Evidence → Execution (read) → MCP Developer Experience                                                           |
| **Dashboards**              | Assigned defects; failure evidence queue; re-verification status                                                                  |
| **Reports**                 | Personal defect throughput; component quality summary                                                                             |
| **Notifications**           | New defect assignments; re-verification failures; mentions on defects                                                             |
| **Search requirements**     | Search defects, evidence, verifications by component or service                                                                   |
| **Collaboration**           | Manual Tester; QA Engineer; Release Manager (readiness context)                                                                   |
| **Inputs**                  | Defect records; session evidence; automation failure links; requirement trace links                                               |
| **Outputs**                 | Fix commits (external); defect resolution; reproduction notes                                                                     |
| **Information consumed**    | Verification procedures; evidence packs; traceability to requirements                                                             |
| **Information produced**    | Defect comments; reproduction steps; fix verification requests                                                                    |
| **Related modules**         | Defects; MCP Developer Experience; Execution (read); Evidence; Traceability                                                       |
| **Related workflows**       | Defect fix; re-verification; MCP-assisted context lookup                                                                          |
| **Permissions**             | Update assigned defects; read verification and evidence; MCP read tools per policy                                                |
| **Audit responsibilities**  | Defect status changes; MCP query audit when enabled                                                                               |
| **Security considerations** | No certification; MCP tools permission-filtered; no admin                                                                         |
| **AI interaction**          | Optional defect summarisation in MCP when AI enabled; never auto-closes defects                                                   |
| **MCP interaction**         | Primary governed channel for IDE integration; read-first; mutating MCP requires human approval                                    |
| **Future evolution**        | Inline fix suggestion with mandatory human review; deeper IDE workflow                                                            |
| **Acceptance criteria**     | Developer can resolve defects with full evidence context; MCP read access works when entitled; certify actions not available      |

---

## PSN-DEF-11 — Release Manager

| Field                       | Definition                                                                                                                                                |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                 | Make evidence-backed release decisions and execute formal human certification — **primary certifier** in APZ QEP                                          |
| **Responsibilities**        | Assess release readiness; assemble evidence packs; drive gate completion; certify, reject, or approve with qualifications; manage certification lifecycle |
| **Goals**                   | Timely defensible certification; clear gate status; minimal certification rework                                                                          |
| **Business objectives**     | Audit-ready release decisions; reduced production incidents; predictable certification cycles                                                             |
| **Success measures**        | Certification cycle time; first-pass certification rate; post-cert incident rate                                                                          |
| **KPIs**                    | Open gate count; pack completeness score; qualification rate; signal-driven re-cert requests                                                              |
| **Daily activities**        | Review readiness dashboard; process certification queue; chase gate blockers; review evidence gaps                                                        |
| **Weekly activities**       | Lead readiness reviews; coordinate with QA Manager and PO; plan certification calendar                                                                    |
| **Pain points**             | Incomplete evidence packs; contradictory readiness signals; last-minute scope changes; manual pack assembly                                               |
| **Decision authority**      | Release go/no-go recommendation; certification scope; qualification wording                                                                               |
| **Approval authority**      | **Certify, reject, approve with qualifications** — primary human certification authority; may configure co-approvers per tenant policy                    |
| **Primary workspace**       | Release                                                                                                                                                   |
| **Secondary workspaces**    | Executive (briefings); Compliance; Auditor (pack prep)                                                                                                    |
| **Navigation journey**      | Home → Release Readiness → Evidence → Certification → Traceability → Defects                                                                              |
| **Dashboards**              | Gate status; certification queue; pack completeness; open blockers; continuous signals                                                                    |
| **Reports**                 | Readiness pack; certification statement; release decision record                                                                                          |
| **Notifications**           | Gate failures; pack ready for review; continuous certification signals; co-approver requests                                                              |
| **Search requirements**     | Search releases, certifications, evidence packs, gates by ID and status                                                                                   |
| **Collaboration**           | QA Manager; Product Owner; Executive; Compliance Officer; Auditor                                                                                         |
| **Inputs**                  | Readiness assessments; evidence packs; gate results; waiver register; risk summaries                                                                      |
| **Outputs**                 | Certification decisions; qualification records; rejection rationale; locked evidence packs                                                                |
| **Information consumed**    | Full traceability for release scope; session and run results; defect status                                                                               |
| **Information produced**    | Certification statements; audit trail of human decisions; readiness narratives                                                                            |
| **Related modules**         | Release Readiness; Certification; Evidence; Home; Traceability; Defects; Reporting                                                                        |
| **Related workflows**       | Readiness assessment; evidence pack assembly; human certification; signal-driven re-cert request                                                          |
| **Permissions**             | Full certification actions within scope; readiness gate management; evidence pack lock                                                                    |
| **Audit responsibilities**  | All certification decisions; pack lock events; qualification recordings                                                                                   |
| **Security considerations** | High-trust role; separation of duties configurable; cannot delegate certification to AI                                                                   |
| **AI interaction**          | Optional readiness narrative drafts — **non-authoritative**; human always decides certify                                                                 |
| **MCP interaction**         | Read readiness via MCP when enabled; no MCP path to certify without human UI action                                                                       |
| **Future evolution**        | Richer qualification templates; multi-party co-certification workflows                                                                                    |
| **Acceptance criteria**     | Release Manager can complete full certify/reject/qualifications flow; AI and signals never auto-certify; evidence pack locks on decision                  |

---

## PSN-DEF-12 — Operations Engineer

| Field                       | Definition                                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                 | Ensure operational health of APZ QEP integrations, environments, and platform usage from an operations perspective                          |
| **Responsibilities**        | Monitor integration health; respond to ingest outages; coordinate environment availability signals; disable broken integrations when needed |
| **Goals**                   | High integration availability; fast MTTR on quality pipeline breaks; minimal false readiness from stale data                                |
| **Business objectives**     | Reliable quality data flow; operational SLAs for QEP dependencies                                                                           |
| **Success measures**        | Integration MTTR; ingest success rate; environment readiness signal accuracy                                                                |
| **KPIs**                    | Open integration incidents; mean time between failures; disabled integration count                                                          |
| **Daily activities**        | Monitor integration dashboards; triage alerts; coordinate with Automation Engineer on ingest issues                                         |
| **Weekly activities**       | Review integration capacity; planned maintenance windows; post-incident reviews                                                             |
| **Pain points**             | Silent integration failures; credential rotation without notice; unowned connectors                                                         |
| **Decision authority**      | Integration disable/enable within ops policy; maintenance scheduling                                                                        |
| **Approval authority**      | Disable broken integrations; escalate to Platform Admin for platform issues                                                                 |
| **Primary workspace**       | Operations                                                                                                                                  |
| **Secondary workspaces**    | Automation; Platform Admin (read)                                                                                                           |
| **Navigation journey**      | Home → Integration Centre → Automation (health) → Administration (ops subset)                                                               |
| **Dashboards**              | Integration health matrix; ingest error rates; environment status                                                                           |
| **Reports**                 | Integration SLA report; incident summary                                                                                                    |
| **Notifications**           | Integration failures; threshold breaches; maintenance reminders                                                                             |
| **Search requirements**     | Search integrations, connectors, error codes, environments                                                                                  |
| **Collaboration**           | Automation Engineer; Platform Administrator; Release Manager on release-blocking outages                                                    |
| **Inputs**                  | Integration telemetry; alert streams; maintenance calendars                                                                                 |
| **Outputs**                 | Incident records; integration status updates; disable/enable actions                                                                        |
| **Information consumed**    | Connector health; run ingest metrics                                                                                                        |
| **Information produced**    | Ops runbooks updates; incident timelines                                                                                                    |
| **Related modules**         | Integration Centre; Automation Management; Administration; Home                                                                             |
| **Related workflows**       | Integration incident response; maintenance; disable broken integration                                                                      |
| **Permissions**             | Ops-level integration control; read admin health; no certification                                                                          |
| **Audit responsibilities**  | Integration disable/enable; ops configuration changes                                                                                       |
| **Security considerations** | Least privilege ops roles; no tenant policy override                                                                                        |
| **AI interaction**          | None required; optional alert summarisation when AI enabled                                                                                 |
| **MCP interaction**         | Ops MCP read for health status if configured                                                                                                |
| **Future evolution**        | Predictive integration degradation alerts                                                                                                   |
| **Acceptance criteria**     | Operations Home surfaces integration health; can disable broken integration with audit trail                                                |

---

## PSN-DEF-13 — Support Agent

| Field                       | Definition                                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Purpose**                 | Help users of APZ QEP resolve usage questions, known limitations, and non-certification quality workflow issues          |
| **Responsibilities**        | Answer user questions; guide manual verification workflows; escalate defects in QEP product; maintain knowledge articles |
| **Goals**                   | Fast support MTTR; accurate guidance aligned with product boundaries; reduced repeat tickets                             |
| **Business objectives**     | User adoption; lower support cost; accurate expectation setting on certification and AI                                  |
| **Success measures**        | Support ticket resolution time; first-contact resolution rate; knowledge article usage                                   |
| **KPIs**                    | Open support queue; escalation rate to engineering; user satisfaction on QEP help                                        |
| **Daily activities**        | Triage support requests; search knowledge base; guide users through sessions and evidence                                |
| **Weekly activities**       | Update knowledge from recurring issues; brief QA Manager on usability pain                                               |
| **Pain points**             | Users expect AI to certify; confusion between verification and external test tools; permission errors                    |
| **Decision authority**      | Support guidance and ticket routing                                                                                      |
| **Approval authority**      | None; escalates certification and policy questions to appropriate roles                                                  |
| **Primary workspace**       | Support                                                                                                                  |
| **Secondary workspaces**    | Knowledge-focused Manual Testing view (read)                                                                             |
| **Navigation journey**      | Home → Knowledge → Defects (read) → Administration (user lookup read)                                                    |
| **Dashboards**              | Open support themes; known limitations; recent knowledge updates                                                         |
| **Reports**                 | Support volume by module; top user confusion topics                                                                      |
| **Notifications**           | Assigned support escalations; knowledge review requests                                                                  |
| **Search requirements**     | Strong search on knowledge articles, known limitations, and public workflow guides                                       |
| **Collaboration**           | Tenant Administrator; QA Manager; Platform Administrator on escalations                                                  |
| **Inputs**                  | User tickets; knowledge base; known limitation registry                                                                  |
| **Outputs**                 | Resolved tickets; knowledge updates; escalation records                                                                  |
| **Information consumed**    | Product documentation; audit excerpts for user actions (limited)                                                         |
| **Information produced**    | Support responses; FAQ updates                                                                                           |
| **Related modules**         | Knowledge; Defects (read); Home; Search                                                                                  |
| **Related workflows**       | User guidance; knowledge maintenance; escalation                                                                         |
| **Permissions**             | Read-mostly across user-facing modules; no certification or admin mutate                                                 |
| **Audit responsibilities**  | Support actions on user behalf when impersonation policy allows — fully audited                                          |
| **Security considerations** | Strict read boundaries; no access to other tenants; impersonation gated                                                  |
| **AI interaction**          | Support may use AI to draft responses when enabled — human sends; AI never certifies                                     |
| **MCP interaction**         | None typical                                                                                                             |
| **Future evolution**        | In-product guided help; support copilot with cited knowledge only                                                        |
| **Acceptance criteria**     | Support workspace provides knowledge-first guidance; cannot certify or change tenant AI policy                           |

---

## PSN-DEF-14 — Security Officer

| Field                       | Definition                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                 | Ensure APZ QEP configuration, permissions, and integrations meet organisational security posture                    |
| **Responsibilities**        | Review permission models; approve sensitive policy changes; assess integration security; monitor privileged actions |
| **Goals**                   | Least-privilege enforcement; timely detection of misconfiguration; secure MCP and AI governance                     |
| **Business objectives**     | Reduce security risk from quality tooling; compliance with security standards                                       |
| **Success measures**        | Open critical permission issues; time to remediate misconfigurations                                                |
| **KPIs**                    | Excessive privilege assignments; failed security reviews; MCP policy violations                                     |
| **Daily activities**        | Review security dashboard; triage permission change requests; scan audit for anomalies                              |
| **Weekly activities**       | Security review meetings; policy updates; integration security assessments                                          |
| **Pain points**             | Shadow admin roles; AI enabled without governance; integration secrets mishandled                                   |
| **Decision authority**      | Security policy recommendations; block sensitive changes                                                            |
| **Approval authority**      | Sensitive policy changes; MCP tool allowlists; AI enablement preconditions per security policy                      |
| **Primary workspace**       | Security                                                                                                            |
| **Secondary workspaces**    | Compliance; Platform Admin (read)                                                                                   |
| **Navigation journey**      | Home → Administration → Audit → Risk → Integrations                                                                 |
| **Dashboards**              | Permission anomalies; privileged action feed; MCP/AI policy status                                                  |
| **Reports**                 | Security posture report; privileged access review                                                                   |
| **Notifications**           | Sensitive config changes; MCP mutating tool usage; AI enablement requests                                           |
| **Search requirements**     | Search users, roles, permissions, audit events, integration configs                                                 |
| **Collaboration**           | Tenant Administrator; Platform Administrator; Compliance Officer; Auditor                                           |
| **Inputs**                  | Audit logs; permission matrices; integration manifests                                                              |
| **Outputs**                 | Security approvals; remediation tasks; policy updates                                                               |
| **Information consumed**    | Administration config; audit events; risk register security items                                                   |
| **Information produced**    | Security review records; approval decisions                                                                         |
| **Related modules**         | Administration; Audit; Risk; Integration Centre                                                                     |
| **Related workflows**       | Security review; sensitive change approval; MCP governance                                                          |
| **Permissions**             | Security read across tenant; approve sensitive changes; no certification by default                                 |
| **Audit responsibilities**  | Reviews own approval actions; monitors others' privileged actions                                                   |
| **Security considerations** | Meta-security role; highly audited; separation from Release Manager certification                                   |
| **AI interaction**          | Approves AI enablement prerequisites; AI never overrides security policy                                            |
| **MCP interaction**         | Defines and reviews MCP governance rules; mutating tools require human approval chain                               |
| **Future evolution**        | Continuous permission drift detection; automated excessive privilege alerts                                         |
| **Acceptance criteria**     | Security officer can review and approve sensitive changes; MCP and AI status visible; cannot certify releases       |

---

## PSN-DEF-15 — Compliance Officer

| Field                       | Definition                                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                 | Align APZ QEP retention, audit, and certification practices with regulatory and organisational compliance obligations                       |
| **Responsibilities**        | Define retention policies; review compliance packs; validate certification evidence meets regulatory needs; coordinate with Auditor         |
| **Goals**                   | Complete policy coverage; audit-ready exports; defensible certification records                                                             |
| **Business objectives**     | Pass external audits; minimise compliance findings; enforce immutable evidence rules                                                        |
| **Success measures**        | Retention policy coverage; audit export completeness; compliance pack turnaround                                                            |
| **KPIs**                    | Open compliance gaps; waiver compliance rate; expired certification count                                                                   |
| **Daily activities**        | Review compliance dashboard; triage policy exceptions; validate pack exports                                                                |
| **Weekly activities**       | Compliance reviews with Release Manager; update retention rules; prepare regulator packs                                                    |
| **Pain points**             | Incomplete evidence chains; manual export assembly; unclear waiver documentation                                                            |
| **Decision authority**      | Compliance policy content; retention and export rules                                                                                       |
| **Approval authority**      | Retention/compliance policies; compliance pack release; not substitute for Release Manager certification                                    |
| **Primary workspace**       | Compliance                                                                                                                                  |
| **Secondary workspaces**    | Auditor; Release (read); Executive (read)                                                                                                   |
| **Navigation journey**      | Home → Audit → Administration (policies) → Certification (view) → Reporting                                                                 |
| **Dashboards**              | Retention coverage; compliance pack status; certification expiry horizon                                                                    |
| **Reports**                 | Compliance pack; regulatory export; waiver compliance summary                                                                               |
| **Notifications**           | Policy violations; upcoming certification expiry; export job completion                                                                     |
| **Search requirements**     | Search policies, certifications, audit events, retention classes                                                                            |
| **Collaboration**           | Auditor; Release Manager; Security Officer; Executive                                                                                       |
| **Inputs**                  | Regulatory requirements; audit findings; certification records                                                                              |
| **Outputs**                 | Compliance policies; approved exports; gap remediation plans                                                                                |
| **Information consumed**    | Certification statements; evidence pack metadata; audit trails                                                                              |
| **Information produced**    | Compliance attestations; policy versions; export manifests                                                                                  |
| **Related modules**         | Audit; Administration; Certification (view); Reporting                                                                                      |
| **Related workflows**       | Retention policy management; compliance export; certification review support                                                                |
| **Permissions**             | Manage compliance policies; trigger exports; view all certification within scope                                                            |
| **Audit responsibilities**  | Policy changes; export approvals; compliance attestations                                                                                   |
| **Security considerations** | Export controls; data classification on packs; cross-border restrictions                                                                    |
| **AI interaction**          | AI may assist pack narrative when enabled — never authoritative for compliance sign-off                                                     |
| **MCP interaction**         | Read-only compliance queries via MCP if governed                                                                                            |
| **Future evolution**        | Regulator-specific pack templates; continuous compliance monitoring                                                                         |
| **Acceptance criteria**     | Compliance officer can manage retention policies and generate exports; certification view read-only unless separate certifier role assigned |

---

## PSN-DEF-16 — Auditor

| Field                       | Definition                                                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                 | Provide **independent** proof of certification integrity, privileged actions, and evidence immutability — **cannot certify** |
| **Responsibilities**        | Investigate audit trails; sample certification decisions; verify evidence pack integrity; export audit records               |
| **Goals**                   | Complete independent audit coverage; reproducible findings; no conflict of interest with certification                       |
| **Business objectives**     | Satisfy internal and external audit; detect control failures; validate human certification accountability                    |
| **Success measures**        | Export completeness; audit finding closure rate; sampling coverage                                                           |
| **KPIs**                    | Days to complete audit cycle; privileged action sample size; certification decision traceability                             |
| **Daily activities**        | Review audit investigation queue; trace certification decisions to evidence; sample session records                          |
| **Weekly activities**       | Publish audit sampling plans; coordinate with Compliance; report findings                                                    |
| **Pain points**             | Incomplete audit exports; inability to prove immutability; certifier also holding audit role                                 |
| **Decision authority**      | Audit scope and sampling; finding severity                                                                                   |
| **Approval authority**      | **Does not certify by default** — independence mandatory; may approve audit export release only                              |
| **Primary workspace**       | Auditor                                                                                                                      |
| **Secondary workspaces**    | Compliance; Release (read-only investigation)                                                                                |
| **Navigation journey**      | Home → Audit → Certification (read) → Evidence (read) → Administration (read)                                                |
| **Dashboards**              | Investigation queue; privileged action timeline; certification sample status                                                 |
| **Reports**                 | Audit finding report; certification integrity report; export manifest                                                        |
| **Notifications**           | Export ready; critical privileged actions; certification decisions for sampled releases                                      |
| **Search requirements**     | Advanced search on audit events, actors, certification IDs, correlation IDs                                                  |
| **Collaboration**           | Compliance Officer; Security Officer; Release Manager (factual queries only)                                                 |
| **Inputs**                  | Audit logs; certification records; evidence pack manifests                                                                   |
| **Outputs**                 | Audit findings; export packages; attestation of review completion                                                            |
| **Information consumed**    | Immutable history; certification statements; MCP/AI audit trails                                                             |
| **Information produced**    | Audit workpapers; finding records; export checksums                                                                          |
| **Related modules**         | Audit; Certification (read); Evidence (read); Administration (read)                                                          |
| **Related workflows**       | Audit investigation; certification sampling; export verification                                                             |
| **Permissions**             | Broad read for audit; export generation; explicit deny on certify actions                                                    |
| **Audit responsibilities**  | Auditor's own queries logged; findings recorded in audit module                                                              |
| **Security considerations** | Independence enforced by permission model; read-only on evidence content where policy requires                               |
| **AI interaction**          | AI may summarise audit logs when enabled — human validates findings; AI cannot certify                                       |
| **MCP interaction**         | Read-only governed MCP for audit queries; no mutating tools                                                                  |
| **Future evolution**        | Continuous control monitoring dashboards; cross-system correlation                                                           |
| **Acceptance criteria**     | Auditor role explicitly excludes certification actions; can export complete audit trail for sampled releases                 |

---

## PSN-DEF-17 — Customer Representative

| Field                       | Definition                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                 | Provide external enterprise stakeholders transparent, permission-filtered visibility into release readiness and quality posture |
| **Responsibilities**        | Review shared readiness reports; raise concerns on release scope; participate in customer-facing quality reviews                |
| **Goals**                   | Confidence in supplier quality; timely visibility into certification outcomes affecting their organisation                      |
| **Business objectives**     | Trust through transparency; reduced surprise escalations; contractual quality evidence                                          |
| **Success measures**        | Customer transparency satisfaction; escalation rate; time to shared readiness report                                            |
| **KPIs**                    | Shared report freshness; open customer concerns; certification visibility latency                                               |
| **Daily activities**        | Review shared dashboards; check certification status on contracted releases                                                     |
| **Weekly activities**       | Customer quality review meetings; comment on shared readiness packs                                                             |
| **Pain points**             | Over-shared internal noise; under-shared certification detail; jargon-heavy reports                                             |
| **Decision authority**      | Customer acceptance input — external to QEP; documented as comments not certification                                           |
| **Approval authority**      | None within QEP; cannot certify or waive                                                                                        |
| **Primary workspace**       | Customer                                                                                                                        |
| **Secondary workspaces**    | Executive shared views when invited                                                                                             |
| **Navigation journey**      | Home (limited) → Reporting (shared) → Certification (shared view)                                                               |
| **Dashboards**              | Shared readiness summary; certification status for contracted scope; defect summary (aggregated)                                |
| **Reports**                 | Customer readiness pack; shared certification statement                                                                         |
| **Notifications**           | Shared certification outcomes; readiness report published; scope change notices                                                 |
| **Search requirements**     | Search within shared scope only — releases, reports, certification IDs granted                                                  |
| **Collaboration**           | Release Manager; Product Owner; Account management (external)                                                                   |
| **Inputs**                  | Shared reports; certification statements; readiness summaries                                                                   |
| **Outputs**                 | Customer comments; acceptance feedback recorded externally to cert decision                                                     |
| **Information consumed**    | Aggregated quality metrics; approved certification statements                                                                   |
| **Information produced**    | Customer review comments when channel enabled                                                                                   |
| **Related modules**         | Reporting; Home (limited); Certification (shared view)                                                                          |
| **Related workflows**       | Shared readiness review; customer reporting                                                                                     |
| **Permissions**             | Strictly shared/read-only scope; no internal modules                                                                            |
| **Audit responsibilities**  | Customer access logged; comments audited                                                                                        |
| **Security considerations** | Tenant isolation; no internal user or defect detail beyond share policy                                                         |
| **AI interaction**          | None by default for customer tier                                                                                               |
| **MCP interaction**         | None                                                                                                                            |
| **Future evolution**        | Customer self-service portal expansions; contractual pack automation                                                            |
| **Acceptance criteria**     | Customer sees only shared artefacts; no certify, admin, or internal defect detail unless explicitly shared                      |

---

## PSN-DEF-18 — Third-party Integrator

| Field                       | Definition                                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                 | Build and maintain stable, governed integrations between external systems and APZ QEP without certification authority         |
| **Responsibilities**        | Implement integration adapters; test ingest and sync; document connector behaviour; respond to integration failures           |
| **Goals**                   | Low failed call rate; stable MCP and API consumption patterns; clear error translation                                        |
| **Business objectives**     | Reliable data exchange; minimise custom bypass integrations                                                                   |
| **Success measures**        | Integration success rate; time to restore failed connector; documentation completeness                                        |
| **KPIs**                    | Failed call rate; retry success; mapping error count                                                                          |
| **Daily activities**        | Monitor client health dashboards; fix integration errors; test payload mappings                                               |
| **Weekly activities**       | Release connector updates; coordinate with Operations and Automation Engineer                                                 |
| **Pain points**             | Undocumented behaviour changes; sandbox drift; credential rotation friction                                                   |
| **Decision authority**      | Integration implementation choices within approved manifests                                                                  |
| **Approval authority**      | **Cannot certify**; may request Platform Admin enablement                                                                     |
| **Primary workspace**       | Integrator                                                                                                                    |
| **Secondary workspaces**    | Automation; MCP Developer Experience                                                                                          |
| **Navigation journey**      | Home → Integration Centre → MCP → Administration (limited)                                                                    |
| **Dashboards**              | Client health; error taxonomy; sandbox test results                                                                           |
| **Reports**                 | Integration test summary; failed call analysis                                                                                |
| **Notifications**           | Connector failures; sandbox reset; credential expiry warnings                                                                 |
| **Search requirements**     | Search integration docs, error codes, capability manifests                                                                    |
| **Collaboration**           | Platform Administrator; Operations Engineer; Automation Engineer                                                              |
| **Inputs**                  | Integration manifests; sandbox credentials (refs); test payloads                                                              |
| **Outputs**                 | Connector updates; test evidence; integration documentation                                                                   |
| **Information consumed**    | Capability definitions; health endpoints                                                                                      |
| **Information produced**    | Integration test records; change logs                                                                                         |
| **Related modules**         | Integration Centre; MCP Developer Experience; Administration (limited)                                                        |
| **Related workflows**       | Connector development; sandbox testing; production promotion request                                                          |
| **Permissions**             | Integrator-scoped admin; sandbox write; no production cert or tenant policy                                                   |
| **Audit responsibilities**  | Connector changes; sandbox promotions requests                                                                                |
| **Security considerations** | Least privilege integrator accounts; secrets never in repos                                                                   |
| **AI interaction**          | None required for integration work                                                                                            |
| **MCP interaction**         | Primary development surface when building MCP tools — governed registration                                                   |
| **Future evolution**        | Self-service connector certification (technical, not release certification)                                                   |
| **Acceptance criteria**     | Integrator can develop and test connectors in sandbox; production changes require Platform Admin; certify actions unavailable |

---

## PSN-DEF-19 — Platform Administrator

| Field                       | Definition                                                                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                 | Enable and govern APZ QEP at platform level — entitlements, identity federation, global integrations, and cross-tenant operations where applicable |
| **Responsibilities**        | Manage platform entitlements; configure identity; enable modules; oversee platform integrations; support Tenant Administrators                     |
| **Goals**                   | Zero misconfiguration incidents; consistent entitlement model; healthy multi-tenant platform                                                       |
| **Business objectives**     | Reliable platform operations; scalable tenant onboarding                                                                                           |
| **Success measures**        | Misconfiguration incident count; tenant onboarding time; platform integration uptime                                                               |
| **KPIs**                    | Failed provisioning jobs; entitlement drift; platform-wide alert count                                                                             |
| **Daily activities**        | Monitor platform admin Home; process entitlement requests; triage platform incidents                                                               |
| **Weekly activities**       | Review tenant onboarding; platform patch planning; integration governance council                                                                  |
| **Pain points**             | Entitlement sprawl; tenant admins bypassing process; unowned platform integrations                                                                 |
| **Decision authority**      | Platform-wide enablement; module entitlement; federation config                                                                                    |
| **Approval authority**      | High privilege admin actions; integrator production promotion; not release certification unless separate RM role                                   |
| **Primary workspace**       | Platform Admin                                                                                                                                     |
| **Secondary workspaces**    | Operations; Integrator                                                                                                                             |
| **Navigation journey**      | Home → Administration → Integrations → Audit (platform scope)                                                                                      |
| **Dashboards**              | Entitlement matrix; tenant health; platform integration status; identity sync                                                                      |
| **Reports**                 | Platform operations report; tenant onboarding summary                                                                                              |
| **Notifications**           | Platform incidents; entitlement requests; security escalations from Security Officer                                                               |
| **Search requirements**     | Cross-tenant search where policy allows — tenants, entitlements, platform connectors                                                               |
| **Collaboration**           | Tenant Administrator; Security Officer; Third-party Integrator                                                                                     |
| **Inputs**                  | Tenant requests; security policies; platform roadmap                                                                                               |
| **Outputs**                 | Entitlement changes; platform config; incident resolutions                                                                                         |
| **Information consumed**    | Platform telemetry; tenant usage                                                                                                                   |
| **Information produced**    | Platform change records; onboarding runbooks                                                                                                       |
| **Related modules**         | Administration; Integration Centre; Audit                                                                                                          |
| **Related workflows**       | Tenant provisioning; entitlement management; platform integration lifecycle                                                                        |
| **Permissions**             | Highest platform privileges; scoped by deployment model                                                                                            |
| **Audit responsibilities**  | All platform admin mutations heavily audited                                                                                                       |
| **Security considerations** | Break-glass procedures; MFA mandatory; no shared accounts                                                                                          |
| **AI interaction**          | Platform AI features disabled until tenant-level and platform policy both allow                                                                    |
| **MCP interaction**         | Platform MCP registry management; tool governance at platform scope                                                                                |
| **Future evolution**        | Automated entitlement compliance scanning; federated admin delegation                                                                              |
| **Acceptance criteria**     | Platform admin can provision tenant and entitlements; all actions audited; release certification requires separate RM role                         |

---

## PSN-DEF-20 — Tenant Administrator

| Field                       | Definition                                                                                                                                      |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                 | Govern tenant policies, users, roles, and feature enablement — **keeps AI default OFF** until explicitly authorised                             |
| **Responsibilities**        | Manage tenant users and roles; configure tenant policies; authorise AI and MCP enablement per governance; delegate workspace defaults           |
| **Goals**                   | Correct permission assignments; zero accidental AI enablement; aligned tenant configuration with org policy                                     |
| **Business objectives**     | Secure tenant operation; controlled feature rollout; audit-ready admin actions                                                                  |
| **Success measures**        | Accidental AI enablement = 0; permission review completion; admin incident count                                                                |
| **KPIs**                    | Orphan role assignments; AI/MCP policy violations; user provisioning SLA                                                                        |
| **Daily activities**        | Process access requests; review admin alerts; validate role assignments                                                                         |
| **Weekly activities**       | Permission audits with Security Officer; policy reviews; AI/MCP enablement decisions                                                            |
| **Pain points**             | Role proliferation; users requesting certifier rights; shadow AI enablement                                                                     |
| **Decision authority**      | Tenant user and role management; tenant policy configuration                                                                                    |
| **Approval authority**      | Tenant policies; AI enablement authorisation; MCP tenant allowlists; not release certification by default                                       |
| **Primary workspace**       | Tenant Admin                                                                                                                                    |
| **Secondary workspaces**    | Security; Compliance                                                                                                                            |
| **Navigation journey**      | Home → Administration → Audit → Integration Centre (tenant scope)                                                                               |
| **Dashboards**              | User and role matrix; AI/MCP status (OFF default); policy compliance                                                                            |
| **Reports**                 | Access review report; tenant configuration summary                                                                                              |
| **Notifications**           | Access requests; AI enablement requests; policy violation alerts                                                                                |
| **Search requirements**     | Search users, roles, groups, policies within tenant                                                                                             |
| **Collaboration**           | Security Officer; Compliance Officer; Platform Administrator                                                                                    |
| **Inputs**                  | Access requests; security policy; compliance requirements                                                                                       |
| **Outputs**                 | Role assignments; policy updates; AI/MCP authorisation records                                                                                  |
| **Information consumed**    | Audit summaries; entitlement catalog                                                                                                            |
| **Information produced**    | Admin change log; access review attestations                                                                                                    |
| **Related modules**         | Administration; Audit; Integration Centre (tenant)                                                                                              |
| **Related workflows**       | User provisioning; role assignment; AI/MCP enablement; policy management                                                                        |
| **Permissions**             | Tenant-wide admin within tenant boundary                                                                                                        |
| **Audit responsibilities**  | All tenant admin actions; AI enablement decisions                                                                                               |
| **Security considerations** | Cannot escalate to platform admin; certifier roles assigned deliberately                                                                        |
| **AI interaction**          | Authorises tenant AI — default OFF; documents governance before enable                                                                          |
| **MCP interaction**         | Authorises tenant MCP tools and policies; mutating tools require human approval chain                                                           |
| **Future evolution**        | Self-service access reviews; automated role recertification (identity, not release cert)                                                        |
| **Acceptance criteria**     | Tenant admin can manage users/roles; AI shows OFF until explicit authorisation with audit; cannot certify releases unless also assigned RM role |

---

## PSN-DEF-21 — AI Agent

| Field                       | Definition                                                                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                 | Assist quality engineering tasks within strict policy as a **non-authoritative actor** — **cannot certify**; mutating tools require human approval |
| **Responsibilities**        | Invoke allowed MCP tools; propose drafts and analyses; retrieve SoR context; never write authoritative records without human accept                |
| **Goals**                   | Productive assistance with zero unauthorised mutations; full audit trail of agent actions                                                          |
| **Business objectives**     | Accelerate QE work when AI authorised; maintain human accountability for all SoR changes and certification                                         |
| **Success measures**        | Unauthorised tool attempts = 0; human accept rate on proposals; agent error rate                                                                   |
| **KPIs**                    | Blocked mutating tool calls; proposal acceptance ratio; MCP latency                                                                                |
| **Daily activities**        | Respond to user/agent sessions; query read tools; submit proposals for human review                                                                |
| **Weekly activities**       | N/A — continuous agent operation when enabled                                                                                                      |
| **Pain points**             | Users expect autonomous certification; tool allowlist too narrow; ambiguous human approval queues                                                  |
| **Decision authority**      | **None authoritative** — recommendations only                                                                                                      |
| **Approval authority**      | **Cannot certify**; cannot approve own proposals; mutating MCP tools blocked pending human approval                                                |
| **Primary workspace**       | Agent context (non-UI)                                                                                                                             |
| **Secondary workspaces**    | AI Quality Workspace (when acting on behalf of entitled user)                                                                                      |
| **Navigation journey**      | N/A — operates via MCP and AI Workspace sessions, not standard shell navigation                                                                    |
| **Dashboards**              | N/A — metrics consumed by administrators via Audit and AI governance views                                                                         |
| **Reports**                 | Agent activity reports for administrators                                                                                                          |
| **Notifications**           | Human approval requests for mutating actions; policy violation blocks                                                                              |
| **Search requirements**     | Governed MCP search/read tools only — no broad unfiltered search beyond allowlist                                                                  |
| **Collaboration**           | Human users (QA Engineer, Developer, etc.); Tenant Administrator for policy                                                                        |
| **Inputs**                  | User prompts; MCP tool responses; SoR read snapshots                                                                                               |
| **Outputs**                 | Proposals; draft content pending accept; audit events                                                                                              |
| **Information consumed**    | Requirements; verifications; defects; readiness data via read tools                                                                                |
| **Information produced**    | AI session logs; proposals; rejected recommendation records                                                                                        |
| **Related modules**         | MCP Developer Experience; AI Quality Workspace; Audit                                                                                              |
| **Related workflows**       | AI assist workflows per AI-WORKFLOWS.md; MCP governed invocation                                                                                   |
| **Permissions**             | Explicit allowlisted tools; read vs mutating separation; cert actions denied                                                                       |
| **Audit responsibilities**  | Every tool invocation logged; proposals and human decisions linked                                                                                 |
| **Security considerations** | AI never SoR without human accept; no certification endpoints; tenant AI default OFF                                                               |
| **AI interaction**          | Core actor — operates only when tenant and user entitlements enable AI                                                                             |
| **MCP interaction**         | **Primary interaction channel** — governed tools; mutating calls require human approval gate                                                       |
| **Future evolution**        | Richer tool registry; multi-step plans with checkpoint approvals                                                                                   |
| **Acceptance criteria**     | Agent cannot invoke certify actions; mutating MCP tools block until human approves; all actions audited; AI default OFF at tenant level            |

---

## Persona–workspace map

```mermaid
flowchart TB
  subgraph Leadership["Leadership & governance"]
    Exec[PSN-DEF-01 Executive] --> WExec[Executive workspace]
    PO[PSN-DEF-02 Product Owner] --> WPO[Product Owner workspace]
    PM[PSN-DEF-04 Project Manager] --> WDel[Delivery workspace]
    RM[PSN-DEF-11 Release Manager] --> WRel[Release workspace]
    Comp[PSN-DEF-15 Compliance Officer] --> WComp[Compliance workspace]
    Aud[PSN-DEF-16 Auditor] --> WAud[Auditor workspace]
  end

  subgraph Quality["Quality engineering"]
    QAM[PSN-DEF-05 QA Manager] --> WQAL[QA Leadership workspace]
    QAE[PSN-DEF-06 QA Engineer] --> WQAE[QA Engineering workspace]
    MT[PSN-DEF-07 Manual Tester] --> WMan[Manual Testing workspace]
    ET[PSN-DEF-08 Exploratory Tester] --> WExp[Exploratory workspace]
    AE[PSN-DEF-09 Automation Engineer] --> WAut[Automation workspace]
  end

  subgraph Delivery["Delivery & analysis"]
    BA[PSN-DEF-03 Business Analyst] --> WAn[Analyst workspace]
    Dev[PSN-DEF-10 Developer] --> WDev[Developer workspace]
  end

  subgraph Operations["Operations & support"]
    Ops[PSN-DEF-12 Operations Engineer] --> WOps[Operations workspace]
    Sup[PSN-DEF-13 Support Agent] --> WSup[Support workspace]
    Sec[PSN-DEF-14 Security Officer] --> WSec[Security workspace]
  end

  subgraph External["External & platform"]
    Cust[PSN-DEF-17 Customer Representative] --> WCust[Customer workspace]
    Int[PSN-DEF-18 Third-party Integrator] --> WInt[Integrator workspace]
    PAdm[PSN-DEF-19 Platform Administrator] --> WPAdm[Platform Admin workspace]
    TAdm[PSN-DEF-20 Tenant Administrator] --> WTAdm[Tenant Admin workspace]
  end

  subgraph Agent["Non-human actor"]
    Agent[PSN-DEF-21 AI Agent] --> WMCP[MCP / AI agent context]
  end

  RM -.->|primary certifier| WRel
  Aud -.->|independent — no certify| WAud
  Agent -.->|cannot certify| WMCP
```
