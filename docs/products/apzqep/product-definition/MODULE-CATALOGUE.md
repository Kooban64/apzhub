# APZ QEP — Module Catalogue

> **Programme:** APZQEP-DEF-002 (catalogue content from DEF-001; field tables unchanged)  
> **Note:** Product modules — not technical services or packages.  
> **DEF-002:** Module relationships, navigation mapping, and cross-cutting behaviour expanded in [PRODUCT-MODULES.md](./PRODUCT-MODULES.md) and [NAVIGATION-MAP.md](./NAVIGATION-MAP.md). This catalogue remains the per-module field authority (M01–M22).

## Catalogue index

| ID | Module | Slug | Horizon |
| -- | ------ | ---- | ------- |
| M01 | Home and Command Centre | `home` | MVP core |
| M02 | Portfolio and Projects | `portfolio` | MVP core |
| M03 | Requirements | `requirements` | MVP core |
| M04 | Verification Library | `verification-library` | MVP core |
| M05 | Verification Design | `verification-design` | MVP core |
| M06 | Execution and Sessions | `execution` | MVP core |
| M07 | Automation Management | `automation` | MVP foundation / Phase 2 depth |
| M08 | Defects and Quality Issues | `defects` | MVP core |
| M09 | Evidence | `evidence` | MVP core |
| M10 | Traceability | `traceability` | MVP core |
| M11 | Risk Management | `risk` | MVP foundation / Phase 2 depth |
| M12 | Release Readiness | `release-readiness` | MVP core |
| M13 | Certification | `certification` | MVP core |
| M14 | Quality Intelligence | `quality-intelligence` | Phase 2+ (AI/MCP OFF until authorised) |
| M15 | Reporting and Analytics | `reporting` | MVP core |
| M16 | Knowledge and Learning | `knowledge` | Phase 2+ (AI/MCP OFF until authorised) |
| M17 | AI Quality Workspace | `ai-workspace` | Phase 2+ (AI/MCP OFF until authorised) |
| M18 | MCP and Developer Experience | `mcp-dx` | Phase 2+ (AI/MCP OFF until authorised) |
| M19 | Integration Centre | `integrations` | MVP foundation / Phase 2 depth |
| M20 | Administration | `administration` | MVP core |
| M21 | Audit and Compliance | `audit` | MVP core |
| M22 | Search and Navigation | `search-nav` | MVP core |

---

## M01 — Home and Command Centre

| Field | Definition |
| ----- | ---------- |
| **Purpose** | Personal and role-aware command centre for quality work |
| **Business problem addressed** | Fragmented status across tools |
| **Primary value** | Instant situational awareness and next actions |
| **Primary users** | All personas (landing differs by role) |
| **Secondary users** | Executives; Release Managers |
| **Core capabilities** | Personal/role dashboards; assigned work; pending approvals; release/quality alerts; recent activity; risk highlights; certification status; verification progress; defect status; quick actions; saved views; personal notifications |
| **Key information objects** | Dashboard widget; Saved view; Alert; Work item pointer |
| **User actions** | Open work; navigate; acknowledge alerts; jump to approvals |
| **Inputs** | Assignments; readiness/cert signals; notifications |
| **Outputs** | Prioritised work queue and status views |
| **Lifecycle states** | Views are live; saved views versioned by user |
| **Approval requirements** | None for viewing; approvals occur on target objects |
| **Evidence requirements** | May deep-link to open evidence packs |
| **Permissions considerations** | Widgets and alerts permission-filtered |
| **Audit considerations** | Drill-into sensitive cert status audited |
| **AI assistance opportunities** | Optional AI summary widgets when AI enabled |
| **Manual-operation support** | Fully usable without AI or automation |
| **Automation support** | Surfaces automation failure alerts |
| **Integration touchpoints** | Notifications; Search |
| **Relationships with other modules** | Navigation hub into all modules |
| **MVP scope** | Personal dashboard; assignments; alerts; quick actions; cert/readiness widgets |
| **Later-phase scope** | Advanced saved views; NL summary widgets |
| **Explicit exclusions** | Standalone BI product |
| **Success measures** | Time-to-first-action; alert acknowledgement rate |

## M02 — Portfolio and Projects

