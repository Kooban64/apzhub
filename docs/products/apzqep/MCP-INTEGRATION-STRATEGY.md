# APZ QEP — MCP Integration Strategy

> **Programme:** APZQEP-TRANSITION-001  
> **MCP:** Model Context Protocol — **preferred governed integration model** for IDE/agent access to QEP

## Why MCP

MCP provides a standard, tool-oriented bridge between AI IDEs/agents and product capabilities with explicit tool boundaries — aligning with Zero Trust, least privilege, and auditable assistant behaviour.

## Preferred model

```text
IDE / Agent (Cursor, VS Code, …)
  → MCP Server (QEP-governed tools)
    → APZHUB API Gateway
      → Auth → Authz → QEP Platform Services
        → QEP SoR / Connectors
```

| Rule      | Statement                                                     |
| --------- | ------------------------------------------------------------- |
| Preferred | MCP for IDE/agent integrations                                |
| Forbidden | Agent → database / connector / engine direct access           |
| Required  | Every MCP tool maps to authorised Platform Service operations |
| Required  | User identity and permissions enforced server-side            |
| Required  | Mutating tools audited; certification tools human-gated       |

## Tool classes (conceptual)

| Class         | Examples                                  | Notes                             |
| ------------- | ----------------------------------------- | --------------------------------- |
| Read          | List verifications, coverage, readiness   | Permission-filtered               |
| Draft         | Propose verification cases, risk notes    | Do not commit without accept      |
| Write (gated) | Create draft verification in SoR          | Explicit user confirm             |
| Certify       | **Not** exposed as autonomous MCP certify | Human approval in QEP UI/API only |

## Relationship to providers

MCP is the **integration channel** for agents/IDEs.  
Model providers (OpenAI, Claude, Gemini, …) are **inference backends**.  
They are orthogonal: MCP tools call QEP; models may assist agents — QEP SoR stays authoritative.

## Future programmes

MCP server design, tool manifest, and security review belong to later Architecture/Engineering programmes after **APZQEP-REQ-001** and Definition — not this transition.
