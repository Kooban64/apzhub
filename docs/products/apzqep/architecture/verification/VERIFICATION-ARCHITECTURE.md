# APZQEP-ARCH-009  
# Verification Capability Architecture  
# Owner Architecture Specification

| Field | Value |
| --- | --- |
| Programme | **APZQEP-ARCH-009** |
| Title | **Verification Capability Architecture** |
| Classification | Owner Architecture Specification |
| Product | APZ QEP (APZ Quality Engineering Platform) |
| Platform baseline | APZHUB Platform 1.4 — CERTIFIED |
| Requirements baseline | `@apzhub/qep-requirements` **1.0.0 CERTIFIED / FROZEN** |
| Traceability baseline | `@apzhub/qep-traceability` **1.0.0 CERTIFIED / FROZEN** |
| Workbench grammar | **APZQEP-ARCH-006** — ACCEPTED |
| Downstream engineering | **APZQEP-ENG-040A** domain authorised — persistence / APIs / Workbench require further Owner Instruction |
| Document revision | **1.0.0-arch** |
| Revision date | 2026-07-26 |
| Nature | Architecture only — implementation-independent |
| Status | **ACCEPTED** |

**Normative language:** **must** = mandatory; **should** = strong recommendation; **may** = optional.

---

## 0. Authority and stop conditions

This specification defines the **Authoritative Verification Capability Architecture** for APZ QEP.

It does **not** authorise:

- domain model code, packages, or persistence;
- REST APIs, permissions catalogues, audit wiring, or search indexes;
- Workbench UI, React, routes, or components;
- Test Cases, Test Specifications, Executions, Evidence, Certification, Coverage, or Impact engineering;
- AI agents or MCP servers.

```text
Architecture → Owner Acceptance → Owner Engineering Programme Instruction
  → Verification domain / infrastructure / Workbench (future, separately authorised)
```

Do **not** begin Verification engineering until a separate **Owner Engineering Programme Instruction** is issued.

Requirements **1.0.0** and Traceability **1.0.0** remain frozen. This architecture must not redesign those capabilities.

---

## 1. Purpose and definition

### 1.1 What Verification is

**Verification** is the APZ QEP capability that **records and governs whether an artefact or requirement has been verified** — including who decided, under what authority, with what outcome, in what context, and with what history.

Verification answers:

- Has this subject been verified?
- Against what target / criteria / claim?
- With what result and status?
- Who authorised the decision?
- What is the governed history of that decision?

### 1.2 What Verification is not

| Not Verification | Owner |
| ---------------- | ----- |
| Requirement content, lifecycle, Relationships | Requirements **1.0.0** |
| Trace Links, Coverage Engine, Impact Engine | Traceability **1.0.0** / future analysis programmes |
| Test Case / Test Specification design | Future Test domains |
| Test Execution runs and raw results | Future Execution domain |
| Evidence packs / binaries as SoR | Future Evidence domain |
| Certification verdicts / certificates | Future Certification domain |
| Coverage percentages / impact blast radius | Future Coverage / Impact services |
| AI ownership of verification truth | Forbidden |

### 1.3 Single source of truth rule

Verification is the **single source of truth for Verification Records and Verification Decisions**.

It is **not** the SoR for Requirements, Trace Links, test artefacts, evidence content, or certification artefacts. Those remain owned by their domains. Verification **references** them as subjects, targets, or supporting context.

---

## 2. Philosophy and principles

| # | Principle | Meaning |
| - | --------- | ------- |
| P1 | Decision-centric | Primary object is a governed Verification Record / Decision |
| P2 | Bounded ownership | Verification owns verification truth only |
| P3 | Reference, do not absorb | Subjects and targets are identifiers + summaries; payloads stay in owning domains |
| P4 | Server authority | Lifecycle, outcomes, permissions, and available actions are server-authoritative |
| P5 | Immutable history | Material changes produce history; closed decisions are not silently rewritten |
| P6 | Explainable decisions | Authority, rationale, provenance, and context are first-class |
| P7 | Consumer architecture | Traceability, Workbench, AI, MCP consume Verification; they do not own it |
| P8 | Extensible outcomes | Result taxonomy is governed and extensible without redesign |
| P9 | Separate from execution | Execution produces facts; Verification records governed decisions about verification |
| P10 | Workbench reuse | UX extends ARCH-006; no parallel shell |

---

## 3. Domain ownership

### 3.1 Verification owns

