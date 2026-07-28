# MCP Considerations — APZQEP-ARCH-007

> Companion extract. Authoritative detail: [TRACEABILITY-ARCHITECTURE.md](./TRACEABILITY-ARCHITECTURE.md) §16.

## Rules

1. **MCP consumes Traceability** — future tools may query Trace, coverage, and impact.
2. MCP inherits Platform authentication and authorisation — no privilege escalation.
3. Any future write path uses the same commands and server `availableActions`.
4. MCP must not maintain a shadow Trace SoR.

No MCP implementation is authorised by APZQEP-ARCH-007.
