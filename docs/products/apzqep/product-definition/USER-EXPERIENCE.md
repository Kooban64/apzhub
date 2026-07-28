# APZ QEP — User Experience Definition

> **Programme:** APZQEP-DEF-002  
> **Rule:** Experience intent only — no mock-ups, wireframes, or technical UI specs  
> **Preserved from DEF-001:** Principles, patterns, accessibility baseline, APZHUB shell regions

## Experience principles

| Principle | Meaning |
| --------- | ------- |
| Role-aware | Surfaces follow permissions and workspace |
| Task-oriented | Workspaces optimise jobs-to-be-done |
| Progressive disclosure | Complexity appears when needed |
| Context preservation | Cross-module navigation keeps object context |
| Search-first access | Global search reaches SoR objects quickly |
| Evidence before opinion | Claims show artefacts |
| Human gates visible | Approvals and cert decisions are explicit |
| AI clearly labelled | Suggestions never silent SoR writes |
| Manual first-class | Manual sessions are polished, not second-class |
| Honest empty states | Limitations and next actions clear |

## Overall experience philosophy

APZ QEP is a **confidence platform**, not a test tool. Every surface should help a human answer: *Can this software be released with sufficient confidence?* The experience prioritises **accountability, traceability, and clarity** over volume of data or speed of clicks.

Users should always understand **where they are** (scope, release, object), **what they can do** (permission-filtered actions), and **what the system will not decide for them** (certification, approvals, authoritative writes from AI). Complexity is introduced progressively: daily operators see task-focused workspaces; governance roles see gates, packs, and audit trails when their job requires them.

The product sits inside the APZHUB desktop shell. Navigation follows fixed regions — Activity Bar → Sidebar → Workspace → Context — at product-intent level. QEP does not invent parallel navigation paradigms; it registers modules and objects into the platform model described in [NAVIGATION-MAP.md](./NAVIGATION-MAP.md).

Experience quality is measured by **time-to-trusted-action** (open assigned work, complete a session, approve with evidence visible) rather than feature count. When AI and automation are disabled (MVP default), the product must feel complete and professional — not “lite” or “waiting for AI.”

## Role-specific experiences

Each persona receives a **primary workspace** — a composed Home layout, default module emphasis, and saved views — without gaining permissions they do not hold. See [ROLE-WORKSPACES.md](./ROLE-WORKSPACES.md) and [PERSONAS.md](./PERSONAS.md).

| Experience tier | Who | What they feel |
| --------------- | --- | -------------- |
| Command | Executive, Release Manager | Exceptions, gates, certification posture — not operational noise |
| Design & govern | QA Manager, QA Engineer, BA | Coverage, design quality, traceability, approval queues |
| Execute | Manual Tester, Automation Engineer | Assigned work, session flow, evidence capture, defect raise |
| Fix & integrate | Developer, Integrator | Defect context, failure evidence, integration health |
| Assure & investigate | Auditor, Compliance, Security | Immutable history, export, policy visibility |
| Administer | Tenant / Platform Admin | Policy, users, entitlements — separated from daily quality work |

Role-specific experiences **share the same object model and navigation grammar**. A Manual Tester and Release Manager both open a Verification Session, but the Release Manager’s Home emphasises readiness widgets and cert queues while the tester’s emphasises assigned sessions. Secondary workspace pins are personal preferences, not permission grants.

Executives and customer representatives receive **aggregated, explainable views** with drill-down to evidence — never raw execution clutter. AI Agent actors have no UI workspace; their experience is governed through MCP policy (see [MCP-WORKFLOWS.md](./MCP-WORKFLOWS.md)).

## Workspace behaviour

A **workspace** is a role-aware composition of Home widgets, primary modules, default filters, and saved views. Workspaces are product UX structure — not deployment units.

When a user enters QEP, their primary workspace determines: default Home widget set, which Activity Bar items appear first in the sidebar, default project/release context if one was last used, and suggested saved views (e.g. “My open sessions,” “Pending my approval”).

Workspace behaviour rules:

- **Persistence:** Last project, release, and filter context restore on return unless permission or lifecycle state invalidates them.
- **Switching:** Users may pin secondary workspaces; switching changes emphasis, not access.
- **Scope carry-over:** Moving from Requirements → Verification → Execution retains requirement or verification context in breadcrumbs and context panel where applicable.
- **Draft recovery:** In-progress manual sessions and unsubmitted reviews should survive navigation away within policy limits.
- **Permission re-validation:** Restored context re-checks permissions; stale deep links show an honest “no access” or “object archived” state — not silent empty lists.

