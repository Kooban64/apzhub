# APZQEP-OES-ARCH-014
# PART 3 — Workbench Components

| Item | Value |
| ---- | ----- |
| Document | APZQEP-OES-ARCH-014 |
| Part | **3 of 5** |
| Programme | APZQEP-ARCH-014 |
| Status | **IMPLEMENTED / AWAITING OWNER ACCEPTANCE** |

---

## 1. Purpose

This Part defines the **component architecture** of the Test Plans Workbench: Dashboard widgets, Explorer binding, Plan Inspector structure, Edit Draft, action surface, dialogs, and governed unavailable slots.

It **SHALL** enable an engineer to implement presentation components without inventing field layouts, panel roles, or action semantics. It **SHALL NOT** specify React component trees, Tailwind class names, or persistence.

---

## 2. Component catalogue

| Component | Role | Consumes |
| --------- | ---- | -------- |
| **Dashboard** | Attention / counts landing surface | List/aggregate APIs |
| **Plan Explorer** | List inventory (Part 2 §6) | List/search APIs |
| **Review Queue** | Filtered attention list (Part 2 §7) | List/search APIs (`status=review`) |
| **Plan Inspector** | Selection detail + actions | Plan DTO (ENG-060B) |
| **Linked Specifications panel** | Plan Items table | `items[]` on Plan DTO (L-02: no dedicated GET) |
| **Relationships panel** | Cross-capability references | `relationships[]` / reference fields + deep links |
| **History panel** | Append-only timeline | `GET .../history` |
| **Versions panel** | Lineage + Compare entry point | `GET .../versions` |
| **Audit panel** | Governance-significant actions | History / audit projection (read-only) |
| **Edit Draft Form** | Mutable draft content | Create / update APIs |
| **Action Bar / Menus** | Command affordances | `availableActions[]` only |
| **Dialogs** | Confirm/collect input for actions | Corresponding action endpoint |
| **Governed Empty / Unavailable slot** | Missing/undelivered features (e.g. Compare) | Permission + capability presence |

All components are **presentation**. They **MUST NOT** encode Domain lifecycle legality beyond rendering server `availableActions`.

---

## 3. Dashboard

### 3.1 Purpose

Attention and counts for Leads and QA Managers — **not** a second system of record.

### 3.2 Widgets (minimum set)

| Widget | Content | Drill-down |
| ------ | ------- | ---------- |
| Plans by status | Counts: Draft, Review, Approved, Ready, In Execution, Completed, Archived | Explorer with status filter |
| Awaiting my review | Plans in `review` where user holds approve/reject grants | Review queue |
| Ready for execution | Plans in `ready` | Explorer with status filter |
| In execution | Plans in `in_execution` | Explorer with status filter |
| My owned plans | Owner = current user | Explorer (owner filter) |
| My assigned plans | Lead/assignee = current user | Explorer (lead filter) |
| Upcoming schedule | Plans with planned start in window | Explorer (schedule filter) |
| Recently updated | Bounded list, `updatedAt desc` | Explorer sort |
| Rejected / blocked | Rejected plans, or readiness-failed signals if exposed | Explorer / Plan deep link |

### 3.3 Dashboard rules

1. Dashboard data **MUST** come from list/search/aggregate APIs — the client **MUST NOT** invent counts.
2. Widgets are presentation; they **MUST NOT** trigger a lifecycle transition without explicit user action on a specific Plan.
3. Dashboard **MUST** degrade gracefully if an aggregate endpoint is unavailable (show an Explorer call-to-action instead of a broken widget).
4. No fabricated "coverage %" or "execution pass rate" widgets — those belong to future capabilities and **MUST NOT** be simulated here.

---

## 4. Plan Explorer component binding

### 4.1 Data binding

Each Explorer row **SHALL** map to a Plan list item / DTO summary exposing at minimum the columns defined in Part 2 §6.2.

### 4.2 Selection contract

