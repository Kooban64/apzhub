# APZHUB AI Workflow

> **Purpose:** Exact procedure for how future AI-assisted work should proceed  
> **Audience:** AI coding agents  
> **Authoritative references:** [AI-MANIFEST](./AI-MANIFEST.md) · [AI-BOOTSTRAP](./AI-BOOTSTRAP.md) · [AI-CONTEXT](./AI-CONTEXT.md) · [015 — Quality](../015-software-quality-testing-qa-cicd-release-management-framework.md) · [0017 — Review Gate](../adr/ADR-0017-phased-implementation-review-gate.md)  
> **Related documents:** [AI-ENGINEERING-STANDARDS](./AI-ENGINEERING-STANDARDS.md) · [CURRENT-MILESTONE](./CURRENT-MILESTONE.md)  
> **Reading order:** After AI-MANIFEST / CURRENT-MILESTONE / AI-BOOTSTRAP; with AI-ENGINEERING-STANDARDS during approved work  
> **Last updated:** 2026-07-18  
> **Current status:** Active — includes mandatory **APZHUB Engineering Lifecycle**

---

## APZHUB Engineering Lifecycle (mandatory)

Every programme **must** follow this sequence. Do not skip stages. Do not implement before Owner Approval. Do not recommend the next programme before Owner Acceptance of the current one.

```text
Bootstrap
      ↓
Programme Recommendation
      ↓
Owner Approval
      ↓
Implementation
      ↓
Testing
      ↓
Certification
      ↓
Programme Acceptance Report
      ↓
Owner Acceptance
      ↓
Repository Bootstrap
      ↓
Next Recommendation
```

| Stage                           | Required outcome                                                                                                           |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Bootstrap**                   | Read [AI-MANIFEST](./AI-MANIFEST.md); verify disk / CURRENT-* / backlog / inventory                                        |
| **Programme Recommendation**    | Single programme from ACTIVE-BACKLOG; report only; **no implementation**                                                   |
| **Owner Approval**              | Explicit owner authorisation of that programme ID                                                                          |
| **Implementation**              | Scoped delivery only                                                                                                       |
| **Testing**                     | Programme tests pass                                                                                                       |
| **Certification**               | Programme audit/certify command passes when defined                                                                        |
| **Programme Acceptance Report** | Fixed acceptance format (Implementation / Architecture / Tests / Certification / Documentation / Repository / Limitations) |
| **Owner Acceptance**            | Owner marks programme ACCEPTED / CLOSED                                                                                    |
| **Repository Bootstrap**        | Re-read AI-MANIFEST + repository (ignore chat memory)                                                                      |
| **Next Recommendation**         | Single next programme; stop until Owner Approval                                                                           |

**Programme tracking states** (use in CURRENT-* / ACTIVE-BACKLOG / recommendations):

| State                                 | Meaning                                                      |
| ------------------------------------- | ------------------------------------------------------------ |
| **Completed & Accepted**              | Owner Acceptance given; programme **CLOSED**                 |
| **Implemented, Awaiting Acceptance**  | Delivery + Acceptance Report done; awaiting Owner Acceptance |
| **Approved, Awaiting Implementation** | Owner Approval given; implementation authorised              |
| **Recommended, Awaiting Approval**    | Recommendation report only; **not** authorised               |

**Programme Acceptance Report** is mandatory before Owner Acceptance. Template fields: Programme, Classification, Status, Implementation, Architecture, Tests (+ count), Certification (+ audit command), Documentation checklist, Repository (+ package version), Known Limitations, Recommendation → Await Owner Acceptance.

### Phase 3 — Product Engineering (in force)

See [APZHUB-PHASE-3 Product Engineering Commencement](./APZHUB-PHASE-3-Product-Engineering-Commencement.md).

- Platform Foundation is **CLOSED**; product programmes are the default.
- Prefer: Product capability → Platform extension (only if required) → Certification → Release.
- Platform-only programmes are exceptional (product need, ops necessity, or ADR + owner).
- Do **not** recommend or implement until explicit Owner Approval of a product programme.

Detailed phase mechanics below remain in force inside Implementation → Completion.

---

## Workflow overview (implementation phases)

```text
Planning → Architecture → Implementation → Validation → Documentation → Review → Completion → Approval
```

Each phase has entry criteria, activities, and exit criteria. **Do not skip phases.** These sit inside the Engineering Lifecycle between **Owner Approval** and **Programme Acceptance Report**.

---

## Phase 1 — Planning

**Entry:** Owner approves a milestone (sprint guide or backlog item) — Engineering Lifecycle **Owner Approval** stage.

**Activities:**

