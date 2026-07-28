# APZQEP-OES-ARCH-015

# PART 3 — Permissions, availableActions & Workbench Architecture

| Item      | Value               |
| --------- | ------------------- |
| Document  | APZQEP-OES-ARCH-015 |
| Part      | **3 of 5**          |
| Programme | APZQEP-ARCH-015     |

---

## 1. Permissions model (conceptual)

Test Execution **SHALL** use the platform PermissionService / authorisation baseline. It **SHALL NOT** invent a second identity system.

### 1.1 Permission concepts

| Concept                   | Typical use                                       |
| ------------------------- | ------------------------------------------------- |
| `qep.execution.read`      | View executions in scope                          |
| `qep.execution.create`    | Create draft executions                           |
| `qep.execution.prepare`   | Seal manifest / mark ready                        |
| `qep.execution.assign`    | Assign / reassign executor                        |
| `qep.execution.execute`   | Start, record steps, complete (as executor/agent) |
| `qep.execution.control`   | Pause / block / resume / cancel (controller)      |
| `qep.execution.review`    | Accept / reject                                   |
| `qep.execution.supersede` | Supersede                                         |
| `qep.execution.ingest`    | Submit external/automated results                 |
| `qep.execution.admin`     | Privileged operational actions (audited)          |

Exact permission strings **MAY** be refined in Engineering Specification; architecture requires the capability surface above.

### 1.2 Role responsibilities (architectural)

| Role                                | Capabilities                                |
| ----------------------------------- | ------------------------------------------- |
| QA Engineer / Executor              | Execute assigned work; record results       |
| Reviewer                            | Review queue; accept/reject                 |
| Test Lead / Owner                   | Create, prepare, assign, supersede          |
| Automation Agent (service identity) | Ingest / execute under `ingest` + `execute` |
| Auditor (read)                      | Read + audit trail; no mutate               |

---

## 2. availableActions (sole UI authority)

### 2.1 Rule

> **`availableActions` is the sole UI authority for executable actions.**

The Application layer **SHALL** compute `availableActions` from:

1. Current lifecycle state
2. Actor permissions
3. Assignment relationship (executor / reviewer / owner)
4. Policy flags (review required, fast-path accept, etc.)
5. Concurrency / revision validity

Workbench **SHALL**:

- Render action controls only from `availableActions`
- **NOT** reconstruct actions from status enums
- **NOT** duplicate permission logic
- Refresh from authoritative API after failures / stale revision
- Treat absence of an action as non-executable — never invent it

See ADR-0083.

### 2.2 Action descriptors (architectural)

Each available action **SHOULD** include:

| Field                  | Purpose                                                         |
| ---------------------- | --------------------------------------------------------------- |
| `action`               | Stable command key (e.g. `start`, `recordStepResult`, `accept`) |
| `label`                | Display label (server-supplied or i18n key)                     |
| `requiresConfirmation` | Optional UX hint                                                |
| `reasonRequired`       | Whether reason/comment mandatory                                |
| `dangerous`            | Optional severity hint                                          |

---

## 3. Workbench architecture (presentation only)

Workbench **SHALL** remain a pure presentation and authorised-action invocation layer. No business behaviour ownership.

### 3.1 Execution workspace

Primary surface for a single TestExecution:

- Header: number, status, mode, outcome, revision
- Source context: plan/spec version refs (read-only), link-outs to frozen Workbench routes
- Target context: ExecutionContext display
- Progress: steps completed / remaining (presentation of authoritative counts)
- Step list + active step
- Expected vs actual result editors (invoke record commands)
- Outcome selectors (only outcomes allowed by Domain for that step — via contract)
- Evidence reference association UI
- Observations list/create
- Assignment display
- History panel (append-only)
- Action bar bound exclusively to `availableActions`

### 3.2 Assigned work

Operator queue:

- Assigned to me
- Ready / in progress / blocked / paused
- Recently completed
- Optional scheduled window metadata (not a lifecycle state)

### 3.3 Review queue

- Executions in `submitted_for_review`
- Review context: source, steps, outcomes, evidence refs, observations
- Decision form (accept/reject) only if actions present
- Reviewer independence messaging when policy requires

### 3.4 Explorer and inspector

- Discover executions via search / filters (tenant + permission aware)
- Inspector shows authoritative DTO fields
- No client-side lifecycle engines

### 3.5 Progress views

| View                | Authoritative source                                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| Execution progress  | Execution DTO counts / status                                                                                   |
| Step progress       | Step collection                                                                                                 |
| Plan-level progress | Query aggregating executions referencing a plan version — **facts owned by Test Execution**; Plan SoR unchanged |
| Outcome summaries   | Derived fields from API                                                                                         |
| Review status       | Status field                                                                                                    |

Presentation **MAY** compute percentages client-side from authoritative counts. Presentation **SHALL NOT** invent statuses.

### 3.6 Error and conflict handling

| Condition                  | UX expectation                                         |
| -------------------------- | ------------------------------------------------------ |
| Stale revision             | Show conflict; refresh; re-apply only via new command  |
| Permission loss            | Actions disappear after refresh; explain access denied |
| Invalid transition         | Show server error; refresh `availableActions`          |
| Concurrent edit            | Optimistic concurrency failure path                    |
| Unavailable evidence       | Association fails with typed error                     |
| Failed ingestion           | Operator-visible quarantine / rejection reason         |
| Network interrupt          | No silent success; retry-safe commands                 |
| Action no longer available | Disable/remove; refresh                                |

### 3.7 Accessibility (architectural — mandatory)

Workbench **SHALL** architect for:

- Full keyboard operation of step navigation and actions
- Focus management on step change and dialog open/close
- Semantic structure (headings, lists, status regions)
- Screen-reader announcements for status/outcome changes
- Non-colour outcome indicators (icons + text)
- Explicit error identification linked to fields
- Usable long-running sessions (save/resume via Domain pause — not client-only drafts as SoR)

### 3.8 Responsive behaviour

Desktop-first operational workspace; smaller screens **SHALL** preserve step performance and action invocation without hiding authoritative status. Visual design is out of scope.

---

## 4. Concurrency expectations

| Scenario                              | Architectural behaviour                                                |
| ------------------------------------- | ---------------------------------------------------------------------- |
| Two users mutate same execution       | Optimistic concurrency; second fails with conflict                     |
| Update during review                  | Mutating execute actions absent; review actions only                   |
| Automation after cancel               | Ingestion rejected / quarantined                                       |
| Plan version changes during execution | Ignored for sealed manifest; new work uses new execution               |
| Executor loses permission             | Mutating actions cease; control/cancel may remain for privileged roles |
| Reassignment while active             | Explicit command; audit; prior executor loses execute actions          |

---

## STOP

```text
PART 3 COMPLETE
AVAILABLEACTIONS SOLE UI AUTHORITY
WORKBENCH PURITY PRESERVED
ACCESSIBILITY ARCHITECTURALLY REQUIRED
```