| Field | Definition |
| ----- | ---------- |
| **Purpose** | Organise quality scope by portfolio project application and service |
| **Business problem addressed** | Quality work lacks stable product context |
| **Primary value** | Governed quality contexts without becoming an ALM |
| **Primary users** | Product Owner; Project Manager; QA Manager |
| **Secondary users** | Executive; Developer |
| **Core capabilities** | Portfolio; projects; applications; services; components; repositories; environments; teams; owners; project quality profile/status; project dashboards; external project links |
| **Key information objects** | Project; Application; Service; Component; Environment; Team |
| **User actions** | Create/update contexts; assign owners; link externals; view quality profile |
| **Inputs** | ALM/project references via Platform Services |
| **Outputs** | Quality status aggregation per project |
| **Lifecycle states** | Draft → Active → Archived |
| **Approval requirements** | Owner assignment required for Active |
| **Evidence requirements** | Project-level packs in later phases |
| **Permissions considerations** | Project-scoped permissions |
| **Audit considerations** | Project configuration changes audited |
| **AI assistance opportunities** | None required for MVP |
| **Manual-operation support** | Manual project setup fully supported |
| **Automation support** | Link CI repositories as references only |
| **Integration touchpoints** | APZ Projects / ALM connectors |
| **Relationships with other modules** | Parent context for Requirements and Verification |
| **MVP scope** | Projects; environments; owners; basic dashboards; external links |
| **Later-phase scope** | Multi-product portfolios; deep component trees |
| **Explicit exclusions** | Sprint planning; full ALM workflows |
| **Success measures** | Percent of projects with quality profile |

## M03 — Requirements

| Field | Definition |
| ----- | ---------- |
| **Purpose** | Capture approve and version quality-relevant requirements |
| **Business problem addressed** | Unclear unapproved needs and weak acceptance criteria |
| **Primary value** | Approved requirements as the foundation for verification |
| **Primary users** | Business Analyst; Product Owner |
| **Secondary users** | QA; Project Manager; Compliance |
| **Core capabilities** | Repository; hierarchy; types (business functional NFR security compliance); acceptance criteria; ownership; status; versioning; review/approval; relationships/dependencies; risk; history; baselines; import/sync; requirement quality analysis |
| **Key information objects** | Requirement; Baseline; Acceptance criterion |
| **User actions** | Create/import; review; approve; baseline; link dependencies |
| **Inputs** | Manual entry; optional ALM synchronisation |
| **Outputs** | Approved requirement sets and baselines |
| **Lifecycle states** | Draft → In review → Approved → Deprecated → Superseded |
| **Approval requirements** | Human approval before verification obligation |
| **Evidence requirements** | Baselines exportable into packs |
| **Permissions considerations** | Author vs approver roles |
| **Audit considerations** | Approve/reject audited |
| **AI assistance opportunities** | Ambiguity and testability analysis when AI enabled |
| **Manual-operation support** | Fully manual authoring |
| **Automation support** | Not an automation module |
| **Integration touchpoints** | Optional ALM sync; Documents |
| **Relationships with other modules** | Feeds Verification Design and Traceability |
| **MVP scope** | CRUD; acceptance criteria; approve; baseline; import; links |
| **Later-phase scope** | AI quality analysis; advanced synchronisation |
| **Explicit exclusions** | Replacing ALM product backlog ownership |
| **Success measures** | Percent approved requirements linked to verification |

## M04 — Verification Library

| Field | Definition |
| ----- | ---------- |
| **Purpose** | Reusable governed repository of verification assets |
| **Business problem addressed** | Scattered non-reusable test assets |
| **Primary value** | Managed reusable verification library |
| **Primary users** | QA Engineer; QA Manager |
| **Secondary users** | Automation Engineer |
| **Core capabilities** | Folders; suites; collections; reusable verifications; templates; steps; expected outcomes; preconditions; data/environment references; tags; priority; risk; ownership; versions; review/approval; support for manual automated AI-assisted hybrid continuous methods |
| **Key information objects** | Verification; Suite; Template; Folder |
| **User actions** | Browse; version; reuse; tag; retire |
| **Inputs** | Approved designs from Verification Design |
| **Outputs** | Reusable approved assets ready for execution |
| **Lifecycle states** | Draft → Review → Approved → Retired |
| **Approval requirements** | Approval for shared/org templates |
| **Evidence requirements** | None until executed |
| **Permissions considerations** | Library write vs read roles |
| **Audit considerations** | Version publish audited |
| **AI assistance opportunities** | Duplicate suggestions when AI enabled |
| **Manual-operation support** | Full manual procedures first-class |
| **Automation support** | Automation identifier fields on procedures |
| **Integration touchpoints** | Search providers |
| **Relationships with other modules** | Used by Design and Execution |
| **MVP scope** | Library CRUD; suites; templates; manual procedures |
| **Later-phase scope** | Advanced collections; continuous verification types |
| **Explicit exclusions** | Storing runner binaries |
| **Success measures** | Reuse rate; orphan procedure count |

## M05 — Verification Design

