# APZHUB-ENG-002 — Programme Design

| Field            | Value                                                                         |
| ---------------- | ----------------------------------------------------------------------------- |
| Programme        | APZHUB-ENG-002                                                                |
| Title            | Portfolio Engineering Standards                                               |
| Status           | **DESIGNED — matrix ACCEPTED; execution deferred to next governance session** |
| Design date      | 2026-08-02                                                                    |
| Promotion Review | Product Board CERTIFIED                                                       |

---

## 1. Outcome

When execution completes, APZHUB owns portfolio-level standards for at least:

- Testing
- Certification
- Engineering Specification Template (contract)
- Engineering workflow alignment
- **APZHUB Engineering Standards** (enterprise naming, repo, commits, evidence, ADR, Markdown, workflow conventions)

…while APZQEP remains the flagship reference implementation and retains:

- Constitution and Handbook
- **APZQEP Engineering Standards** (product-only: evidence domain, lifecycle, catalogue, integrity, storage, product API/event naming)
- initially API / Database / Domain Event specialised standards

---

## 2. Non-goals

This programme MUST NOT:

- reopen APZQEP-120-S01…S06;
- rewrite Document 000 or Foundation 001–029;
- unfreeze APZHUB-ENG-001 without ADR/Owner path;
- copy APZQEP documents verbatim into `docs/engineering/`;
- authorise APZQEP package, release, or deployment work;
- start APZQEP API / Database / Domain Event standards as a substitute for promotion design.

---

## 3. Proposed phases (execution — Owner gated)

### Phase 0 — Authorisation

- Owner accepts this design + [PROMOTION-MATRIX.md](./PROMOTION-MATRIX.md).
- Confirms open questions in the matrix.
- Explicitly opens Phase 1.

### Phase 1 — Portfolio Testing Standard

- Genericise APZQEP Testing Standard.
- Publish APZHUB Testing Standard v1.0.
- Update APZHUB Engineering Standard index.
- Leave APZQEP Testing Standard as conforming specialisation or thin wrapper (per Owner decision).

### Phase 2 — Portfolio Certification Standard

- Genericise APZQEP Certification Standard.
- Align / supersede gaps vs `SLICE-CERTIFICATION.md` without breaking ENG-001 freeze intent (ADR if required).
- Publish APZHUB Certification Standard v1.0.
- Clarify Board CERTIFIED vs engineering PASS vocabulary at portfolio level.

### Phase 3 — Portfolio Engineering Specification Template

- Merge strengths of APZQEP Specification Template + ENG-001 short/expanded templates.
- Mandatory Dependencies block becomes portfolio.
- Products fill product fields only.

### Phase 4 — Workflow and checklists alignment

- Align AI Engineering Workflow + checklists with promoted standards.
- Single checklist authority.

### Phase 5 — Engineering Standards split

- Publish **APZHUB Engineering Standards** v1.0 (enterprise-wide conventions listed in the promotion matrix).
- Reshape **APZQEP Engineering Standards** into product-only conventions + explicit `Inherits APZHUB Engineering Standards vX`.
- Do **not** leave a single “partially promoted” monolith.

### Phase 6 — Framework pattern (optional)

- Document “Product Engineering Framework” pattern (named core set + extensions + changelog).
- APZQEP Framework v1.0 remains the reference instance.

### Phase 7 — Closure

- Promotion matrix marked EXECUTED.
- APZQEP-ENG-001 may resume specialised standards with clear product vs portfolio labels.
- Completion evidence filed.

---

## 4. Acceptance criteria (programme)

1. Promotion matrix dispositions are Owner-accepted.
2. At least Testing, Certification, and Specification Template exist as APZHUB portfolio standards (or explicit deferral recorded).
3. No duplicate competing authorities for those concerns.
4. APZQEP can cite both Framework v1.0 and inherited APZHUB standards without contradiction.
5. APZHUB Engineering Standard index updated.
6. Evidence pack under `docs/operations/evidence/` (path TBD: `apzh ub/` or `platform/`) records each phase.

---

## 5. Relationship to APZQEP-ENG-001

| APZQEP-ENG-001                          | APZHUB-ENG-002                        |
| --------------------------------------- | ------------------------------------- |
| Builds product Engineering Framework    | Promotes proven pieces to portfolio   |
| Paused for specialised expansion        | Designed now; execute when authorised |
| APZQEP remains reference implementation | APZHUB becomes enterprise standard    |

After APZHUB-ENG-002 Phase 7, APZQEP may resume API / Database / Domain Event / Documentation / Checklists with explicit disposition labels from the matrix.

---

## 6. Risk register (design)

| Risk                                   | Mitigation                                                  |
| -------------------------------------- | ----------------------------------------------------------- |
| Dual maintenance during transition     | Thin wrappers + SHARE BY REFERENCE; short transition window |
| ENG-001 freeze conflict                | ADR for any normative change to frozen slice pack           |
| Over-promotion of product architecture | KEEP PRODUCT on Handbook/Constitution                       |
| Premature API/DB portfolio law         | KEEP PRODUCT initially                                      |

---

## 7. Recommended Owner decision text

```text
APZHUB-ENG-002

Status: DESIGN ACCEPTED / DESIGN REVISED / DEFERRED

Promotion matrix: ACCEPTED / REVISED

Authorise execution: Phase 0 only / Phase 1 / NONE

APZQEP-ENG-001 specialised standards: REMAIN PAUSED until ENG-002 Phase 7 / OTHER
```

---

## 8. Related

- [PROMOTION-MATRIX.md](./PROMOTION-MATRIX.md)
- [README.md](./README.md)
- APZHUB-ENG-001 / ADR-0092
- APZQEP Engineering Framework v1.0