## Navigation consistency

Navigation is **global, permission-filtered, and object-aware**. The same object types use consistent labels, detail page patterns, and related-object panels across modules. Verification Library and Verification Design both refer to “Verification,” not mixed “test case” product language (DEF-D-001).

Consistency expectations:

- **Activity Bar:** Stable module order; hidden items never appear as dead links.
- **Breadcrumbs:** Tenant → Portfolio/Project → Module → Object → Sub-view; Release and Certification hubs insert release scope when active.
- **Context panel:** Related requirements, verifications, runs, evidence, defects, and approvals on object detail pages follow a predictable panel order.
- **Cross-links:** Traceability, Evidence, and Certification deep-link with preserved object identity — not generic list landing.
- **Administration vs quality work:** Admin surfaces use a distinct navigation subtree so operators do not confuse policy changes with daily execution.

Full navigation area definitions: [NAVIGATION-MAP.md](./NAVIGATION-MAP.md).

## Search-first philosophy

Search is a **primary access path**, not a fallback. Users should reach any SoR object they are permitted to see faster via search than via manual tree navigation for known identifiers, titles, or recent work.

Search-first principles:

- Global search indexes principal product objects (requirements, verifications, sessions, defects, evidence, releases, certifications, risks, knowledge) with permission filtering at query time.
- Search results show **object type, scope, status, and owner** so users disambiguate duplicates.
- Contextual search within a project or release narrows results without requiring advanced query syntax.
- Recent items and favourites complement search for high-frequency objects.
- Search never surfaces objects the user cannot open; result counts must not leak existence of restricted records beyond policy.

Command palette integration (when APZHUB UCP is available) follows the same permission and object model as module search.

## Accessibility

Accessibility is a **first-class product requirement**, not a post-release patch. Target: **WCAG 2.1 Level AA** for all primary flows.

| Topic | Definition |
| ----- | ---------- |
| Perceivable | Semantic structure; meaningful headings; colour not sole status indicator |
| Operable | Keyboard-complete primary flows; sufficient focus visibility; no time limits on approvals without extension |
| Understandable | Consistent labels aligned to [PRODUCT-GLOSSARY.md](./PRODUCT-GLOSSARY.md); errors explain remediation |
| Robust | Screen reader support for primary objects and status changes |

Primary flows include: Home work queue, manual verification session step execution, evidence attach/view, defect create/link, approval accept/reject with reason, certification pack review, audit search/export initiation, and Administration user/role assignment.

Responsive posture: **desktop-first**; tablet acceptable for review/approve; mobile read-mostly (see Mobile principles in [NAVIGATION-MAP.md](./NAVIGATION-MAP.md)). Low-bandwidth: core flows usable with reduced media; evidence preview may degrade gracefully with download option.

## Keyboard support

All **primary flows** must be fully operable by keyboard without requiring pointer hover for essential actions.

| Flow category | Keyboard expectation |
| ------------- | -------------------- |
| Navigation | Activity Bar, sidebar, breadcrumbs, and search reachable and activatable |
| Manual verification | Step advance, pass/fail/blocked/NA, comment entry, evidence attach, session pause/complete |
| Review & approval | Queue navigation, open detail, accept/reject with mandatory reason field focus |
| Certification | Pack section navigation, decision actions, qualification entry when outcome requires it |
| Search | Open search, move results, open selection, return to prior context |
| Tables & lists | Sort, filter, row open where lists are primary (defect queues, audit results) |

Shortcuts must not override platform shell conventions. Custom shortcuts, when offered, are documented in-product and avoid conflicting with assistive technology.

## Review experience

**Review** is any human examination of quality artefacts before approval, certification, or promotion — requirements, verifications, evidence packs, automation promotion candidates, waivers.

Review experience intent:

- **Queues** surface “pending my review” with age, scope, and requestor — not buried in generic notifications alone.
- **Side-by-side context:** Reviewers see the artefact, its traceability links, prior versions/comments, and blocking dependencies.
- **Explicit outcomes:** Accept, reject, or request changes — each requiring rationale where policy demands.
- **No silent merge:** Accepted review writes are visible events in audit and object history.
- **Delegation visibility:** When review is reassigned, both parties see status.