1. Read [AI-MANIFEST](./AI-MANIFEST.md) and [CURRENT-MILESTONE](./CURRENT-MILESTONE.md)
2. Read [AI-BOOTSTRAP](./AI-BOOTSTRAP.md) pre-implementation checklist
3. Read [AI-CONTEXT](./AI-CONTEXT.md)
4. Read sprint guide / backlog — scope, constraints, stop condition
5. Read depends-on foundation docs and architecture references
6. Identify deliverables, tests, and documentation requirements
7. Confirm what is **explicitly excluded**

**Exit:** Clear understanding of scope; no ambiguity about stop condition.

**Never:** Begin implementation without approved milestone.

---

## Phase 2 — Architecture

**Entry:** Milestone involves new patterns, packages, or boundary changes.

**Activities:**

1. Verify approach against [003](../003-overall-system-architecture-design-principles.md) and relevant foundation docs
2. Check [DECISION-REGISTER](./DECISION-REGISTER.md) for existing decisions
3. Draft ADR if significant change (before coding)
4. Update architecture docs if planning-only milestone
5. Create/update manifests (`module.yaml`, `service.yaml`, etc.) before code

**Exit:** Architecture aligned with constitution; ADR filed if required; manifests drafted.

**Never:** Invent new architecture; redesign existing work.

---

## Phase 3 — Implementation

**Entry:** Architecture confirmed; manifests in place (where applicable).

**Activities:**

1. Implement minimal correct diff matching existing conventions
2. Follow layered architecture — no bypassing
3. Wire tests alongside implementation
4. No scope creep — only approved items
5. No vendor-specific code unless milestone explicitly includes it

**Exit:** Code complete within scope; tests written.

**Never:** Start next milestone; add unrequested features; skip manifest-first.

---

## Phase 4 — Validation

**Entry:** Implementation complete.

**Activities:**

1. Run quality gates:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm build
   pnpm test
   pnpm test:coverage
   ```
2. Verify no credential leakage in errors/diagnostics/logs
3. Verify backwards compatibility (existing tests green)
4. Verify architecture compliance (layer boundaries, tenant scope)
5. Fix any failures before proceeding

**Exit:** All quality gates pass; compliance verified.

**Never:** Mark complete with failing gates; skip tests.

---

## Phase 5 — Documentation

**Entry:** Validation passed.

**Activities:**

1. Write completion report — `docs/sprint/{ID}-completion-report.md`
2. Update backlog status
3. Update CHANGELOG if significant
4. Update README / package docs if API changed
5. Update documentation indexes (`docs/README.md`, strategy index, etc.)
6. Cross-link to authoritative references

**Exit:** All documentation deliverables from sprint guide produced.

**Never:** Duplicate content — prefer links to canonical docs.

---

## Phase 6 — Review

**Entry:** Documentation complete.

**Activities:**

1. Self-review against completion criteria in sprint guide
2. Verify constraints confirmed (what was NOT done)
3. Verify stop condition stated clearly
4. Recommend next scope (do not implement)
5. Check terminology consistency (APZHUB names, no engine names in UI)

**Exit:** Completion report ready for owner review.

---

## Phase 7 — Completion

**Entry:** Review passed.

**Activities:**

1. Mark milestone complete in backlog
2. Update [CURRENT-MILESTONE](./CURRENT-MILESTONE.md) and [CURRENT-STATE](./CURRENT-STATE.md) if this milestone changes the stop point
3. Produce **Programme Acceptance Report** (mandatory format)
4. Report summary to owner

**Exit:** Acceptance report ready — Engineering Lifecycle **Programme Acceptance Report** stage.

---

## Phase 8 — Approval

**Entry:** Programme Acceptance Report delivered.

**Activities:**

1. **Stop** — await **Owner Acceptance** of the current programme
2. Do not begin next milestone
3. Do not implement recommended next scope
4. After Owner Acceptance: Bootstrap again → Programme Recommendation (single programme) → await Owner Approval

**Exit:** Owner accepts current programme → Bootstrap → Recommendation → Owner Approval of next → return to Phase 1.

---

## Special cases

| Case                             | Workflow                                                                     |
| -------------------------------- | ---------------------------------------------------------------------------- |
| **Documentation-only milestone** | Skip Phase 3; Phases 1–2 merge; validate links and consistency               |
| **Planning-only milestone**      | Phases 1–2 + 5–8; no code                                                    |
| **Bug fix**                      | Minimal scope; still run quality gates; no milestone report unless requested |
| **Question-only**                | No implementation; reference Knowledge Foundation                            |

---

## Stop conditions

Every sprint guide defines a stop condition. Typical pattern:

> "Stop immediately after {MILESTONE} is complete. Await owner approval before {NEXT}."

**Always obey the stop condition.** This is non-negotiable.
