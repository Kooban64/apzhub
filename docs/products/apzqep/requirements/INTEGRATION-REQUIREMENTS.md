# APZ QEP — Integration Requirements

> **Programme:** APZQEP-REQ-001 · IDs: IR-*  
> **Rule:** Platform Service → Connector → Engine only. Brand masking mandatory.  
> **Related:** [../MCP-INTEGRATION-STRATEGY.md](../MCP-INTEGRATION-STRATEGY.md)

## Platform integrations (mandatory consume)

| ID     | Capability        | Requirement                                                    | Priority | Risk     | Acceptance criteria                 |
| ------ | ----------------- | -------------------------------------------------------------- | -------- | -------- | ----------------------------------- |
| IR-001 | Identity          | BetterAuth session; no product login engine for standard users | P0       | Critical | Silent SSO/session via Platform     |
| IR-002 | Authorisation     | PermissionService catalogue for QEP operations                 | P0       | Critical | Server-authoritative checks         |
| IR-003 | Notifications     | Domain events → Platform Notification / Attention path         | P0       | High     | No product SMTP                     |
| IR-004 | Workflow          | Optional approvals via Platform Workflow (execute gated)       | P2       | Medium   | Only when Platform unlocks execute  |
| IR-005 | Analytics         | Optional quality metrics to Platform Analytics                 | P2       | Low      | No Metabase chrome in QEP           |
| IR-006 | Documents         | Evidence/document refs via Platform Documents                  | P1       | Medium   | Native Documents patterns           |
| IR-007 | Search            | Search providers for QEP entities                              | P0       | High     | Permission-filtered                 |
| IR-008 | Observability     | Health/metrics/logs/traces via Platform Observability          | P0       | High     | Correlation IDs                     |
| IR-009 | Provisioning      | Product enablement via Platform Provisioning/Governance        | P0       | High     | No hardcode shell registration      |
| IR-010 | Audit             | Platform Audit for privileged QEP actions                      | P0       | Critical | Audit immutable                     |
| IR-011 | Platform Services | All business operations through QEP Platform Services          | P0       | Critical | No module business logic SoR writes |

## ALM / work management

| ID     | System               | Requirement                                                               | Priority | Risk   | Acceptance criteria                  |
| ------ | -------------------- | ------------------------------------------------------------------------- | -------- | ------ | ------------------------------------ |
| IR-012 | Plane (APZ Projects) | Traceability via Platform ProjectService — never Plane client from module | P0       | High   | Links through Platform Services      |
| IR-013 | Jira                 | Optional issue/defect sync via connector                                  | P2       | Medium | Brand masked; Owner-approved adapter |
| IR-014 | Linear               | Optional issue sync via connector                                         | P2       | Medium | Brand masked; Owner-approved adapter |
| IR-015 | Azure DevOps         | Optional work items / pipelines via connector                             | P2       | Medium | Brand masked; Owner-approved adapter |

## CI / DevOps

| ID     | System                 | Requirement                                             | Priority | Risk   | Acceptance criteria                      |
| ------ | ---------------------- | ------------------------------------------------------- | -------- | ------ | ---------------------------------------- |
| IR-016 | GitHub                 | Read-oriented Actions/metadata adapter (reference path) | P0       | Medium | Metadata ingest; no full GitHub admin UX |
| IR-017 | GitLab                 | Read-oriented CI metadata adapter                       | P1       | Medium | Same constraints as GitHub               |
| IR-018 | Azure DevOps Pipelines | Optional pipeline metadata                              | P2       | Medium | Connector pattern                        |

## IDE / agent integrations

| ID     | System      | Requirement                                         | Priority | Risk   | Acceptance criteria                |
| ------ | ----------- | --------------------------------------------------- | -------- | ------ | ---------------------------------- |
| IR-019 | MCP         | Preferred governed integration model for IDE/agents | P1       | High   | Tools → Gateway → Authz → Services |
| IR-020 | Cursor      | Primary AI IDE adjacency via MCP/adapters           | P1       | Medium | Authz; no silent certify           |
| IR-021 | VS Code     | Broad editor support via MCP/adapters               | P1       | Medium | Same constraints                   |
| IR-022 | Windsurf    | AI IDE adjacency                                    | P2       | Low    | Same constraints                   |
| IR-023 | Replit      | Cloud IDE adjacency                                 | P2       | Low    | Same constraints                   |
| IR-024 | Kilo        | Listed Owner IDE target                             | P2       | Low    | Same constraints                   |
| IR-025 | Future IDEs | Extensible via MCP / Integration SDK                | P3       | Low    | Pattern documented                 |

## AI providers

| ID     | Provider         | Requirement                                  | Priority | Risk   | Acceptance criteria                      |
| ------ | ---------------- | -------------------------------------------- | -------- | ------ | ---------------------------------------- |
| IR-026 | OpenAI           | Optional inference via Integration Adapter   | P1       | High   | Interchangeable; Owner+DPA when required |
| IR-027 | Anthropic Claude | Optional inference via adapter               | P1       | High   | Same                                     |
| IR-028 | Google Gemini    | Optional inference via adapter               | P1       | Medium | Same                                     |
| IR-029 | DeepSeek         | Optional inference via adapter               | P2       | Medium | Same                                     |
| IR-030 | Mistral          | Optional inference via adapter               | P2       | Medium | Same                                     |
| IR-031 | Llama / local    | Preferred self-hosted path where feasible    | P1       | Medium | Local runtime adapter intent             |
| IR-032 | Future providers | Add via Integration SDK without SoR redesign | P2       | Low    | Capability discovery                     |

## APIs & events

| ID     | Capability | Requirement                                              | Priority | Risk   | Acceptance criteria          |
| ------ | ---------- | -------------------------------------------------------- | -------- | ------ | ---------------------------- |
| IR-033 | REST APIs  | Versioned public/partner APIs through Gateway            | P1       | Medium | OpenAPI + authz + rate limit |
| IR-034 | Webhooks   | Inbound/outbound for run/cert events (Platform patterns) | P1       | Medium | Signed; authz                |
| IR-035 | Kiwi TCMS  | **Out of scope** as SoR/adapter                          | P3       | Low    | Explicitly excluded          |

## Notes

- Historical APZ TCMS 1.0.0: GHA PRWL read-only; GitLab later; Kiwi absent — direction retained.
- User-facing names: APZ Projects (not Plane), APZ QEP (not Kiwi/TestRail/etc.).
