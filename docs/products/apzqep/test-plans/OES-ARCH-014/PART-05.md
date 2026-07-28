# APZQEP-OES-ARCH-014
# PART 5 — Performance, Accessibility, Security, Observability, AI/MCP Boundaries & Acceptance Criteria

| Item | Value |
| ---- | ----- |
| Document | APZQEP-OES-ARCH-014 |
| Part | **5 of 5** |
| Programme | APZQEP-ARCH-014 |
| Status | **IMPLEMENTED / AWAITING OWNER ACCEPTANCE** |

---

## 1. Purpose

This Part defines **non-functional architecture**, **AI/MCP authority boundaries**, **quality gates**, and **Owner Acceptance criteria** for the Test Plans Workbench Architecture. It is the final normative Part before Appendices and `COMPLETE.md` assembly.

**Workbench Engineering remains NOT AUTHORISED until this OES is Owner-Accepted under OES-002.**

---

## 2. Performance architecture

### 2.1 Targets (Workbench Engineering SHALL meet)

| Concern | Target |
| ------- | ------ |
| Explorer / Review queue pagination | Server-driven; **max `pageSize` = 50** (ARCH-013 / ENG-060B Part 2 §5) |
| Large lists | Virtualisation **SHOULD** be used; unbounded DOM rendering **MUST NOT** occur |
| Explorer first meaningful paint (warm) | Perceived interactive ≤ 2s on certified baseline environments |
| Inspector open after selection | ≤ 500ms after DTO available (network excluded) |
| Search debounce | 200–400ms before query |
| Dashboard widgets | Bounded queries only |

### 2.2 Rules

1. The Workbench **MUST NOT** block the UI on non-critical secondary fetches (History/Audit **MAY** lazy-load).
2. Compare (once delivered) **MUST** use two server-driven fetches; the client **MUST NOT** merge them into a fabricated third entity (Part 4 §6).
3. Performance work **MUST NOT** move business rules into the client.
4. Metrics **SHOULD** emit via Platform Observability (Document 014) with correlation IDs (Document 010).

---

## 3. Accessibility architecture (WCAG AA)

### 3.1 Mandatory bar

| Requirement | Standard |
| ----------- | -------- |
| Conformance | **WCAG 2.2 AA** (platform target WCAG AA) |
| Keyboard | All interactive controls operable without a pointer |
| Focus | Visible focus; dialog focus trap; restore on close |
| Name / role / value | Correct semantics for buttons, tabs, tables, dialogs |
| Status | Not colour-only; announce changes |
| Motion | Respect `prefers-reduced-motion` |

### 3.2 Workbench-specific

1. Explorer and Review queue **SHALL** be keyboard-navigable grid/table patterns.
2. Inspector panels **SHALL** be ARIA-compliant (tabs/regions with correct roles).
3. Action menus **SHALL** expose accessible names matching visible labels.
4. Playwright a11y checks (axe) **SHALL** cover Dashboard, Explorer, Review, Inspector, and primary dialogs before any future Workbench Certification.

### 3.3 Design System

Tokens and shared components from Document 006 / 028 only — no one-off inaccessible widgets.

---

## 4. Security architecture

Aligned with Document 013 (Zero Trust):

| Control | Workbench rule |
| ------- | -------------- |
| Authn | Session via Better Auth / platform shell — no separate login screen |
| Authz | Permission Platform + server `availableActions` — **UI hide is not security** |
| Validation | Never trust the client; server validates all commands |
| Secrets | **MUST NOT** embed tokens in URLs, localStorage business payloads, or logs |
| No client-invented grants | The Workbench **SHALL NOT** compute, cache, or assume a permission grant the server has not returned; every mutating control's visibility derives solely from `availableActions` / permission-filtered navigation (Part 2 §11) |
| XSS | Design System / React escaping; no unsanitised HTML injection for Plan content |
| CSRF | Platform central controls |
| Deep links | Id only; no capability tokens or `expectedRevision` values in query strings |
| Error leakage | **MUST NOT** show raw backend/engine errors |
| Superadmin | Explicit tier UX — not a silent bypass affordance |
| Audit | Mutations produce server audit; the Workbench **MUST NOT** fabricate audit rows |

Every mutating call: authenticated → authorised → validated → executed → audited (server path). The Workbench is presentation only.

---

## 5. Observability