| Concern | Notes |
| ------- | ----- |
| Verification Records | Aggregate identity and SoR |
| Verification Decisions | Governed decision instances |
| Verification Status | Lifecycle state of the record |
| Verification History | Immutable domain history of material changes |
| Verification Authority | Who may decide / who decided |
| Verification Rationale | Why the outcome was recorded |
| Verification Metadata | Non-authoritative structured annotations |
| Verification Context | Scope, baseline/version pins, immutability flags |
| Verification Lifecycle | State machine and transition policy |
| Verification Policies | Outcome rules, supersession, expiry, waiver policy |
| Verification Events | Domain / integration event catalogue |

### 3.2 Verification does not own

Requirements · Trace Links · Requirements Relationships · Evidence · Test Cases · Test Specifications · Executions · Certification · Coverage truth · Impact truth · AI decisions · MCP state.

### 3.3 Ownership matrix

| Concern | Owner | Verification role |
| ------- | ----- | ----------------- |
| Requirements / CV / Baselines | Requirements | Subject or context references |
| Trace Links | Traceability | May cite Trace Links as context; never rewrite Trace SoR |
| Test Specs / Cases | Future Test domains | May be verification targets or supporting refs |
| Executions | Future Execution | May supply inputs; Verification does not store execution SoR |
| Evidence | Future Evidence | May be cited as supporting refs |
| Certification | Future Certification | Consumes Verification outcomes; does not own them |
| Coverage / Impact | Future analysis services | May read Verification status; never store on Verification as derived truth owner |
| Platform AuthN/Z, audit, search | Platform | Cross-cuts |

### 3.4 Hard boundaries

**Requirements remains the owner of Requirements.**  
**Traceability remains the owner of Trace Links.**  
**Verification owns Verification Records only.**

Verification must not create a competing Requirements, Trace Link, Evidence, or Certification SoR.

---

## 4. Verification model

### 4.1 Core concepts

| Concept | Definition |
| ------- | ---------- |
| **Verification Record** | Aggregate root representing a governed verification instance |
| **Verification Subject** | What is being verified (e.g. Requirement, Baseline membership claim, other artefact) |
| **Verification Target** | What it is verified against (criteria, specification, claim, external standard, test objective) |
| **Verification Authority** | Actor / role / system authority that owns or performs the decision |
| **Verification Result / Outcome** | Enumerated outcome of the verification decision |
| **Verification Status** | Lifecycle state of the record (distinct from outcome) |
| **Verification Context** | Scope, baseline/content-version pins, tenant, product/project refs, immutability |
| **Verification History** | Append-only domain history of material changes |
| **Verification Metadata** | Extensible key/value annotations (non-SoR for foreign payloads) |
| **Verification Rationale** | Human/policy explanation for the outcome |
| **Verification Timestamp** | Decision and transition timestamps (creation, completion, expiry, …) |
| **Verification Version** | Optimistic concurrency / revision for the aggregate |
| **Verification Outcome** | Synonym for Result in product language — governed taxonomy |

### 4.2 Subject and target references

Subjects and targets are **governed endpoint-style references**:

- artefact kind;
- artefact identity;
- optional content version / baseline pin;
- owning domain;
- optional external URI for external criteria.

Verification stores references and safe display summaries — **not** authoritative copies of Requirement bodies, evidence binaries, or execution logs.

### 4.3 Identity

Verification Record identifiers must be:

- globally unique within the tenant;
- opaque stable strings (engineering may use a prefix such as `ver_*`);
- never raw database sequence numbers in user-facing labels.

### 4.4 Distinction: Status vs Outcome

| Dimension | Meaning | Examples |
| --------- | ------- | -------- |
| **Status (lifecycle)** | Where the record is in the process | Draft, Requested, In Progress, Verified, Rejected, Expired, … |
| **Outcome (result)** | What was concluded about the subject | Verified, Failed, Partially Verified, Waived, … |

A record may be **In Progress** with no final outcome yet. A record in status **Verified** must carry a successful outcome class. Status **Rejected** must carry a non-success outcome. Exact binding rules are domain policy for engineering.

---

## 5. Verification lifecycle

### 5.1 Normative lifecycle states

