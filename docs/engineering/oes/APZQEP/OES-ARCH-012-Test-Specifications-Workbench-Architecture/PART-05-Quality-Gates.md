# APZQEP-OES-ARCH-012  
# PART 5 — Performance, Accessibility, Security, AI/MCP Boundaries & Acceptance Criteria

| Item | Value |
| ---- | ----- |
| Document | APZQEP-OES-ARCH-012 |
| Title | Test Specifications Workbench Architecture |
| Part | **5 of 5** — Quality Gates & Acceptance |
| Status | **FILED** |
| Governing methodology | [OES-000](../../OES-000-Owner-Engineering-Specification-Standard.md) (**FROZEN**) |
| Writing standard | [OES-001](../../OES-001-Engineering-Writing-Standard.md) (**FROZEN**) |
| Review standard | [OES-002](../../OES-002-Engineering-Review-and-Acceptance-Standard.md) |
| Baselines | 013 · 014 · 015 · 006 · ARCH-011 · Parts 1–4 |

---

## 1 Purpose

This Part defines **non-functional architecture**, **AI/MCP authority boundaries**, **quality gates**, and **Owner Acceptance criteria** for the Test Specifications Workbench Architecture OES.

It is the final Part before Appendices and `COMPLETE.md` assembly.

**Workbench Engineering remains NOT AUTHORISED until this OES is Owner-Accepted under OES-002.**

---

## 2 Performance architecture

### 2.1 Targets (Workbench Engineering SHALL meet)

| Concern | Target |
| ------- | ------ |
| Explorer first meaningful paint (warm) | Perceived interactive ≤ 2s on certified baseline environments |
| Inspector open after selection | ≤ 500ms after DTO available (network excluded) |
| Search debounce | 200–400ms before query |
| List pagination | Server-driven; default page size documented in ENG (e.g. 25–50) |
| Compare view | Two parallel fetches; no client merge SoR |

### 2.2 Rules

1. Workbench MUST NOT block UI on non-critical secondary fetches (history MAY lazy-load).  
2. Large lists MUST use virtualisation or pagination — MUST NOT render unbounded DOM.  
3. Performance work MUST NOT move business rules into the client.  
4. Metrics SHOULD emit via Platform Observability (014) with correlation IDs (010).

---

## 3 Accessibility architecture

### 3.1 Mandatory bar

| Requirement | Standard |
| ----------- | -------- |
| Conformance | **WCAG 2.2 AA** (platform target WCAG AA) |
| Keyboard | All interactive controls operable without pointer |
| Focus | Visible focus; dialog focus trap; restore on close |
| Name / role / value | Correct semantics for buttons, tabs, tables, dialogs |
| Status | Not colour-only; announce changes |
| Motion | Respect `prefers-reduced-motion` |

### 3.2 Workbench-specific

1. Explorer SHALL be a keyboard-navigable grid/table pattern.  
2. Inspector tabs/regions SHALL be ARIA-compliant.  
3. Action menus SHALL expose accessible names matching visible labels.  
4. Playwright a11y checks (axe) SHALL cover Dashboard, Explorer, Inspector, Review, Compare, and primary dialogs before Certification.

### 3.3 Design System

Tokens and shared components from [006](../../../../006-design-system-ui-component-architecture.md) / [028](../../../../028-ui-component-sdk-design-system-sdk-component-manifest-specification.md) only — no one-off inaccessible widgets.

---

## 4 Security architecture

Aligned with [013](../../../../013-security-zero-trust-architecture.md):

| Control | Workbench rule |
| ------- | -------------- |
| Authn | Session via Better Auth / platform shell — no separate login |
| Authz | Permission Platform + server `availableActions` — UI hide is not security |
| Validation | Never trust client; server validates all commands |
| Secrets | MUST NOT embed tokens in URLs, localStorage business payloads, or logs |
| XSS | Design System / React escaping; no `dangerouslySetInnerHTML` for Specification content unless sanitised platform pattern exists |
| CSRF | Platform central controls |
| Deep links | Id only; no capability tokens in query string |
| Error leakage | MUST NOT show raw backend/engine errors |
| Superadmin | Explicit tier UX — not silent bypass affordances |
| Audit | Mutations produce server audit; Workbench MUST NOT fake audit rows |

Every mutating call: authenticated → authorised → validated → executed → audited (server path). Workbench is presentation only.

---

## 5 Observability

| Pillar | Workbench contribution |
| ------ | ---------------------- |
| Logs | Client MAY log UX faults with correlation id; MUST NOT log secrets or full PII dumps |
| Traces | Propagate correlation id on API calls |
| Metrics | Optional UX timings (Explorer load, action latency) |
| Health | Capability health consumed from platform — not owned |

---

## 6 AI / MCP authority boundaries

### 6.1 AI MAY

- Suggest titles, acceptance criteria wording, or relationship candidates **as drafts**  
- Summarise a Specification for the user  
- Assist search ranking explanations (non-authoritative)

### 6.2 AI MUST NOT

- Approve, reject, retire, withdraw, supersede, or cancel  
- Bypass IAM or invent `availableActions`  
- Persist Specifications except via user-confirmed server commands  
- Own Specification SoR or lifecycle  
- Silent-auto-submit for review  

