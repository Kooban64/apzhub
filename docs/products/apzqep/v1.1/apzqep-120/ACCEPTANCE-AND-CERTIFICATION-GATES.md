# Acceptance and Certification Gates — APZQEP-120

---

## Slice gate (all slices)

| #   | Criterion                                                     | Pass |
| --- | ------------------------------------------------------------- | ---- |
| 1   | Acceptance criteria in SLICE-CATALOGUE met with test evidence | ☐    |
| 2   | Affected packages lint/typecheck/build green                  | ☐    |
| 3   | Required security/tenant tests green when applicable          | ☐    |
| 4   | Docs/CERT limitations updated                                 | ☐    |
| 5   | No unrelated changes; tree clean after commit                 | ☐    |
| 6   | Repository releasable (no broken mainline)                    | ☐    |
| 7   | Scope excludes 130+ features                                  | ☐    |

**FAIL** if any P0 security or data-loss defect open for that slice.

---

## Band gates

| Band | Extra gate                                                                                      |
| ---- | ----------------------------------------------------------------------------------------------- |
| R0   | L-EM-01 closed; S01+S02 certified                                                               |
| R1   | L-03 closed or Owner-waived; worker drain proven; S15 OpenAPI published                         |
| R2   | Durable Evidence create/get after restart; hash integrity; audit durable; D-001–D-003 satisfied |
| R3   | Search ACL tests; notify smoke; health probes; Playwright default OFF                           |
| R4   | S19 suite green; S20 checklist; Board release recommendation                                    |

---

## Programme certification (S20)

1. All P0 slices PASS or written Owner waiver with residual risk.
2. P1 slices PASS or scheduled with Board visibility.
3. Evidence package CERT + TE CERT reflect closed limitations (L-EM-01, L-03, L-01, L-OP-01 as applicable).
4. Compatibility strategy documented; no silent breaking API.
5. Availability remains LA unless Board elevates.
6. Deferred backlog explicitly lists 130+ items.
7. Planning vs implementation authority: implementation only via per-slice Owner instructions.

---

## Quality vs security vs release

| Gate type          | Authority                  |
| ------------------ | -------------------------- |
| Slice cert         | Engineering + QA Architect |
| Security suite S19 | Security Architect         |
| Release band       | Release Planner + Owner    |
| Programme close    | Product Board              |

---

## Evidence artifact naming (implementation)

```text
docs/operations/evidence/apzqep/<TIMESTAMP>-APZQEP-120-SNN-<RESULT>.json
```