Peer review of verifications and managerial sign-off of risk/waivers follow the same review grammar even when business rules differ.

## Evidence experience

Evidence is **proof**, not attachment clutter. Users attach, organise, and consume evidence without leaving execution or certification context.

| Moment | Experience intent |
| ------ | ----------------- |
| During execution | Attach from session step with minimal friction; link to external artefacts when integrated |
| After execution | Evidence appears on run/session and rolls up to packs |
| During certification | Pack review shows completeness, gaps, and locked artefacts post-decision |
| During audit | Evidence opens with integrity context (who/when/scope) — not editable after lock |

Claims in readiness and certification views **link to evidence** (“evidence before opinion”). Missing evidence is explicit in readiness explanations, not implied green status.

See [EVIDENCE-MODEL.md](./EVIDENCE-MODEL.md).

## Approval experience

**Approvals** are human decision records on requirements, verifications, waivers, promotions, and other gated transitions. Approvals are never implied by status colour alone.

Approval experience intent:

- Approvers see **what they are deciding, for which scope, and what happens next**.
- Reject and “request changes” require **reasons** captured for audit.
- Approval queues integrate with Home and notifications; overdue items escalate visually per policy.
- Separation of duties: users cannot approve their own submissions where policy forbids it — the UI explains the block.
- Approved with qualifications (certification-related) uses distinct outcome language from binary approve/reject on other objects.

AI recommendations may **prefill draft decisions** but never complete approvals without explicit human action.

## Manual verification experience

Manual verification is **first-class in MVP** (DEF-D-002). Manual testers must not feel relegated to a legacy form while automation gets the “real” product.

Manual session experience intent:

- **Assignment clarity:** Sessions show scope, environment, prerequisites, and linked verification steps.
- **Step execution:** Pass, fail, blocked, N/A with comments; blocked captures reason and optional defect link.
- **Progress:** Clear session progress, pause/resume, and completion sign-off where policy requires.
- **Evidence inline:** Capture during steps without navigating away.
- **Defect raise:** Fail/blocked paths offer frictionless defect creation pre-filled with context.
- **Offline-tolerant posture (product intent):** Session state survives transient connectivity loss where edition allows; sync conflicts surface honestly.

Exploratory sessions share execution module entry with different emphasis (charters, notes, time-box) — see [MANUAL-VERIFICATION.md](./MANUAL-VERIFICATION.md).

## Automation experience

Automation Management surfaces **health, ingestion, and quality signals** — not CI pipeline administration (DEF-D-008). Automation engineers monitor what QEP ingested, what failed to map, and what is flaky — then jump to Execution or Defects.

| Surface | Intent |
| ------- | ------ |
| Ingest status | Last run mapped, parse errors, orphaned results |
| Flaky / unstable signals | Trends prompting human review — not auto-waiver |
| Promotion queue | Automation candidates for verification library — human promotion |
| Failure drill-down | Link to execution results, evidence, and defects |

When automation is absent, Automation module areas show honest empty states directing users to manual execution — not broken placeholders.

## Executive experience

Executives need **portfolio posture and exceptions**, not session-level detail by default.

Executive experience intent:

- Home and Reporting emphasise: release readiness summary, certification status, top risks, escaped-defect trends, waiver exposure.
- Drill-down is **one click to explanation**, two clicks to evidence — never forced through operational modules first.
- Comparisons across projects/releases use consistent readiness language.
- No certification actions on executive dashboards by default (DEF-D-010).
- AI summaries, when enabled, are labelled and cite sources — never replace formal certification records.

## Audit experience

Auditors and compliance officers investigate **immutable activity** with search, filter, export, and correlation to certification and evidence.

Audit experience intent:

- Investigation starts from Audit module or object-level “view history” on sensitive records.
- Filters by actor, object type, action, time, project, release.
- Export produces human-readable packs suitable for external audit — without exposing unrelated tenant data.
- Certification and approval history are read-only; no delete or retroactive edit paths in UI.
- Drill from audit event to related evidence and certification locks.

## AI review experience

AI is **default OFF** for MVP (DEF-D-005). When enabled, AI assists — it never certifies, silently writes SoR, or auto-flips certification status.

AI review experience intent:

