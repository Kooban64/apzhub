# APZQEP-OES-ENG-070A — Test Plans Workbench Engineering Specification

> **Programme:** APZQEP-OES-ENG-070A
> **Title:** Test Plans Workbench Engineering Specification
> **Capability:** Test Plans
> **Layer:** Presentation / Workbench Engineering Specification
> **Status:** **ACCEPTED / APPROVED / ENGINEERING SPECIFICATION BASELINED / PROGRAMME CLOSED**
> **Version:** **1.0.0-oes**
> **Date:** 2026-07-28
> **Nature:** Engineering specification only — defines how ENG will implement; does **NOT** authorise coding
> **Authoritative assembly:** [COMPLETE.md](./COMPLETE.md)
> **Acceptance:** **ACCEPTED** (2026-07-28) — [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) · `20260728T065105Z-APZQEP-OES-ENG-070A-ACCEPTANCE.json`
> **Authorised next:** **APZQEP-ENG-070A** — Test Plans Workbench Engineering — implementation authorised; ECR-gated (stop at Engineering Completion Review — see [../workbench/README.md](../workbench/README.md))

## Baselines consumed (immutable)

| Baseline | Status |
| -------- | ------ |
| APZQEP-ARCH-014 — Test Plans Workbench Architecture | **ACCEPTED / ARCHITECTURE BASELINED / CLOSED** (2026-07-28) |
| Domain `@apzhub/qep-test-plans` **0.1.0 CERTIFIED** (CERT-060A) | CLOSED |
| Infrastructure `@apzhub/qep-test-plans` **0.2.0 INFRASTRUCTURE COMPONENT CERTIFIED** (CERT-060B) | CLOSED |
| Recorded Infrastructure limitations L-01 / L-02 / L-03 | [KNOWN-LIMITATIONS.md](../infrastructure/KNOWN-LIMITATIONS.md) |
| Document 000 · OES-000 · OES-001 · OES-002 v1.1.0 | Applicable foundation and methodology standards |
| Binding invariant (Owner ARCH-014 Acceptance) | **"The Workbench SHALL never determine what a user may do."** |

## Purpose

Owner Engineering Specification for **implementing** the Test Plans Workbench against the Accepted Architecture (APZQEP-ARCH-014) and the certified Domain (0.1.0) and Infrastructure (0.2.0) baselines.

**No React / Next.js / UI code may be written until this OES `COMPLETE.md` is Owner-Accepted — and, per programme convention, until a follow-on ENG-070A Owner Instruction separately authorises implementation.**

## Pack

| Document | Role |
| -------- | ---- |
| [COMPLETE.md](./COMPLETE.md) | Authoritative assembly |
| [PART-01.md](./PART-01.md) … [PART-05.md](./PART-05.md) | Normative parts |
| [APPENDIX-A.md](./APPENDIX-A.md) … [APPENDIX-E.md](./APPENDIX-E.md) | Appendices |
| [OWNER-SUMMARY.md](./OWNER-SUMMARY.md) | Owner entry |
| [ENGINEERING-SPECIFICATION-COMPLETION-REPORT.md](./ENGINEERING-SPECIFICATION-COMPLETION-REPORT.md) | Completion report |
| [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) | Owner Decision — **PENDING** |

## Pack structure

```text
OES-ENG-070A/
├── README.md
├── PART-01.md
├── PART-02.md
├── PART-03.md
├── PART-04.md
├── PART-05.md
├── APPENDIX-A.md
├── APPENDIX-B.md
├── APPENDIX-C.md
├── APPENDIX-D.md
├── APPENDIX-E.md
├── COMPLETE.md
├── OWNER-SUMMARY.md
├── ENGINEERING-SPECIFICATION-COMPLETION-REPORT.md
└── OWNER-ACCEPTANCE.md
```

## Workflow

```text
OES-000 / 001 / 002 (FROZEN)
  → APZQEP-ARCH-014 ACCEPTED / ARCHITECTURE BASELINED / CLOSED
  → APZQEP-OES-ENG-070A (this pack) → Owner Acceptance
  → separate Owner Instruction → APZQEP-ENG-070A implementation
  → Workbench Review → Owner Acceptance → Capability Certification (later)
```

## Next

**APZQEP-ENG-070A** — Test Plans Workbench Engineering implementation — **authorised** by Owner Acceptance of this OES (2026-07-28). Implementation proceeded through **Engineering Completion Review (ECR) — PASS** to **Owner Acceptance — ACCEPTED / APPROVED / PROGRAMME CLOSED** (2026-07-28): see [../workbench/README.md](../workbench/README.md). Next: **APZQEP-CERT-070A — Test Plans Workbench Component Certification** — **IMPLEMENTED / AWAITING OWNER CERTIFICATION DECISION** — see [../CERT-070A/README.md](../CERT-070A/README.md). Capability Certification, Freeze, and 1.0.0 promotion remain **not yet performed**.

## STOP

```text
Programme: APZQEP-OES-ENG-070A
Status: ACCEPTED / APPROVED / ENGINEERING SPECIFICATION BASELINED / CLOSED

AUTHORISED NEXT: APZQEP-ENG-070A (implementation) — see docs/products/apzqep/test-plans/workbench/
```