| Field | Definition |
| ----- | ---------- |
| **Purpose** | Create and approve verifications from requirements templates or AI drafts |
| **Business problem addressed** | Ad-hoc unverifiable designs |
| **Primary value** | High-quality verification design with coverage impact |
| **Primary users** | QA Engineer; Business Analyst |
| **Secondary users** | Automation Engineer; AI Agent (draft only) |
| **Core capabilities** | Create from requirements; manual/template/AI/bulk creation; scenario types (positive negative boundary security accessibility performance compliance regression); exploratory charters; peer review; approval; duplication detection; coverage and change impact |
| **Key information objects** | Design draft; Exploratory charter; Review record |
| **User actions** | Author; peer review; approve; detect duplicates |
| **Inputs** | Requirements; templates; optional AI drafts |
| **Outputs** | Approved verifications in Library |
| **Lifecycle states** | Draft → Peer review → Approved → Rejected |
| **Approval requirements** | Peer review plus approver for shared assets |
| **Evidence requirements** | Design notes may attach |
| **Permissions considerations** | Designer vs approver separation |
| **Audit considerations** | Approvals audited |
| **AI assistance opportunities** | AI drafting and duplication detection when enabled |
| **Manual-operation support** | Manual creation is primary MVP path |
| **Automation support** | Mark automation candidates |
| **Integration touchpoints** | None special beyond Platform |
| **Relationships with other modules** | Writes Library; reads Requirements |
| **MVP scope** | Manual and template design; review; approve; coverage impact basic |
| **Later-phase scope** | AI draft; bulk creation; advanced impact analysis |
| **Explicit exclusions** | Auto-approve AI content |
| **Success measures** | Design cycle time; coverage after design |

## M06 — Execution and Sessions

| Field | Definition |
| ----- | ---------- |
| **Purpose** | Plan and execute verification runs and human sessions |
| **Business problem addressed** | Undocumented execution and weak results |
| **Primary value** | Governed execution with step results and evidence capture |
| **Primary users** | Manual Tester; QA Engineer |
| **Secondary users** | Automation Engineer; Exploratory Tester |
| **Core capabilities** | Runs; sessions; manual/automated/hybrid; queues; planning; assignees; environments; builds; versions; test data; live progress; step-level results; comments; evidence capture; failures; blocked; retries/reruns/retesting; bulk updates; pause/resume/handover; history |
| **Key information objects** | Run; Session; Step result |
| **User actions** | Plan; assign; execute; pause; hand over; complete; retest |
| **Inputs** | Approved verifications; build/environment references; automation ingest |
| **Outputs** | Completed results and evidence links |
| **Lifecycle states** | Planned → In progress → Paused → Completed → Cancelled |
| **Approval requirements** | Optional session sign-off |
| **Evidence requirements** | Evidence attach during or after execution |
| **Permissions considerations** | Assignee execute rights |
| **Audit considerations** | Result mutations audited |
| **AI assistance opportunities** | Flaky narratives when AI enabled |
| **Manual-operation support** | Full manual sessions first-class |
| **Automation support** | Ingest automated runs into same result model |
| **Integration touchpoints** | CI metadata |
| **Relationships with other modules** | Feeds Defects Evidence Readiness |
| **MVP scope** | Manual sessions; runs; results; retest; evidence attach |
| **Later-phase scope** | Advanced hybrid; continuous instances |
| **Explicit exclusions** | Becoming a test runner |
| **Success measures** | Session completion rate; blocked aging |

## M07 — Automation Management

| Field | Definition |
| ----- | ---------- |
| **Purpose** | Product-management view of automation assets and health — not a runner |
| **Business problem addressed** | Opaque automation and unknown flakiness |
| **Primary value** | Govern automation references and ingested health |
| **Primary users** | Automation Engineer |
| **Secondary users** | QA Manager; Developer |
| **Core capabilities** | Automation assets/references; framework identification; repository/pipeline/runner linkage; status; last execution; result ingestion; flaky tracking; manual-to-automation candidates; automation coverage; ownership; health |
| **Key information objects** | Automation asset; Ingest record; Flaky signal |
| **User actions** | Register references; view health; triage flaky; promote candidates |
| **Inputs** | CI connectors; library automation identifiers |
| **Outputs** | Ingested results into Execution |
| **Lifecycle states** | Registered → Healthy / Degraded / Stale |
| **Approval requirements** | Review to promote manual-to-auto candidates |
| **Evidence requirements** | Keep automation logs as evidence references |
| **Permissions considerations** | Automation admin roles |
| **Audit considerations** | Ingest failures audited |
| **AI assistance opportunities** | Candidate suggestions when AI enabled |
| **Manual-operation support** | Manual verification remains independent |
| **Automation support** | Core purpose: govern automation results |
| **Integration touchpoints** | GitHub; GitLab; Azure DevOps pipelines |
| **Relationships with other modules** | Links Execution and Library |
| **MVP scope** | Register assets; GitHub-oriented ingest path; flaky list |
| **Later-phase scope** | Broader frameworks; AI candidates |
| **Explicit exclusions** | Owning runners or pipelines |
| **Success measures** | Percent automated results linked into SoR |

## M08 — Defects and Quality Issues