| Event | Effect |
| ----- | ------ |
| Single select | Load full DTO by id; open Inspector at Summary |
| Deep link open | Same as single select |
| Deselect | Close or clear Inspector per shell grammar |
| Multi-select | Enable bulk UI **only** for actions present on **every** selected row's `availableActions` intersection |

---

## 5. Create Draft Form

### 5.1 Purpose

Mutable creation surface for a new Test Plan, gated by `qep.plan.create`.

### 5.2 Fields (minimum, aligned with ENG-060B Part 3 §4.1)

| Field | Notes |
| ----- | ----- |
| Title | Required |
| Objective / description | Required for `submitForReview` per Domain; **MAY** be optional at create |
| Scope / plan type | Release, Product, Feature, Milestone, Sprint, Regression, Certification, Custom (ARCH-013 §1.3) |
| Priority | Default `medium` |
| Owner | Defaults to actor; **MAY** be reassigned if permitted |
| Schedule (optional) | Planned start / end |
| Assignment (optional) | Lead / assignees |
| Initial items (optional) | Specification references, if the Create command accepts them in-band |

### 5.3 Rules

1. Creation **MUST** call the create command; the client **MUST NOT** invent `number`, `id`, `status`, or `revision`.
2. On success, the Workbench **SHALL** navigate to the new Plan's Inspector.
3. Validation messages **SHOULD** mirror server validation categories (Document 010); client-side schema checks **MAY** pre-validate shape only.

---

## 6. Plan Inspector

### 6.1 Purpose

The Inspector is the primary detail surface for one selected Plan. It is read-mostly for non-draft/non-rejected states; mutable content uses the Edit Draft Form gated by `qep.plan.update`.

### 6.2 Inspector panels (normative)

| Panel | Content | Notes |
| ----- | ------- | ----- |
| **Summary** | Number, Title, Status badge, Scope, Priority, Objective, Version label | Always visible header/primary panel |
| **Metadata** | Owner, Lead, Assignees, Schedule (planned start/end), Tags | Compact |
| **Items / Linked Specifications** | Plan Items table: order, Specification id/number/title, version pin, item status (Included/Optional/Deferred/Removed), notes | Sourced from Plan DTO `items[]` (L-02 — no dedicated `GET .../items` yet; see Part 4 §6) |
| **Relationships** | Requirement / Trace Link / Verification references; future Execution/Run/Evidence/Defect slots | Reference list + deep links; governed unavailable for future kinds |
| **History** | Append-only `historySummaries` / `GET .../history` entries | Read-only |
| **Versions** | Version lineage (`versionLabel`, predecessor/successor), Compare entry point | Compare is a **governed unavailable slot** pending Infrastructure L-01 (Part 4 §6) |
| **Audit** | Governance-significant actions: submit, approve, reject, mark-ready, start-execution, complete, archive, cancel, supersede | Read-only; sourced from history/audit projection |
| **Actions** | Buttons/menus rendered strictly from `availableActions` | Mandatory gate (§9) |

### 6.3 Field inventory (DTO-aligned)

The Inspector **SHALL** be able to present every field on the Plan DTO that is meaningful to users. Engineering **MUST NOT** omit `status`, `revision`, lineage, `items[]`, or `availableActions`.

| Group | Fields |
| ----- | ------ |
| Identity | `id`, `number`, `title`, `status`, `versionLabel`, `revision` |
| Classification | `scope` / `planType`, `priority` |
| Content | `objective` / description |
| Ownership | `ownerId`, lead/assignee references |
| Scheduling | Planned start / end |
| Items | `items[]` (specificationId, version pin, sequence, item status, notes) |
| Lineage | `clonedFromPlanId`, `supersedesPlanId`, `supersededByPlanId` |
| Governance | Approval records (decision, actor, comment, timestamp) |
| Relations | Requirement / Trace / Verification reference fields |
| Audit UI | `createdAt/By`, `updatedAt/By`, `correlationId` (secondary/debug) |
| History | `historySummaries[]` / history endpoint entries |
| Actions | `availableActions[]` |

### 6.4 Inspector rules

