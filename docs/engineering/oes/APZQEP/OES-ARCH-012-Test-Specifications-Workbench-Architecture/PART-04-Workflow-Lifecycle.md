# APZQEP-OES-ARCH-012

# PART 4 — Workflow, Lifecycle, Dashboards & User Experience

| Item                  | Value                                                                             |
| --------------------- | --------------------------------------------------------------------------------- |
| Document              | APZQEP-OES-ARCH-012                                                               |
| Title                 | Test Specifications Workbench Architecture                                        |
| Part                  | **4 of 5** — Workflow, Lifecycle, Dashboards & User Experience                    |
| Status                | **FILED**                                                                         |
| Governing methodology | [OES-000](../../OES-000-Owner-Engineering-Specification-Standard.md) (**FROZEN**) |
| Writing standard      | [OES-001](../../OES-001-Engineering-Writing-Standard.md) (**FROZEN**)             |
| Review standard       | [OES-002](../../OES-002-Engineering-Review-and-Acceptance-Standard.md)            |
| Baselines             | ARCH-011 §7–9 · ENG-050A lifecycle · ENG-050B REST · Parts 1–3                    |

---

## 1 Purpose

This Part defines **lifecycle UX**, **persona workflows**, **Review queue behaviour**, **Dashboard attention model**, and **cross-cutting user experience** for the Test Specifications Workbench.

The Workbench SHALL present lifecycle; it MUST NOT own or invent lifecycle rules (Part 1 Principle 1 / 4).

---

## 2 Lifecycle presentation model

### 2.1 Normative statuses (Domain / contracts)

| Status         | User-facing label | Mutable content        | Authoritative                |
| -------------- | ----------------- | ---------------------- | ---------------------------- |
| `draft`        | Draft             | Yes (if `updateDraft`) | No                           |
| `under_review` | Under review      | No                     | No                           |
| `approved`     | Approved          | No                     | Yes (when `isAuthoritative`) |
| `rejected`     | Rejected          | No                     | No                           |
| `superseded`   | Superseded        | No                     | No                           |
| `withdrawn`    | Withdrawn         | No                     | No                           |
| `retired`      | Retired           | No                     | No                           |
| `cancelled`    | Cancelled         | No                     | No                           |

### 2.2 UX rules

1. Status badges SHALL use Design System semantic tokens — no hardcoded colours.
2. `isAuthoritative` SHALL be visually distinct (only latest Approved tip).
3. Terminal statuses (`superseded`, `withdrawn`, `retired`, `cancelled`) SHALL be clearly non-actionable except navigation/history.
4. The Workbench MUST refresh DTO after every transition command.

---

## 3 Canonical workflow journeys

### 3.1 Author — create and submit

```text
Dashboard / Explorer
  → New Specification (permission-gated)
  → Create Draft Form → POST create
  → Inspector (draft)
  → Edit as needed (updateDraft)
  → Submit for review (submitForReview)
  → Inspector (under_review) — await decision
```

### 3.2 Reviewer / Approver — decide

```text
Review queue (or Explorer filter under_review)
  → Select Specification → Inspector
  → Approve (approve)  OR  Reject (reject + rationale)
  → Server returns new status + availableActions
```

### 3.3 Author — after rejection

```text
Explorer / notification deep link
  → Inspector (rejected)
  → If server exposes return-to-draft (or equivalent) in availableActions → return to Draft and rework
  → Else: Withdraw / Cancel only as exposed — MUST NOT invent client transition
```

**Contract note:** Domain ENG-050A allows rejected → draft. Current `@apzhub/qep-contracts` `availableActions` for `rejected` expose `withdraw` / `cancel` only. Workbench Engineering SHALL follow **server** `availableActions`. Closing any gap is an Infrastructure / Contracts concern, not a Workbench invention.

### 3.4 Steward — supersede Approved

```text
Inspector (approved + isAuthoritative)
  → Supersede (supersede)
  → Choose existing successor OR create successor draft
  → Predecessor → superseded; successor → draft (or existing)
  → Navigate to successor
```

### 3.5 Steward — retire / withdraw

```text
Inspector (approved | other eligible)
  → Retire OR Withdraw per availableActions
  → Confirmation + rationale
  → Terminal / non-authoritative state
```

### 3.6 Auditor — inspect history

```text
Search / Explorer → deep link
  → Inspector → History / Versions
  → Compare prior versions as needed
  → No mutation
```

---

## 4 Action → status expectations (presentation)

The table below is a **UX expectation aid**. Server validation remains authoritative; UI MUST NOT assume success without response.

| From         | Action                                | Expected to (typical)    |
| ------------ | ------------------------------------- | ------------------------ |
| draft        | `submitForReview`                     | under_review             |
| under_review | `approve`                             | approved                 |
| under_review | `reject`                              | rejected                 |
| under_review | `withdraw` / `cancel`                 | withdrawn / cancelled    |
| approved     | `supersede`                           | superseded (+ successor) |
| approved     | `retire` / `withdraw`                 | retired / withdrawn      |
| rejected     | `withdraw` / `cancel`                 | withdrawn / cancelled    |
| rejected     | _(future return-to-draft if exposed)_ | draft                    |

---

## 5 Review queue UX

### 5.1 Purpose

Operational attention surface for Specifications awaiting review decisions (Part 2 §7).

### 5.2 Behaviour

