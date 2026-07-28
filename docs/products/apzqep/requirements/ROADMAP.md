# APZ QEP — Product Roadmap (Requirements Horizon)

> **Programme:** APZQEP-REQ-001  
> **Note:** Roadmap is requirements intent. Sequencing in Definition/Architecture may refine without changing P0 obligations.

## MVP (Phase 1) — Enterprise QE foundation

**Goal:** Structured verification + evidence + certification + traceability on Platform 1.4.

| Theme                    | Include (P0 / selected P1)                                          |
| ------------------------ | ------------------------------------------------------------------- |
| Identity                 | Projects/contexts, RBAC, tenant-ready                               |
| Requirements             | Capture/approve/link                                                |
| Verification             | Plans, suites, manual procedures, runs                              |
| Automation               | Foundational result ingest + CI metadata (GitHub path)              |
| Traceability             | Req ↔ verification ↔ defect ↔ release                               |
| Evidence & certification | Evidence repo, human sign-off, release readiness                    |
| Platform consume         | Identity, Authz, Audit, Search, Notifications events, Observability |
| Reporting                | Executive / quality / release dashboards                            |
| Explicitly deferred      | Runtime AI ON, full MCP server, marketplace, hybrid cloud           |

## Phase 2

| Theme                     | Include                                                    |
| ------------------------- | ---------------------------------------------------------- |
| Automation breadth        | GitLab (+ optional Azure Pipelines)                        |
| Libraries & templates     | Verification libraries/templates                           |
| Risk management           | Risk entity + risk analytics                               |
| Documents                 | Stronger Documents adjacency for packs                     |
| AI (authorised programme) | Generation/review/coverage OFF→ON under Owner AI programme |
| MCP                       | Governed MCP tools for Cursor/VS Code                      |
| ALM optional              | Jira / Linear connectors (Owner-approved)                  |

## Phase 3

| Theme                             | Include                                                      |
| --------------------------------- | ------------------------------------------------------------ |
| Continuous verification           | Pipeline/monitor continuous signals                          |
| Continuous certification advanced | Re-cert automation of _signals_ (human still approves state) |
| Quality Intelligence              | Deeper analytics / EI                                        |
| Workflow execute                  | When Platform unlocks Workflow execute                       |
| Cloud offering                    | Optional managed cloud (Owner-gated)                         |

## Enterprise roadmap

| Theme                            | Include                                    |
| -------------------------------- | ------------------------------------------ |
| HA / enterprise SLO              | NFR availability enterprise tier           |
| Enterprise licensing packs       | CR enterprise                              |
| Industry overlays                | Regulated overlays without audit weakening |
| Professional services & partners | CR-010 / CR-011                            |
| SOC 2 / ISO narratives           | RR evidence exports                        |

## Future AI roadmap

| Theme                               | Include                                                  |
| ----------------------------------- | -------------------------------------------------------- |
| Interchangeable providers           | OpenAI, Claude, Gemini, DeepSeek, Mistral, Llama, future |
| AI Quality Agents                   | Broader agent catalogue via MCP                          |
| NL querying                         | AIR-010                                                  |
| Risk prediction / defect clustering | AIR-006 / AIR-007                                        |
| Prompt governance maturity          | Versioning, evaluation harnesses                         |
| **Never**                           | Auto-certify; AI as SoR                                  |

## Marketplace roadmap

| Theme                             | Include              | Priority |
| --------------------------------- | -------------------- | -------- |
| Verification template marketplace | Share/sell templates | P3       |
| Agent / connector listings        | Partner extensions   | P3       |
| Knowledge packs                   | Industry playbooks   | P3       |

## Sequencing rule

```text
Requirements Acceptance (this programme)
  → APZQEP-DEF-001 Definition
    → Architecture programmes
      → Engineering programmes (MVP first)
```

No phase authorises implementation by itself.