| State | Meaning |
| ----- | ------- |
| **Draft** | Authoring; not yet formally requested |
| **Requested** | Verification has been requested; awaiting start |
| **In Progress** | Active verification work |
| **Verified** | Successfully completed with a success-class outcome |
| **Rejected** | Completed with a failure/rejection-class outcome |
| **Expired** | Prior decision no longer valid due to time/policy |
| **Withdrawn** | Request or decision withdrawn by authorised actor |
| **Superseded** | Replaced by a successor Verification Record |
| **Cancelled** | Cancelled before completion |
| **Retired** | Administratively closed; retained for history |

Engineering may refine names slightly if contracts require, but semantic coverage of these states is mandatory.

### 5.2 Transition principles

| From | Typical to | Notes |
| ---- | ---------- | ----- |
| Draft | Requested, Cancelled, Retired | Request formalises intent |
| Requested | In Progress, Cancelled, Withdrawn | Start or abandon |
| In Progress | Verified, Rejected, Cancelled, Withdrawn, Deferred→In Progress | Completion records outcome |
| Verified | Expired, Superseded, Retired, Withdrawn (policy-gated) | Success path is mostly immutable |
| Rejected | Superseded, Retired, Requested (re-open policy) | Re-open creates new cycle or successor |
| Expired | Superseded, Retired, Requested | Re-verification is explicit |
| Withdrawn / Cancelled / Retired / Superseded | Terminal or successor-linked | No silent resurrection |

### 5.3 Transition rules

1. Transitions are **explicit commands** — never side effects of typing metadata.  
2. Server validates authority, permissions, and policy.  
3. Material transitions append **Verification History**.  
4. Supersession links predecessor → successor; predecessor becomes **Superseded**.  
5. Re-verification of an immutable subject/context should prefer **new record** or **supersession**, not silent overwrite.  
6. Client must never invent allowed transitions; future Workbench uses server `availableActions`.

---

## 6. Verification results (outcomes)

### 6.1 Normative outcome catalogue (extensible)

| Outcome | Meaning |
| ------- | ------- |
| **Verified** | Subject meets the target criteria under stated authority |
| **Failed** | Subject does not meet the target criteria |
| **Partially Verified** | Partial satisfaction; residual gaps documented |
| **Not Verified** | Explicit non-verification conclusion (distinct from “not yet done”) |
| **Inconclusive** | Insufficient basis to conclude |
| **Blocked** | Cannot proceed due to dependency/blocker |
| **Deferred** | Intentionally postponed |
| **Waived** | Formally waived under policy/authority |

### 6.2 Extensibility

- Normative outcomes above are stable identifiers.  
- Future governed extensions may be added via taxonomy governance.  
- Arbitrary free-text outcomes are **not** authoritative.  
- Deprecated outcomes must remain readable in history.

---

## 7. Governance

### 7.1 Ownership and authority

| Concept | Rule |
| ------- | ---- |
| Record ownership | Tenant-scoped; created under authenticated actor |
| Decision authority | Explicit authority kind (user / role / system / delegated) + actor identity |
| Approval | Distinct from authorship where policy requires dual control |
| Delegation | May be modelled as authority metadata; never bypasses permission service |
| Review | Optional review gates before Verified/Rejected |
| Superadmin | Explicit tier; audited; not a silent bypass |

### 7.2 History and immutability

- **Verification History** records domain state evolution (creation, start, completion, outcome change, authority change, supersession, expiry, withdrawal, …).  
- **Platform Audit** records who performed operational actions — distinct from domain history.  
- Once a record reaches terminal success/failure under immutable context (e.g. Baseline-pinned), mutating outcome requires supersession or policy-exception workflow.  
- History records are append-only.

### 7.3 Supersession

- At most one active successor head per supersession chain (bounded).  
- Predecessor retains full history.  
- Consumers must resolve “current verification” via active non-superseded records.

### 7.4 Policy enforcement

Policies may include:

- required rationale for Failed / Waived / Partially Verified;  
- authority class required for Waived;  
- expiry rules (time-bound verification);  
- subject/target kind compatibility;  
- immutability when context is Baseline-locked.

Policies are owned by Verification domain services (future engineering) — not by the Workbench client.

---

## 8. Relationships to other capabilities

| Capability | Relationship |
| ---------- | ------------ |
| **Requirements** | Verification subjects commonly reference Requirements / Content Versions / Baseline claims. Requirements SoR unchanged. |
| **Traceability** | Trace Links may connect Requirements to future Verification Activities/Results. Verification does not own Trace Links. Traceability may index Verification Record identities when published. |
| **Test Cases / Specs** (future) | May appear as targets or supporting references; owned by Test domains. |
| **Executions** (future) | Provide factual run data that Verification may consider; Execution ≠ Verification Decision. |
| **Evidence** (future) | Cited as supporting references; Evidence SoR remains Evidence. |
| **Certification** (future) | Consumes Verification outcomes as inputs to certification claims. |
| **Coverage** (future) | May count Verified subjects; Coverage is derived — not stored as Verification SoR truth. |
| **Impact** (future) | May use Verification status in impact presentation; Impact does not own Verification. |

