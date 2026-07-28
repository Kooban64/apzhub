# APZQEP-OES-ENG-090A

# PART 4 — API Contracts, Security & Workbench Contracts

| Item         | Value                                                                  |
| ------------ | ---------------------------------------------------------------------- |
| Document     | APZQEP-OES-ENG-090A                                                    |
| Part         | **4 of 5**                                                             |
| Programme    | APZQEP-OES-ENG-090A                                                    |
| Status       | **ACCEPTED / APPROVED / ENGINEERING SPECIFICATION BASELINED / CLOSED** |
| Architecture | APZQEP-ARCH-015 Parts 3–4 — authoritative                              |

---

## 1. API contracts

### 1.1 Base path

Public client API under platform gateway:

```text
/api/v1/qep/executions
```

Consistent with frozen QEP REST patterns. Exact OpenAPI artefacts **SHALL** be produced in Engineering — this OES locks resources, verbs, authz, and envelopes.

### 1.2 Resources

| Method | Path                                                 | Purpose                             | Typical permission                      |
| ------ | ---------------------------------------------------- | ----------------------------------- | --------------------------------------- |
| `POST` | `/api/v1/qep/executions`                             | `createExecution`                   | `qep.execution.create`                  |
| `GET`  | `/api/v1/qep/executions`                             | `listExecutions`                    | `qep.execution.read`                    |
| `GET`  | `/api/v1/qep/executions/assigned`                    | `listAssigned`                      | `qep.execution.read` + assignment scope |
| `GET`  | `/api/v1/qep/executions/review-queue`                | `listReviewQueue`                   | `qep.execution.review`                  |
| `POST` | `/api/v1/qep/executions/ingestions`                  | `ingestExternalResult`              | `qep.execution.ingest`                  |
| `GET`  | `/api/v1/qep/executions/{id}`                        | `getExecution` (+ embedded actions) | `qep.execution.read`                    |
| `GET`  | `/api/v1/qep/executions/{id}/manifest`               | `getManifest`                       | `qep.execution.read`                    |
| `GET`  | `/api/v1/qep/executions/{id}/history`                | `getHistory`                        | `qep.execution.read`                    |
| `GET`  | `/api/v1/qep/executions/{id}/available-actions`      | `getAvailableActions`               | `qep.execution.read`                    |
| `GET`  | `/api/v1/qep/executions/{id}/steps`                  | List steps                          | `qep.execution.read`                    |
| `POST` | `/api/v1/qep/executions/{id}/actions/{action}`       | Command invocation                  | Action-specific                         |
| `POST` | `/api/v1/qep/executions/{id}/steps/{stepId}/results` | `recordStepResult`                  | `qep.execution.execute`                 |
| `POST` | `/api/v1/qep/executions/{id}/evidence-references`    | `associateEvidence`                 | `qep.execution.execute` (or tighter)    |
| `POST` | `/api/v1/qep/executions/{id}/observations`           | `recordObservation`                 | `qep.execution.execute`                 |
| `GET`  | `/api/v1/qep/executions/progress/by-plan/{planId}`   | `getPlanExecutionProgress`          | `qep.execution.read`                    |

`{action}` keys **SHALL** match command keys: `prepare`, `assign`, `start`, `pause`, `block`, `resume`, `complete`, `submitForReview`, `accept`, `reject`, `cancel`, `supersede` (and equivalents listed in Appendix D).

### 1.3 Request context

Every request **SHALL** carry / resolve: auth token, correlation id, org/tenant, workspace/project, locale, timezone (Document 010).

Mutating requests **SHALL** include `revision` (optimistic concurrency) except create/ingest-create paths where N/A.

### 1.4 Response envelope

Standard APZHUB envelope:

- Success: data DTO + meta (correlation id, revision)
- Error: typed category + safe message + correlation id — **no** raw backend leakage

Execution DTOs **SHALL** include `availableActions` on get/mutate responses unless explicitly actions-only query.

### 1.5 Error categories

| Category              | HTTP guidance                                           |
| --------------------- | ------------------------------------------------------- |
| `validation`          | 400                                                     |
| `unauthenticated`     | 401                                                     |
| `forbidden`           | 403                                                     |
| `not_found`           | 404                                                     |
| `conflict`            | 409                                                     |
| `precondition_failed` | 412 / 422 (platform consistency)                        |
| `ingestion_rejected`  | 422 / 409                                               |
| `gone`                | 410 with supersession redirect metadata when applicable |

---

## 2. Security requirements

### 2.1 Permission catalogue (normative strings)

