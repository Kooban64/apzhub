# APZ QEP — Product Constitution

> **Programme:** APZQEP-CONSTITUTION-001  
> **Authority:** Highest for APZ QEP after Product Vision  
> **Stability:** Expected to remain stable for many years  
> **Status:** READY FOR CONSTITUTION ACCEPTANCE  
> **Vision:** [../PRODUCT-VISION.md](../PRODUCT-VISION.md)  
> **Discovery principles (elevated):** [../discovery/PRODUCT-PRINCIPLES.md](../discovery/PRODUCT-PRINCIPLES.md)

## Preamble

APZ QEP (APZ Quality Engineering Platform) is an AI-native Enterprise Quality Engineering Platform. This Constitution defines immutable principles that govern all future Product Definition, Architecture, Engineering, Artificial Intelligence, Integrations, and Operations.

## Article I — Identity

1. The official product name is **APZ QEP**.
2. The product category is **Enterprise Quality Engineering Platform**.
3. Testing is one capability — not the product identity.
4. Backend engine brands shall never define the product identity in user-facing surfaces.

## Article II — Constitutional principles

The following principles are permanent:

| #   | Principle                                  | Meaning                                                              |
| --- | ------------------------------------------ | -------------------------------------------------------------------- |
| 1   | **Quality before Testing**                 | Quality outcomes precede and outrank test-tooling convenience        |
| 2   | **Verification before Execution**          | Define what “good” means before running activity                     |
| 3   | **Evidence before Opinion**                | Claims require SoR artefacts and references                          |
| 4   | **Certification before Release**           | Human-approved certification precedes release confidence             |
| 5   | **Knowledge before Automation**            | Codify reusable knowledge before scaling automation blindly          |
| 6   | **Governance before Convenience**          | Controls precede shortcuts that weaken audit or SoR                  |
| 7   | **Security by Design**                     | Security is inherent, not bolted on                                  |
| 8   | **Platform-first Architecture**            | Module → Platform Service → Connector → Engine only                  |
| 9   | **API-first Architecture**                 | Capabilities are exposed through governed, versioned APIs            |
| 10  | **AI assists Humans**                      | AI drafts, analyses, recommends                                      |
| 11  | **Humans remain Accountable**              | Humans own decisions that affect SoR and certification               |
| 12  | **Everything is Traceable**                | Requirements ↔ verification ↔ defects ↔ evidence ↔ releases          |
| 13  | **Everything is Auditable**                | Privileged and certification actions leave immutable history         |
| 14  | **Everything is Explainable**              | Material decisions and AI recommendations carry rationale            |
| 15  | **Everything is Measurable**               | Coverage, risk, readiness, and quality trends are first-class        |
| 16  | **Enterprise-first Design**                | IAM, tenancy, retention, audit, and self-hosted posture are defaults |
| 17  | **Backward Compatibility where practical** | Prefer non-breaking evolution of APIs and SoR contracts              |
| 18  | **Standards over Shortcuts**               | Prefer platform standards, manifests, and open protocols             |

## Article III — Hierarchy of authority

```text
1. Product Vision (identity & purpose)
2. Product Constitution (this document + companion articles)
3. Accepted Requirements Baseline
4. Accepted Discovery (strategy guidance)
5. Product Definition
6. Architecture / ADRs
7. Engineering implementation
```

Lower levels shall not contradict higher levels without Owner amendment of the higher level.

## Article IV — System of Record

APZ QEP is the authoritative System of Record for domains listed in [SYSTEM-OF-RECORD.md](./SYSTEM-OF-RECORD.md). No external system or AI may become authoritative for those domains.

## Article V — AI

AI is governed by [AI-CONSTITUTION.md](./AI-CONSTITUTION.md). AI never becomes SoR and never certifies independently.

## Article VI — Certification

Certification is governed by [CERTIFICATION-CONSTITUTION.md](./CERTIFICATION-CONSTITUTION.md). Human accountability is mandatory.

## Article VII — Integration & security

Integrations obey API-first / MCP-preferred / Platform Services authoritative rules. Security obeys Zero Trust and related permanent rules in [SECURITY-CONSTITUTION.md](./SECURITY-CONSTITUTION.md).

## Article VIII — Guardrails

Engineering and product scope limits are permanent in [ENGINEERING-GUARDRAILS.md](./ENGINEERING-GUARDRAILS.md) and [PRODUCT-GUARDRAILS.md](./PRODUCT-GUARDRAILS.md).

## Article IX — Long-term commitments

Commitments in [LONG-TERM-COMMITMENTS.md](./LONG-TERM-COMMITMENTS.md) bind product strategy across years.

## Article X — Amendment

1. The Constitution may be amended only by explicit Owner Decision.
2. Temporary exceptions require named Owner Approval, scope, expiry, and audit.
3. Silence is not amendment. Convenience is not amendment.

## Article XI — Conflict

Where implementation conflicts with the Constitution, **the Constitution shall prevail**. Non-compliant work is an architectural/product defect until remediated or the Constitution is lawfully amended.
