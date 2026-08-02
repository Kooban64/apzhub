# APZQEP-ENG-001 — APZHUB Promotion Review

| Field           | Value                                              |
| --------------- | -------------------------------------------------- |
| Programme       | APZQEP-ENG-001                                     |
| Review          | APZHUB Promotion Review                            |
| Status          | **CERTIFIED**                                      |
| Date            | 2026-08-02                                         |
| Phase 6         | Product Board CERTIFIED                            |
| Programme close | APZQEP-ENG-001 **CLOSED** · Maintenance **ACTIVE** |

---

## Board decision

```text
APZQEP-ENG-001
Promotion Review
Status: CERTIFIED

APZQEP-ENG-001
Status: COMPLETE
Engineering Framework: BASELINED
Handover: COMPLETE
Recommendation: Transition governance responsibility to APZHUB-ENG-002.
APZQEP engineering framework enters maintenance mode.
```

---

## Affirmed promote / keep table

| Promote to APZHUB                                    | Keep in APZQEP                                          |
| ---------------------------------------------------- | ------------------------------------------------------- |
| Testing Standard                                     | Engineering Constitution                                |
| Certification Standard                               | Engineering Handbook                                    |
| Engineering Specification Template                   | API Standard (initially)                                |
| Engineering Workflow                                 | Database Standard (initially)                           |
| Engineering Framework concept                        | Domain Event Standard (initially)                       |
| **APZHUB Engineering Standards** (new portfolio doc) | **APZQEP Engineering Standards** (product-only reshape) |
|                                                      | Product-specific architecture                           |

---

## Board refinement — Standards split

“Engineering Standards (partial)” is **rejected**.

Instead:

1. **APZHUB Engineering Standards** — enterprise naming, repo, docs, commits, evidence, certification, release, folders, ADR, Markdown, workflow conventions.
2. **APZQEP Engineering Standards** — evidence domain, lifecycle, catalogue, integrity, storage, product event/API naming.

Authoritative detail: [PROMOTION-MATRIX.md](../../../engineering/APZHUB-ENG-002/PROMOTION-MATRIX.md) § Standards split.

---

## Handoff

| Item             | Path                               | Status                                            |
| ---------------- | ---------------------------------- | ------------------------------------------------- |
| APZHUB-ENG-002   | `docs/engineering/APZHUB-ENG-002/` | DESIGNED; matrix ACCEPTED; **execution deferred** |
| Programme design | `…/PROGRAMME-DESIGN.md`            | Ready for next session Phase 0                    |
| This review      | CERTIFIED                          | Closed with APZQEP-ENG-001                        |

**Do not** start APZHUB-ENG-002 execution in this session.

---

## Strategic distinction

- **APZHUB** owns enterprise engineering governance.
- **APZQEP** remains the exemplar / reference implementation.
