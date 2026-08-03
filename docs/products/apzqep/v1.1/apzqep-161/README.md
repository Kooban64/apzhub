# APZQEP-161 — Enterprise Automation Foundation

| Field            | Value                                                          |
| ---------------- | -------------------------------------------------------------- |
| Programme        | **APZQEP-161**                                                 |
| Wave             | 1                                                              |
| Status           | **COMPLETE** (engineering) — await Product Board certification |
| Timestamp        | 20260803T143922Z                                               |
| Platform package | `@apzhub/platform-automation` **0.1.0**                        |
| QEP package      | `@apzhub/qep-automation` **0.1.0**                             |
| First provider   | Playwright (active); others placeholder                        |

## Deliverables

| Document                | Path                                                                 |
| ----------------------- | -------------------------------------------------------------------- |
| Owner Authorisation     | [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md)                   |
| Automation Architecture | [AUTOMATION-ARCHITECTURE.md](./AUTOMATION-ARCHITECTURE.md)           |
| Automation SDK          | [AUTOMATION-SDK.md](./AUTOMATION-SDK.md)                             |
| Provider Contract       | [AUTOMATION-PROVIDER-CONTRACT.md](./AUTOMATION-PROVIDER-CONTRACT.md) |
| Playwright Provider     | [PLAYWRIGHT-PROVIDER.md](./PLAYWRIGHT-PROVIDER.md)                   |
| Execution Lifecycle     | [EXECUTION-LIFECYCLE.md](./EXECUTION-LIFECYCLE.md)                   |
| Automation Evidence     | [AUTOMATION-EVIDENCE.md](./AUTOMATION-EVIDENCE.md)                   |
| Workspace Guide         | [WORKSPACE-GUIDE.md](./WORKSPACE-GUIDE.md)                           |
| API Guide               | [API-GUIDE.md](./API-GUIDE.md)                                       |
| Certification           | [CERTIFICATION.md](./CERTIFICATION.md)                               |
| Completion              | [COMPLETION.md](./COMPLETION.md)                                     |

Evidence: `evidence/apzqep-161/20260803T143922Z/`

## Architecture rule

The Automation Engine **never** depends on Playwright. Playwright is the first **provider**. Future engines (Selenium, Cypress, Appium, REST, k6, visual, accessibility) plug into the same provider interface without changing the engine.

## Explicit exclusions (later waves)

GitHub · GitLab · AI · real Selenium/Cypress/Appium/k6/visual/accessibility providers.