| Permission                | Use                                       |
| ------------------------- | ----------------------------------------- |
| `qep.execution.read`      | View in scope                             |
| `qep.execution.create`    | Create draft                              |
| `qep.execution.prepare`   | Seal manifest / ready                     |
| `qep.execution.assign`    | Assign / reassign                         |
| `qep.execution.execute`   | Start, record, complete as executor/agent |
| `qep.execution.control`   | Pause / block / resume / cancel           |
| `qep.execution.review`    | Accept / reject                           |
| `qep.execution.supersede` | Supersede                                 |
| `qep.execution.ingest`    | External/automated submissions            |
| `qep.execution.admin`     | Privileged ops (audited)                  |

### 2.2 Zero Trust controls

- Authenticate every request
- Authorise every command/query
- Validate every payload
- Rate-limit at gateway
- Absolute tenant isolation
- Assignment-scoped execute rights
- Distinct reviewer permissions
- Evidence access checks on association
- Service identities for automation agents
- No secrets in logs; classify actual results / datasets as potentially sensitive
- Retention / export restriction hooks for future Engineering
- CSRF/XSS protections via platform defaults
- Superadmin is explicit tier, not bypass

### 2.3 Role mapping (conceptual → permissions)

| Role              | Permissions (typical)                        |
| ----------------- | -------------------------------------------- |
| Executor          | read + execute (+ limited control if policy) |
| Reviewer          | read + review                                |
| Test Lead / Owner | create, prepare, assign, supersede, control  |
| Automation Agent  | ingest + execute (service identity)          |
| Auditor           | read only                                    |

Exact org role bindings are platform configuration — Workbench **SHALL NOT** hardcode backend role names.

---

## 3. Workbench contracts

### 3.1 Nature

Workbench is **presentation only**. It invokes authorised APIs and renders server truth. No Domain/Infrastructure imports. No client lifecycle engine.

Module identity (future): `modules/qep-test-execution` with `module.yaml` before code (Document 025).

### 3.2 Surfaces

| Surface                  | Contract                                                                                                                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Execution workspace**  | Single execution: header, source context, context descriptors, progress, steps, expected/actual editors, outcome selectors (allowed set from contract), evidence refs, observations, assignment, history, action bar from `availableActions` only |
| **Assigned work**        | Queues: assigned to me; ready / in progress / blocked / paused; recently completed                                                                                                                                                                |
| **Review queue**         | `submitted_for_review`; decision form only if actions present                                                                                                                                                                                     |
| **Explorer / inspector** | Permission-filtered discovery; inspector shows DTO fields                                                                                                                                                                                         |
| **Progress views**       | Counts/status from API; client **MAY** compute percentages from authoritative counts; **SHALL NOT** invent statuses                                                                                                                               |
| **Plan progress**        | Uses `getPlanExecutionProgress`; does not mutate Plan SoR                                                                                                                                                                                         |

### 3.3 Action bar rules

1. Render controls **only** from `availableActions`.
2. **Never** reconstruct actions from status enums.
3. **Never** duplicate permission logic.
4. Refresh after failures / stale revision.
5. Absence of action = non-executable.

### 3.4 Error / conflict UX

| Condition            | UX                                               |
| -------------------- | ------------------------------------------------ |
| Stale revision       | Conflict; refresh; re-apply via new command      |
| Permission loss      | Actions disappear after refresh                  |
| Invalid transition   | Show typed error; refresh actions                |
| Concurrent edit      | Optimistic concurrency path                      |
| Unavailable evidence | Typed association failure                        |
| Failed ingestion     | Quarantine/rejection reason visible to operators |
| Network interrupt    | No silent success; retry-safe                    |
| Action gone          | Disable/remove; refresh                          |

### 3.5 Design System / a11y

- Tokens only; shadcn/ui + Tailwind shared library; Lucide only
- WCAG AA
- No one-off module visual systems
- Shell regions per Documents 005 / 016 / 017

### 3.6 Deep links

Stable routes for execution workspace, assigned queue, review queue, explorer — registered via module nav, permission-filtered. Exact path strings fixed in Workbench Engineering; conceptual resources locked here.

---

## 4. Integration with frozen Workbenches

Workbench **MAY** link-out to frozen Plans/Specs/Requirements/Verification/Traceability routes for read context. **SHALL NOT** embed foreign aggregate editors or write foreign SoRs.

---

## STOP

```text
PART-04 COMPLETE
API + SECURITY + WORKBENCH CONTRACTS FIXED
```
