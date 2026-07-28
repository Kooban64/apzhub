# APZOR Engineering Standard

# OES-002 — Engineering Review & Acceptance Standard

| Item                  | Value                                                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Document              | **OES-002**                                                                                                                               |
| Title                 | Engineering Review & Acceptance Standard                                                                                                  |
| Classification        | **APZOR Engineering Review Constitution**                                                                                                 |
| Organisation          | APZOR                                                                                                                                     |
| Owner                 | APZOR Engineering / Programme Owner                                                                                                       |
| Status                | **ACCEPTED / APPROVED / FROZEN**                                                                                                          |
| Version               | **1.1.0** (frozen — minor enhancement)                                                                                                    |
| Prior version         | 1.0.0 (2026-07-27)                                                                                                                        |
| Acceptance            | [OES-002-OWNER-ACCEPTANCE.md](./OES-002-OWNER-ACCEPTANCE.md) · `20260727T001800Z-OES-002-ACCEPTANCE.json`                                 |
| Revision              | [OES-002-v1.1.0-CHANGE.md](./OES-002-v1.1.0-CHANGE.md) · `20260727T051500Z-OES-002-v1.1.0.json`                                           |
| Governing methodology | [OES-000](./OES-000-Owner-Engineering-Specification-Standard.md) (**FROZEN**)                                                             |
| Writing standard      | [OES-001](./OES-001-Engineering-Writing-Standard.md) (**FROZEN**)                                                                         |
| Applies to            | Every APZOR engineering programme review and Acceptance                                                                                   |
| Related               | [Document 000](../../000-apzhub-engineering-constitution.md) · [OWNER-ACCEPTANCE-REGISTER](../../foundation/OWNER-ACCEPTANCE-REGISTER.md) |

---

## 1. Purpose

OES-000 defines **how APZOR engineers software**.  
OES-001 defines **how APZOR communicates engineering**.  
**OES-002 defines how APZOR reviews and accepts engineering.**

Reviews MUST NOT rely on convention or individual memory. Every capability SHALL be reviewed using the same objective criteria, regardless of who performs the review.

OES-002 standardises:

- Owner Review process
- Architecture Review process
- Engineering Review process
- Infrastructure Review process
- Workbench Review process
- Certification Review process
- Acceptance checklists
- Review evidence
- Required artefacts
- PASS / FAIL criteria
- ACCEPTED / REJECTED / CONDITIONAL outcomes
- Version Promotion rules
- Freeze approval rules
- Review records and evidence retention

---

## 2. Authority

```text
Document 000 / Product Constitution  → platform architecture
        ↓
OES-000 (FROZEN)                      → methodology
        ↓
OES-001 (FROZEN)                      → writing
        ↓
OES-002 (FROZEN)                      → review & acceptance
        ↓
Capability OES → reviews → Owner Acceptance → Implementation → …
```

| Concern                           | Authority                                |
| --------------------------------- | ---------------------------------------- |
| Whether a phase may proceed       | **Owner** (via Acceptance under OES-002) |
| Review process and evidence shape | **OES-002** (this document) — **FROZEN** |
| What was specified                | Capability OES (`COMPLETE.md`)           |
| Platform/stack conflicts          | Document 000                             |

AI MAY produce review evidence drafts. AI MUST NOT issue Acceptance, Rejection, Freeze, or Version Promotion decisions.

**OES-002 is FROZEN.** Amendments require formal change control and semantic versioning (Owner-authorised revision). Ad hoc edits are prohibited.

---

## 3. Review classes

| Class                                   | When                                                    | Primary question                                                                         |
| --------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Owner Review**                        | End of every programme / OES                            | Does this meet the authorised OES and may the next gate open?                            |
| **Architecture Review**                 | ARCH / Workbench Architecture OES complete              | Is the design complete, consistent, and implementable without invention?                 |
| **Domain Engineering Review**           | Domain ENG complete                                     | Are business rules pure, tested, and boundary-compliant?                                 |
| **Infrastructure Review**               | Infrastructure ENG complete                             | Do persistence/API/integrations expose Domain without replacing it?                      |
| **Workbench Review**                    | Workbench ENG complete                                  | Does UI conform to accepted Workbench Architecture + REST + a11y?                        |
| **Engineering Completion Review (ECR)** | Immediately before Owner Acceptance of an ENG programme | Are all Work Packages, quality gates, and evidence complete with no architectural drift? |
| **Operational Readiness Review**        | Before Certification                                    | Can the capability be operated safely?                                                   |
| **Certification Review**                | CERT programme                                          | Does evidence support the claimed certification class?                                   |

Reviews MAY be combined in a single Owner session when the Owner records that combination explicitly.