| Element          | Rule                                                    |
| ---------------- | ------------------------------------------------------- |
| Default filter   | `status=under_review`                                   |
| Optional filters | Owner, type, classification, reviewer, updated          |
| Row actions      | Same as Explorer — open Inspector                       |
| Empty state      | “No Specifications awaiting review” — governed empty    |
| Permission       | Queue MAY be hidden if user lacks review/approve grants |

### 5.3 Reviewer guidance (UX copy principles)

- Show objective / scope summary before decision.
- Reject MUST collect rationale.
- Approve SHOULD surface acceptance criteria for confirmation.
- Never show backend permission key strings in primary UI.

---

## 6 Dashboard model

### 6.1 Purpose

Attention and counts for quality managers, product owners, and leads — **not** a second SoR.

### 6.2 Widgets (minimum set)

| Widget                        | Content                                               | Drill-down                  |
| ----------------------------- | ----------------------------------------------------- | --------------------------- |
| Counts by status              | Draft / Under review / Approved / Rejected / Terminal | Explorer with status filter |
| Awaiting my review            | Items where user is reviewer (if API supports)        | Review queue                |
| Recently updated              | Last N Specifications                                 | Explorer sort               |
| Authoritative tip changes     | Recent supersessions                                  | History / Spec deep link    |
| Classification / priority mix | Simple faceted counts                                 | Explorer filters            |

### 6.3 Rules

1. Dashboard data MUST come from list/search/aggregate APIs — client MUST NOT invent counts.
2. Widgets are presentation; they MUST NOT trigger lifecycle without explicit user action on a Specification.
3. Dashboard MUST degrade gracefully if an aggregate endpoint is unavailable (show Explorer CTA).
4. No fake “coverage %” or “execution pass rate” widgets — those belong to future capabilities.

---

## 7 Notifications & attention (consume only)

Aligned with [021](../../../../021-notification-activity-attention-management-framework.md):

| Event (Domain emits)                             | Workbench role                                   |
| ------------------------------------------------ | ------------------------------------------------ |
| Submitted / approved / rejected / superseded / … | Deep-link target for Attention Engine deliveries |
| Activity stream                                  | Read-only consume when platform exposes          |

Workbench MUST NOT implement its own notification subsystem.

---

## 8 Empty, loading, error, forbidden

| State                    | Requirement                                                  |
| ------------------------ | ------------------------------------------------------------ |
| Loading                  | Design System loading patterns; no blank flash of wrong data |
| Empty Explorer           | Guided CTA to Create (if permitted) or adjust filters        |
| Not found                | Governed 404-style panel for deep links                      |
| Forbidden                | Governed 403-style panel — no data leakage                   |
| API error                | Typed error envelope messaging; retry where safe             |
| Unavailable foreign link | Slot message — capability not present / no permission        |

---

## 9 Responsive & session UX

1. Desktop: Explorer + Inspector split per ARCH-006.
2. Narrow viewports: Inspector as overlay/drawer; focus trap required (Part 5 a11y).
3. Session restore (018): restore filters + selection; re-validate permissions; re-fetch.
4. Background jobs (if any) MUST NOT be invented in Workbench — async work stays server-side.

---

## 10 Accessibility UX requirements (behavioural)

Detailed matrices in Part 5. Behavioural minimums:

1. Every action reachable by keyboard.
2. Status changes announced to assistive tech (live region or focus management).
3. Dialogs trap focus and restore on close.
4. Colour is not the sole status signal (badge text + icon/pattern).
5. WCAG AA contrast via Design System tokens only.

---

## 11 Persona → surface matrix

| Persona         | Primary surfaces                 | Typical actions                      |
| --------------- | -------------------------------- | ------------------------------------ |
| Author          | Explorer, Inspector, Create/Edit | create, updateDraft, submitForReview |
| Reviewer        | Review queue, Inspector          | approve, reject                      |
| Approver        | Review queue, Inspector          | approve, reject                      |
| Steward / owner | Inspector, Versions              | supersede, retire, withdraw          |
| Auditor         | Search, History, Compare         | read-only                            |
| Quality manager | Dashboard, Review, Explorer      | monitor, drill-down                  |
| Product owner   | Dashboard, Explorer              | monitor, navigate refs               |

---

## 12 Traceability

| This Part        | Trace                              |
| ---------------- | ---------------------------------- |
| Lifecycle states | ARCH-011 §7 · ENG-050A             |
| Governance       | ARCH-011 §9                        |
| Actions          | `@apzhub/qep-contracts` · ENG-050B |
| Shell / sessions | ARCH-006 · 018                     |
| Notifications    | 021 (consume)                      |
| Components       | OES-ARCH-012 Part 3                |

---

## 13 Explicit non-goals (Part 4)

This Part does NOT define:

- Performance budgets, security headers, AI/MCP authority (Part 5)
- Owner Acceptance checklist detail (Part 5 / Appendix E)
- React/Next implementation

---

## 14 Success criteria (Part 4)

Part 4 is successful when an engineer can implement:

1. End-to-end persona journeys without inventing transitions
2. Review queue and Dashboard attention model
3. Status / authoritative presentation rules
4. Empty/error/forbidden and session restore behaviour

without inventing workflow or business rules.

---

## END OF PART 4

**Next:** Part 5 — Performance, Accessibility, Security, AI/MCP Boundaries, Acceptance Criteria.
