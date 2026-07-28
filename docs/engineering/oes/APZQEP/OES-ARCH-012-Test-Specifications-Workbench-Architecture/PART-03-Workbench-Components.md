# APZQEP-OES-ARCH-012

# PART 3 — Workbench Components

| Item                  | Value                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------ |
| Document              | APZQEP-OES-ARCH-012                                                                        |
| Title                 | Test Specifications Workbench Architecture                                                 |
| Part                  | **3 of 5** — Workbench Components                                                          |
| Status                | **FILED**                                                                                  |
| Governing methodology | [OES-000](../../OES-000-Owner-Engineering-Specification-Standard.md) (**FROZEN**)          |
| Writing standard      | [OES-001](../../OES-001-Engineering-Writing-Standard.md) (**FROZEN**)                      |
| Review standard       | [OES-002](../../OES-002-Engineering-Review-and-Acceptance-Standard.md)                     |
| Baselines             | ARCH-006 · ARCH-011 · ENG-050A · ENG-050B · `@apzhub/qep-contracts` Test Specification DTO |

---

## 1 Purpose

This Part defines the **component architecture** of the Test Specifications Workbench: Explorer binding, Inspector structure, Relationships viewer, Version Comparison, History, and action surfaces.

It SHALL enable an engineer to implement presentation components without inventing field layouts, panel roles, or action semantics.

This Part SHALL NOT specify React component trees, Tailwind class names, or persistence.

---

## 2 Component catalogue

| Component                        | Role                            | Consumes                              |
| -------------------------------- | ------------------------------- | ------------------------------------- |
| **Specification Explorer**       | List inventory (Part 2)         | List / search APIs                    |
| **Specification Inspector**      | Selection detail + actions      | `QepTestSpecificationDto`             |
| **Relationships Viewer**         | Reference graph / list          | `relationships[]` + deep links        |
| **Version Lineage**              | Predecessor / successor chain   | `versionLineage`, pred/succ ids       |
| **Version Comparison**           | Diff two Specification versions | Two DTOs + optional `comparisonNotes` |
| **History Panel**                | Append-only summaries           | `historySummaries[]`                  |
| **Action Bar / Menus**           | Command affordances             | `availableActions[]` only             |
| **Create / Edit Draft Form**     | Mutable draft content           | Create / `updateDraft` APIs           |
| **Governed Empty / Unavailable** | Missing foreign targets         | Permission + capability presence      |

All components are **presentation**. They MUST NOT encode Domain lifecycle legality beyond rendering server `availableActions`.

---

## 3 Explorer component binding

### 3.1 Data binding

Each Explorer row SHALL map to a Specification list item / DTO summary exposing at minimum the columns defined in Part 2 §6.2.

### 3.2 Selection contract

| Event          | Effect                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| Single select  | Load full DTO by id; open Inspector                                                                     |
| Deep link open | Same as single select                                                                                   |
| Deselect       | Close or clear Inspector per shell grammar                                                              |
| Multi-select   | Enable bulk UI **only** for actions present on **every** selected row’s `availableActions` intersection |

### 3.3 Create affordance

A “New Specification” control SHALL appear only when the caller holds create permission (Permission Platform). It SHALL open the Create Draft Form (overlay or primary workspace). Creation MUST call the create REST command; the client MUST NOT invent identifiers or statuses.

---

## 4 Specification Inspector

### 4.1 Purpose

The Inspector is the primary detail surface for one selected Specification. It is read-mostly for non-draft states; draft edits use the Edit Draft Form / inline draft editors gated by `updateDraft`.

### 4.2 Inspector regions (normative)

| Region                   | Content                                                             | Notes                           |
| ------------------------ | ------------------------------------------------------------------- | ------------------------------- |
| **Header**               | Number, Title, Status badge, Version label, Authoritative indicator | Always visible                  |
| **Identity strip**       | Type, Priority, Classification, Owner, Author, Reviewer             | Compact                         |
| **Summary**              | Description, Objective, Scope                                       | Primary prose                   |
| **Design structure**     | Preconditions, Postconditions, Acceptance Criteria                  | Ordered lists                   |
| **Risks & dependencies** | Risks[], Dependencies[]                                             | Summaries + optional refs       |
| **Tags & metadata**      | Tags, metadata map                                                  | Presentation only               |
| **Relationships**        | Embedded Relationships Viewer summary                               | Link to full Relationships view |
| **Version**              | Version label, pred/succ links, lineage entry                       | Link to Versions / Compare      |
| **Approval**             | Approval block when present                                         | Decision, actors, comments      |
| **History**              | Recent `historySummaries`                                           | Link to full History            |
| **Actions**              | Buttons/menus from `availableActions`                               | Mandatory gate                  |

