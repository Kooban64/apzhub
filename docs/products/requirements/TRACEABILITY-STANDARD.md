# Traceability Standard

> **Programme:** APZHUB-PRODUCTS-004

## Purpose

Ensure requirements remain traceable from idea through Definition, Architecture, implementation, and test — without requiring those later artefacts to exist yet.

## Traceability model

```text
Idea / Change request
  → Requirement (BR/SR/FR/NFR/RR/AIR/UX)
    → Product Definition section (later)
      → Architecture / ADR (later)
        → Implementation / tests / release evidence (later)
```

## Minimum matrix columns

| Requirement ID | Source (idea/stakeholder) | Priority | Risk | Definition ref (later) | Architecture ref (later) | Test ref (later) | Status |
| -------------- | ------------------------- | -------- | ---- | ---------------------- | ------------------------ | ---------------- | ------ |

At Requirements Approval, Definition/Architecture/Test columns may be **TBD**.

## Rules

1. Every in-scope requirement appears in the matrix.
2. P3/Won't items remain listed with status **PARKED**.
3. Orphan requirements (no source) are forbidden.
4. After Definition/Architecture programmes, matrix must be updated in the same product `requirements/` folder (or linked release evidence).
5. Traceability does not authorise skipping gates.

## Storage

Prefer `TRACEABILITY-MATRIX.md` beside the baseline, or an embedded §8 table in `REQUIREMENTS-BASELINE.md` for small changes.
