# Provider Contracts Baseline — APZQEP Version 1.1

## Frozen rules

1. **Provider-neutral orchestration** — Wave 5 never hardcodes Playwright, Selenium,
   Cypress, Appium, k6, GitLab, Azure DevOps, OpenAI, etc. as business owners.
2. **Capability Registry** — logical eligibility only; providers register as
   catalogue capabilities under later programmes.
3. **Automation Coordination** — emits intents (`execution: false`); never runs providers.
4. **Source Change Coordination** — normalizes identities; never calls SCM APIs.
5. **QI Enrichment** — advisory only; external AI providers contribute through the
   common enrichment contract when separately authorised.
6. **Dashboards / presentation** — Wave 4 owns rendering; Executive Experience is projection.

## Future provider programme families (illustrative — not authorised)

| Family                   | Series     | Examples                                                                                           |
| ------------------------ | ---------- | -------------------------------------------------------------------------------------------------- |
| Automation Providers     | APZQEP-170 | Playwright enhancements, Selenium, Cypress, Appium, REST/API, k6, accessibility, visual regression |
| Source Control Providers | APZQEP-180 | GitLab, Azure DevOps, Bitbucket, Gitea, Forgejo                                                    |
| Intelligence Providers   | APZQEP-190 | OpenAI, local LLMs, rule packs, statistical models, historical prediction                          |
| Enterprise Integrations  | APZQEP-200 | Jira, Plane, Zammad, Slack, Teams, Google Workspace, email, CI/CD                                  |

These are **provider / integration programmes**, not architecture programmes.
Each requires independent Owner Authorisation. See also
[ENTERPRISE-QUALITY-BASELINE.md](./ENTERPRISE-QUALITY-BASELINE.md).
