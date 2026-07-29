# Programme Lifecycle

| Item     | Value                    |
| -------- | ------------------------ |
| Document | Programme Lifecycle      |
| Version  | **1.0.0**                |
| Parent   | [README.md](./README.md) |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional.

---

## 1. Purpose

APZOR work is organised as **programmes** under Owner Directives. This document defines programme types and how Directives authorise them across the [ENGINEERING-LIFECYCLE.md](./ENGINEERING-LIFECYCLE.md).

---

## 2. Programme types

| Type                          | Typical id pattern            | Purpose                                       |
| ----------------------------- | ----------------------------- | --------------------------------------------- |
| Architecture                  | `*-ARCH-*`                    | Capability Architecture baseline              |
| Engineering Specification     | `*-ENG-*` / `OES-ENG-*`       | ES baseline                                   |
| Engineering Wave              | `*-ENG-*A…E` or Wave-numbered | Bounded production Engineering                |
| Engineering Completion Review | `*-ECR-*`                     | ECR pack and Owner Engineering Acceptance     |
| Certification                 | `*-CERT-*`                    | Certification decision                        |
| Freeze                        | `*-FREEZE-*`                  | Production freeze baseline                    |
| Release                       | `*-RELEASE-*`                 | Production release decision                   |
| Governance / Standard         | `*-GOV-*` / `*-LIFECYCLE-*`   | Operating model or standard amendment         |
| Maintenance                   | `*-MAINT-*`                   | Post-release corrective/security work         |
| Docs / Analysis               | as directed                   | Documentation-only; no production Engineering |

Product prefixes (e.g. `APZQEP-`, `APZHUB-`) **SHALL** identify the owning product. This Lifecycle Standard is **product-agnostic**; naming conventions **MAY** vary by product if Owner-recorded.

---

## 3. Owner Directives

An Owner Directive **SHALL**:

1. Name the programme identifier.
2. State the programme type.
3. Define authorised scope (and explicit exclusions where needed).
4. Reference governing baselines (Architecture, ES, Build Contract, Lifecycle Standard).
5. State the required stop condition (e.g. IMPLEMENTED / AWAITING OWNER REVIEW).
6. Use authoritative verbs ([OWNER-GOVERNANCE.md](./OWNER-GOVERNANCE.md)).

Directives **MAY** be issued as chat instructions, formal packs, or standing records — form does not relax substance.

---

## 4. Programme state machine (generic)

```text
PROPOSED / NOT AUTHORISED
  → AUTHORISED (Owner Directive)
  → IN PROGRESS
  → IMPLEMENTED / AWAITING OWNER DECISION
  → ACCEPTED | RETURN FOR REVISION | REJECTED
  → (if ACCEPTED) BASELINED / CLOSED as applicable
```

Agents **SHALL NOT** transition a programme to AUTHORISED or ACCEPTED.

---

## 5. Relationship to Waves

Wave programmes are first-class programmes. Progression rules:

1. Wave N Acceptance **SHALL** precede Wave N+1 authorisation.
2. Combining Waves **SHOULD** be rare and **MUST** be Owner-recorded with justification ([BUILD-CONTRACT.md](./BUILD-CONTRACT.md), OES-003).
3. Monolithic “build entire capability” Engineering is **SUPERSEDED** for future authorisations.

Wave taxonomy: [engineering-waves/README.md](./engineering-waves/README.md).

---

## 6. Governance programmes

Standards and operating-model amendments (e.g. APZQEP-LIFECYCLE-001, APZQEP-GOV-ENG-BUILD-001) **SHALL** be documentation/governance programmes unless the Directive explicitly authorises production code. They **MUST NOT** silently alter product baselines.

---

## 7. Concurrent programmes

Multiple programmes **MAY** run concurrently across capabilities. Within one capability, later lifecycle stages **SHALL NOT** start before required prior gates without Owner exception. Concurrent governance programmes (e.g. Lifecycle Standard while Release completes) **MAY** proceed when scopes do not conflict.

---

## STOP

```text
PROGRAMME LIFECYCLE
TYPES · OWNER DIRECTIVES · WAVE GATING
NO AUTO-AUTHORISATION
```