### 6.3 MCP MUST NOT

- Own Specification SoR, lifecycle, or Workbench state  
- Bypass permissions / `availableActions` semantics  
- Expose engine credentials or raw backend errors  

### 6.4 Execution path (mandatory)

```text
AI / MCP suggestion
  → Human confirmation in Workbench
  → Platform API command
  → Authn / Authz / Validation
  → Domain transition
  → Persistence / events / audit
```

No alternate path.

---

## 7 Implementation boundaries (Workbench Engineering — future)

When separately authorised, Workbench Engineering SHALL:

| Do | Do not |
| -- | ------ |
| Implement presentation per Parts 1–5 | Own business rules |
| Call `/api/v1/qep/specifications` (and platform search) | Call Domain packages / DB / connectors |
| Use Design System + shell regions | Build parallel shell |
| Gate actions on `availableActions` | Hardcode transition matrices as authority |
| Meet a11y / performance / security gates | Ship without Playwright a11y on primary surfaces |

---

## 8 Quality gates before Workbench Engineering starts

| Gate | Criterion |
| ---- | --------- |
| G1 | Parts 1–5 filed |
| G2 | Appendices A–E filed |
| G3 | `COMPLETE.md` assembled and self-consistent |
| G4 | Architecture Review PASS (OES-002) |
| G5 | Owner Acceptance of this OES (OES-002) — ACCEPTED |
| G6 | ENG-050B Acceptance as Owner directs (API baseline) |
| G7 | No contradiction with frozen Requirements / Traceability / Verification 1.0.0 |

Workbench Engineering MUST NOT start if any of G1–G5 fail. G6 MAY be sequenced by Owner Decision but API contracts MUST be stable before UI binds.

---

## 9 Quality gates during Workbench Engineering (preview)

| Gate | Criterion |
| ---- | --------- |
| W1 | Unit / component tests for critical UI state rendering |
| W2 | Integration tests against API contracts (mocked or test env) |
| W3 | Playwright journeys: create → submit → approve; reject path; supersede; deep link |
| W4 | axe WCAG AA on primary surfaces |
| W5 | Permission / `availableActions` negative tests |
| W6 | Docs + Storybook (shared components) as applicable |
| W7 | Workbench Review PASS + Owner Acceptance (OES-002) |

---

## 10 Owner Acceptance criteria (this OES)

This OES (`COMPLETE.md`) is **Accepted** only when the Owner confirms:

1. **Completeness** — Parts 1–5 and Appendices A–E filed; `COMPLETE.md` ready.  
2. **Implementability** — Another engineer can build the Workbench without architectural invention.  
3. **Boundaries** — Workbench owns presentation only; Domain / Infra / permissions / audit / search remain authoritative elsewhere.  
4. **Lifecycle fidelity** — UX journeys match ENG-050A / contracts; client never invents legality.  
5. **IA & deep links** — Part 2 URL model and Explorer/Search rules are sufficient.  
6. **Components** — Inspector, Relationships, Compare, History, Actions are fully specified.  
7. **Dashboards & review** — Attention model sufficient for personas.  
8. **NFRs** — Performance, a11y, security, observability targets are clear.  
9. **AI/MCP** — Authority boundaries explicit and non-bypassable.  
10. **Traceability** — Baselines (ARCH-006/011, ENG-050A/B, frozen 1.0.0 capabilities) respected.  
11. **Non-goals** — No React/Next/code delivered by this programme.  
12. **Stop condition** — Workbench Engineering still requires a separate Owner Engineering Programme Instruction after Acceptance.

### 10.1 Outcomes (OES-002)

| Outcome | Meaning |
| ------- | ------- |
| **ACCEPTED** | `COMPLETE.md` is authority; Workbench Engineering MAY be authorised separately |
| **ACCEPTED WITH CONDITIONS** | Listed conditions MUST close before or as first Workbench Engineering gate |
| **REJECTED** | Rework Parts; no Workbench Engineering |
| **DEFERRED** | Parked; no implementation authority |

AI MUST NOT issue these outcomes.

---

## 11 Explicit STOP

```text
APZQEP-OES-ARCH-012
PARTS 1–5 (when filed) DEFINE ARCHITECTURE ONLY
COMPLETE.md REQUIRED FOR OWNER REVIEW
WORKBENCH ENGINEERING NOT AUTHORISED BY THIS PART ALONE
NO REACT · NO NEXT · NO PERSISTENCE · NO DOMAIN CHANGES
```

---

## 12 Traceability

| This Part | Trace |
| --------- | ----- |
| Security | 013 |
| Observability | 014 |
| Quality / DoD | 015 |
| Design System | 006 · 028 |
| AI/MCP | ARCH-011 MCP notes · OES-000 AI matrix |
| Review outcomes | OES-002 |
| Prior parts | OES-ARCH-012 Parts 1–4 |

---

## 13 Success criteria (Part 5)

Part 5 is successful when:

1. NFR targets are unambiguous for Workbench Engineering  
2. AI/MCP cannot be misread as lifecycle authority  
3. Owner Acceptance criteria are checklist-complete  
4. Quality gates G1–G7 are explicit  

---

## END OF PART 5

**Next:** Appendices A–E, then assemble `COMPLETE.md` for Owner Review under OES-002.
