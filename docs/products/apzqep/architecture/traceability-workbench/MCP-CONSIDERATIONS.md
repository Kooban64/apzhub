# MCP Considerations — APZQEP-ARCH-008

> Companion extract. Authoritative detail: [TRACEABILITY-WORKBENCH-ARCHITECTURE.md](./TRACEABILITY-WORKBENCH-ARCHITECTURE.md) §22.

## MCP as consumer

Future MCP adapters may consume:

- Traceability REST APIs (ENG-030A Part 2);  
- Workbench-oriented summary contracts;  
- Platform Search (`trace_link`).

## MCP must not

- Become part of the Traceability domain;  
- Autonomously mutate without governed authz / audit;  
- Treat search indexes as Systems of Record;  
- Bypass `availableActions` / permission checks.

## Workbench implication

Keep stable machine-readable summaries, actions, and error codes so a future governed MCP adapter can integrate without Workbench redesign. **No MCP implementation under ARCH-008.**
