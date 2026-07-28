# Version Promotion — `@apzhub/qep-test-plans` 1.0.0

| Field | Value |
| ----- | ----- |
| Package | `@apzhub/qep-test-plans` |
| From | **0.2.0** |
| To | **1.0.0** |
| Date | 2026-07-28 |
| Authority | Owner Certification Decision APZQEP-CERT-080A |
| Breaking public contract changes | **None** |
| Nature | CERT packaging alignment — not engineering |
| Status | **APPLIED** |

## Gates before promotion

| Gate | Result |
| ---- | ------ |
| Typecheck | **PASS** |
| Capability re-verification test set | **PASS** (124) |
| Cross-layer architecture integrity | **PASS** |
| CERT-060A / CERT-060B / CERT-070A | **CERTIFIED / CLOSED** |
| ARCH-013 / ARCH-014 / all OES-ENG identifiers | **ACCEPTED** |
| APZQEP-CERT-080A Owner Certification Decision | **CERTIFIED / APPROVED / CLOSED** |

## Artefacts updated (promotion packaging)

| Artefact | Change |
| -------- | ------ |
| `packages/qep-test-plans/package.json` | version **1.0.0** |
| `packages/qep-test-plans/src/index.ts` | `QEP_TEST_PLANS_VERSION` / `QEP_TEST_PLANS_PROGRAMME` |
| `packages/qep-test-plans/src/architecture-boundaries.test.ts` | asserts **1.0.0** |
| `modules/qep-test-plans/module.yaml` | version **1.0.0** · programme APZQEP-CERT-080A · status certified |

## SemVer rationale

Domain, Infrastructure, and Workbench Component Certification plus integrated Capability Certification justify first stable major **1.0.0**. No breaking API redesign accompanied the promotion.

## Freeze note

Promotion did not itself freeze the baseline. The baseline has since been frozen under **APZQEP-FREEZE-080A** — **FROZEN / APPROVED / CLOSED**. `@apzhub/qep-test-plans` **1.0.0 CERTIFIED / FROZEN / BASELINE ESTABLISHED** (see [../freeze/OWNER-FREEZE-DECISION.md](../freeze/OWNER-FREEZE-DECISION.md)).
