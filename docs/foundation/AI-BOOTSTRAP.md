# APZHUB AI Bootstrap Guide

> **Purpose:** Detailed operating manual for AI agents starting work on APZHUB  
> **Audience:** Cursor, ChatGPT, Claude, Gemini, Copilot, and future assistants  
> **Companion (read first):** [AI-MANIFEST.md](./AI-MANIFEST.md) — concise operational summary  
> **Related:** [SESSION-START](./SESSION-START.md) · [AI-CONTEXT](./AI-CONTEXT.md) · [AI-WORKFLOW](./AI-WORKFLOW.md) · [AI-ENGINEERING-STANDARDS](./AI-ENGINEERING-STANDARDS.md)  
> **Last updated:** 2026-07-18  
> **Programme:** APZHUB-KF-002  
> **Classification:** Knowledge Foundation — documentation only

---

## Purpose

Enable any AI system to bootstrap from the **repository alone**, without relying on historical conversation context. This guide explains _how_ to start, verify, implement (when approved), certify, document, and stop. Operational facts live in [AI-MANIFEST](./AI-MANIFEST.md) and status docs — this file does not duplicate package version tables.

---

## Repository philosophy

1. The **repository is the only authoritative source of truth**.
2. Conversation history is **advisory** — useful for intent, never for “what is implemented”.
3. Prefer **disk evidence**: `package.json`, source trees, completion reports, freeze notices.
4. Product name is **APZHUB** (Platform / Workspace / Workbench) — never “portal” or “launcher”.
5. User-facing names hide engines (Projects, Support, Documents — not Plane, Zammad, Paperless).

---

## Knowledge Foundation philosophy

The Knowledge Foundation (`docs/foundation/`) is the permanent programme memory:

| Layer                              | Role                                            |
| ---------------------------------- | ----------------------------------------------- |
| **AI-MANIFEST**                    | Machine-oriented bootstrap (start here)         |
| **AI-BOOTSTRAP**                   | This operating manual                           |
| **SESSION-START**                  | Short human/AI launchpad map                    |
| **AI-CONTEXT**                     | Rules, naming, constraints, milestone catalogue |
| **CURRENT-*** / **ACTIVE-BACKLOG** | Live stop / snapshot / backlog index            |
| **Catalogues + Inventory**         | Products, OSS, packages, integrations           |
| **000–029 + ADRs**                 | Engineering law and decisions                   |

**APZHUB-KF-001** reconciled KF docs to the repository. **APZHUB-KF-002** adds this permanent AI bootstrap layer. Neither changes production code.

---

## Bootstrap sequence

Execute in order. Do not skip.

```text
1. AI-MANIFEST.md
2. CURRENT-MILESTONE.md          ← stop if not approved
3. AI-BOOTSTRAP.md (this file) / SESSION-START.md
4. AI-CONTEXT.md
5. APZHUB-CONSTITUTION.md
6. Repository verification (disk)
7. Documentation verification (status + reports)
8. Package verification (package.json vs CURRENT-STATE)
9. Approved sprint / backlog for THIS milestone only
10. Relevant foundation docs 001–029 + ADRs for the area
11. AI-WORKFLOW.md + AI-ENGINEERING-STANDARDS.md
12. Pre-implementation checklist → work → post-implementation checklist
13. STOP at milestone boundary
```

If CURRENT-MILESTONE says **await owner** and the user prompt does not explicitly approve a named programme, **do not implement**.

---

## Repository verification

Before claiming status:

1. List `packages/*` and `integrations/*` that exist on disk.
2. Confirm absent engines are actually absent (no invented adapters).
3. Confirm freeze notices exist under `docs/architecture/*Freeze*` for frozen programmes.
4. Confirm completion reports exist under `docs/sprint/` or `docs/foundation/completion-reports/` for claimed complete work.
5. Never treat “recommended next” in an old report as approval.

---

## Documentation verification

Read and cross-check:

| Document          | Check                                                |
| ----------------- | ---------------------------------------------------- |
| CURRENT-MILESTONE | What is complete; what is authorised; stop condition |
| CURRENT-STATE     | Versions and completed programmes                    |
| ACTIVE-BACKLOG    | Which backlogs are open vs complete                  |
| Inventory         | Disk vs catalogue reality                            |
| Catalogues        | Consistent with Inventory + CURRENT-STATE            |
| AI-MANIFEST       | Frozen/certified lists still match freeze notices    |

On conflict, apply the **Source of Truth Hierarchy** in [AI-MANIFEST](./AI-MANIFEST.md).

---

## Package verification

1. Read target `package.json` files — do not trust remembered versions.
2. Compare to CURRENT-STATE top inventory and Inventory §D.
3. If docs disagree with disk → **documentation drift** (see below); do not “fix” by changing package versions unless the approved programme requires a version bump.
4. Docs-only programmes (KF-*) must **never** change package versions.

---

## Completion report verification

For any “complete” claim:

1. Open the completion report.
2. Confirm stated packages/versions against disk (or confirm docs-only).
3. Confirm classification (e.g. PRODUCTION_READY_WITH_LIMITATIONS).
4. Confirm stop condition was respected.
5. Prefer completion report + disk over stale catalogue text.

---

## How to identify documentation drift

Drift exists when:

- Catalogue/status version ≠ `package.json`
- “Not implemented” / “blocked” / “recommended next” contradicts a completion report
- CURRENT-MILESTONE stop contradicts CURRENT-STATE “recommended next”
- ADR count or freeze list is wrong
- Inventory §G (or equivalent) still lists open drift after a reconcile programme

**Corrective authority:** repository → package.json → completion reports → then update docs.

