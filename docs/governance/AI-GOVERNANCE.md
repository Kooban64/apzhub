# APZOR AI Governance

> **Programme:** APZHUB-GOVERNANCE-001  
> **Date:** 2026-07-20  
> **Related:** [AI-ENGINEERING-OPERATIONS.md](../operations/AI-ENGINEERING-OPERATIONS.md) · AI-MANIFEST

---

## Scope

Govern use of AI (Cursor agents, future product AI) around APZHUB **without** authorising AI feature delivery.

## Principles

| Principle        | Rule                                                                    |
| ---------------- | ----------------------------------------------------------------------- |
| Repository-first | AI must bootstrap from AI-MANIFEST; ignore chat as authority            |
| Programme gates  | No implementation without Owner Approval                                |
| Freeze respect   | AI must not “helpfully” unfreeze SDK/Notify/Execute                     |
| Honesty          | AI must not invent Production claims beyond packs                       |
| Secrets          | Never paste secrets into prompts/logs                                   |
| STOP             | Email SoR · FIN-001 · 1.2 · monitoring implementation unless authorised |

## AI Steward duties

- Keep AI-MANIFEST / AI-WORKFLOW current
- Review high-risk agent outputs before Acceptance
- Ensure AI-generated docs cite evidence paths

## Future product AI

Requires separate Owner-approved programme; not implied by this governance doc.