### 8.1 Consumption direction

```text
Requirements / Traceability / Test / Execution / Evidence
        │  (references / inputs)
        ▼
   Verification (SoR for Verification Records)
        │  (outcomes / events)
        ▼
Certification / Coverage / Impact / Workbench / AI / MCP (consumers)
```

Verification **consumes** foreign identities; foreign domains **consume** Verification outcomes. No ownership inversion.

---

## 9. Domain events

Events are past-tense, schema-versioned, and published by Platform Services (not UI). Illustrative catalogue:

| Event | When |
| ----- | ---- |
| `qep.verification.created` | Record created |
| `qep.verification.updated` | Non-lifecycle material update |
| `qep.verification.requested` | Moved to Requested |
| `qep.verification.started` | Moved to In Progress |
| `qep.verification.completed` | Reached a completion state with outcome |
| `qep.verification.failed` | Outcome Failed (may pair with completed) |
| `qep.verification.verified` | Status Verified / outcome Verified |
| `qep.verification.rejected` | Status Rejected |
| `qep.verification.expired` | Expired |
| `qep.verification.withdrawn` | Withdrawn |
| `qep.verification.superseded` | Superseded |
| `qep.verification.cancelled` | Cancelled |
| `qep.verification.retired` | Retired |

Engineering must define `event.yaml` manifests (Platform Event SDK **029**) before implementation. Correlation / causation IDs mandatory (010 / 012).

---

## 10. Workbench principles

Reuse **APZQEP-ARCH-006**. Do not redesign shell, navigation, docking, or toolbar philosophy.

### 10.1 Primary surfaces

| Surface | Purpose |
| ------- | ------- |
| **Verification Explorer** | Filtered, paginated inventory of Verification Records |
| **Verification Inspector** | Selection detail + server `availableActions` |
| **Verification Timeline** | Process view of request → progress → decision |
| **Verification History** | Domain history (distinct from Platform Audit) |
| **Verification Search** | Platform Search projection; reload SoR on select |
| **Verification Dashboard** | Aggregated status/outcome indicators (presentation; not Coverage Engine) |
| **Verification Filters** | Status, outcome, subject kind, authority, scope, dates |
| **Verification Actions** | Create, request, start, complete, reject, waive, supersede, retire — from `availableActions` only |

### 10.2 Interaction rules

- List / inspector first; no mandatory graph.  
- Bounded queries; no loading entire tenant verification sets.  
- Cross-navigate to Requirements / Traceability owning routes when available.  
- Empty / loading / error / permission states follow QEP Workbench conventions.  
- Future engineering implements UI under a separate Owner Instruction.

---

## 11. AI considerations

| AI may | AI must not |
| ------ | ----------- |
| Suggest verification candidates | Verify / approve / reject authoritatively |
| Analyse gaps / summarise history | Own Verification Records |
| Prioritise review queues | Set authority or waive without human/policy workflow |
| Draft rationale proposals | Bypass lifecycle or audit |

AI is a **consumer and proposer**. Promotion of AI suggestions into authoritative Verification requires governed human or policy-controlled workflows (same pattern as Traceability AI-promotion policy).

**No AI implementation under ARCH-009.**

---

## 12. MCP considerations

| MCP may | MCP must not |
| ------- | ------------ |
| Read Verification via authorised APIs | Become part of the Verification domain |
| Invoke permitted commands under authz | Autonomously own verification truth |
| Use search projections for discovery | Treat search as SoR |

**No MCP implementation under ARCH-009.**

---

## 13. Platform integration (future engineering contracts)

When engineering is authorised, Verification must integrate with:

| Concern | Expectation |
| ------- | ----------- |
| Permissions | Granular `qep.verification.*` family (exact names in engineering) |
| Audit | Platform Audit actions distinct from domain history |
| Search | Projection entity (e.g. `verification_record`); SoR reload on select |
| Observability | Command/query timing, denials, conflicts — non-decision |
| Events | Outbox / Platform Event Bus patterns (029) |
| Tenancy | Authoritative tenant context + RLS where required |
| Concurrency | Optimistic revision on aggregate |

