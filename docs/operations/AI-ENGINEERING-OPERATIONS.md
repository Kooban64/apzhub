# AI Engineering Operations

> **Programme:** APZHUB-OPERATIONS-001  
> **Related:** [AI-MANIFEST](../foundation/AI-MANIFEST.md) · [AI-WORKFLOW](../foundation/AI-WORKFLOW.md) · [AI-BOOTSTRAP](../foundation/AI-BOOTSTRAP.md) · [AI-ENGINEERING-STANDARDS](../foundation/AI-ENGINEERING-STANDARDS.md) · [DEFINITION-OF-READY](./DEFINITION-OF-READY.md) · [DEFINITION-OF-DONE](./DEFINITION-OF-DONE.md)

---

## Purpose

How AI engineering agents must operate under the Engineering Operating Model. Conversation history is **never** source of truth for implementation status.

---

## Bootstrap (mandatory)

1. Read [AI-MANIFEST](../foundation/AI-MANIFEST.md).
2. Read [CURRENT-MILESTONE](../foundation/CURRENT-MILESTONE.md) — **STOP** if work is not approved.
3. Read [AI-BOOTSTRAP](../foundation/AI-BOOTSTRAP.md) / [SESSION-START](../foundation/SESSION-START.md).
4. Read [AI-CONTEXT](../foundation/AI-CONTEXT.md) + Constitution as needed.
5. Verify disk vs CURRENT-STATE / inventory / completion reports (SoT hierarchy in AI-MANIFEST).
6. Read [Release Roadmaps](../releases/README.md). For product work: Portfolio · Definition Packs · [Reference Implementation](../products/APZHUB-PRODUCT-ENGINEERING-REFERENCE-IMPLEMENTATION.md) · this Operations model.
7. Read only the Owner-approved Product Release, Platform Release, or ADR scope.
8. Follow [AI-WORKFLOW](../foundation/AI-WORKFLOW.md).

---

## Repository-first rule

| Higher authority                              | Lower                   |
| --------------------------------------------- | ----------------------- |
| `packages/`, `integrations/`, `apps/` on disk | Chat memory             |
| `package.json` versions                       | Assumed versions        |
| Completion / Acceptance reports               | Informal claims         |
| CURRENT-STATE / CURRENT-MILESTONE             | Prior session summaries |

If chat and disk disagree → **disk wins**.

---

## Documentation-first rule

- Manifests / Definition Packs / ADRs / Sprint Guides before code.
- Update KF status docs on programme close.
- Do not invent programme IDs unless Owner provided them.

---

## Architecture freeze rules

- Read freeze notices in AI-MANIFEST.
- No public API / frozen subsystem change without ADR + Owner.
- Prefer product Workbench over platform redesign.

---

## Quality gates

Agents must not claim Done without:

- typecheck / lint / tests appropriate to scope
- product UI cert when UI in scope
- no production `any` / ts-ignore / eslint-disable / stubs

See [DEFINITION-OF-DONE](./DEFINITION-OF-DONE.md).

---

## Certification requirements

- Run programme audit/certify commands when defined.
- Architecture compliance checklist (no connector bypass, branding masked).
- File Completion + Acceptance reports in fixed formats.

---

## Owner approval requirements

| Action                   | Requires                                                                   |
| ------------------------ | -------------------------------------------------------------------------- |
| Implementation           | Owner Approval of Product Release, Platform Release, or named delivery     |
| Freeze break             | ADR + Owner                                                                |
| New governance programme | Explicit Owner authorisation only (repo-wide governance programmes CLOSED) |
| Production release       | Owner release approval                                                     |

---

## Programme closure

1. Completion Report
2. Acceptance Report → Await Owner Acceptance
3. On ACCEPTED / CLOSED: update Portfolio, readiness, CURRENT-*, AI-MANIFEST, DOCUMENT-MAP, PROJECT-INDEX, SESSION-START
4. Re-bootstrap from repository
5. Do **not** auto-start the next programme

---

## Repository update process

After Acceptance, update only what changed:

- Maturity / programme status
- Limitations
- Navigation maps
- Package versions if released

---

## STOP behaviour

**STOP and await Owner** when:

- CURRENT-MILESTONE does not authorise work
- Scope would invent capabilities or break freezes
- Definition of Ready unmet
- Acceptance Report filed (await Acceptance)
- Operations / governance docs change materially without Approval
- Asked to recommend multiple programmes or skip lifecycle stages

Default after any Acceptance Report: **Await Owner Acceptance. Do not recommend another governance programme. Implementation begins only through approved Product or Platform Releases.**
