# APZQEP-OES-ENG-050C — APPENDIX C — Route Inventory

Architectural routes from OES-ARCH-012 Part 2. Concrete Next.js file paths SHALL follow sibling QEP Workbench conventions; paths below are the **stable URL contracts**.

| Route | Screen |
| ----- | ------ |
| `/workspace/qep/test-specifications` | Dashboard |
| `…/explorer` | Explorer |
| `…/review` | Review queue |
| `…/search` | Capability search |
| `…/specifications/{id}` | Inspector |
| `…/specifications/{id}/history` | History |
| `…/specifications/{id}/versions` | Versions |
| `…/specifications/{id}/relationships` | Relationships |
| `…/specifications/{id}/compare?with={otherId}` | Compare |

Implementation MAY nest under the existing QEP workspace prefix used by Requirements/Verification if that prefix differs slightly — **document the final mapping in the product workbench pack** without breaking deep-link stability once shipped.

## END OF APPENDIX C
