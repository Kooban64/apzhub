# APZHUB Session Start

> **Purpose:** One-page launchpad for every new AI conversation and engineering session  
> **Audience:** AI agents, developers, reviewers  
> **Primary AI entry:** [AI-MANIFEST](./AI-MANIFEST.md) · detail [AI-BOOTSTRAP](./AI-BOOTSTRAP.md)  
> **Authoritative references:** [AI-CONTEXT](./AI-CONTEXT.md) · [CURRENT-MILESTONE](./CURRENT-MILESTONE.md) · [000 — Engineering Constitution](../000-apzhub-engineering-constitution.md)  
> **Related documents:** [PROJECT-INDEX](./PROJECT-INDEX.md) · [AI-WORKFLOW](./AI-WORKFLOW.md)  
> **Reading order:** **AI-MANIFEST first** — then this map / CURRENT-MILESTONE  
> **Last updated:** 2026-07-18  
> **Current status:** Active — **Phase 3 Product Engineering**; Platform Foundation **CLOSED** (FOUNDATION-001 **ACCEPTED**); SDK **OSS-100-11** frozen; no product programme authorised

---

## 1. Read these documents first (in order)

| Step   | Document                                                                                  | Why                                                  |
| ------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **1**  | [AI-MANIFEST](./AI-MANIFEST.md)                                                           | **Primary AI entry** — operational bootstrap         |
| **2**  | [CURRENT-MILESTONE](./CURRENT-MILESTONE.md)                                               | Where development stops; what is approved            |
| **3**  | [APZHUB-FOUNDATION-001](./APZHUB-FOUNDATION-001-Platform-Foundation-Completion-Report.md) | Platform Foundation COMPLETE — executive summary     |
| **4**  | [Product Engineering Framework](../products/README.md)                                    | Phase 3 product standards (APZHUB-PRODUCTS-000)      |
| **5**  | [AI-BOOTSTRAP](./AI-BOOTSTRAP.md)                                                         | Full operating manual (checklists, verification)     |
| **6**  | [SESSION-START](./SESSION-START.md)                                                       | This page — short navigation map                     |
| **7**  | [AI-CONTEXT](./AI-CONTEXT.md)                                                             | Platform rules, naming, things never to do           |
| **8**  | [APZHUB-CONSTITUTION](./APZHUB-CONSTITUTION.md)                                           | Immutable programme principles                       |
| **9**  | Task-specific sprint guide or backlog                                                     | Scope, constraints, stop condition for approved work |
| **10** | Relevant foundation docs (001–029) / product docs                                         | Area-specific standards                              |
| **11** | [AI-WORKFLOW](./AI-WORKFLOW.md)                                                           | How to plan, implement, validate, and stop           |

**Do not rely on historical chat threads.** If a prior conversation conflicts with these documents, the Knowledge Foundation wins.

---

## 2. How to identify the current milestone

1. Open **[CURRENT-MILESTONE](./CURRENT-MILESTONE.md)** — section **"Where development stops"**
2. Cross-check **[CURRENT-STATE](./CURRENT-STATE.md)** — completed milestones and versions
3. Check the latest entry in **[CHANGELOG.md](../../CHANGELOG.md)** under `[Unreleased]`
4. Find the most recent completion report in `docs/sprint/` or `docs/foundation/` for the milestone you are executing

**Signals that a milestone is current:**

| Signal                                          | Location                                    |
| ----------------------------------------------- | ------------------------------------------- |
| "Stop condition: await owner approval before …" | Completion report, backlog, strategy README |
| Status line at top of `docs/README.md`          | Programme-wide stop point                   |
| "Next approved milestone (pending owner)"       | CURRENT-MILESTONE                           |

**As of last update:** **Phase 3 Product Engineering** in force ([directive](./APZHUB-PHASE-3-Product-Engineering-Commencement.md)). Platform Foundation **CLOSED**. No product programme authorised — await Owner Approval (see [CURRENT-MILESTONE](./CURRENT-MILESTONE.md)).