| Field | Definition |
| ----- | ---------- |
| **Purpose** | Track defects and quality issues linked to verification and requirements |
| **Business problem addressed** | Defects disconnected from evidence and requirements |
| **Primary value** | Closed-loop defect quality |
| **Primary users** | QA Engineer; Developer |
| **Secondary users** | Product Owner; Support |
| **Core capabilities** | Defect repository; creation; classification; severity/priority/impact/risk; affected requirements/verifications/releases/environments; evidence; root cause; resolution; retesting; closure/reopening; duplicate detection; external issue linkage/sync; quality observations; improvement actions; known limitations |
| **Key information objects** | Defect; Quality issue; Known limitation |
| **User actions** | Create; classify; link; resolve; retest; sync externally |
| **Inputs** | Execution failures; manual findings |
| **Outputs** | Resolved/closed defects with retest proof |
| **Lifecycle states** | New → Triaged → In progress → Resolved → Retest → Closed → Reopened |
| **Approval requirements** | Optional severity gates |
| **Evidence requirements** | Attach failure evidence |
| **Permissions considerations** | Defect create/update roles |
| **Audit considerations** | State changes audited |
| **AI assistance opportunities** | Clustering when AI enabled |
| **Manual-operation support** | Create from manual sessions |
| **Automation support** | Link automation failures |
| **Integration touchpoints** | Optional Jira Linear Azure DevOps |
| **Relationships with other modules** | Links Execution Requirements Releases |
| **MVP scope** | Full defect lifecycle plus external link reference |
| **Later-phase scope** | Advanced sync; QI clustering |
| **Explicit exclusions** | Full ITSM replacement |
| **Success measures** | Escape defect rate; retest pass rate |

## M09 — Evidence

| Field | Definition |
| ----- | ---------- |
| **Purpose** | Govern evidence artefacts and packs for trustworthy claims |
| **Business problem addressed** | Claims without artefacts |
| **Primary value** | Evidence-first quality |
| **Primary users** | QA; Release Manager; Auditor |
| **Secondary users** | Compliance; Automation Engineer |
| **Core capabilities** | Evidence repository for screenshots videos documents logs API outputs automation results performance security accessibility AI reports human observations approval records digital sign-offs; metadata; ownership; retention; review; integrity; versioning; certification locking; packs; export; chain of custody |
| **Key information objects** | Evidence item; Evidence pack |
| **User actions** | Capture; review; pack; export; lock on certification |
| **Inputs** | Execution; approvals; optional AI reports |
| **Outputs** | Exportable and lockable packs |
| **Lifecycle states** | Captured → Reviewed → Packaged → Locked (on certification approve) |
| **Approval requirements** | Reviewer for certification packs |
| **Evidence requirements** | Core module |
| **Permissions considerations** | Evidence access roles |
| **Audit considerations** | Access and export audited |
| **AI assistance opportunities** | AI reports attach only as non-authoritative until accepted |
| **Manual-operation support** | Human observations first-class |
| **Automation support** | Automation outputs as references |
| **Integration touchpoints** | Platform Documents/storage patterns |
| **Relationships with other modules** | Feeds Certification and Audit |
| **MVP scope** | Capture; pack; retention intent; export; lock on certify |
| **Later-phase scope** | Advanced chain-of-custody UX |
| **Explicit exclusions** | Generic document management platform |
| **Success measures** | Percent certification decisions with locked packs |

## M10 — Traceability

| Field | Definition |
| ----- | ---------- |
| **Purpose** | End-to-end links across quality objects with gap detection |
| **Business problem addressed** | Orphans and unsupported certification claims |
| **Primary value** | Visible coverage and gaps |
| **Primary users** | Business Analyst; QA Manager; Auditor |
| **Secondary users** | Product Owner; Release Manager |
| **Core capabilities** | Trace among business objectives requirements verification execution evidence defects risks releases approvals certification source changes automation assets AI recommendations; forward/backward views; coverage gaps; orphaned requirements; unlinked verification; unverified changes; unsupported certification claims |
| **Key information objects** | Trace link; Coverage view |
| **User actions** | Build matrix; find gaps; export |
| **Inputs** | Links from SoR objects |
| **Outputs** | Coverage and gap reports |
| **Lifecycle states** | Derived views refresh on change |
| **Approval requirements** | Not applicable |
| **Evidence requirements** | Gap reports includable in packs |
| **Permissions considerations** | Permission-filtered graphs |
| **Audit considerations** | Exports audited |
| **AI assistance opportunities** | Gap explanations when AI enabled |
| **Manual-operation support** | Manual link maintenance supported |
| **Automation support** | Auto-link automation identifiers where mapped |
| **Integration touchpoints** | Search |
| **Relationships with other modules** | Spans core SoR modules |
| **MVP scope** | Matrix; gaps; orphans; export |
| **Later-phase scope** | AI recommendation links; change impact |
| **Explicit exclusions** | Separate GRC suite |
| **Success measures** | Orphan requirement count |

## M11 — Risk Management

