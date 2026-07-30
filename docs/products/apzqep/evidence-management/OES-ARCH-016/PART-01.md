# APZQEP-OES-ARCH-016 — PART 1

# Executive Summary, Authority, Scope & Capability Definition

| Item               | Value                                                            |
| ------------------ | ---------------------------------------------------------------- |
| Document           | **APZQEP-OES-ARCH-016**                                          |
| Title              | Evidence Management Capability Architecture                      |
| Programme          | **APZQEP-ARCH-016**                                              |
| Capability         | Evidence Management                                              |
| Part               | **1 of 5**                                                       |
| Version            | **1.0.0-arch**                                                   |
| Date               | 2026-07-30                                                       |
| Status             | **IMPLEMENTED / AWAITING OWNER ARCHITECTURE DECISION**           |
| Constitution       | APZQEP Constitution v1.0.0                                       |
| Lifecycle Standard | APZ Engineering Lifecycle Standard v1.0 (**stable — use as-is**) |
| Writing / OES      | OES-000 / OES-001 / OES-002                                      |

**Normative language:** **SHALL** / **MUST** / **SHOULD** / **MAY** (RFC 2119 as applied by OES-001).

---

## 1. Executive summary

This document defines the authoritative **Capability Architecture** for **Evidence Management** within APZ QEP — the information backbone of the platform.

**Evidence Management** is the **authoritative System of Record (SoR)** for quality evidence: content, metadata, integrity, classification, access, retention, disposition, provenance, and audit. Consuming capabilities (Test Execution, future Test Runs, Defects, Reporting, Analytics, AI, Compliance) **SHALL** reference evidence; they **SHALL NOT** duplicate evidence content as SoR.

This programme **SHALL** produce architecture only. It **SHALL NOT** perform engineering, create schemas, APIs, packages, migrations, Workbench UI, or storage implementations.

Upon Owner Architecture Acceptance, this architecture becomes the baseline for a separately authorised Engineering Specification.

---

## 2. Programme authority

| Field              | Value                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------- |
| Owner Instruction  | APZQEP-ARCH-016 AUTHORISED TO COMMENCE (after CAPABILITY-002 acceptance)                |
| Authorises         | Architecture modelling, ADRs, Owner decision pack                                       |
| Does not authorise | Engineering, Eng Spec, code, UI, migrations, TE modification, Lifecycle Standard change |

Operating premise:

```text
Lifecycle Stability → Capability Delivery → Customer Value
≥90% user-facing capability effort / ≤10% governance evolution
```

---

## 3. Capability definition

### 3.1 Definition

An **Evidence** item is a governed, identifiable record of quality-relevant content (file, log, screenshot, report, observation artefact, export, or structured payload) together with metadata that establishes integrity, ownership, classification, lifecycle, and access.

**Evidence Management** owns the lifecycle and SoR for that record. Other capabilities own their domain objects and may hold **EvidenceReference** pointers.

### 3.2 Product identity

| Field                          | Value                                          |
| ------------------------------ | ---------------------------------------------- |
| User-facing name               | Evidence                                       |
| Module catalogue               | M09                                            |
| Suggested package (future)     | `@apzhub/qep-evidence`                         |
| Suggested module id (future)   | `qep-evidence`                                 |
| Platform service name (future) | `EvidenceService` (never storage-vendor-named) |

### 3.3 Primary users

Testers · Reviewers · QA Managers · Compliance / Auditors · Release / Certification Managers · (secondary) Developers, Product Owners

---

## 4. Scope

### 4.1 In scope (architecture)

Domain model · aggregates · lifecycle · SoR boundaries · integrity · security/ACL · storage abstraction · associations · Workbench vision · external interfaces · NFRs · integration with frozen/delivered capabilities · future consumers

### 4.2 Out of scope

Engineering · UI implementation · REST contracts · SQL · object-store product selection · TE behaviour changes · Defect/Runs implementation · AI model design · generic enterprise DMS replacement

---

## 5. Frozen / delivered baselines (immutable under ARCH-016)

| Capability                                                 | Status                                           |
| ---------------------------------------------------------- | ------------------------------------------------ |
| Requirements / Traceability / Verification / Specs / Plans | **1.0.0 FROZEN**                                 |
| Test Execution                                             | **1.0.1** Limited Availability · L-02 **CLOSED** |
| ADR-0080 Evidence ownership boundary (TE)                  | **Accepted** — reinforced, not contradicted      |

ARCH-016 **SHALL** respect ADR-0080: Test Execution continues to own **EvidenceReference** only.

---

## 6. Programme objectives

1. Establish Evidence Management as platform Evidence SoR.
2. Define domain concepts, aggregates, and lifecycle.
3. Align security with fail-closed / default-deny model proven in L-02.
4. Abstract storage; separate metadata SoR from content bytes.
5. Define integration contracts for consumers (reference, not copy).
6. Enable subsequent Eng Spec without inventing missing concepts.
7. Remain implementation-independent.
