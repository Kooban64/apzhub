# APZ QEP — Gap Analysis

> **Programme:** APZQEP-DISCOVERY-001  
> **Classes:** Commodity · Competitive · Differentiator · Future Innovation

## Classification legend

| Class             | Meaning                                          |
| ----------------- | ------------------------------------------------ |
| Commodity         | Table stakes; parity required for credibility    |
| Competitive       | Needed to shortlist against leaders              |
| Differentiator    | Win theme; invest disproportionately             |
| Future Innovation | Horizon bets; protect vision, sequence carefully |

## Capability matrix

| Capability                                | Class                  | Market maturity                    | Strategic importance | Impl. priority | Business value | Eng. complexity |
| ----------------------------------------- | ---------------------- | ---------------------------------- | -------------------- | -------------- | -------------- | --------------- |
| Manual verification procedures/runs       | Commodity              | High                               | High                 | P0             | High           | Medium          |
| Plans/suites organisation                 | Commodity              | High                               | High                 | P0             | High           | Low–Med         |
| Basic defect links                        | Commodity              | High                               | High                 | P0             | High           | Medium          |
| REST API                                  | Commodity              | High                               | High                 | P0             | High           | Medium          |
| CI result ingest (GitHub path)            | Commodity→Competitive  | High                               | High                 | P0             | High           | Medium          |
| Requirements traceability                 | Competitive            | High                               | Critical             | P0             | Critical       | Medium          |
| Release association / readiness views     | Competitive            | Medium–High                        | Critical             | P0             | Critical       | Medium          |
| Standard QA dashboards                    | Competitive            | High                               | High                 | P0             | High           | Medium          |
| Jira sync                                 | Competitive (optional) | High                               | Medium               | P2             | Medium         | Medium          |
| Evidence repository + retention           | Differentiator         | Medium                             | Critical             | P0             | Critical       | Medium–High     |
| Human multi-role certification            | Differentiator         | Low–Medium                         | Critical             | P0             | Critical       | Medium          |
| Continuous certification signals          | Differentiator         | Low                                | Critical             | P1–P2          | Critical       | High            |
| Quality Knowledge Base                    | Differentiator         | Low–Medium                         | High                 | P1             | High           | Medium          |
| Risk-based quality                        | Differentiator         | Medium                             | High                 | P1             | High           | Medium          |
| Executive quality intelligence            | Differentiator         | Medium                             | High                 | P1             | High           | Medium          |
| Verification maturity model (productised) | Differentiator         | Low                                | High                 | P1             | Medium–High    | Low–Med (UX)    |
| AI generation (governed)                  | Differentiator         | High (ungoverned) / Low (governed) | High                 | P1*            | High           | High            |
| Prompt governance / AI audit              | Differentiator         | Low                                | Critical             | P1*            | Critical       | Medium–High     |
| Provider abstraction                      | Differentiator         | Low–Medium                         | High                 | P1*            | High           | Medium          |
| MCP-native governed tools                 | Differentiator         | Emerging                           | Critical             | P1             | Critical       | High            |
| NL quality querying                       | Future Innovation      | Emerging                           | Medium–High          | P2             | High           | High            |
| Multi-agent QE workflows                  | Future Innovation      | Emerging                           | High                 | P2             | High           | High            |
| Marketplace templates/agents              | Future Innovation      | Emerging                           | Medium               | P3             | Medium         | High            |
| Shift-right continuous verification       | Future Innovation      | Medium                             | High                 | P2             | High           | High            |
| Hybrid cloud control plane                | Future Innovation      | Medium                             | Medium               | P3             | Medium         | High            |

\*AI user features remain **default OFF** until Owner-authorised AI implementation programmes; governance plumbing may precede.

## Gap summary vs market leaders

| Versus              | Gap we accept                             | Gap we close                                 |
| ------------------- | ----------------------------------------- | -------------------------------------------- |
| TestRail            | Decades of TCMS polish initially          | Cert SoR, MCP, suite platform, AI governance |
| Xray/Zephyr         | Jira-native convenience                   | Independence from Jira; multi-ALM            |
| Allure TestOps      | Pure automation analytics depth initially | Manual+cert+requirements SoR                 |
| BrowserStack TM     | Device cloud                              | Not in scope — integrate results later       |
| AI copilots in IDEs | Generic code assist                       | Quality SoR + audit + cert firewall          |

## Definition guidance from gaps

MVP Definition must cover **Commodity + selected Competitive + flagship Differentiator slices** (evidence, certification, readiness, platform governance). Defer Future Innovation to sequenced programmes — document intent, do not over-scope MVP.
