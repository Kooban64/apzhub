# Enterprise Quality Baseline — APZQEP Version 1.1

| Field     | Value                 |
| --------- | --------------------- |
| Product   | APZQEP                |
| Version   | **1.1**               |
| Timestamp | 20260804T183844Z      |
| Authority | Product Board / Owner |
| Status    | **RECORDED**          |

## Formal designation

```text
APZQEP Version 1.1 is designated the Enterprise Quality Baseline for APZHUB.

All future enhancements shall be delivered as separately authorised
provider, integration, or operational improvement programmes against
this frozen architecture.

Final sentence for Version 1.1:
The platform is ready to learn.
```

Chapter close: [CHAPTER-CLOSE.md](./CHAPTER-CLOSE.md).

## Mandatory quality platform

APZQEP Version 1.1 is the mandatory quality platform for APZHUB products, including:

- APZHUB
- APZ Projects
- APZ Support
- APZ Time
- APZ Law Platform
- APZSign
- ZFConnect
- Any future APZHUB product

Use APZQEP for planning quality activities, automation, evidence, governance,
release readiness, and operational certification.

## Mode of work

| Mode                                                        | Status                                           |
| ----------------------------------------------------------- | ------------------------------------------------ |
| Foundational architecture / Wave 5 engineering              | **CLOSED** — Version 1.1 **officially complete** |
| Internal production adoption / dogfooding                   | **AUTHORISED** — enterprise infrastructure mode  |
| Provider / integration / operational improvement programmes | Require separate Owner Auth                      |

Adoption sequence and success metrics:
[ADOPTION-AND-OPERATIONS.md](./ADOPTION-AND-OPERATIONS.md).

Allowed change types against this baseline:
[APZQEP-CHANGE-CONTROL.md](./APZQEP-CHANGE-CONTROL.md).

## Provider programme families (illustrative — not authorised)

| Family                   | Series     | Examples                                                                                           |
| ------------------------ | ---------- | -------------------------------------------------------------------------------------------------- |
| Automation Providers     | APZQEP-170 | Playwright enhancements, Selenium, Cypress, Appium, REST/API, k6, accessibility, visual regression |
| Source Control Providers | APZQEP-180 | GitLab, Azure DevOps, Bitbucket, Gitea, Forgejo                                                    |
| Intelligence Providers   | APZQEP-190 | OpenAI, local LLMs, rule packs, statistical models, historical prediction                          |
| Enterprise Integrations  | APZQEP-200 | Jira, Plane, Zammad, Slack, Teams, Google Workspace, email, CI/CD                                  |

These are provider / integration programmes — not architecture programmes.
