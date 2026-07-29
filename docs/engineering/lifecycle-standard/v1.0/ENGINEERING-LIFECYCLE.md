# Engineering Lifecycle — Stage Definitions

| Item     | Value                                    |
| -------- | ---------------------------------------- |
| Document | Engineering Lifecycle                    |
| Version  | **1.0.0**                                |
| Parent   | [README.md](./README.md)                 |
| Status   | Normative within Lifecycle Standard v1.0 |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional.

---

## 1. Purpose

This document defines every lifecycle stage from Architecture through End of Life. No stage **SHALL** be skipped, collapsed, or auto-started without Owner-recorded exception ([OWNER-GOVERNANCE.md](./OWNER-GOVERNANCE.md)).

---

## 2. Mandatory stage sequence

```text
Architecture
  → Owner Architecture Acceptance
  → Engineering Specification
  → Owner Engineering Specification Acceptance
  → Engineering Waves (01…05, Owner-gated)
  → Engineering Completion Review (ECR)
  → Owner Engineering Acceptance
  → Certification
  → Freeze
  → Release
  → General Availability (when authorised)
  → Maintenance
  → End of Life
```

See [diagrams/LIFECYCLE.md](./diagrams/LIFECYCLE.md).

---

## 3. Stage definitions

### 3.1 Architecture

Establishes capability boundaries, aggregates, lifecycle states, non-goals, and layering. Output is an Accepted Architecture baseline. Detail: [architecture/README.md](./architecture/README.md).

Engineering **SHALL NOT** redesign Architecture during later stages.

### 3.2 Engineering Specification (ES)

Defines implementable contracts: interfaces, persistence logical model, API/security, Workbench contracts, tests, and AI boundaries. Output is an Accepted ES baseline. Detail: [engineering-specification/README.md](./engineering-specification/README.md).

### 3.3 Engineering Waves

Bounded production engineering increments under the [BUILD-CONTRACT.md](./BUILD-CONTRACT.md). Default taxonomy: Repository → Domain → Application → Infrastructure & API → Workbench. Detail: [engineering-waves/README.md](./engineering-waves/README.md).

Each Wave **SHALL** stop for Owner Review before the next Wave is authorised.

### 3.4 Engineering Completion Review (ECR)

Independent review that Engineering is complete against Architecture + ES + Build Contract before Certification. Detail: [engineering-review/README.md](./engineering-review/README.md).

### 3.5 Certification

Evidence-based determination of certification class and readiness. Detail: [certification/README.md](./certification/README.md).

### 3.6 Freeze

Baselines version, dependencies, known limitations, and operational artefacts; freezes production change without Owner-authorised exception. Detail: [freeze/README.md](./freeze/README.md).

### 3.7 Release

Produces the tagged, reproducible production release under Owner Release Decision. Detail: [release/README.md](./release/README.md).

### 3.8 General Availability (GA)

GA **SHALL** require a separate Owner Decision after Release. Limited Availability **MAY** be approved at Release without unrestricted GA.

GA **MUST** confirm: residual risks accepted, operational handover complete, unrestricted rollout authorised.

### 3.9 Maintenance

Post-release defect fixes, security patches, and Owner-authorised incremental changes. Maintenance **SHALL** preserve Architecture/ES meaning unless a new Architecture/ES programme is authorised. Continuous evidence **SHALL** continue ([BUILD-CONTRACT.md](./BUILD-CONTRACT.md)).

### 3.10 End of Life (EOL)

Owner-declared withdrawal of support. EOL **SHALL** record: sunset date, migration path, data retention, and successor (if any). No new feature Engineering **SHALL** proceed on EOL-declared baselines without Owner exception.

---

## 4. Stage gates

| Transition             | Gate                                                        |
| ---------------------- | ----------------------------------------------------------- |
| ARCH → ES              | Owner Architecture Acceptance                               |
| ES → Wave 01           | Owner ES Acceptance + Build Contract affirmation            |
| Wave N → Wave N+1      | Owner Wave Review / Acceptance                              |
| Waves complete → ECR   | Owner determination that Engineering is complete for review |
| ECR → Certification    | Owner Engineering Acceptance                                |
| Certification → Freeze | Owner Certification Decision                                |
| Freeze → Release       | Owner Freeze Acceptance                                     |
| Release → GA           | Owner GA / Availability Decision                            |
| Maintenance → EOL      | Owner EOL Declaration                                       |

Agents **SHALL NOT** auto-progress stages.

---

## 5. Evidence continuity

Every stage **SHALL** leave durable evidence (reports, acceptance records, evidence JSON as required by programme practice). Continuous evidence is **MANDATORY** — see [BUILD-CONTRACT.md](./BUILD-CONTRACT.md) and [risk-management/README.md](./risk-management/README.md).

---

## STOP

```text
ENGINEERING LIFECYCLE
STAGES DEFINED THROUGH EOL
GATES OWNER-CONTROLLED
```
