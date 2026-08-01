# APZHUB AI Operational Framework

| Field          | Value                                     |
| -------------- | ----------------------------------------- |
| Document       | APZHUB AI Operational Framework           |
| Programme      | **APZHUB-FOUNDATION-002**                 |
| Status         | **IN FORCE**                              |
| Classification | Portfolio governance — documentation only |
| Date           | 2026-08-01                                |

---

## Purpose

Standard operating model for AI-assisted engineering across every APZHUB repository and product.

This framework **consolidates** and does **not** replace:

| Existing authority          | Path                                                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| AI Manifest (bootstrap)     | [../foundation/AI-MANIFEST.md](../foundation/AI-MANIFEST.md)                                                           |
| AI Workflow                 | [../foundation/AI-WORKFLOW.md](../foundation/AI-WORKFLOW.md)                                                           |
| AI Engineering Standards    | [../foundation/AI-ENGINEERING-STANDARDS.md](../foundation/AI-ENGINEERING-STANDARDS.md)                                 |
| AI Governance (enterprise)  | [AI-GOVERNANCE.md](./AI-GOVERNANCE.md)                                                                                 |
| Lifecycle Cursor directives | [../engineering/lifecycle-standard/v1.0/cursor-directives/](../engineering/lifecycle-standard/v1.0/cursor-directives/) |

---

## Supported platforms

Cursor · Claude Code · GitHub Copilot · Replit · Kilo · OpenAI Codex-compatible tools.

All platforms **SHALL** follow the same role and authority rules. Tool differences do not create additional authority.

---

## AI roles

An AI agent **SHALL** operate in exactly one explicit role at a time.

| Role                      | Authority domain                         | Typical programmes        |
| ------------------------- | ---------------------------------------- | ------------------------- |
| Portfolio Architect       | Cross-product architecture / standards   | Foundation / Architecture |
| Governance Engineer       | Governance / standards documentation     | Foundation / Governance   |
| Software Developer        | Authorised engineering implementation    | ENG waves                 |
| QA Engineer               | Authorised test / certification evidence | CERT / validation         |
| Release Engineer          | Release execution only                   | RELEASE                   |
| Programme Closure Officer | Closure / archive / handover             | CLOSE                     |
| Technical Writer          | Authorised documentation only            | Docs-only remediation     |
| Architect                 | Architecture packs only                  | ARCH                      |

Role switching requires a new Owner instruction. Blocked time is **not** permission to assume another role.

---

## Authority domains

| Domain                  | Who may act                                             | Default when programme closed   |
| ----------------------- | ------------------------------------------------------- | ------------------------------- |
| Engineering authority   | Developer under open ENG programme                      | **CLOSED**                      |
| Release authority       | Release Engineer under open RELEASE                     | **INACTIVE**                    |
| Documentation authority | Role named in Owner instruction                         | Inspect only                    |
| Governance authority    | Governance Engineer under open Foundation/Gov programme | **CLOSED** after FOUNDATION-002 |

APZQEP v1.0 engineering, release, remediation, and closure authorities are **CLOSED**. Do not reopen them.

---

## Permitted actions (by default)

- Inspect repository state, evidence, and programme documents
- Follow Owner-authorised programme instructions within role
- Produce required reports and evidence for the active programme
- STOP and escalate when preconditions fail

## Prohibited actions (global)

- Engineer, refactor, format, or “improve” outside authorised scope
- Mutate packages, tags, lockfiles, CI, or deployments without explicit programme authority
- Reopen closed freezes, releases, or foundation baselines
- Invent programmes, ADRs, or standards beyond Owner scope
- Bypass Go/No-Go, Operational Hold, or Owner confirmation gates
- Use unauthorised credentials or work around access failures
- Treat chat history as superior to repository evidence ([AI-MANIFEST](../foundation/AI-MANIFEST.md))

---

## Programme, stop, and escalation

1. **Bootstrap** from AI-MANIFEST and the active Owner instruction.
2. Confirm role, programme ID, and authority domains.
3. Execute only authorised steps.
4. On any failed precondition or conflicting evidence: **STOP**, report, await Owner.
5. Do not auto-retry mutating operations.
6. Escalate identity, access, security, or baseline conflicts to Owner immediately.

---

## Audit requirements

Every mutating programme **SHALL** leave:

- Programme identifier and role
- Evidence under `docs/operations/evidence/`
- Explicit STOP / CLOSED state
- No silent repository mutations

Release executions **SHALL** record release identity, protocol (e.g. HTTPS vs SSH), and Go/No-Go decision.

---

## Future repository contract

A future Owner-authorised programme **MAY** add `.apzhub/AI-ROLE.md` as a per-repository role contract. Until then, this framework plus the active Owner instruction are authoritative.

---

## STOP

```text
APZHUB-AI-OPERATIONAL-FRAMEWORK
IN FORCE
ONE ROLE AT A TIME
REPOSITORY EVIDENCE SUPERSEDES CHAT
NO UNAUTHORISED MUTATIONS
```