### 4.3 Field inventory (DTO-aligned)

Inspector SHALL be able to present every field on `QepTestSpecificationDto` that is meaningful to users. Engineering MUST NOT omit Status, Version, `isAuthoritative`, Relationships, History, or `availableActions`.

| Group      | Fields                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------ |
| Identity   | `id`, `number`, `title`, `status`, `version`, `type`, `priority`, `complexity`, `classification` |
| People     | `owner`, `author`, `reviewer`                                                                    |
| Content    | `description`, `objective`, `scope`, `preconditions`, `postconditions`, `acceptanceCriteria`     |
| Risk / dep | `risks[]`, `dependencies[]`                                                                      |
| Governance | `approval`, `isAuthoritative`, review/withdraw/cancel/retire/supersede timestamps                |
| Lineage    | `predecessorSpecificationId`, `successorSpecificationId`, `versionLineage`, `comparisonNotes`    |
| Relations  | `relationships[]`                                                                                |
| Audit UI   | `createdAt/By`, `updatedAt/By`, `revision`, `correlationId` (correlation MAY be secondary/debug) |
| History    | `historySummaries[]`                                                                             |
| Actions    | `availableActions[]`                                                                             |

### 4.4 Inspector rules

1. Inspector MUST re-fetch after every successful command.
2. Optimistic UI MAY show pending state; on failure MUST revert and surface server error envelope.
3. Action buttons SHALL be shown/enabled **only** when present in `availableActions`.
4. Approved / terminal content MUST be read-only in the Inspector.
5. Inspector MUST remain usable as a responsive overlay (tablet/mobile) per ARCH-006.
6. Inspector MUST NOT call Domain or repositories — REST / Platform Service gateway only.

---

## 5 Edit Draft Form

### 5.1 Purpose

Mutable editing surface for `draft` Specifications (and create).

### 5.2 Editable groups

Aligned with Domain editability (ENG-050A) and `updateDraft`:

| Group                                              | Editable when                                                |
| -------------------------------------------------- | ------------------------------------------------------------ |
| Title, description, objective, scope               | `updateDraft` in `availableActions`                          |
| Type, priority, complexity, classification         | same                                                         |
| Preconditions, postconditions, acceptance criteria | same                                                         |
| Risks, dependencies                                | same                                                         |
| Tags, metadata                                     | same                                                         |
| Owner / author / reviewer                          | per server command contracts (transfer ownership if exposed) |

### 5.3 Rules

1. Form MUST NOT appear for statuses lacking `updateDraft`.
2. Validation messages SHOULD mirror server validation categories ([010](../../../../010-api-gateway-integration-communication-standards.md)); client Zod MAY pre-check shape only.
3. Save MUST invoke `updateDraft` (or create). Client MUST NOT mark status Approved.
4. Unsaved draft recovery MAY use platform session prefs for **form draft UI state** only — never as SoR.

---

## 6 Relationships Viewer

### 6.1 Purpose

Present Specification relationships as **references only** (ARCH-011 / Part 1).

### 6.2 Relationship kinds (presentation)

| Kind                                                  | Meaning                                | Navigation                       |
| ----------------------------------------------------- | -------------------------------------- | -------------------------------- |
| `requirement`                                         | Linked Requirement                     | Requirements Workbench deep link |
| `trace_link`                                          | Traceability artefact                  | Traceability Workbench           |
| `verification`                                        | Verification record                    | Verification Workbench           |
| `test_case` / `test_suite` / `execution` / `evidence` | Future                                 | Governed unavailable slot        |
| Internal Specification                                | Predecessor / successor / related Spec | Spec deep link                   |

Exact kind enumerations follow Domain / contracts; Workbench MUST render unknown kinds safely without inventing ownership.

### 6.3 Capabilities

| Capability  | Rule                                                |
| ----------- | --------------------------------------------------- |
| List        | Show kind, target label/id, summary                 |
| Navigate    | Open deep link when capability available            |
| Add         | Only when `addRelationship` ∈ `availableActions`    |
| Remove      | Only when `removeRelationship` ∈ `availableActions` |
| Unavailable | Governed empty — MUST NOT fabricate foreign records |

### 6.4 Non-goals

Relationships Viewer MUST NOT:

- Own foreign SoR data
- Compute coverage or verification outcomes
- Imply Test Case generation

---

## 7 Version Lineage & Comparison

### 7.1 Version Lineage view

SHALL show:

- Current version label (`major.minor`)
- `versionLineage` identifiers (navigable)
- Predecessor / successor links
- Authoritative flag on the current Approved tip

### 7.2 Version Comparison