**ECR rule (v1.1.0):** For Engineering (ENG) programmes, Owner Acceptance SHALL NOT proceed unless Engineering Completion Review outcome is **PASS** (or Owner records an explicit waiver with conditions).

---

## 4. Common review process (normative)

Every review class SHALL follow these steps:

```text
1. Identify programme + OES COMPLETE.md (or ENG pack) under review
2. Confirm prerequisites Accepted / Frozen
3. Execute class checklist (Sections 6–11)
4. Record PASS / FAIL per criterion
5. Determine outcome (Section 5)
6. Persist review record + evidence (Section 13)
7. Update governance pointers if Accepted
8. STOP or authorise next gate explicitly
```

### 4.1 Preconditions (all classes)

Review SHALL NOT start unless:

1. Authorising Owner Instruction / OES exists
2. Prerequisites named in the OES are Accepted (or explicitly waived with conditions)
3. Artefacts under review are in the repository (not chat-only)
4. `COMPLETE.md` exists for design OES programmes (or ENG completion report for ENG programmes)

---

## 5. Outcomes

| Outcome                      | Meaning                                            | Effect                                                    |
| ---------------------------- | -------------------------------------------------- | --------------------------------------------------------- |
| **ACCEPTED**                 | Meets OES / checklist                              | Phase closed; next gate only if Acceptance authorises it  |
| **ACCEPTED WITH CONDITIONS** | Accepted subject to listed conditions              | Conditions MUST be tracked; blocked work MUST NOT proceed |
| **REJECTED**                 | Does not meet criteria                             | Remediation required; no next gate                        |
| **DEFERRED**                 | Review incomplete / blocked on external dependency | No Acceptance; resume when ready                          |

Legacy synonym **CONDITIONAL** = **ACCEPTED WITH CONDITIONS**.

### 5.1 PASS / FAIL criteria rules

1. Each checklist item SHALL be marked `PASS`, `FAIL`, or `N/A` (with justification).
2. Any `FAIL` on a mandatory item ⇒ outcome MUST NOT be unconditional **ACCEPTED**.
3. `N/A` requires a written reason tied to programme class (e.g. Architecture OES has no React tests).

---

## 6. Owner Review process

### 6.1 Purpose

Owner Review is the only review that can grant **Acceptance**, **Freeze**, or **Version Promotion**.

### 6.2 Required artefacts

| Artefact                                       | Required |
| ---------------------------------------------- | -------- |
| OES `COMPLETE.md` or ENG Completion Report     | ✅       |
| Programme README with status                   | ✅       |
| Evidence JSON (portfolio-recert or equivalent) | ✅       |
| OWNER-ACCEPTANCE.md draft or prior template    | ✅       |
| Traceability to baselines / prior Acceptances  | ✅       |
| Explicit STOP / next gate proposal             | ✅       |

### 6.3 Owner Review checklist (mandatory)

| ID    | Criterion                                                      |
| ----- | -------------------------------------------------------------- |
| OR-01 | Programme scope matches Owner authorisation                    |
| OR-02 | Conforms to OES-000                                            |
| OR-03 | Conforms to OES-001                                            |
| OR-04 | Reviewed under OES-002 process                                 |
| OR-05 | No out-of-scope implementation present                         |
| OR-06 | Quality gates claimed in OES are evidenced                     |
| OR-07 | AI did not decide Acceptance / Freeze / Promotion              |
| OR-08 | Next gate (if any) is explicitly named or explicitly forbidden |

---

## 7. Architecture Review process

Applies to Capability Architecture and Presentation / Workbench Architecture OES programmes.

| ID    | Criterion                                                                                             |
| ----- | ----------------------------------------------------------------------------------------------------- |
| AR-01 | `COMPLETE.md` assembled from all Parts + required Appendices                                          |
| AR-02 | Boundaries (owns / does not own) explicit                                                             |
| AR-03 | Non-goals explicit                                                                                    |
| AR-04 | No contradiction with Document 000 / product ARCH baselines                                           |
| AR-05 | No contradiction with frozen upstream capabilities                                                    |
| AR-06 | Screens / flows / states defined sufficiently that implementation requires no architectural invention |
| AR-07 | Deep links / navigation hierarchy defined (Workbench Architecture)                                    |
| AR-08 | `availableActions` / server-authoritative UX stated                                                   |
| AR-09 | AI / MCP boundaries stated                                                                            |
| AR-10 | Acceptance Criteria testable                                                                          |
| AR-11 | STOP forbids implementation artefacts for Architecture-only programmes                                |

**FAIL examples:** missing COMPLETE.md; UI framework choices embedded as requirements when out of scope; Domain rules redefined in Workbench Architecture.

---

## 8. Domain Engineering Review process

