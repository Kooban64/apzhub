# Product Transition Report — APZQEP-TRANSITION-001

> **Date:** 2026-07-24  
> **From:** APZ TCMS  
> **To:** APZ QEP (APZ Quality Engineering Platform)

## Decision

Owner authorised renaming and vision realignment from a traditional Test Case Management framing to an Enterprise Quality Engineering Platform, while preserving all existing documentation and work.

## What changed

| Area                  | Change                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| Official product name | **APZ QEP**                                                                                            |
| Vision                | SDLC quality governance; testing is one capability                                                     |
| Philosophy            | Verification-centred; QEP SoR; AI assistants; mandatory traceability; certification readiness core     |
| Conceptual modules    | Expanded to Requirements, Verification modes, Evidence, Certification, Analytics, AI Agents, MCP, etc. |
| AI posture            | Documented as AI-native with interchangeable providers + IDE/MCP strategy                              |
| Docs root             | `docs/products/apzqep/` established as official                                                        |
| Historical packs      | `apz-tcms/` and `apztcms/` retained with bridges                                                       |

## What did not change

- Platform 1.4 code, architecture, freezes
- No product implementation, schema, APIs, or UI
- No ADRs authored
- Historical APZ-TCMS-001/002 and APZTCMS-REQ-001 artefacts remain on disk
- Layering and brand-mask rules unchanged

## APZTCMS-REQ-001 disposition

| Item                               | Disposition                                                                        |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| Programme ID                       | Preserved historically                                                             |
| Content                            | Preserved under `docs/products/apztcms/requirements/`                              |
| Product identity in downstream     | Evolves to APZ QEP                                                                 |
| Next requirements programme        | **APZQEP-REQ-001** (after Transition Acceptance) — evolve baseline, do not discard |
| Former next DEF id APZTCMS-DEF-001 | Naming superseded; Definition programmes will use APZQEP-* after REQ               |

## Risks / notes

- Code/package names may still say `testing` / `tcms` until later Engineering — documentation identity is QEP first.
- Release evidence folders remain `docs/releases/tcms/` until a future Owner-authorised release path rename.