1. Inspector **MUST** re-fetch the Plan DTO after every successful command.
2. Optimistic UI **MAY** show a pending state; on failure it **MUST** revert and surface the server error envelope (Document 010).
3. Action buttons **SHALL** be shown/enabled **only** when present in `availableActions`.
4. Approved / terminal (`completed`, `archived`, `cancelled`, `superseded`) content **MUST** be read-only in the Inspector.
5. Inspector **MUST** remain usable as a responsive overlay (tablet/mobile) per Document 016.
6. Inspector **MUST NOT** call Domain or repositories — REST via the platform gateway only.

---

## 7. Edit Draft Form

### 7.1 Purpose

Mutable editing surface for `draft` and `rejected` (post `return-to-draft`) Plans.

### 7.2 Editable groups

Aligned with Domain editability (ENG-060A) and `updateDraft`-equivalent commands (`UpdatePlanContent`, `UpdatePlanMetadata`, `UpdateAssignment`, `UpdateSchedule`, item commands):

| Group | Editable when |
| ----- | ------------- |
| Title, objective/description | `qep.plan.update` present in `availableActions` |
| Scope, priority, tags | same |
| Ownership transfer | `TransferOwnership` present |
| Assignment (lead/assignees) | `UpdateAssignment` present |
| Schedule (planned start/end) | `UpdateSchedule` present |
| Plan Items (add/update/remove/reorder) | Corresponding item command present |

### 7.3 Rules

1. The form **MUST NOT** appear for statuses lacking `qep.plan.update` in `availableActions`.
2. Save **MUST** invoke the corresponding command with `expectedRevision`. The client **MUST NOT** mark status `approved`, `ready`, or any other lifecycle value directly.
3. Validation messages **SHOULD** mirror server validation categories; client-side schema checks **MAY** pre-check shape only.
4. Unsaved draft recovery **MAY** use platform session preferences for **form UI state** only — never as system of record.

---

## 8. Relationships panel

### 8.1 Purpose

Present Plan relationships as **references only** (ARCH-013 §2 / Part 1 W5).

### 8.2 Relationship kinds (presentation)

| Kind | Meaning | Navigation |
| ---- | ------- | ---------- |
| `specification` | Plan Item target | Test Specifications Inspector deep link |
| `requirement` | Linked Requirement | Requirements Workbench deep link |
| `trace_link` | Traceability artefact | Traceability Workbench |
| `verification` | Verification record | Verification Workbench |
| `execution` / `run` / `evidence` / `defect` | Future | Governed unavailable slot |

### 8.3 Capabilities

| Capability | Rule |
| ---------- | ---- |
| List | Show kind, target label/id, summary |
| Navigate | Open deep link when the target capability is available and permitted |
| Add | Only when the corresponding item/relationship command is in `availableActions` |
| Remove | Only when the corresponding remove command is in `availableActions` |
| Unavailable | Governed empty — **MUST NOT** fabricate foreign records |

### 8.4 Non-goals

The Relationships panel **MUST NOT**:

- Own foreign SoR data.
- Compute coverage, verification outcomes, or execution results.
- Imply Test Case generation.

---

## 9. Action surface mapping

Canonical actions from ENG-060B Part 3 §3 / Part 4 §2.1:

| Action | Typical UI | Notes |
| ------ | ---------- | ----- |
| `qep.plan.update` (content/metadata) | Edit Draft / Save | Draft or Rejected only |
| `submit-for-review` | Submit for review dialog | |
| `approve` | Approve dialog | Optional/required comment per Domain policy |
| `reject` | Reject dialog | Rationale **required** |
| `return-to-draft` | Return to Draft confirm | Rejected → Draft only |
| `mark-ready` | Mark Ready confirm | Approved → Ready; readiness gates apply |
| `start-execution` | Start Execution confirm | Ready → In Execution |
| `complete` | Complete confirm | In Execution → Completed |
| `archive` | Archive confirm | Completed → Archived; terminal |
| `cancel` | Cancel confirm | Early states → Cancelled |
| `supersede` | Supersede flow | Choose existing successor or create-successor draft |
| `clone` | Clone confirm | Creates new Draft with new number |
| `transfer-ownership` | Transfer ownership dialog | |
| `assign` | Update assignment dialog | |
| `schedule` | Update schedule dialog | |
| Item add/update/remove/reorder | Inline item editor controls | Draft/Rejected content editability only |