These are architectural expectations — **not** an implementation authorisation.

---

## 14. Extensibility

Verification must remain extensible for:

- new subject kinds (as domains appear);  
- new target kinds (standards, specs, claims);  
- new outcomes via governed taxonomy;  
- policy packs (regulatory regimes);  
- Certification / Coverage / Impact consumers;  
- optional future linkage to Execution and Evidence without absorbing those SoRs.

Forbidden extensions:

- parallel Verification shells;  
- UI-authoritative lifecycle;  
- storing Coverage/Impact as Verification SoR fields;  
- absorbing Test/Evidence/Certification payloads as authoritative Verification data.

---

## 15. Consistency validation

| Baseline | Consistency claim |
| -------- | ----------------- |
| Requirements **1.0.0** | Verification references Requirements; does not own or mutate Requirements SoR |
| Traceability **1.0.0** | Trace Links may reference Verification; Verification does not own Trace Links or Coverage/Impact engines |
| ARCH-006 | Workbench principles reuse grammar; no shell redesign |
| Platform 003/008/009/010/011/012/013 | Layered ownership, services boundary, events, security, SoR rules respected |
| ARCH-007 | Verification Activities/Results remain distinct from Trace Links |

No intentional contradictions. Where ARCH-007 listed “Verification Activities / Results” as future Verification SoR, this architecture **is** that Verification ownership statement.

---

## 16. Non-goals

This architecture does **not** define or authorise:

- TypeScript packages, migrations, or repositories;  
- REST routes or DTO shapes;  
- React Workbench;  
- Test Case / Execution / Evidence / Certification / Coverage / Impact products;  
- AI or MCP implementation;  
- pixel-perfect mockups.

---

## 17. Architecture decisions (ADRs)

### ADR-ARCH-009-001 — Verification owns Verification Records only

**Decision:** Verification is SoR for Verification Records/Decisions/Status/History/Authority/Outcomes. It does not own Requirements, Trace Links, Evidence, Tests, Executions, or Certification.  
**Rationale:** Bounded context clarity; prevents SoR duplication.  
**Status:** Proposed with this architecture.

### ADR-ARCH-009-002 — Status and Outcome are distinct dimensions

**Decision:** Lifecycle status and verification outcome are separate fields with explicit binding rules.  
**Rationale:** Avoids overloaded “verified” meaning both process state and conclusion.  
**Status:** Proposed with this architecture.

### ADR-ARCH-009-003 — Execution facts ≠ Verification decisions

**Decision:** Future Execution results are inputs; Verification Records remain the governed decision SoR.  
**Rationale:** Separates empirical run data from governed verification conclusions.  
**Status:** Proposed with this architecture.

### ADR-ARCH-009-004 — Supersession over silent rewrite

**Decision:** Closed/immutable verifications change via supersession or explicit re-open policy, not silent overwrite.  
**Rationale:** Auditability and historical integrity.  
**Status:** Proposed with this architecture.

### ADR-ARCH-009-005 — AI/MCP are consumers only

**Decision:** AI and MCP may propose/read/invoke under authz; they never own verification truth.  
**Rationale:** Zero Trust; same pattern as Traceability.  
**Status:** Proposed with this architecture.

### ADR-ARCH-009-006 — Workbench reuses ARCH-006

**Decision:** Verification UX extends ARCH-006; no parallel shell.  
**Rationale:** Consistency with Requirements and Traceability Workbenches.  
**Status:** Proposed with this architecture.

---

## 18. Conformance checklist for future engineering

Future Verification engineering must demonstrate:

1. Domain ownership boundaries in §3.  
2. Model concepts in §4 with Status ≠ Outcome.  
3. Lifecycle coverage in §5.  
4. Outcome taxonomy in §6 (extensible, governed).  
5. History distinct from Platform Audit.  
6. Server-authoritative actions/permissions.  
7. References to foreign artefacts — no payload absorption.  
8. Events per Platform Event SDK.  
9. Workbench reuses ARCH-006.  
10. No Coverage/Impact/Evidence/Certification/Test engines shipped as Verification.

---

## 19. Document control

| Revision | Date | Notes |
| -------- | ---- | ----- |
| 1.0.0-arch | 2026-07-26 | Initial Owner Architecture Specification (APZQEP-ARCH-009) |

**End of authoritative specification.**
