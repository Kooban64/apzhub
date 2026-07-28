# Domain Ownership — APZQEP-ARCH-007

> Companion extract. Authoritative detail: [TRACEABILITY-ARCHITECTURE.md](./TRACEABILITY-ARCHITECTURE.md) §3.

## Summary matrix

| Domain | Owns | Does not own |
| ------ | ---- | ------------ |
| **Requirements** | Requirements, CVs, Baselines, Requirement↔Requirement Relationships | Trace SoR, coverage math, certification |
| **Traceability** | Trace Links, Trace Types (cross-domain), coverage/impact contracts | Requirement content, Relationship taxonomy, evidence payloads |
| **Verification** | Specs, cases, verification activities/results (future) | Requirements Relationships |
| **Execution** | Executions / run results (future) | Trace taxonomy |
| **Evidence** | Evidence artefacts (future) | Trace SoR |
| **Certification** | Certification decisions/artefacts (future) | Auto-certification from graphs |
| **Documents** | Document identities | Trace business rules |
| **Platform** | AuthZ, audit, search infra, events | Trace domain rules |
| **AI / MCP** | Nothing authoritative | Trace ownership |

## Non-negotiable

- Requirements remains owner of Requirements.  
- Traceability consumes Requirements.  
- Traceability does not own Requirements.  
- Traceability must not fork a competing Relationship SoR (ARCH-005).
