# AI Engineering Workflow

| Field             | Value                                                                               |
| ----------------- | ----------------------------------------------------------------------------------- |
| Document          | AI Engineering Workflow                                                             |
| Programme         | **APZHUB-ENG-001**                                                                  |
| Status            | **IN FORCE**                                                                        |
| Classification    | Operating standard for AI-assisted slice engineering                                |
| Governance parent | [APZHUB AI Operational Framework](../governance/APZHUB-AI-OPERATIONAL-FRAMEWORK.md) |

---

## Purpose

Define how AI engineers (Cursor and peers) execute **authorised engineering slices**.

This workflow **specialises** the AI Operational Framework for slice delivery. It does not replace role authority, portfolio governance, or the Lifecycle suite.

Also see: [AI-ENGINEERING-STANDARDS](../foundation/AI-ENGINEERING-STANDARDS.md) · [AI-WORKFLOW](../foundation/AI-WORKFLOW.md).

---

## Role

For an authorised engineering slice, operate as **Software Developer** (implementation) and **QA Engineer** (tests/evidence) under the same Owner instruction — still one programme, one slice.

Do **not** assume Release Engineer, Governance Engineer, or Architect redesign authority unless the instruction says so.

---

## Operating rules

### 1. Inspect first

Never assume planning docs match HEAD. Re-inspect the affected area before changing code. Return findings before implementation when the slice is non-trivial.

### 2. Never assume

Repository evidence supersedes chat memory. Cite paths. Verify limitation IDs, package versions, and factories in code.

### 3. Respect architecture

Implement the approved design. On contradiction: STOP, record exception, await Owner. Do not silently redesign.

### 4. Small slices

Only the authorised slice. Do not pull S{n+1} work forward. Do not “while we’re here” refactors.

### 5. Small commits

Prefer one engineering commit and one documentation/evidence commit when both are needed. Meaningful messages. No force-push; no hook bypass.

### 6. No unrelated changes

No drive-by formatting of unrelated files, dependency bumps, or CI edits unless authorised.

### 7. Repository always releasable

After the slice, `main` must build and targeted tests must pass. Do not leave the tree broken between “milestones” inside a slice.

### 8. Never optimise outside scope

No performance rewrites, framework upgrades, or abstract platforms “for later” unless the slice acceptance criteria require them.

### 9. Evidence first (before claiming done)

Tests, security validation, docs, and evidence artefacts are part of the slice — not optional cleanup.

### 10. Security before completion

If the slice touches authz, ACL, tenant, upload, or public APIs: security validation is a hard gate. Prefer fail-closed.

### 11. Inherit the standard

Do not ask the Owner to restate the full lifecycle. Follow [ENGINEERING-SLICE-STANDARD.md](./ENGINEERING-SLICE-STANDARD.md) automatically.

### 12. Stop conditions

Stop immediately on architecture/security conflict, breaking API, unexpected dependency, instability, or required Owner decision. Report clearly. Do not invent workarounds that expand scope.

---

## Prompt expectations

Owner prompts from S02 onward should be short. The AI **SHALL**:

1. Load this workflow + slice standard + checklist + certification
2. Execute the lifecycle
3. Return the standard final report block

If the prompt omits process detail, **inherit defaults** — do not block waiting for a 10-page restatement.

---

## Quality over speed

Correctness, security, and repository integrity outrank delivery speed. S01 is the reference pattern for depth of validation.

---

## STOP

```text
INSPECT → CONFIRM → DESIGN → IMPLEMENT → TEST → SECURE → DOCUMENT → EVIDENCE → CERTIFY → COMMIT → CLEAN
ONE SLICE · ONE AUTHORITY · RELEASABLE ALWAYS
```