| Field | Definition |
| ----- | ---------- |
| **Purpose** | Govern quality and release risks with human acceptance |
| **Business problem addressed** | Informal risk decisions |
| **Primary value** | Risk-based prioritisation and accepted residual risk |
| **Primary users** | QA Manager; Release Manager; Compliance |
| **Secondary users** | Product Owner; Security Officer |
| **Core capabilities** | Quality product release requirement verification operational security compliance risks; scoring; ownership; treatment; acceptance; evidence; residual risk; trends; AI-assisted recommendations with human approval |
| **Key information objects** | Risk; Risk acceptance |
| **User actions** | Score; treat; accept; link evidence |
| **Inputs** | Requirements; releases; defects |
| **Outputs** | Accepted residual risk records |
| **Lifecycle states** | Open → Treating → Accepted → Closed |
| **Approval requirements** | Human approval for risk acceptance |
| **Evidence requirements** | Risk evidence links |
| **Permissions considerations** | Risk approver roles |
| **Audit considerations** | Acceptances audited |
| **AI assistance opportunities** | AI risk suggestions when enabled |
| **Manual-operation support** | Fully manual scoring |
| **Automation support** | Not a runner module |
| **Integration touchpoints** | None special |
| **Relationships with other modules** | Feeds Release Readiness and Certification |
| **MVP scope** | Basic risk register; accept; link to release |
| **Later-phase scope** | Advanced trends; AI assist |
| **Explicit exclusions** | Enterprise GRC platform replacement |
| **Success measures** | Accepted risks with owners |

## M12 — Release Readiness

| Field | Definition |
| ----- | ---------- |
| **Purpose** | Aggregate go/no-go confidence for a release |
| **Business problem addressed** | Ambiguous release status |
| **Primary value** | Explainable readiness for accountable humans |
| **Primary users** | Release Manager; Product Owner |
| **Secondary users** | Executive; QA Manager |
| **Core capabilities** | Release records; scope; included requirements/changes/defects; verification status; evidence completeness; open risks/defects; waivers/exceptions; approval readiness; gates; readiness score; explanation; missing actions; comparisons; history; executive release view |
| **Key information objects** | Release; Gate; Waiver; Readiness snapshot |
| **User actions** | Assess; approve waivers; compare; hand to certification |
| **Inputs** | Traceability; defects; evidence; risk |
| **Outputs** | Readiness snapshot |
| **Lifecycle states** | Draft → Assessing → Ready / Not ready → Handed to certification |
| **Approval requirements** | Waiver approvals |
| **Evidence requirements** | Completeness checks against policy |
| **Permissions considerations** | Release permissions |
| **Audit considerations** | Snapshots audited |
| **AI assistance opportunities** | Narrative explanation when AI enabled |
| **Manual-operation support** | Manual assessment fully usable |
| **Automation support** | Includes automation status in gates |
| **Integration touchpoints** | None special |
| **Relationships with other modules** | Inputs Certification |
| **MVP scope** | Gates; score; waivers; executive view; explanation |
| **Later-phase scope** | Comparisons; predictive signals |
| **Explicit exclusions** | Automatic production deployment |
| **Success measures** | Ready releases with human-readable explanation |

## M13 — Certification

| Field | Definition |
| ----- | ---------- |
| **Purpose** | Human certification decisions with immutable history |
| **Business problem addressed** | Unchecked release claims |
| **Primary value** | Accountable certification System of Record |
| **Primary users** | Release Manager; Auditor |
| **Secondary users** | Compliance; Executive |
| **Core capabilities** | Certification request; scope; criteria/policy; evidence/gate/risk thresholds; required approvers; human accountability; review; decisions (Approved; Approved with qualifications; Rejected; Withdrawn; Expired; Superseded); evidence pack; statement; history; reproduction; audit; continuous certification signals that never independently change formal status |
| **Key information objects** | Certification; Certification pack; Certification decision |
| **User actions** | Request; review; decide; reproduce history |
| **Inputs** | Readiness and locked evidence packs |
| **Outputs** | Immutable decision and pack |
| **Lifecycle states** | Requested → In review → Decided → Expired/Superseded |
| **Approval requirements** | Mandatory human multi-role approval as configured |
| **Evidence requirements** | Locked packs on approve |
| **Permissions considerations** | Certifier roles; separation of duties |
| **Audit considerations** | All decisions immutably audited |
| **AI assistance opportunities** | Recommendations only; never decide |
| **Manual-operation support** | Fully human certification path |
| **Automation support** | Automation signals may request re-certification only |
| **Integration touchpoints** | Audit |
| **Relationships with other modules** | Consumes Readiness and Evidence |
| **MVP scope** | Human certify; qualifications; reject; history; reproduce |
| **Later-phase scope** | Continuous signal UX |
| **Explicit exclusions** | Auto-certify paths |
| **Success measures** | Certification decisions with human actors recorded |

## M14 — Quality Intelligence

