# AI-GOVERNANCE — APZQEP-163-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-163-000   |
| Timestamp | 20260803T175516Z |

## Position

AI is a **provider class** inside Quality Intelligence. AI governance is therefore a specialisation of Provider Governance + Recommendation Governance — not a separate product centre.

## Governance pillars

| Pillar                   | Rule                                                    |
| ------------------------ | ------------------------------------------------------- |
| Advisory default         | AI outcomes are advisory unless policy elevates         |
| Human certification      | GO/NO-GO / Board certification remain human             |
| Provider neutrality      | No single AI vendor owns platform behaviour             |
| Explainability mandatory | No AI recommendation without Explanation                |
| Auditability             | ProviderRun + prompts refs + outcomes immutable         |
| Least privilege          | Providers receive minimised context                     |
| Opt-in live inference    | Production AI calls deny-by-default (ops flags)         |
| Self-hosted preference   | Local/OSS models first-class for enterprise deployments |

## Human approval boundaries

| Action                       | AI may propose? | Human required? |
| ---------------------------- | --------------- | --------------- |
| Suggest regression subset    | Yes             | Accept to run   |
| Suggest defect cluster label | Yes             | Optional accept |
| Release readiness advice     | Yes             | Board/authority |
| Auto-merge / auto-release    | **No**          | N/A forbidden   |
| Change enterprise governance | **No**          | Owner/Board     |
| Modify Wave 1/2 architecture | **No**          | Separate Auth   |

## Provider governance

- Register providers with capability, residency, PII claims.
- Health and version tracking mandatory.
- Disable provider without engine redesign.
- Cost/rate metadata for ops dashboards (Wave 4 consumers).

## Product Board interaction

Board receives Release Readiness / Certification Readiness artefacts with provider attribution and explanations — never opaque model answers.
