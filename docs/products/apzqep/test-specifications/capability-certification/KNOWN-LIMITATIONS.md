# Known Limitations — APZQEP-CERT-050D

These limitations are **expected** or **documented non-blocking caveats** and do **not** fail certification gates.

## Product-scope exclusions (future programmes)

| Limitation | Status |
| ---------- | ------ |
| No Evidence capability | Expected — future programme |
| No Coverage capability | Expected — future programme |
| No Impact capability | Expected — future programme |
| No Certification Engine integration | Expected — future programme |
| No AI implementation | Expected — consumer architecture only |
| No MCP implementation | Expected — consumer architecture only |
| ADR-0074 `returnToDraft` contract delta | Expected — separate Domain/Infra then UI programme |

## Documented non-blocking caveats (from ENG-050C)

| Constraint | Notes |
| ---------- | ----- |
| Authenticated Playwright uses API route mocks | Same pattern as Support/TCMS; Vitest + contracts lock action matrix |
| Module discovery may need `modules/` on discovery roots | Deep links remain authoritative (same as Verification) |
| Preference Service named saved views not implemented | URL + session query persistence satisfies OES round-trip |
| No dedicated large-scale load-test campaign under CERT-050D | Pagination architecture in place |

## Freeze implication

Limitations above remain outside the **1.0.0** frozen Test Specifications capability surface until separately authorised.