| Field | Definition |
| ----- | ---------- |
| **Purpose** | Explainable decision support — never silent accountable decisions |
| **Business problem addressed** | Dashboards without insight |
| **Primary value** | Explainable quality confidence |
| **Primary users** | Executive; QA Manager; Release Manager |
| **Secondary users** | Product Owner |
| **Core capabilities** | Quality indicators; coverage/risk/defect/maturity/release intelligence; trends; predictive signals; quality debt; quality confidence; gaps; recurring failures; high-risk components; executive views; explainable scoring; data confidence; recommendations |
| **Key information objects** | Quality indicator; Insight; Score explanation |
| **User actions** | Explore; explain; export recommendations for humans |
| **Inputs** | SoR metrics |
| **Outputs** | Insights with explanations |
| **Lifecycle states** | Derived |
| **Approval requirements** | Humans decide; QI never certifies |
| **Evidence requirements** | Insight exports optional |
| **Permissions considerations** | Permission-filtered |
| **Audit considerations** | Access to sensitive scores audited |
| **AI assistance opportunities** | Core consumer of AI analytics when enabled |
| **Manual-operation support** | Works with non-AI analytics |
| **Automation support** | Uses automation health signals |
| **Integration touchpoints** | Platform Analytics adjacency |
| **Relationships with other modules** | Reads Execution Defects Risk Certification |
| **MVP scope** | Basic indicators and explainability stubs |
| **Later-phase scope** | Predictive signals; advanced debt |
| **Explicit exclusions** | Autonomous decisions |
| **Success measures** | Insight adoption without automatic actions |

## M15 — Reporting and Analytics

| Field | Definition |
| ----- | ---------- |
| **Purpose** | Operational and executive reporting and exports |
| **Business problem addressed** | Reporting silos |
| **Primary value** | Role-appropriate reports and certification exports |
| **Primary users** | Managerial personas |
| **Secondary users** | Auditor; Compliance |
| **Core capabilities** | Executive portfolio project requirement verification execution defect release certification compliance AI risk trend dashboards; custom/scheduled reports; exports; certification packs; saved views; role-specific analytics |
| **Key information objects** | Report; Dashboard; Export |
| **User actions** | Run; schedule; export; save views |
| **Inputs** | SoR aggregates |
| **Outputs** | Reports and packs |
| **Lifecycle states** | Not applicable |
| **Approval requirements** | Not applicable |
| **Evidence requirements** | Certification pack exports |
| **Permissions considerations** | Report permissions |
| **Audit considerations** | Exports audited |
| **AI assistance opportunities** | AI dashboards when AI enabled |
| **Manual-operation support** | Manual-era reports sufficient for MVP |
| **Automation support** | Automation charts |
| **Integration touchpoints** | Optional Platform Analytics |
| **Relationships with other modules** | Reads all modules |
| **MVP scope** | Standard dashboards and export |
| **Later-phase scope** | Custom builder; scheduling |
| **Explicit exclusions** | Embedding Metabase chrome for standard users |
| **Success measures** | Export completeness for audits |

## M16 — Knowledge and Learning

| Field | Definition |
| ----- | ---------- |
| **Purpose** | Reusable quality knowledge that compounds |
| **Business problem addressed** | Lessons lost between releases |
| **Primary value** | Searchable approved knowledge |
| **Primary users** | QA Manager; Business Analyst |
| **Secondary users** | All practitioners |
| **Core capabilities** | Quality knowledge base; lessons learned; reusable verification knowledge; known risks/defects; root-cause knowledge; best practices; standards; policies; guidance; historical release insights; reusable evidence patterns; reusable prompts; knowledge review/approval/search/reuse; continuous improvement records |
| **Key information objects** | Knowledge item; Prompt knowledge |
| **User actions** | Author; review; approve; reuse |
| **Inputs** | Certification and release outcomes |
| **Outputs** | Approved knowledge |
| **Lifecycle states** | Draft → Approved → Deprecated |
| **Approval requirements** | Knowledge approval |
| **Evidence requirements** | Not applicable |
| **Permissions considerations** | KB roles |
| **Audit considerations** | Publishes audited |
| **AI assistance opportunities** | Grounds AI when enabled |
| **Manual-operation support** | Fully human KB |
| **Automation support** | Not applicable |
| **Integration touchpoints** | Search |
| **Relationships with other modules** | Feeds AI and Design |
| **MVP scope** | Minimal KB CRUD optional |
| **Later-phase scope** | Full KB; prompt library depth |
| **Explicit exclusions** | Generic organisation wiki replacement |
| **Success measures** | Reuse citations in designs |

## M17 — AI Quality Workspace