| ID    | Criterion                                                 |
| ----- | --------------------------------------------------------- |
| DE-01 | Business rules exist only in Domain                       |
| DE-02 | No persistence / framework imports in Domain              |
| DE-03 | Lifecycle and invariants enforced                         |
| DE-04 | Domain events defined; past-tense naming                  |
| DE-05 | Tests meet OES coverage targets                           |
| DE-06 | Architecture-boundary tests present                       |
| DE-07 | Package/docs pack complete                                |
| DE-08 | No Workbench / REST / React artefacts in Domain programme |

---

## 9. Infrastructure Review process

| ID    | Criterion                                                                             |
| ----- | ------------------------------------------------------------------------------------- |
| IR-01 | Repositories implement Domain ports; no business rules in repos                       |
| IR-02 | Multi-tenancy / RLS (or equivalent) present where Postgres used                       |
| IR-03 | Optimistic concurrency enforced                                                       |
| IR-04 | REST (if in scope) matches OES; standard envelopes                                    |
| IR-05 | Permissions consumed, not owned                                                       |
| IR-06 | Audit / search / events are hooks or platform integrations — not duplicate subsystems |
| IR-07 | Transactions / rollback behaviour defined                                             |
| IR-08 | Tests meet OES targets including concurrency                                          |
| IR-09 | Domain remains authoritative; infra does not bypass it                                |
| IR-10 | No Workbench UI in Infrastructure programme                                           |

---

## 10. Workbench Review process

| ID    | Criterion                                                          |
| ----- | ------------------------------------------------------------------ |
| WR-01 | Implements accepted Workbench Architecture `COMPLETE.md` only      |
| WR-02 | Consumes REST; no Domain/persistence bypass                        |
| WR-03 | Renders `availableActions`; no client-side authorisation invention |
| WR-04 | Deep links match architecture                                      |
| WR-05 | WCAG AA evidenced for in-scope surfaces                            |
| WR-06 | Keyboard accessibility for primary flows                           |
| WR-07 | No business-rule duplication                                       |
| WR-08 | Permission-filtered navigation                                     |
| WR-09 | Tests: component / e2e as required by ENG OES                      |
| WR-10 | No new backend ownership                                           |

---

## 10A. Engineering Completion Review (ECR) — v1.1.0

### 10A.1 Purpose

Engineering Completion Review occurs **immediately before Owner Acceptance** of an Engineering programme. It is an objective completeness gate so Acceptance is never granted on a partial delivery.

ECR verifies readiness for Owner Acceptance; it does **not** itself grant Acceptance, Freeze, or Version Promotion.

### 10A.2 When required

| Programme class                           | ECR required?                                                   |
| ----------------------------------------- | --------------------------------------------------------------- |
| Domain / Infrastructure / Workbench ENG   | ✅ Mandatory before Owner Acceptance                            |
| Architecture / Workbench Architecture OES | Optional (Architecture Review + COMPLETE.md remain primary)     |
| Certification                             | Covered by Certification Review (ECR N/A unless Owner requires) |

### 10A.3 Required artefacts

| Artefact                                                                    | Required |
| --------------------------------------------------------------------------- | -------- |
| Completion Report                                                           | ✅       |
| Work Package completion matrix (all WP complete or deferred with rationale) | ✅       |
| Accessibility evidence (where UI in scope)                                  | ✅       |
| End-to-end / Playwright evidence (where required by ENG OES)                | ✅       |
| Test evidence (unit/component/integration as scoped)                        | ✅       |
| Architecture compliance statement                                           | ✅       |
| ADR honour statement                                                        | ✅       |
| Known limitations / risks                                                   | ✅       |

### 10A.4 ECR checklist (mandatory)

| ID     | Criterion                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------- |
| ECR-01 | Every Work Package is **COMPLETE** or **DEFERRED** with documented Owner-visible rationale                          |
| ECR-02 | No placeholder UI remains on in-scope surfaces                                                                      |
| ECR-03 | No TODO / FIXME / HACK markers remain in production code paths for the programme                                    |
| ECR-04 | Accessibility gates complete and evidenced (axe critical/serious = 0 on primary surfaces; keyboard; focus; dialogs) |
| ECR-05 | End-to-end journeys required by the ENG OES PASS                                                                    |
| ECR-06 | Documentation pack complete (README, surface docs, Completion Report)                                               |
| ECR-07 | Completion Report complete (matrix, compliance, limitations, risks, version recommendation)                         |
| ECR-08 | No architectural drift vs accepted Architecture / OES baselines                                                     |
| ECR-09 | All accepted ADRs applicable to the programme are honoured                                                          |
| ECR-10 | STOP / next gate proposal is explicit and does not authorise Certification/Freeze without Owner                     |

### 10A.5 Outcomes

