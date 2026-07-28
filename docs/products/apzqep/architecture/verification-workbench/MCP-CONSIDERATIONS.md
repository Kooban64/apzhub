# MCP Considerations — APZQEP-ARCH-010

> Companion extract. Authoritative detail: [VERIFICATION-WORKBENCH-ARCHITECTURE.md](./VERIFICATION-WORKBENCH-ARCHITECTURE.md) §22.

## MCP may

- Read Verification via authorised APIs
- Invoke authorised APIs on behalf of a principal

## MCP must never

- Own Verification SoR
- Own lifecycle or Workbench state
- Bypass IAM or `availableActions` semantics

## Rule

No MCP server implementation under ARCH-010. MCP is a consumer only.