| Field | Definition |
| ----- | ---------- |
| **Purpose** | Governed AI assistance for quality engineering tasks |
| **Business problem addressed** | Ungoverned AI test sprawl |
| **Primary value** | Productive AI under Constitution |
| **Primary users** | QA Engineer; Business Analyst |
| **Secondary users** | AI Agent (constrained actor) |
| **Core capabilities** | AI quality agents; sessions; recommendations; requirement analysis; verification generation; coverage/regression/risk analysis; defect clustering; root-cause assistance; release-readiness and certification recommendations; natural-language querying; knowledge-aware responses; prompt library/templates/versions; provider selection; AI approval queues; AI audit history; explainability; confidence; feedback; reject/correct; AI-generated content status (Draft Reviewed Approved Rejected Superseded) |
| **Key information objects** | AI session; Recommendation; Prompt |
| **User actions** | Request; review; accept/reject; configure prompts |
| **Inputs** | Permission-filtered SoR and Knowledge |
| **Outputs** | Accepted drafts into SoR modules only after human accept |
| **Lifecycle states** | Draft → Reviewed → Approved/Rejected → Superseded |
| **Approval requirements** | Human accept before SoR; never certify |
| **Evidence requirements** | AI reports attach only if accepted policy allows |
| **Permissions considerations** | AI entitlements |
| **Audit considerations** | All privileged AI audited |
| **AI assistance opportunities** | Module purpose |
| **Manual-operation support** | Product fully usable with AI disabled |
| **Automation support** | Not a runner |
| **Integration touchpoints** | AI providers via Integration Centre |
| **Relationships with other modules** | Writes only via accept into Design and related modules |
| **MVP scope** | Governance plumbing and feature flags default OFF |
| **Later-phase scope** | Enabled generation/review after Owner AI programme |
| **Explicit exclusions** | Autonomous certification; AI as SoR |
| **Success measures** | Zero auto-certify incidents; accept rate when enabled |

## M18 — MCP and Developer Experience

| Field | Definition |
| ----- | ---------- |
| **Purpose** | Governed IDE and agent product experience |
| **Business problem addressed** | Agents bypass System of Record |
| **Primary value** | IDE-native quality engineering without losing control |
| **Primary users** | Developer; Automation Engineer; AI Agent |
| **Secondary users** | QA Engineer |
| **Core capabilities** | Experiences for Cursor VS Code Windsurf Replit Kilo and future IDEs; governed MCP capabilities to retrieve approved requirements verification context standards known defects release scope missing coverage; propose verification; submit drafts and evidence references; retrieve execution results and certification readiness; request quality explanations — all authenticated authorised scoped audited traceable revocable and subject to human approval where required |
| **Key information objects** | MCP client session; Tool invocation |
| **User actions** | Connect; invoke allowed tools; submit proposals |
| **Inputs** | Platform identity session |
| **Outputs** | Proposals into human approval queues |
| **Lifecycle states** | Connected → Active → Revoked |
| **Approval requirements** | Human approval for mutating proposals |
| **Evidence requirements** | Not applicable |
| **Permissions considerations** | Tool-level permissions |
| **Audit considerations** | Every tool call audited |
| **AI assistance opportunities** | Primary agent channel |
| **Manual-operation support** | Read tools may ship before AI UX |
| **Automation support** | Retrieve automation results |
| **Integration touchpoints** | MCP clients in Integration Centre |
| **Relationships with other modules** | Into Design Execution Evidence queues |
| **MVP scope** | Definition of catalogue; optional read-only later; not required ON for MVP value |
| **Later-phase scope** | Draft propose and gated write maturity |
| **Explicit exclusions** | Unrestricted database access; autonomous certify; workflow bypass |
| **Success measures** | Authorised tool-call compliance |

## M19 — Integration Centre

| Field | Definition |
| ----- | ---------- |
| **Purpose** | Catalogue and health of product integrations |
| **Business problem addressed** | Shadow integrations |
| **Primary value** | Governed integration inventory |
| **Primary users** | Platform Administrator; Third-party Integrator |
| **Secondary users** | Operations |
| **Core capabilities** | Integration catalogue; configured integrations; health; connection status; permissions; data direction; synchronisation status; failures; retries; audit; webhooks; API clients; MCP clients; AI providers; IDE clients; ALM; source control; CI; automation frameworks; documents; notifications; observability; Platform Service integrations |
| **Key information objects** | Integration; Connection; Webhook subscription |
| **User actions** | Configure; monitor; disable; audit |
| **Inputs** | External systems via Platform Services and connectors |
| **Outputs** | Health and synchronisation status |
| **Lifecycle states** | Configured → Healthy / Degraded / Disabled |
| **Approval requirements** | Admin approval for new connections |
| **Evidence requirements** | Not applicable |
| **Permissions considerations** | Integration admin |
| **Audit considerations** | Configuration changes audited |
| **AI assistance opportunities** | Provider entries for AI |
| **Manual-operation support** | Manual import/export path independent |
| **Automation support** | CI connections |
| **Integration touchpoints** | All external touchpoints |
| **Relationships with other modules** | Enables Automation Defects AI MCP |
| **MVP scope** | Platform integrations plus GitHub ingest path |
| **Later-phase scope** | Broader ALM/CI/AI providers |
| **Explicit exclusions** | Module-to-engine direct calls |
| **Success measures** | Integration health uptime |