| Outcome                  | Meaning                                                                        |
| ------------------------ | ------------------------------------------------------------------------------ |
| **PASS**                 | Programme may proceed to Owner Acceptance                                      |
| **FAIL**                 | Remediation required; Owner Acceptance blocked                                 |
| **PASS WITH CONDITIONS** | Owner Acceptance may proceed only for the scoped remainder; conditions tracked |

AI MAY draft ECR evidence. AI MUST NOT declare ECR PASS as Owner Acceptance.

---

## 11. Certification Review process

| ID    | Criterion                                                        |
| ----- | ---------------------------------------------------------------- |
| CR-01 | Capability SemVer and scope named                                |
| CR-02 | All prerequisite ENG / ARCH Acceptances present                  |
| CR-03 | Operational Readiness evidence present or waived with conditions |
| CR-04 | Test / security / a11y evidence matches claims                   |
| CR-05 | Certification class justified (e.g. PRWL)                        |
| CR-06 | Limitations / known gaps documented honestly                     |
| CR-07 | Freeze proposal explicit (what is frozen; what is not)           |
| CR-08 | AI produced evidence only — Owner decides class                  |

---

## 12. Version Promotion and Freeze approval

### 12.1 Version Promotion

Version Promotion SHALL occur only when:

1. Certification Review outcome is **ACCEPTED** or **ACCEPTED WITH CONDITIONS** (conditions MUST NOT block promotion), and
2. Owner Decision explicitly promotes SemVer / baseline, and
3. Evidence JSON + release/cert pack paths are recorded.

AI MAY recommend promotion. AI MUST NOT promote versions.

### 12.2 Freeze approval

Freeze SHALL occur only when:

1. Owner Decision states **FROZEN**, and
2. Frozen artefact set is enumerated (packages, APIs, docs), and
3. Maintenance vs Change Programme rules (OES-000) are acknowledged.

AI MUST NEVER decide Freeze or unfreeze.

---

## 13. Review records and evidence retention

### 13.1 Required record

Every completed review SHALL produce:

1. `OWNER-ACCEPTANCE.md` or `REVIEW-RECORD.md` under the programme pack
2. Evidence JSON under `docs/operations/evidence/` (or product-equivalent)
3. Updated programme README status
4. Governance pointer updates when Accepted (CURRENT-MILESTONE / AI-MANIFEST as applicable)

### 13.2 Minimum evidence JSON fields

```json
{
  "programme": "…",
  "reviewClass": "Owner|Architecture|Domain|Infrastructure|Workbench|OR|Certification",
  "recordedAt": "ISO-8601",
  "decision": "ACCEPTED|ACCEPTED WITH CONDITIONS|REJECTED|DEFERRED",
  "checklist": [{ "id": "…", "result": "PASS|FAIL|N/A" }],
  "conditions": [],
  "authorisesNext": [],
  "notAuthorised": []
}
```

### 13.3 Retention

Review records SHALL remain in the repository for the life of the product baseline. Deletion of Acceptance evidence requires Owner Decision.

---

## 14. Acceptance checklist template (normative outline)

```markdown
# OWNER ACCEPTANCE DECISION

**Programme:** …
**Decision:** ACCEPTED | ACCEPTED WITH CONDITIONS | REJECTED | DEFERRED
**Review class:** …

## Checklist summary

| ID | Result |

## Conditions

## Authorises next

## Explicit stop
```

---

## 15. AI authority in reviews

| Action                        | Human Owner | AI             |
| ----------------------------- | ----------- | -------------- |
| Draft checklist evidence      | Review      | ✅ Assist      |
| Mark PASS/FAIL recommendation | Decide      | Recommend      |
| Acceptance decision           | ✅          | Never          |
| Rejection decision            | ✅          | Never          |
| Conditional Acceptance        | ✅          | Never          |
| Freeze / unfreeze             | ✅          | Never          |
| Version Promotion             | ✅          | Recommend only |

---

## 16. Success criteria for OES-002

OES-002 succeeds when:

1. Every capability uses the same review classes and outcomes vocabulary.
2. Acceptance evidence is always repository-resident.
3. Conditional Acceptances carry tracked conditions.
4. Freeze and Version Promotion cannot occur without Owner Decision records.
5. AI-assisted reviews remain advisory for decisions reserved to the Owner.
6. Engineering programmes complete **Engineering Completion Review (ECR)** before Owner Acceptance (v1.1.0).

---

## 17. STOP

```text
OES-002
ACCEPTED / APPROVED / FROZEN
VERSION 1.1.0
```

OES-002 is frozen at **1.1.0**. Further changes require formal change control and semantic versioning.  
ENG programmes require **Engineering Completion Review (ECR) PASS** before Owner Acceptance.  
Governance trilogy (OES-000 / OES-001 / OES-002) remains complete — no further foundational OES without a demonstrated gap and Owner Decision.
