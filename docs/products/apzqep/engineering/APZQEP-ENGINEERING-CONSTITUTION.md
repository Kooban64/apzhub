# APZQEP Engineering Constitution

| Field          | Value                                    |
| -------------- | ---------------------------------------- |
| Document       | APZQEP-ENGINEERING-CONSTITUTION          |
| Programme      | APZQEP-ENG-001                           |
| Classification | Immutable engineering principles         |
| Status         | **COMPLETE**                             |
| Mutability     | Immutable without Product Board approval |

---

## 1. Purpose

This Constitution states the non-negotiable engineering principles for APZQEP.

It defines principles only.

It does not define implementation detail, technology recipes, or slice-specific scope.

Where this Constitution conflicts with a slice instruction, handbook chapter, or informal practice, this Constitution prevails within APZQEP product engineering, subject only to the APZHUB Engineering Constitution and ADR-0092.

---

## 2. Authority

APZQEP engineering inherits and must not contradict:

- the APZHUB Foundation;
- the APZHUB Engineering Constitution;
- the APZHUB Engineering Slice Standard (APZHUB-ENG-001) as frozen by ADR-0092;
- approved APZQEP product roadmap and solution architecture;
- certified engineering slices, which remain closed unless explicitly reopened by Owner authority.

This Constitution does not rewrite those artefacts.

---

## 3. Principles

### 3.1 Architecture before engineering

No engineering slice may proceed without an approved architectural basis for the capability it implements.

### 3.2 Business logic belongs to application services

Business rules, orchestration, and policy evaluation belong in application services.

Presentation layers, handlers, controllers, and transport adapters must remain thin.

### 3.3 Ports and adapters only

Application and domain layers depend on ports.

Infrastructure adapters implement ports.

Direct infrastructure coupling from domain or presentation is prohibited.

### 3.4 Layer boundaries are mandatory

No layer may assume another layer’s responsibilities.

Catalogue, storage, integrity, permission, query, lifecycle, and event concerns remain distinct authorities where architecture so defines them.

### 3.5 Tenant isolation

Every durable operation is tenant-scoped.

Cross-tenant access is denied by default and must never rely on UI filtering alone.

### 3.6 Default deny security

Absence of an explicit allow decision is a deny.

Authorisation is server-side and authoritative.

### 3.7 Repository abstraction

Application services persist through repository ports.

Persistence technology must not leak into application contracts.

### 3.8 Provider independence

Content storage providers are replaceable behind storage abstractions.

Lifecycle and catalogue policy must not bind to a single provider’s physical mechanics.

### 3.9 Additive migrations only

Schema change is additive, tested, and non-destructive to existing identifiers and authoritative content.

Destructive migration requires explicit Owner authority outside normal slice practice.

### 3.10 Engineering evidence is mandatory

Every engineering slice produces timestamped evidence sufficient to prove what was built, tested, secured, and certified.

### 3.11 Certification is mandatory

An engineering slice is not complete until slice certification passes under the governing certification standard.

### 3.12 Independently certifiable slices

Each authorised engineering slice must be independently certifiable.

A slice must not require unauthorised later slices to become certifiable.

### 3.13 No undocumented behaviour

Behaviour that is user-visible, security-relevant, or persistence-relevant must be documented in the artefacts that govern that slice.

### 3.14 No hidden APIs

Public and platform client contracts are explicit, versioned, and documented.

Undocumented client contracts are defects.

### 3.15 No silent package, release, or deployment authority

Package promotion, release tagging, and deployment require explicit programme authority.

An engineering slice does not imply release or deployment authority.

### 3.16 Product Board approval

Product-significant engineering programmes and release gates require Product Board authority as defined by APZQEP governance.

### 3.17 Stop on conflict

When repository reality, safety, or architecture conflicts with an authorised slice in a way that cannot be resolved within scope, work stops and a structured STOP report is returned.

Workarounds that bypass constitutional principles are prohibited.

### 3.18 Inheritance over duplication

Future slice instructions reference this framework and APZHUB-ENG-001.

They must not redefine engineering methodology already established here.

---

## 4. Change control

This Constitution is immutable in normal engineering practice.

Amendment requires Product Board approval and an explicit superseding document version.

Cosmetic rephrasing that changes normative meaning is an amendment.

---

## 5. Related documents

- [README.md](./README.md) — framework entry and use
- [APZQEP-ENGINEERING-HANDBOOK.md](./APZQEP-ENGINEERING-HANDBOOK.md) — how engineering is performed
- [APZQEP-ENGINEERING-STANDARDS.md](./APZQEP-ENGINEERING-STANDARDS.md) — mandatory standards
- APZHUB Document 000 — platform Engineering Constitution
- ADR-0092 — Engineering Slice Standard Freeze