## M20 — Administration

| Field | Definition |
| ----- | ---------- |
| **Purpose** | Tenant organisation team user and policy configuration |
| **Business problem addressed** | Unsafe defaults and entitlement chaos |
| **Primary value** | Enterprise-ready administration |
| **Primary users** | Tenant Administrator; Platform Administrator |
| **Secondary users** | Security Officer |
| **Core capabilities** | Tenants; organisations; business units; teams; users; roles; permissions; policies; groups; licensing; subscription; feature entitlements; configuration; custom fields; statuses; workflows; templates; retention; evidence; certification; risk; AI; prompt; integration policies; audit access; security settings; branding; localisation |
| **Key information objects** | Tenant; Role; Policy; Entitlement |
| **User actions** | Configure policies; assign roles; manage entitlements |
| **Inputs** | Platform Identity and PermissionService |
| **Outputs** | Configured tenant |
| **Lifecycle states** | Active policies versioned |
| **Approval requirements** | Optional dual-control for sensitive policy changes |
| **Evidence requirements** | Retention policies govern evidence |
| **Permissions considerations** | Admin roles least privilege |
| **Audit considerations** | All admin changes audited |
| **AI assistance opportunities** | AI policy defaults OFF |
| **Manual-operation support** | Manual administration complete |
| **Automation support** | Not applicable |
| **Integration touchpoints** | Identity Platform |
| **Relationships with other modules** | Constrains all modules |
| **MVP scope** | Users; roles; policies; retention defaults; branding basics |
| **Later-phase scope** | Advanced entitlements; localisation depth |
| **Explicit exclusions** | Custom IAM product replacement |
| **Success measures** | Policy change audit completeness |

## M21 — Audit and Compliance

| Field | Definition |
| ----- | ---------- |
| **Purpose** | Immutable investigation and compliance reporting |
| **Business problem addressed** | Missing who/when for privileged actions |
| **Primary value** | Prove actions and certifications |
| **Primary users** | Auditor; Compliance Officer |
| **Secondary users** | Security Officer |
| **Core capabilities** | Audit history; user activity; approval history; AI activity; prompt activity; integration activity; evidence activity; certification activity; policy changes; permission changes; export history; retention; legal hold; compliance reporting; audit investigation; immutable records where required |
| **Key information objects** | Audit event; Legal hold; Compliance report |
| **User actions** | Search; export; place hold; investigate |
| **Inputs** | Events from all modules |
| **Outputs** | Investigation packs |
| **Lifecycle states** | Append-only for immutable classes |
| **Approval requirements** | Not applicable |
| **Evidence requirements** | Holds protect evidence |
| **Permissions considerations** | Auditor roles |
| **Audit considerations** | Access to audit is itself audited |
| **AI assistance opportunities** | AI activity included when AI on |
| **Manual-operation support** | Works without AI |
| **Automation support** | Not applicable |
| **Integration touchpoints** | Platform Audit |
| **Relationships with other modules** | Observes Certification Administration AI |
| **MVP scope** | Search; export; certification/approval history; legal hold intent |
| **Later-phase scope** | Advanced compliance packs |
| **Explicit exclusions** | Replacing Platform Audit subsystem |
| **Success measures** | Investigation time for cert events |

## M22 — Search and Navigation

| Field | Definition |
| ----- | ---------- |
| **Purpose** | Find and navigate across quality objects |
| **Business problem addressed** | Lost in tool sprawl |
| **Primary value** | Permission-filtered discovery |
| **Primary users** | All users |
| **Secondary users** | AI Agent via NL when enabled |
| **Core capabilities** | Global search; contextual search; saved searches; filters; search across requirements verification runs evidence defects risks releases certification knowledge audit; natural-language quality search when AI enabled; recent items; favourites; pinned workspaces; breadcrumbs; context panels |
| **Key information objects** | Saved search; Navigation pin |
| **User actions** | Search; save; pin; navigate |
| **Inputs** | All permissioned objects |
| **Outputs** | Result sets |
| **Lifecycle states** | Not applicable |
| **Approval requirements** | Not applicable |
| **Evidence requirements** | Not applicable |
| **Permissions considerations** | Results permission-filtered |
| **Audit considerations** | Sensitive object access via search audited |
| **AI assistance opportunities** | NL quality search when AI enabled |
| **Manual-operation support** | Keyword search in MVP |
| **Automation support** | Not applicable |
| **Integration touchpoints** | Platform Search providers |
| **Relationships with other modules** | Entry point to all modules |
| **MVP scope** | Global search; recent; pins; breadcrumbs |
| **Later-phase scope** | NL quality search |
| **Explicit exclusions** | Standalone search product |
| **Success measures** | Search success rate; zero-result rate |
