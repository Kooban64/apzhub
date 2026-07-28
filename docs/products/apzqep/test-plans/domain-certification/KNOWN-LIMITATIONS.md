# Known Limitations — APZQEP-CERT-060A

These limitations are **expected** for Domain-only scope and do **not** fail Domain certification gates.

## Intentional non-delivery (future programmes)

| Limitation | Status |
| ---------- | ------ |
| No Infrastructure / persistence / repositories | Expected — future ENG |
| No REST / Gateway routes | Expected — future ENG |
| No Workbench / UI | Expected — future programmes |
| No Authz / Audit / Search wiring | Expected — Infrastructure |
| No AI / MCP implementation | Expected — out of scope |
| No capability Freeze / 1.0.0 baseline | Expected — post full vertical CERT |

## Documented quality caveats (from ENG-060A)

| Constraint | Notes |
| ---------- | ----- |
| Coverage below aspirational OES % objectives | Owner-accepted; defensive residuals only |
| No dedicated load-test campaign | Not applicable to pure Domain package |

## Classification implication

Limitations above justify **DOMAIN_PRODUCTION_READY_WITH_LIMITATIONS** and retention of SemVer **0.1.0** until full-capability certification.
