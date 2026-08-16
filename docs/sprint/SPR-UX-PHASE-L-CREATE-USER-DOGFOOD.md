# SPR-UX-PHASE-L — APZOR create-user dogfood (S6-09 slice)

> **Status:** **COMPLETE · CERTIFIED 100%** — 2026-08-16  
> **Authority:** [OWNER programme order §3](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md) · [UX-STREAM-006](../ux/UX-STREAM-006-tenant-identity-rbac-administration.md) · [S6-09](./SPR-UX-STREAM-006-tenant-identity-rbac-administration.md)  
> **Prerequisite:** Phase K create-user wizard **CERTIFIED** · SPR-IAM-COMMERCIAL-001 **ACCEPTED**  
> **Does not:** Full S6-06 teams/overrides · BetterAuth session admin · parked APZPEN enterprise

## Objective

Prove the Phase K create path on the **ordinary reference tenant** journey:

```text
Org Admin → provision Support Agent (Customer Support template)
  + product grants (support · time · knowledge)
  + support.queue scope
  + optional Professional Tool
→ User Inspector shows scopes/tools
→ Agent login → Support-shaped shell only (no QEP / Projects)
```

## Ships

| ID  | Ship                                                        | Exit                           |
| --- | ----------------------------------------------------------- | ------------------------------ |
| L0  | Sprint + gap map + registry                                 | Docs live                      |
| L1  | Unit dogfood (overlays → Inspector)                         | Vitest green                   |
| L2  | Playwright API dogfood (provision + inspect + home-context) | Spec + `pnpm test:e2e:phase-l` |
| L3  | Closeout                                                    | Gap map CERTIFIED              |

## Definition of Done

- Support Agent provision with Phase K overlays is covered by unit + Playwright smoke.
- Inspector access API reflects queue scope and professional tool grants.
- Negative: agent effective products exclude `qep` / `projects` when not granted.
- No provider brands in responses or UI copy under test.
