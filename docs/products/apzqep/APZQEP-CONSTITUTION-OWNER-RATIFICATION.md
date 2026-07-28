# OWNER RATIFICATION

**Document:** [APZQEP-CONSTITUTION.md](./APZQEP-CONSTITUTION.md)  
**Version:** 1.0.0  
**Date:** 2026-07-28  
**Evidence (prepared):** `docs/operations/evidence/portfolio-recert/20260728T102538Z-APZQEP-CONSTITUTION-1.0.0.json`  
**Evidence (ratification):** `docs/operations/evidence/portfolio-recert/20260728T102844Z-APZQEP-CONSTITUTION-1.0.0-RATIFICATION.json`

## Governing Authority

- Document 000 v1.0.0  
- APZQEP-CONSTITUTION v1.0.0  
- OES-000 v1.0.0  
- OES-001 v1.0.0  
- OES-002 v1.1.0  

## Decision

**RATIFIED**

**APPROVED**

**BASELINED**

## Ratification assessment

The Constitution appropriately establishes permanent governing principles for APZQEP without duplicating implementation standards. It defines *what must always be true*; OES documents, engineering specifications, and capability documentation define *how those principles are implemented*.

| Constitutional Area | Result |
| ------------------- | ------ |
| Vision and Purpose | ✅ Ratified |
| Authority Hierarchy | ✅ Ratified |
| Architectural Principles | ✅ Ratified |
| Engineering Principles | ✅ Ratified |
| Governance Principles | ✅ Ratified |
| Certification Principles | ✅ Ratified |
| Versioning Policy | ✅ Ratified |
| Freeze Policy | ✅ Ratified |
| Change Control Principles | ✅ Ratified |
| AI Engineering Principles | ✅ Ratified |
| Platform Invariants | ✅ Ratified |
| Mandatory Capability Lifecycle | ✅ Ratified |

## Constitutional invariants (binding)

### Architecture

- Domain owns business behaviour.  
- Infrastructure orchestrates capability services.  
- Workbench presents information and invokes authorised actions only.  
- Architectural separation between layers is mandatory.

### User Interface

- Workbench never owns business behaviour.  
- `availableActions` is the sole authority for executable user actions.  
- Presentation must never infer or invent business permissions.

### Governance

Every capability shall complete the full APZOR Engineering Operating Model lifecycle. No governance stage may be omitted or merged.

### Certification

Certification remains independent of engineering. Certification shall never remediate or modify software.

### Freeze

Only an Owner-authorised Freeze programme establishes an immutable production baseline.

### AI

AI is an engineering assistant and accelerator. AI shall not replace governance, certification, architectural authority, or Owner decision-making.

## Constitutional status

```text
APZQEP-CONSTITUTION
Version: 1.0.0
Status: RATIFIED
APPROVED
BASELINED
```

This document is the constitutional entry point for APZQEP.

## Amendment rule

- Amendments require a dedicated Owner-authorised constitutional programme.  
- Amendments shall not be introduced indirectly through engineering specifications, architecture documents, or capability documentation.  
- Subordinate documents shall remain consistent with the Constitution.

## Final declaration (Owner)

The **APZQEP Foundation Programme** is fully complete. The engineering platform is **Version 1**, constitutionally governed, operationally validated, and supported by five certified and frozen production capabilities. Capability Expansion may begin only when an Owner authorises the first Wave 2 Architecture programme. Until then, the Foundation baseline remains the authoritative reference.

## STOP

```text
APZQEP-CONSTITUTION 1.0.0
RATIFIED
APPROVED
BASELINED

FOUNDATION FULLY COMPLETE
ENGINEERING PLATFORM V1
NO WAVE-2 AUTHORISED
```
