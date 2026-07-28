# APZ QEP — Conceptual Module Architecture

> **Programme:** APZQEP-TRANSITION-001  
> **Note:** Conceptual product structure for Definition/Architecture later. **Not** an implementation or database design.

## Product structure (target conceptual modules)

| Module / domain                      | Role                                                                   |
| ------------------------------------ | ---------------------------------------------------------------------- |
| **Requirements Engineering**         | Capture/link quality-relevant requirements; feed verification          |
| **Verification Management**          | Plan, organise, and govern all verification work                       |
| **Manual Verification**              | Human procedures, runs, results                                        |
| **Automated Verification**           | Link/ingest automation results; orchestrate — do not become the runner |
| **AI-assisted Verification**         | AI draft/review/suggest under human gates                              |
| **Requirements Traceability**        | Requirements ↔ verification ↔ defects ↔ releases                       |
| **Risk Analysis**                    | Risk-based coverage and prioritisation                                 |
| **Evidence Management**              | Evidence metadata, refs, packs, retention                              |
| **Defect Management**                | Defects linked to verifications and requirements                       |
| **Release Readiness**                | Aggregated go/no-go signals                                            |
| **Continuous Certification**         | Ongoing certification state and re-cert signals                        |
| **Quality Analytics**                | Metrics and trends (Platform Analytics adjacency)                      |
| **Quality Dashboards**               | Role-based operational and executive views                             |
| **Quality Knowledge Base**           | Playbooks, standards, reusable verification knowledge                  |
| **AI Quality Agents**                | Governed agents for QE tasks (assistants only)                         |
| **MCP Integration**                  | Model Context Protocol as preferred IDE/agent bridge                   |
| **External AI Provider Integration** | Interchangeable model providers                                        |
| **API Platform**                     | Versioned Gateway APIs for QEP                                         |
| **Administration**                   | Product admin, entitlements, configuration                             |
| **Security**                         | Authz catalogue, least privilege, Zero Trust consume                   |
| **Compliance**                       | POPIA/GDPR/audit/retention overlays                                    |

## Mapping from former TCMS concepts

| Former TCMS concept      | QEP concept                                                |
| ------------------------ | ---------------------------------------------------------- |
| Test Plans               | Verification plans (under Verification Management)         |
| Test Suites              | Verification suites / collections                          |
| Test Cases               | Manual verification procedures (one verification form)     |
| Test Runs                | Verification runs / executions                             |
| Certification            | Continuous Certification + Release Readiness               |
| Engineering Intelligence | Quality Analytics / Dashboards / AI Agents (as applicable) |
| CI metadata              | Automated Verification integrations                        |

## Layering (unchanged)

```text
QEP Module UI
  → APZHUB API Gateway
  → Platform Services
  → Connectors (CI/ALM/AI providers as required)
  → External systems
```

QEP modules never call engines or provider SDKs directly.