| Element         | Requirement                                                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Inputs          | Two Specification ids (query `compare?with=`)                                                                                          |
| Layout          | Side-by-side or unified diff of content fields                                                                                         |
| Compared fields | Title, description, objective, scope, pre/postconditions, acceptance criteria, risks, dependencies, type/priority/classification, tags |
| Notes           | Display `comparisonNotes` when present                                                                                                 |
| Actions         | No lifecycle from Compare alone — user returns to Inspector                                                                            |

### 7.3 Rules

1. Comparison is presentation of two server DTOs — MUST NOT invent a third merged entity.
2. Superseded versions remain readable and comparable.
3. Only latest Approved is authoritative for downstream consumers (Domain rule; UI MUST display the flag, not redefine it).

---

## 8 History Panel

### 8.1 Purpose

Append-only material history for auditors and authors.

### 8.2 Binding

Each entry: `at`, `by`, `kind`, `summary` from `historySummaries`.

### 8.3 Rules

1. History is read-only.
2. History MUST NOT be reconstructed client-side from guesses.
3. Full History route (Part 2) MAY paginate if API supports it; otherwise show provided summaries.

---

## 9 Action surface mapping

Canonical actions from `@apzhub/qep-contracts` (`QEP_TEST_SPECIFICATION_ACTIONS`):

| Action               | Typical UI               | Notes                                  |
| -------------------- | ------------------------ | -------------------------------------- |
| `updateDraft`        | Edit / Save              | Draft only                             |
| `submitForReview`    | Submit for review dialog | May collect reviewer                   |
| `approve`            | Approve dialog           | Rationale/comment per policy           |
| `reject`             | Reject dialog            | Rationale required                     |
| `withdraw`           | Withdraw confirm         | Rationale recommended/required         |
| `supersede`          | Supersede flow           | Successor existing or create-successor |
| `retire`             | Retire confirm           | Terminal                               |
| `cancel`             | Cancel confirm           | Pre-approval abandon                   |
| `addRelationship`    | Add relationship dialog  | Draft (per contracts)                  |
| `removeRelationship` | Remove control           | Draft (per contracts)                  |

### 9.1 Rules

1. Workbench MUST NOT render an action absent from `availableActions`.
2. If Domain supports a transition not yet exposed in contracts (e.g. rejected → draft), Workbench MUST wait for server `availableActions` — MUST NOT invent `returnToDraft` client-side.
3. Labels MUST use product language (Approve, Retire, …) — never backend role names.
4. Destructive / terminal actions SHALL use confirmation dialogs.

---

## 10 Dialogs & overlays

| Dialog               | Trigger           | Required inputs                             |
| -------------------- | ----------------- | ------------------------------------------- |
| Submit for review    | `submitForReview` | Reviewer (if API requires)                  |
| Approve              | `approve`         | Optional/required comment per policy        |
| Reject               | `reject`          | Rationale **required**                      |
| Withdraw             | `withdraw`        | Rationale recommended/required              |
| Supersede            | `supersede`       | Successor id **or** create-successor fields |
| Retire / Cancel      | matching action   | Confirmation + rationale as API requires    |
| Add relationship     | `addRelationship` | Kind + target reference                     |
| Create Specification | create permission | Required create fields                      |

Dialogs MUST call the corresponding REST command and close only on success (or explicit cancel).

---

## 11 Future presentation slots

The following MAY appear as labelled slots with **governed unavailable** states until those capabilities exist:

- Derived Test Cases
- Executions
- Evidence
- Coverage

They MUST NOT be fake populated screens.

---

## 12 Traceability

| This Part                      | Trace                              |
| ------------------------------ | ---------------------------------- |
| Shell / panels                 | ARCH-006                           |
| Surfaces catalogue             | ARCH-011 §11                       |
| DTO / actions                  | ENG-050B · `@apzhub/qep-contracts` |
| Domain editability / lifecycle | ENG-050A                           |
| IA / routes                    | OES-ARCH-012 Part 2                |

---

## 13 Explicit non-goals (Part 3)

This Part does NOT define:

- Dashboard widgets and review queue UX detail (Part 4)
- Performance budgets, a11y matrices, AI/MCP (Part 5)
- React/Next implementation

---

## 14 Success criteria (Part 3)

Part 3 is successful when an engineer can implement:

1. Inspector regions and DTO field binding
2. Draft edit / create forms gated by `availableActions`
3. Relationships viewer with add/remove gates
4. Version lineage and comparison
5. History panel
6. Action dialogs mapped 1:1 to server actions

without inventing component architecture or action legality.

---

## END OF PART 3

**Next:** Part 4 — Workflow, Lifecycle, Dashboards & User Experience.