| Pillar | Workbench contribution |
| ------ | ------------------------ |
| Logs | Client **MAY** log UX faults with correlation id; **MUST NOT** log secrets or full PII dumps |
| Traces | Propagate correlation id on API calls (Document 010) |
| Metrics | Optional UX telemetry events (§5.1) |
| Health | Capability health consumed from platform — not owned |

### 5.1 UI telemetry events (architectural catalogue)

The Workbench **MAY** emit non-authoritative UX telemetry events for Platform Observability, always **in addition to** — never instead of — server-side audit/events:

| Event (UI) | When |
| ----------- | ---- |
| `qep.plan.explorer.viewed` | Explorer loaded |
| `qep.plan.inspector.opened` | Plan Inspector opened |
| `qep.plan.action.attempted` | User invokes an action dialog |
| `qep.plan.action.succeeded` / `.failed` | Action command resolves |
| `qep.plan.search.performed` | Search query executed |
| `qep.plan.compare.unavailable_viewed` | Governed unavailable Compare slot rendered (Part 4 §6) |

These are **UI telemetry only** — they carry no lifecycle authority and **MUST NOT** be treated as a substitute for Domain events or Infrastructure audit records.

---

## 6. AI boundary

### 6.1 Stance

AI is a **future consumer** of the Test Plans Workbench. This programme **SHALL NOT** implement AI.

### 6.2 Where AI MAY assist (future, separately authorised)

| Assistance | Constraint |
| ---------- | ---------- |
| Draft plan content suggestions (title, objective, item selection) | Suggestions only; human confirmation required |
| Coverage / gap analysis over references | Read-only; no SoR writes without approval |
| Duplicate plan detection | Suggest; no silent merge |
| Scheduling assistance | Ordering / date suggestions only |

### 6.3 AI MUST NOT (ever, without new governance)

- **Approve, reject, mark-ready, start-execution, complete, archive, cancel, or supersede a Plan autonomously as authority.**
- Bypass `availableActions` / permissions.
- Mutate certified Domain or Infrastructure behaviour.
- Become system of record for Plans.
- Silent-auto-submit for review.

### 6.4 Execution path (mandatory)

```text
AI suggestion
  → Human confirmation in Workbench
  → Platform API command
  → Authn / Authz / Validation
  → Domain transition
  → Persistence / events / audit
```

No alternate path. No AI approve bypass under any circumstance.

---

## 7. MCP boundary (future)

### 7.1 Stance

MCP is a **future consumer** interface. This programme **SHALL NOT** implement MCP servers or tools.

### 7.2 Future MCP MAY expose (architectural)

- Read Plan summary / items / status.
- List Plans with permission filters.
- Propose Draft Plan payloads for human confirmation.

### 7.3 MCP MUST NOT

- Hold elevated privileges beyond the invoking user.
- Perform privileged lifecycle transitions without the same authz path as REST.
- Cache Plan data as authoritative outside the platform.

---

## 8. Implementation boundaries (Workbench Engineering — future)

When separately authorised, Workbench Engineering **SHALL**:

| Do | Do not |
| -- | ------ |
| Implement presentation per Parts 1–5 | Own business rules |
| Call `/api/v1/qep/plans/*` (and platform search) | Call Domain packages / DB / connectors |
| Use Design System + shell regions | Build a parallel shell |
| Gate actions on `availableActions` | Hardcode a transition matrix as authority |
| Meet a11y / performance / security gates | Ship without Playwright a11y on primary surfaces |
| Present Compare as governed-unavailable until Infrastructure delivers it | Fabricate a client-side diff to simulate Compare |

---

## 9. Quality gates before Workbench Engineering starts

| Gate | Criterion |
| ---- | --------- |
| G1 | Parts 1–5 filed |
| G2 | Appendices A–E filed |
| G3 | `COMPLETE.md` assembled and self-consistent |
| G4 | Architecture Review PASS (OES-002) |
| G5 | Owner Acceptance of this OES (OES-002) — ACCEPTED |
| G6 | No contradiction with ARCH-013, certified Domain (ENG-060A/CERT-060A), or certified Infrastructure (ENG-060B/CERT-060B) |
| G7 | Known limitations L-01 / L-02 honestly represented, not silently closed |

Workbench Engineering **MUST NOT** start if any of G1–G5 fail.

---

## 10. Quality gates during Workbench Engineering (preview)

