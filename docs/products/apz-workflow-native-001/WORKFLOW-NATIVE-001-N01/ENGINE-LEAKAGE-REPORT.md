# Engine Leakage Report — APZ Workflow

| Field     | Value            |
| --------- | ---------------- |
| Slice     | N-01             |
| Status    | **COMPLETE**     |
| Timestamp | 20260805T163000Z |

## Named engine brand (n8n)

| Check                       | Result                                   |
| --------------------------- | ---------------------------------------- |
| UI component strings        | **PASS** — no `n8n` in Workflow UI trees |
| Error sanitisation          | **PASS** — strips n8n / x-n8n tokens     |
| Boundary tests (components) | Present (forbid n8n in component trees)  |

## Product-visible engine identity

| Check                                  | Result                                     |
| -------------------------------------- | ------------------------------------------ |
| Activity Bar **Workflow Engine**       | **FAIL** — engine is a first-class product |
| Palette “Go to Workflow Engine”        | **FAIL**                                   |
| “Validate Engine Connection”           | **FAIL**                                   |
| Provider / capabilities / ops language | **FAIL** — implementation framing          |

## Conclusion

Named-engine branding is largely masked. **Functional engine productisation** remains a Critical leak against the APPROVED mission and Intent Principle.
