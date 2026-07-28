# APZQEP-OES-ARCH-014

# PART 4 — Workflow, Lifecycle UX & Persona Journeys

| Item      | Value                                       |
| --------- | ------------------------------------------- |
| Document  | APZQEP-OES-ARCH-014                         |
| Part      | **4 of 5**                                  |
| Programme | APZQEP-ARCH-014                             |
| Status    | **IMPLEMENTED / AWAITING OWNER ACCEPTANCE** |

---

## 1. Purpose

This Part defines **lifecycle UX**, **persona workflows**, **Review queue behaviour**, **empty/loading/error/forbidden states**, **notification consumption**, and the **Compare presentation contract** for the Test Plans Workbench.

The Workbench **SHALL** present lifecycle; it **MUST NOT** own or invent lifecycle rules (Part 1 W2 / W3).

---

## 2. Lifecycle presentation model

### 2.1 Normative statuses (Domain ENG-060A, display mapping)

| Status (Domain) | User-facing label | Mutable content              | Terminal |
| --------------- | ----------------- | ---------------------------- | -------- |
| `draft`         | Draft             | Yes (if `qep.plan.update`)   | No       |
| `review`        | Under review      | No                           | No       |
| `approved`      | Approved          | No                           | No       |
| `ready`         | Ready             | No                           | No       |
| `in_execution`  | In execution      | No                           | No       |
| `completed`     | Completed         | No                           | No       |
| `archived`      | Archived          | No                           | **Yes**  |
| `rejected`      | Rejected          | No (until `return-to-draft`) | No       |
| `cancelled`     | Cancelled         | No                           | **Yes**  |
| `superseded`    | Superseded        | No                           | **Yes**  |

### 2.2 UX rules

1. Status badges **SHALL** use Design System semantic tokens — no hardcoded colours.
2. Terminal statuses (`archived`, `cancelled`, `superseded`) **SHALL** be clearly non-actionable except navigation/history.
3. The Workbench **MUST** refresh the Plan DTO after every transition command.
4. Status is never colour-only — badge text and icon/pattern accompany colour (Part 5 §2).

See [APPENDIX-B.md](./APPENDIX-B.md) for the full presentation state machine.

---

## 3. Canonical persona journeys

### 3.1 Viewer — browse and inspect

```text
Dashboard / Explorer / Search
  → Select Plan → Inspector (read-only)
  → Navigate Items / Relationships / History / Versions
  → No mutation available (no availableActions rendered)
```

### 3.2 Tester — assigned work awareness

```text
Explorer (assigned filter) / Dashboard "My assigned plans"
  → Select Plan → Inspector
  → Review Items relevant to assignment
  → No approve / lifecycle actions unless explicitly granted
```

### 3.3 Lead — create, prepare, and submit

```text
Dashboard / Explorer
  → New Test Plan (qep.plan.create) → Create Draft Form → POST create
  → Inspector (draft)
  → Edit content / items / schedule / assignment (qep.plan.update / assign / schedule)
  → Submit for review (submit-for-review)
  → Inspector (review) — await decision
```

### 3.4 Lead — after rejection

```text
Explorer / notification deep link
  → Inspector (rejected)
  → If availableActions exposes return-to-draft → Return to Draft and rework
  → Else: Cancel only as exposed — MUST NOT invent a client transition
```

### 3.5 QA Manager — review and decide

```text
Review queue (or Explorer filter status=review)
  → Select Plan → Inspector
  → Approve (approve)  OR  Reject (reject + rationale)
  → Server returns new status + availableActions
```

### 3.6 Lead / QA Manager — readiness and execution handoff

```text
Inspector (approved)
  → Mark Ready (mark-ready) — readiness gates evaluated server-side
  → Inspector (ready)
  → Start Execution (start-execution) — hands off to future Execution capability
  → Inspector (in_execution) — plan state advances; run results live elsewhere
  → Complete (complete) — on execution closure signal or authorised complete
  → Inspector (completed)
  → Archive (archive)
```

### 3.7 QA Manager — supersede an approved plan

```text
Inspector (approved | ready | in_execution, per availableActions)
  → Supersede (supersede)
  → Choose existing successor OR create successor draft
  → Predecessor → superseded; successor → draft (or existing)
  → Navigate to successor
```

### 3.8 Lead — clone a plan

```text
Inspector (any state exposing clone) / Explorer row menu
  → Clone (clone)
  → New Draft plan created with new number; items copied by reference
  → Navigate to clone
```

### 3.9 Auditor / QA Manager — inspect history and versions

```text
Search / Explorer → deep link
  → Inspector → History / Versions / Audit
  → Compare shown as governed unavailable slot (L-01) — no mutation
```

---

## 4. Action → status expectations (presentation aid)

The table below is a **UX expectation aid**. Server validation remains authoritative; the Workbench **MUST NOT** assume success without a server response.

| From                              | Action              | Expected to (typical)                      |
| --------------------------------- | ------------------- | ------------------------------------------ |
| draft                             | `submit-for-review` | review                                     |
| review                            | `approve`           | approved                                   |
| review                            | `reject`            | rejected                                   |
| rejected                          | `return-to-draft`   | draft                                      |
| rejected                          | `cancel`            | cancelled                                  |
| approved                          | `mark-ready`        | ready                                      |
| ready                             | `start-execution`   | in_execution                               |
| in_execution                      | `complete`          | completed                                  |
| completed                         | `archive`           | archived                                   |
| draft / review / approved / ready | `cancel`            | cancelled                                  |
| approved / ready / completed      | `supersede`         | superseded (+ successor)                   |
| any permitted state               | `clone`             | new draft (successor unrelated to lineage) |

---

## 5. Review queue UX

### 5.1 Purpose