| Gate | Criterion |
| ---- | --------- |
| W1 | Unit / component tests for critical UI state rendering |
| W2 | Integration tests against API contracts (mocked or test env) |
| W3 | Playwright journeys: create → submit → approve; reject → return-to-draft; mark-ready → start-execution → complete → archive; supersede; clone; deep link |
| W4 | axe WCAG AA on primary surfaces |
| W5 | Permission / `availableActions` negative tests |
| W6 | Docs + Storybook (shared components) as applicable |
| W7 | Workbench Review PASS + Owner Acceptance (OES-002) |

---

## 11. Owner Acceptance criteria (this OES)

This OES (`COMPLETE.md`) is **Accepted** only when the Owner confirms:

1. **Completeness** — Parts 1–5 and Appendices A–E filed; `COMPLETE.md` ready.
2. **Implementability** — Another engineer can build the Workbench without architectural invention.
3. **Boundaries** — the Workbench owns presentation only; Domain / Infrastructure / permissions / audit / search remain authoritative elsewhere.
4. **Lifecycle fidelity** — UX journeys match ENG-060A statuses and ENG-060B `availableActions` / action catalogue; the client never invents legality.
5. **IA & deep links** — Part 2 URL model, Explorer, Review, and Search rules are sufficient.
6. **Components** — Dashboard, Explorer, Inspector panels, Edit Draft, action surface, dialogs, and unavailable slots are fully specified.
7. **Honesty about limitations** — L-01 (Compare) and L-02 (no dedicated items GET) are represented accurately, with a forward-compatible presentation contract that does not require Infrastructure change under this programme.
8. **NFRs** — Performance, a11y, security, and observability targets are clear.
9. **AI/MCP** — Authority boundaries are explicit and non-bypassable; no AI approve bypass.
10. **Traceability** — Baselines (ARCH-013, ENG-060A/CERT-060A, ENG-060B/CERT-060B, Documents 000/005/016/017) are respected.
11. **Non-goals** — no React/Next.js/production code delivered by this programme.
12. **Stop condition** — Workbench Engineering still requires a separate Owner Engineering Programme Instruction after Acceptance.

### 11.1 Outcomes (OES-002)

| Outcome | Meaning |
| ------- | ------- |
| **ACCEPTED** | `COMPLETE.md` is authority; Workbench Engineering **MAY** be authorised separately |
| **ACCEPTED WITH CONDITIONS** | Listed conditions **MUST** close before or as first Workbench Engineering gate |
| **REJECTED** | Rework Parts; no Workbench Engineering |
| **DEFERRED** | Parked; no implementation authority |

AI **MUST NOT** issue these outcomes.

---

## 12. Explicit STOP

```text
APZQEP-OES-ARCH-014
PARTS 1–5 DEFINE ARCHITECTURE ONLY
COMPLETE.md REQUIRED FOR OWNER REVIEW
WORKBENCH ENGINEERING NOT AUTHORISED BY THIS PART ALONE
NO REACT · NO NEXT.JS · NO PERSISTENCE · NO DOMAIN / INFRASTRUCTURE CHANGES
```

---

## 13. Traceability

| This Part | Trace |
| --------- | ----- |
| Security | Document 013 |
| Observability | Document 014 |
| Quality / DoD | Document 015 |
| Design System | Documents 006 / 028 |
| AI/MCP | OES-000 AI matrix; ARCH-013 Part 5 precedent |
| Review outcomes | OES-002 |
| Prior parts | OES-ARCH-014 Parts 1–4 |

---

## 14. Acceptance criteria (summary, restated)

Architecture **SHALL**:

1. Conform to Document 000, OES-000, OES-001, and be reviewable under OES-002.
2. Preserve fidelity to the certified Domain (0.1.0) and certified Infrastructure Component (0.2.0).
3. Define complete information architecture (shell placement, routes, deep links, session restore).
4. Define complete component architecture (Dashboard, Explorer, Inspector panels, Edit Draft, actions, dialogs, unavailable slots).
5. Define complete workflow/lifecycle UX with persona journeys mapped 1:1 to certified actions and statuses.
6. Define performance, accessibility, security, and observability postures.
7. Define AI and MCP boundaries without implementation, with an explicit no-approve-bypass rule.
8. Honestly represent Infrastructure limitations L-01 and L-02 without requiring their remediation under this programme.
9. Contain **no** engineering, implementation, or production code.

---

## 15. STOP (Part 5)

```text
APZQEP-ARCH-014
IMPLEMENTED
AWAITING OWNER ACCEPTANCE
NO WORKBENCH ENG · NO UI CODE
```
