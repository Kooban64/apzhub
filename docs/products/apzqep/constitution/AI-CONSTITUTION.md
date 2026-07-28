# APZ QEP — AI Constitution

> **Programme:** APZQEP-CONSTITUTION-001  
> **Authority:** Constitutional (Article V)  
> **Related:** [../AI-STRATEGY.md](../AI-STRATEGY.md) · REQ-001 AIR-* · Discovery AI-DISCOVERY

## Immutable AI rules

| #   | Rule                                                                                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | **AI never becomes the System of Record.**                                                                                   |
| 2   | **AI never certifies software independently.**                                                                               |
| 3   | **Human approval is mandatory for certification** and for any AI output that would change certification-impacting SoR state. |
| 4   | **AI output must be explainable** for material recommendations (rationale / sources).                                        |
| 5   | **AI recommendations must be traceable** to inputs, prompts/versions, and resulting accept/reject decisions.                 |
| 6   | **Prompt governance is mandatory** — ownership, change control, versioning.                                                  |
| 7   | **Provider abstraction is required** — architecture shall not hard-lock a single model vendor.                               |
| 8   | **AI providers are replaceable** without redesigning QEP SoR.                                                                |
| 9   | **AI interactions shall be auditable** for privileged and certification-adjacent actions (minimise personal data).           |
| 10  | **AI assists humans; humans remain accountable.**                                                                            |
| 11  | **AI shall not grant permissions or bypass Authz.**                                                                          |
| 12  | **AI shall not call connectors/engines directly** — Platform Services only.                                                  |
| 13  | **AI shall not silently alter evidence.**                                                                                    |
| 14  | **AI features default OFF** until a named Owner-authorised AI implementation programme enables them.                         |
| 15  | **Knowledge used by AI shall be permission-filtered** — no cross-tenant leakage.                                             |
| 16  | **Silent training on customer data is forbidden** without explicit policy and Owner-aligned consent posture.                 |
| 17  | **MCP (or successor governed protocol) is preferred** for IDE/agent tool access; tools inherit these rules.                  |

## Allowed AI behaviours

- Draft verification procedures, analyses, summaries, and risk/coverage suggestions
- Natural language querying over permission-filtered SoR/KB (when authorised)
- Multi-agent workflows that **propose** only

## Forbidden AI behaviours

- Autonomous certification approve/reject
- Silent SoR commits without human accept
- Privilege escalation
- Cross-tenant knowledge use
- Presenting model memory as authoritative over QEP SoR

## Amendment

AI Constitution rules may be relaxed only by Owner Decision. Operational enablement of AI features is not amendment — enablement still must obey these rules.