Operational attention surface for Plans awaiting review decisions (Part 2 §7).

### 5.2 Behaviour

| Element          | Rule                                                                             |
| ---------------- | -------------------------------------------------------------------------------- |
| Default filter   | `status=review`                                                                  |
| Optional filters | Owner, lead, scope, priority, updated                                            |
| Row actions      | Same as Explorer — open Inspector                                                |
| Empty state      | "No Test Plans awaiting review" — governed empty                                 |
| Permission       | Queue **MAY** be hidden if the user lacks `qep.plan.approve` / `qep.plan.reject` |

### 5.3 Reviewer guidance (UX copy principles)

- Show objective / scope summary and linked Specifications count before decision.
- Reject **MUST** collect a rationale.
- Approve **SHOULD** surface the item set / readiness summary for confirmation.
- Never show backend permission key strings (`qep.plan.approve`) in primary UI copy.

---

## 6. Compare presentation contract (Infrastructure limitation L-01)

Infrastructure Certification (CERT-060B) recorded **L-01**: `CompareVersions` / `GET .../compare` is a **deferred capability**, not a defect. This architecture **SHALL** specify the presentation contract for Compare so that:

1. The route `/plans/{planId}/compare?from={rev}&to={rev}` (Part 2 §4.1) **SHALL** exist in the Workbench navigation map today, rendering a **governed unavailable state**: "Version comparison is not yet available for Test Plans" with a link back to the Versions panel.
2. **When** Infrastructure delivers the endpoint under a future, separately authorised ENG programme, the Compare screen **SHALL**:
   - Accept two Plan version/revision identifiers (`from`, `to`).
   - Present a side-by-side or unified diff of comparable fields: title, objective, scope, priority, schedule, ownership/assignment, item set (added/removed/reordered/changed pin).
   - Display any server-supplied comparison notes.
   - Offer **no lifecycle action** from the Compare screen itself — the user returns to the Inspector to act.
3. This programme (ARCH-014) **SHALL NOT** require, perform, or block on the Infrastructure change. Closing L-01 remains an Infrastructure/Domain concern under a separate Owner Instruction (mirrors ARCH-013 §2.3 rule 4 treatment of unavailable integration slots).
4. The Workbench **MUST NOT** simulate a diff client-side from two separately fetched full DTOs as a substitute for the server contract — that would silently fabricate a feature Infrastructure has not certified.

---

## 7. Notifications & attention (consume only)

Aligned with [021](../../../../021-notification-activity-attention-management-framework.md):

| Event (Infrastructure/Domain emits)                                                                                                                                           | Workbench role                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `qep.plan.created` / `.submitted` / `.approved` / `.rejected` / `.readied` / `.started` / `.completed` / `.archived` / `.cancelled` / `.superseded` / `.cloned` / item events | Deep-link target for Attention Engine deliveries |
| Activity stream                                                                                                                                                               | Read-only consume when the platform exposes it   |

The Workbench **MUST NOT** implement its own notification subsystem, delivery channel, or digesting logic.

---

## 8. Empty, loading, error, forbidden

| State                    | Requirement                                                                      |
| ------------------------ | -------------------------------------------------------------------------------- |
| Loading                  | Design System loading patterns; no blank flash of stale/wrong data               |
| Empty Explorer           | Guided CTA to Create (if `qep.plan.create` permitted) or adjust filters          |
| Empty Review queue       | "No Test Plans awaiting review"                                                  |
| Not found                | Governed 404-style panel for deep links to missing plans                         |
| Forbidden                | Governed 403-style panel — no data leakage about the Plan's existence or content |
| API error                | Typed error envelope messaging (Document 010); retry where safe                  |
| Unavailable foreign link | Slot message — capability not present or no permission                           |
| Unavailable Compare      | Governed message per Part 4 §6 — not an error state                              |

---

## 9. Responsive & session UX

1. Desktop: Explorer + Inspector split per Document 016.
2. Narrow viewports: Inspector as overlay/drawer; focus trap required (Part 5 §3).
3. Session restore (Document 018): restore filters + selection; re-validate permissions; re-fetch (Part 2 §10).
4. Background jobs, if any, **MUST NOT** be invented in the Workbench — async work stays server-side.

---

## 10. Persona → surface matrix

| Persona    | Primary surfaces                            | Typical actions                                                                    |
| ---------- | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| Viewer     | Explorer, Search, Inspector                 | read-only                                                                          |
| Tester     | Explorer (assigned), Inspector              | read; assignment notes if Domain exposes them                                      |
| Lead       | Dashboard, Explorer, Create/Edit, Inspector | create, update, assign, schedule, submit-for-review, mark-ready, clone             |
| QA Manager | Review queue, Dashboard, Inspector          | approve, reject, mark-ready, start-execution, complete, archive, cancel, supersede |

---

## 11. Traceability

| This Part         | Trace                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------- |
| Lifecycle states  | ENG-060A · ARCH-013 §3                                                                |
| Actions           | ENG-060B Parts 3–4                                                                    |
| Known limitations | ENG-060B `KNOWN-LIMITATIONS.md`, CERT-060B `KNOWN-LIMITATIONS-REVIEW.md` (L-01, L-02) |
| Notifications     | Document 021 (consume)                                                                |
| Sessions          | Document 018                                                                          |
| Components        | OES-ARCH-014 Part 3                                                                   |

---

## 12. Explicit non-goals (Part 4)

This Part does NOT define:

- Performance budgets, security headers, AI/MCP authority (Part 5).
- Owner Acceptance checklist detail (Part 5 / Appendix E).
- React/Next.js implementation.
- Infrastructure work to close L-01.

---

## 13. STOP (Part 4)

Workflow and lifecycle presentation only. No Domain, Infrastructure, or implementation authority granted by this Part.
