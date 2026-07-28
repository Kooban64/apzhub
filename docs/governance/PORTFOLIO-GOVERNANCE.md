# APZOR Portfolio Governance

> **Programme:** APZHUB-GOVERNANCE-001  
> **Date:** 2026-07-20  
> **Registers:** [PORTFOLIO-RELEASE-REGISTER](../releases/PORTFOLIO-RELEASE-REGISTER.md) · Platform **1.1.0**

---

## Portfolio statement

APZHUB portfolio = Platform baseline + commercial products + shared capabilities + integration adapters — one Production story under **PRWL**.

## Portfolio governance duties

| Duty                                        | Owner                            |
| ------------------------------------------- | -------------------------------- |
| Keep PORTFOLIO-RELEASE-REGISTER current     | Release Manager + Platform Owner |
| Align product SemVer with platform baseline | Product Owners + Owner           |
| Cross-product event/automation honesty      | Platform Owner                   |
| Prevent dual SoR / engine brand leakage     | ARB + Product Owners             |

## Programme management

- Every material change is a **named programme** with Owner Approval.
- Programme states follow AI-WORKFLOW / PROGRAMME-LIFECYCLE.
- Closed programmes are not silently reopened.

## Portfolio vs platform SemVer

| SemVer             | Meaning                                                  |
| ------------------ | -------------------------------------------------------- |
| Platform **1.1.0** | Current Production Baseline                              |
| Product versions   | Independent; unchanged unless product programme Accepted |

## Vendor / supplier management (portfolio)

| Vendor class                          | Governance                                                |
| ------------------------------------- | --------------------------------------------------------- |
| OSS engines (Plane, Kimai, Zammad, …) | Adapter-owned; CE/self-hosted first; no EE mandatory deps |
| Hosting / cloud                       | Owner + Ops; coexistence rules                            |
| Future SaaS                           | Owner Approval; never bypass Integration SDK              |