---

## 3. Approved versus planned

| Status                    | Meaning                                 | How to recognise                                                                |
| ------------------------- | --------------------------------------- | ------------------------------------------------------------------------------- |
| **Complete**              | Delivered and closed                    | Completion report exists; backlog marked ✅                                     |
| **Approved / Authorised** | Owner has approved execution            | Owner approval doc, sprint guide says "APPROVED" or "implementation authorised" |
| **Recommended**           | Suggested next scope — **not approved** | "Recommended scope" in completion reports; no owner approval                    |
| **Planned**               | Documented but not authorised           | Backlog exists; no completion report; no owner approval                         |
| **Blocked**               | Cannot start until prerequisite         | CURRENT-MILESTONE "Blocked milestones" table                                    |
| **Deferred**              | Explicitly postponed                    | Review verdict (e.g. FIN-001 DEFER EXTRACTION)                                  |

**Authoritative approval sources:**

| Document                                                           | What it approves                  |
| ------------------------------------------------------------------ | --------------------------------- |
| [PCS-001 Owner Approval](../strategy/PCS-001-owner-approval.md)    | Master strategy and sequencing    |
| [PRH-000 Owner Acceptance](../reviews/PRH-000-Owner-Acceptance.md) | PCv2-01 implementation baseline   |
| Milestone header in user prompt                                    | e.g. `# OSS-100-03 — APPROVED`    |
| Completion report stop condition                                   | Defines what awaits approval next |

**Rule:** If status is unclear, **stop and ask the owner**. Do not implement planned or recommended work without explicit approval in the current conversation.

---

## 4. Where to find canonical architecture

| Topic                             | Canonical document                                                                                       |
| --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Supreme engineering authority** | [000 — Engineering Constitution](../000-apzhub-engineering-constitution.md)                              |
| **Layered architecture**          | [003 — System Architecture](../003-overall-system-architecture-design-principles.md)                     |
| **Frozen baseline**               | [Architecture Baseline v1.0](../architecture/APZHUB-Architecture-Baseline-v1.0.md)                       |
| **Platform Core**                 | [Platform Core Reference Architecture](../architecture/APZHUB-Platform-Core-Reference-Architecture.md)   |
| **Integration SDK**               | [Platform Integration SDK Architecture](../architecture/APZHUB-Platform-Integration-SDK-Architecture.md) |
| **OSS integration**               | [OSS Integration Master Architecture](../architecture/APZHUB-OSS-Integration-Master-Architecture.md)     |
| **Law Platform**                  | [Law Platform Reference Architecture](../architecture/APZHUB-Law-Platform-Reference-Architecture.md)     |
| **Projects / Plane**              | [Projects Capability Architecture](../architecture/APZHUB-Projects-Capability-Architecture.md)           |
| **Index of all architecture**     | [ARCHITECTURE-HANDBOOK](./ARCHITECTURE-HANDBOOK.md)                                                      |

SDK foundation specs: documents **024–029** in `docs/`.

---

## 5. Where to find the active backlog

| Need                    | Document                                                                                                        |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Summary index**       | [ACTIVE-BACKLOG](./ACTIVE-BACKLOG.md)                                                                           |
| **Integration SDK**     | [OSS-100 Backlog](../backlog/OSS-100-Platform-Integration-SDK-Backlog.md)                                       |
| **Projects / Plane**    | [OSS-101 Backlog](../backlog/OSS-101-Plane-Integration-Backlog.md)                                              |
| **Platform Core v2**    | [PCv2-01 Backlog](../backlog/PCv2-01-Backlog.md)                                                                |
| **APZ TCMS**            | [APZTCMS Backlog](../backlog/APZTCMS-Backlog.md) · [Milestone Roadmap](../backlog/APZTCMS-Milestone-Roadmap.md) |
| **Quality Engineering** | _(superseded)_ — use APZ TCMS; predecessor [QE Backlog](../backlog/APZHUB-Quality-Engineering-Backlog.md)       |
| **Law Platform**        | [LAW Platform Backlog](../backlog/LAW-Platform-Backlog.md) — closed                                             |
| **Full registry**       | [docs/README.md](../README.md) — Backlog section                                                                |

