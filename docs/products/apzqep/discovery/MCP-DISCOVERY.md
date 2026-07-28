# APZ QEP — MCP Discovery

> **Programme:** APZQEP-DISCOVERY-001  
> **Related:** [../MCP-INTEGRATION-STRATEGY.md](../MCP-INTEGRATION-STRATEGY.md)  
> **Rule:** APZ QEP remains the authoritative System of Record

## Why MCP matters now

Model Context Protocol is becoming the standard bridge between AI IDEs/agents and enterprise tools. Enterprise guidance emphasises:

- Allowlists / policy for which MCP servers may connect
- Gateway / central enforcement (authn/z, rate limits, audit)
- Tool-level permissions — not only network access
- User-delegated identity (agents act as the user, not as a superuser)

Market risk: **shadow MCPs** that bypass SoR and compliance.

## Strategic stance for APZ QEP

| Principle         | Statement                                                                  |
| ----------------- | -------------------------------------------------------------------------- |
| Preferred channel | MCP for IDE/agent integrations                                             |
| Authority         | QEP SoR always wins                                                        |
| Path              | IDE → MCP Server (QEP) → APZHUB Gateway → Auth → Authz → Platform Services |
| Forbidden         | Agent → DB / connector / engine direct                                     |
| Certify           | Never autonomous via MCP                                                   |

## IDE interaction models

| IDE / environment | Opportunity              | Governed model                                        |
| ----------------- | ------------------------ | ----------------------------------------------------- |
| **Cursor**        | Primary AI IDE adjacency | Remote/local MCP server; org allowlist; user session  |
| **VS Code**       | Broad installed base     | Same; Copilot/agent MCP policies emerging in industry |
| **Windsurf**      | AI IDE adjacency         | Same tool catalogue                                   |
| **Replit**        | Cloud IDE                | Remote MCP + stricter data controls                   |
| **Kilo**          | Owner-listed target      | Same catalogue when client supports MCP               |
| **Future IDEs**   | Extensible               | Capability discovery; no per-IDE SoR forks            |

## Tool classes (discovery)

| Class       | Examples                                              | Governance          |
| ----------- | ----------------------------------------------------- | ------------------- |
| Read        | List requirements, verifications, coverage, readiness | Permission-filtered |
| Draft       | Propose procedures, risk notes, readiness narrative   | No SoR write        |
| Gated write | Create draft verification after explicit user confirm | Audited             |
| Admin       | Config changes                                        | Role-gated; rare    |
| Certify     | **Not exposed as autonomous tool**                    | Human UI/API only   |

## Enterprise MCP governance checklist (for later Architecture)

1. Approved MCP server registry
2. Runtime gateway / policy enforcement
3. OAuth/OIDC-aligned auth where remote
4. Per-tool authz mapped to PermissionService
5. Full tool-call audit trail
6. Rate limits & abuse controls
7. Environment isolation (dev/stage/prod)
8. Kill switch / feature flag

## Discovery conclusions

- MCP is a **differentiator** if QEP ships governance-first, not tools-first.
- Definition should describe actor journeys (developer in Cursor asking coverage) without designing protocol schemas yet.
- Success metric: agents accelerate quality work **without** creating unaudited SoR mutations or auto-certification.
