# APZ QEP — AI Requirements

> **Programme:** APZQEP-REQ-001 · IDs: AIR-*  
> **Posture:** AI-native product · QEP remains SoR · AI are assistants · **Never auto-certify**  
> **Related:** [../AI-STRATEGY.md](../AI-STRATEGY.md) · [../MCP-INTEGRATION-STRATEGY.md](../MCP-INTEGRATION-STRATEGY.md)

## Governing rules

1. AI outputs are drafts/suggestions until a human accepts them into SoR.
2. AI shall not flip certification state.
3. AI shall not grant permissions or bypass Authz.
4. AI shall not call connectors/engines directly.
5. AI shall not silently alter evidence.
6. Features default **OFF** until a named Owner-authorised AI implementation programme.
7. Providers are interchangeable (no single-vendor lock-in in architecture intent).

## AI capability requirements

| ID      | Topic                         | Requirement                                                                                 | Priority | Risk     | Acceptance criteria                                  |
| ------- | ----------------------------- | ------------------------------------------------------------------------------------------- | -------- | -------- | ---------------------------------------------------- |
| AIR-001 | AI Quality Agents             | Governed agents for QE tasks (draft, analyse, summarise) via authorised tools               | P1       | High     | Agent actions map to Platform Services; audited      |
| AIR-002 | Requirement Analysis          | Analyse requirements for ambiguity, testability, gaps                                       | P1       | Medium   | Suggestions non-destructive until accepted           |
| AIR-003 | Verification Generation       | Generate draft verification procedures from requirements/descriptions                       | P1       | Medium   | Human edit/accept before SoR commit                  |
| AIR-004 | Coverage Analysis             | Highlight untested / under-tested requirements and high-risk areas                          | P1       | Medium   | Gaps linked to FR-038                                |
| AIR-005 | Regression Analysis           | Propose regression suites from failure history and change signals                           | P2       | Medium   | Human selects suite before run                       |
| AIR-006 | Risk Prediction               | Rank risk areas for coverage attention                                                      | P2       | Medium   | Explainable outputs; permission-filtered inputs      |
| AIR-007 | Defect Clustering             | Cluster related defects / flaky signals for triage                                          | P2       | Medium   | Clusters are suggestions; SoR unchanged until accept |
| AIR-008 | Release Readiness             | Narrative readiness summary from evidence/gates                                             | P2       | High     | Must not flip certification state                    |
| AIR-009 | Certification Recommendations | Recommend certify / hold with rationale                                                     | P1       | Critical | Human approval mandatory; no auto-certify path       |
| AIR-010 | Natural Language Querying     | NL query over permission-filtered QEP knowledge                                             | P2       | Medium   | Answers cite SoR entities; no cross-tenant leak      |
| AIR-011 | Prompt Governance             | Owned prompts; change control; role-gated edits                                             | P1       | High     | Prompt changes audited                               |
| AIR-012 | Prompt Versioning             | Version prompts; rollback capability intent                                                 | P1       | High     | Version history retained                             |
| AIR-013 | Human Approval Workflow       | Any AI output affecting certification/evidence requires human approval                      | P0       | Critical | No auto-certify; accept/reject UI/API                |
| AIR-014 | AI Explainability             | Provide rationale / source refs for material suggestions                                    | P1       | High     | Explanation available for AIR-004/006/008/009        |
| AIR-015 | Responsible AI                | Fairness, transparency, POPIA/GDPR-aligned data use; default deny training on customer data | P0       | Critical | Policy in Definition; default deny training          |
| AIR-016 | AI Audit                      | Log prompt/response metadata for privileged AI actions (minimise personal data)             | P0       | High     | AI audit trail queryable                             |
| AIR-017 | Knowledge sources             | AI may use permission-filtered QEP + Platform Search knowledge only                         | P0       | High     | No cross-tenant leakage                              |
| AIR-018 | Model / provider usage        | Interchangeable providers (OpenAI, Claude, Gemini, DeepSeek, Mistral, Llama, future)        | P1       | High     | Provider class documented; swap without SoR redesign |
| AIR-019 | External models               | Cloud providers require Owner Approval + DPA where personal data involved                   | P0       | Critical | Approval gate documented                             |
| AIR-020 | Self-hosted preference        | Prefer self-hosted / local models where feasible                                            | P1       | Medium   | Self-hosted path in Definition                       |
| AIR-021 | Default posture               | AI features disabled until named AI implementation programme                                | P0       | High     | Feature flags default OFF                            |
| AIR-022 | MCP agent channel             | Agents/IDEs prefer MCP tools; certify tools not autonomous                                  | P1       | High     | Align IR-MCP; no agent→DB                            |
| AIR-023 | IDE adjacency                 | Support Cursor, VS Code, Windsurf, Replit, Kilo, future IDEs via MCP/adapters               | P1       | Medium   | Listed in IR; Authz enforced                         |
| AIR-024 | AI never SoR                  | Model memory/context never overrides QEP SoR entities                                       | P0       | Critical | Explicit rule in Definition/Architecture later       |

## Explicit exclusions

- AI shall not become System of Record.
- AI shall not auto-certify.
- AI shall not bypass Platform Authn/Authz.
- Documenting AI-native vision does **not** enable runtime AI.
