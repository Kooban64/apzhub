# APZ TCMS — AI Requirements

> **Programme:** APZTCMS-REQ-001 · IDs: AIR-*  
> **Rule:** AI is opt-in. **Never auto-certify.** Human approval gates mandatory for certification-impacting suggestions.

| ID      | Topic                     | Requirement                                                                                                | Priority | Risk     | Acceptance criteria                                |
| ------- | ------------------------- | ---------------------------------------------------------------------------------------------------------- | -------- | -------- | -------------------------------------------------- |
| AIR-001 | AI Test Generation        | Generate draft test cases from requirements/descriptions                                                   | P1       | Medium   | Drafts require human edit/accept before SoR commit |
| AIR-002 | AI Test Review            | Suggest gaps/duplicates/ambiguities in cases                                                               | P1       | Medium   | Suggestions non-destructive until accepted         |
| AIR-003 | AI Risk Analysis          | Rank risk areas for coverage attention                                                                     | P2       | Medium   | Outputs explainable; permission-filtered inputs    |
| AIR-004 | AI Coverage Analysis      | Highlight untested requirements/high-risk areas                                                            | P1       | Medium   | Coverage gaps linked to FR-028                     |
| AIR-005 | AI Regression Suggestions | Propose regression suites from failure history                                                             | P2       | Medium   | Human selects suite before run                     |
| AIR-006 | AI Release Readiness      | Narrative readiness summary from evidence/gates                                                            | P2       | High     | Must not flip certification state                  |
| AIR-007 | AI Prompt Governance      | Versioned prompts; change control; owner role                                                              | P1       | High     | Prompt changes audited                             |
| AIR-008 | Responsible AI            | Fairness, transparency, POPIA-aligned data use; no silent training on customer data without consent policy | P0       | Critical | Policy stated in Definition; default deny training |
| AIR-009 | Human approval gates      | Any AI output affecting certification/evidence requires human approval                                     | P0       | Critical | No auto-certify path exists                        |
| AIR-010 | Knowledge sources         | AI may use permission-filtered TCMS + Search knowledge only                                                | P0       | High     | No cross-tenant leakage                            |
| AIR-011 | Model usage               | Prefer self-hosted models; external models require Owner Approval + DPA                                    | P1       | High     | Provider class documented                          |
| AIR-012 | AI audit                  | Log prompts/responses metadata for privileged AI actions (minimise personal data)                          | P0       | High     | AI audit trail queryable                           |
| AIR-013 | Default posture           | AI features disabled until named AI implementation programme                                               | P0       | High     | Feature flags default OFF                          |

## Explicit exclusions

- AI shall not grant permissions or bypass Authz.
- AI shall not call connectors/engines directly.
- AI shall not silently alter evidence or certification state.