Always read the **full backlog document** before starting a story — the index is navigation only.

---

## 6. Authority when documents conflict

Higher rows win. Never override a higher source without owner approval and ADR.

```text
1. 000 — Engineering Constitution          ← supreme authority
2. Foundation documents 001–029
3. APZHUB-CONSTITUTION (Knowledge Foundation consolidation)
4. ADRs (docs/adr/)
5. Architecture documents (docs/architecture/)
6. Strategy documents (docs/strategy/)
7. Specifications (docs/specs/)
8. Backlogs (docs/backlog/)
9. Sprint guides and completion reports (docs/sprint/)
10. Code and inline comments
```

| If conflict between…                   | Resolve with…                                                  |
| -------------------------------------- | -------------------------------------------------------------- |
| Sprint guide vs 003 Architecture       | 003 wins — escalate if sprint claims exception                 |
| Backlog vs ADR                         | ADR wins                                                       |
| Strategy vs Architecture               | Architecture wins for technical truth; Strategy for sequencing |
| Chat history vs Knowledge Foundation   | Knowledge Foundation wins                                      |
| Completion report vs CURRENT-MILESTONE | CURRENT-MILESTONE reflects latest stop point                   |

---

## 7. Standard prompt template (new conversation)

Copy, fill in the bracketed fields, and paste at the start of a new AI session:

```markdown
# [MILESTONE-ID] — [MILESTONE TITLE]

## APPROVED / PLANNING ONLY / QUESTION ONLY

[State one: approved implementation | documentation only | architecture review | question — no code]

Proceed with [MILESTONE-ID] only.

Do not begin [LIST BLOCKED MILESTONES].

---

## Session context

I have read (or ask the agent to read):

- docs/foundation/SESSION-START.md
- docs/foundation/CURRENT-MILESTONE.md
- docs/foundation/AI-CONTEXT.md

## Objective

[One paragraph — what this milestone must deliver]

## Scope

[Bullet list — in scope]

## Out of scope / Do not implement

[Bullet list — explicit exclusions]

## Authoritative references

- [Link sprint guide, backlog, architecture docs]

## Stop condition

Stop immediately after [MILESTONE-ID] is complete.
Await owner approval before [NEXT-MILESTONE].
```

**Minimal question-only session:**

```markdown
Read docs/foundation/SESSION-START.md and docs/foundation/AI-CONTEXT.md first.

Question: [your question]

Do not implement code unless I explicitly approve a milestone.
```

---

## Quick checklist before writing code

- [ ] Read SESSION-START → CURRENT-MILESTONE → AI-CONTEXT
- [ ] Milestone is **approved** in this conversation or via owner approval doc
- [ ] Sprint guide / backlog read; stop condition understood
- [ ] No blocked prerequisites (e.g. OSS-101-04 requires OSS-100-05)
- [ ] Foundation docs for the area identified
- [ ] Will run quality gates before marking complete

---

## Navigation

| Need                | Go to                                       |
| ------------------- | ------------------------------------------- |
| Full index          | [PROJECT-INDEX](./PROJECT-INDEX.md)         |
| All doc categories  | [DOCUMENT-MAP](./DOCUMENT-MAP.md)           |
| Repo layout         | [REPOSITORY-GUIDE](./REPOSITORY-GUIDE.md)   |
| Programme narrative | [PROJECT-BIBLE](./PROJECT-BIBLE.md)         |
| Decisions           | [DECISION-REGISTER](./DECISION-REGISTER.md) |