- All AI output is **clearly labelled** (draft, suggestion, confidence caveats per policy).
- Workflow: **draft → explain → accept/reject** — user action required for any SoR write.
- AI Quality Workspace and inline assists share the same labelling grammar.
- Users can see **what context** the AI used (linked requirements, verifications, defects) where policy allows.
- Rejected AI suggestions are dismissible with optional feedback — not persisted as authoritative records unless accepted.

See [AI-WORKFLOWS.md](./AI-WORKFLOWS.md).

## Notification philosophy

Notifications **direct attention**, they do not replace in-product queues. Platform Attention Engine delivers; QEP modules publish events — modules do not implement parallel notification subsystems.

| Category | Examples | UX intent |
| -------- | -------- | --------- |
| Action required | Approval pending, session assigned, cert decision needed | High salience; deep link to action |
| Awareness | Readiness changed, defect severity escalated | Medium; dismissible |
| Informational | Integration sync completed | Low; batched where possible |

Notifications respect role and permission: users are not notified about objects they cannot access. Digest and subscription behaviour follows platform policy. Notification text uses product glossary terms.

## Error handling

Errors must be **honest, actionable, and safe** — no raw integration or backend details exposed to standard users.

| Error class | User-facing intent |
| ----------- | ------------------ |
| Permission denied | Explain missing permission or role; suggest admin contact — not “404” disguise |
| Validation | Field-level or summary with fix guidance |
| Conflict | Concurrent edit, stale approval — show refresh/recover path |
| Integration unavailable | Name the integration generically; status in Integration Centre |
| Policy block | Gate not met, SoD violation — cite policy name and remediation |

Transient failures offer retry where appropriate. Destructive actions require confirmation with scope restated. Errors on certification or approval paths never leave ambiguous partial state without user-visible recovery guidance.

## Empty states

Empty states are **honest teaching moments**, not dead ends.

Each empty state should state: **why it is empty** (no data yet, no permission, feature not entitled, AI/automation disabled), **what the user can do next** (create, import, assign, contact admin), and **what the product does not do** where relevant (e.g. “QEP is not an ALM — link a project from Portfolio”).

Avoid fake placeholder data. Distinguish “zero records” from “filtered to zero.” Module-specific empty states align with [MODULE-CATALOGUE.md](./MODULE-CATALOGUE.md) MVP scope messaging.

## Large enterprise considerations

Enterprise deployments introduce scale, segregation, and governance constraints the experience must anticipate at product-intent level:

| Concern | Experience intent |
| ------- | ----------------- |
| Multi-tenant isolation | No cross-tenant leakage in search, recents, or favourites |
| Large portfolios | Pagination, saved views, and search-first access — not unbounded trees |
| Delegation & SoD | Approval and cert paths enforce policy with clear messaging |
| Regional / BU structure | Organisation and team scoping visible in navigation and filters |
| Long retention | Audit and certification history remain discoverable — archive ≠ hidden |
| Entitlements | Edition-gated modules (AI, MCP, advanced intelligence) show upgrade/admin path — not broken nav |
| Brand masking | Backend engine names never appear in standard user surfaces (APZHUB guardrail) |
| Operational continuity | Integration degradation surfaces in Home and Integration Centre — not silent staleness |

## Experience patterns

| Pattern | Intent |
| ------- | ------ |
| Command-centre | Home as situational awareness |
| Review and approval | Queues with accept/reject reasons |
| Evidence-capture | Attach during/after session without friction |
| Manual-verification | Step execution, pass/fail/blocked/na, comments |
| Automation-monitoring | Health and flaky signals, not pipeline admin |
| AI-review | Draft → explain → accept/reject |
| Certification | Pack review → human decision → immutable record |
| Executive | Aggregates and exceptions, not operational clutter |
| Audit | Investigation search/export |

## Related definition documents

| Document | Relationship |
| -------- | ------------ |
| [NAVIGATION-MAP.md](./NAVIGATION-MAP.md) | Navigation areas and entry points |
| [ROLE-WORKSPACES.md](./ROLE-WORKSPACES.md) | Workspace catalogue |
| [INFORMATION-ARCHITECTURE.md](./INFORMATION-ARCHITECTURE.md) | Object meanings and relationships |
| [PRODUCT-MODULES.md](./PRODUCT-MODULES.md) | Module areas supporting UX |
| [PRODUCT-DEFINITION-DECISIONS.md](./PRODUCT-DEFINITION-DECISIONS.md) | DEF-001 decisions preserved |