---

## How to reconcile documentation

Only when a **docs reconciliation** programme is approved (pattern: APZHUB-KF-001):

1. Sweep disk versions and completion/freeze evidence.
2. List every inconsistency in a Drift Report.
3. Update CURRENT-STATE, CURRENT-MILESTONE, ACTIVE-BACKLOG, catalogues, indexes.
4. Write completion + drift reports under `docs/foundation/completion-reports/`.
5. Re-validate; stop. Do not start engineering work in the same programme unless scoped.

---

## How to recommend work

When asked what to do next:

1. Read ACTIVE-BACKLOG and CURRENT-MILESTONE.
2. State that **no work is authorised** unless CURRENT-MILESTONE (or an explicit owner approval in the prompt) names it.
3. You may **list** awaiting-owner items as facts from the backlog.
4. Do **not** invent milestone IDs or treat “recommended next” as approval.
5. Do **not** begin coding after a recommendation unless the owner approves a named programme.

---

## How to stop at milestones

1. Deliver only the approved scope.
2. Meet completion requirements (AI-MANIFEST § Completion Requirements).
3. Update CURRENT-MILESTONE stop condition.
4. Explicitly **STOP**.
5. Await owner approval before the next programme.

Never chain “obvious next” engineering work without approval.

---

## How to generate Cursor implementation instructions

Only after a programme is **APPROVED** (prompt and/or CURRENT-MILESTONE):

Produce explicit instructions covering:

- Affected packages and files
- Implementation tasks
- Tests
- Certification / audit commands
- Documentation updates
- Completion report
- CURRENT-STATE / CURRENT-MILESTONE / ACTIVE-BACKLOG updates
- Version and repository verification

Then implement only that scope. Stop at the boundary.

---

## How to certify programmes

1. Use the programme’s defined certify/audit script when one exists (e.g. `pnpm certify:integration-sdk`).
2. Do not invent certification commands.
3. Record results in the Completion Report and Quality Evidence as required.
4. Retain limitations classifications honestly (e.g. PRODUCTION_READY_WITH_LIMITATIONS).
5. Frozen programmes: certification/governance milestones must not silently change runtime without ADR + owner.

---

## How to update documentation

Every programme (including docs-only):

1. Completion Report
2. CURRENT-STATE
3. CURRENT-MILESTONE
4. ACTIVE-BACKLOG (if applicable)
5. Catalogues / Inventory / indexes when status changes
6. AI-MANIFEST only when frozen/certified/package-name lists materially change (keep it short)

---

## How to finish programmes

1. Implementation (or docs) complete per scope
2. Tests / certification per scope
3. Documentation reconciled
4. Completion Report written
5. Status docs updated
6. Versions verified against disk
7. Final validation checklist (below)
8. STOP — await owner

---

## How to perform final validation

Before declaring complete:

- [ ] Scope matches approval (nothing extra)
- [ ] Disk matches claimed versions / presence
- [ ] Completion Report exists and is accurate
- [ ] CURRENT-STATE / CURRENT-MILESTONE / ACTIVE-BACKLOG updated
- [ ] No new drift introduced in edited catalogues
- [ ] Frozen architecture untouched (or ADR filed)
- [ ] Links from indexes resolve
- [ ] Explicit stop stated

---

## Mandatory AI checklist — before implementation

- [ ] Read AI-MANIFEST
- [ ] Confirmed CURRENT-MILESTONE authorises **this** programme
- [ ] Owner approval is explicit (prompt and/or milestone)
- [ ] Verified disk / package.json / completion reports (not chat memory)
- [ ] Read sprint/backlog stop condition and exclusions
- [ ] Confirmed work does not recreate completed programmes
- [ ] Confirmed work does not modify frozen architecture without ADR
- [ ] Identified tests and certification gates for the programme
- [ ] Docs-only programmes: confirmed **no** code / version / API changes

**If any box fails → STOP and ask the owner.**

---

## Mandatory AI checklist — after implementation

- [ ] Scope complete; exclusions respected
- [ ] Tests pass (scoped)
- [ ] Certification/audit passes if required
- [ ] Completion Report written
- [ ] CURRENT-STATE updated
- [ ] CURRENT-MILESTONE updated (stop condition clear)
- [ ] ACTIVE-BACKLOG updated if needed
- [ ] Versions match `package.json` (or confirmed docs-only)
- [ ] Repository verification done
- [ ] Indexes/catalogues consistent (no new drift)
- [ ] Explicit **STOP** — no unapproved follow-on work

---

## Relationship to other AI docs

| Document                                                  | Use when                                 |
| --------------------------------------------------------- | ---------------------------------------- |
| [AI-MANIFEST](./AI-MANIFEST.md)                           | Every session — first read               |
| [AI-BOOTSTRAP](./AI-BOOTSTRAP.md)                         | Need full procedure (this file)          |
| [SESSION-START](./SESSION-START.md)                       | Short navigation map                     |
| [AI-CONTEXT](./AI-CONTEXT.md)                             | Rules, naming, long milestone catalogue  |
| [AI-WORKFLOW](./AI-WORKFLOW.md)                           | Phase gates during an approved programme |
| [AI-ENGINEERING-STANDARDS](./AI-ENGINEERING-STANDARDS.md) | Coding/review standards                  |

Do not duplicate version tables across these files — point to CURRENT-STATE / Inventory.

---

## See also

- [000 — Engineering Constitution](../000-apzhub-engineering-constitution.md)
- [PROJECT-INDEX](./PROJECT-INDEX.md)
- [APZHUB-KF-002 Completion Report](./completion-reports/APZHUB-KF-002-completion-report.md)