### 9.1 Rules

1. The Workbench **MUST NOT** render an action absent from `availableActions`.
2. If Domain supports a transition not yet exposed by Infrastructure `availableActions`, the Workbench **MUST** wait for the server — it **MUST NOT** invent the transition client-side (mirrors ARCH-012 §9.1 rule 2, and ENG-060B's explicit `RestoreFromArchive` / unarchive non-authorisation, Part 3 §3.1).
3. Labels **MUST** use product language (Approve, Archive, Mark Ready, …) — never backend permission keys or engine role names.
4. Destructive / terminal actions (`archive`, `cancel`, `supersede`) **SHALL** use confirmation dialogs.

---

## 10. Dialogs & overlays

| Dialog | Trigger | Required inputs |
| ------ | ------- | --------------- |
| Create Test Plan | `qep.plan.create` | Title, objective, scope, priority (§5.2) |
| Submit for review | `submit-for-review` | Confirmation; optional note |
| Approve | `approve` | Optional/required comment per policy |
| Reject | `reject` | Rationale **required** |
| Return to Draft | `return-to-draft` | Confirmation |
| Mark Ready | `mark-ready` | Confirmation; readiness summary shown |
| Start Execution | `start-execution` | Confirmation |
| Complete | `complete` | Confirmation |
| Archive | `archive` | Confirmation |
| Cancel | `cancel` | Rationale recommended |
| Supersede | `supersede` | Successor id **or** create-successor fields |
| Clone | `clone` | Optional title override ("Copy of …") |
| Transfer ownership | `transfer-ownership` | New owner identity |
| Assign | `assign` | Lead / assignee identities |
| Schedule | `schedule` | Planned start / end |
| Add relationship / item | Item add command | Specification reference + version pin |

Dialogs **MUST** call the corresponding REST command and close only on success (or explicit cancel).

---

## 11. Future / unavailable presentation slots

The following **MAY** appear as labelled slots with **governed unavailable** states:

| Slot | Reason | Presentation contract |
| ----- | ------ | ---------------------- |
| **Version Compare** | Infrastructure limitation **L-01** — `CompareVersions` / `GET .../compare` not implemented | Route exists (Part 2 §4.1); the Workbench **SHALL** show a governed "Compare is not yet available" message with a link back to Versions. When Infrastructure ships the endpoint under a future ENG programme, the same route **SHALL** activate without a Workbench Architecture change, per the contract in Part 4 §6 |
| **Execution console** | Test Execution capability not yet architected | Governed unavailable slot on Relationships / a future Sidebar entry; **MUST NOT** be a fake populated screen |
| **Spec editor embed** | Out of bounds — Test Specifications owns its own editor | The Workbench **MUST NOT** embed a Specification editor; it **SHALL** deep-link to the Test Specifications Workbench instead |
| **Evidence / Defects panels** | Future capabilities | Governed unavailable slot only |

They **MUST NOT** be fake populated screens.

---

## 12. Traceability

| This Part | Trace |
| --------- | ----- |
| Shell / panels | Documents 005 / 016 |
| DTO / actions | ENG-060B Parts 3–4 |
| Domain editability / lifecycle | ENG-060A |
| IA / routes | OES-ARCH-014 Part 2 |
| Known limitations | ENG-060B `KNOWN-LIMITATIONS.md` L-01 / L-02 |

---

## 13. Explicit non-goals (Part 3)

This Part does NOT define:

- Persona journeys, empty/error/forbidden states, notifications (Part 4).
- Performance budgets, a11y matrices, security, AI/MCP boundaries (Part 5).
- React/Next.js implementation.

---

## 14. STOP (Part 3)

Component architecture only. No React component trees, Tailwind classes, or persistence defined here.
