# SECURITY-ARCHITECTURE — APZQEP-163-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-163-000   |
| Timestamp | 20260803T175516Z |

## Zero Trust alignment

Quality Intelligence inherits APZHUB Zero Trust: verify identity, permission, integrity, intent and context on every request. Never trust provider outputs by default — validate schema, policy and tenant scope.

## Controls

| Control                       | Design                                       |
| ----------------------------- | -------------------------------------------- |
| Tenant isolation              | Mandatory on all QI entities and queries     |
| Project isolation             | First-class where project context exists     |
| Provider credential isolation | Secret refs only; never in events/logs/QKI   |
| Prompt protection             | See Prompt Governance                        |
| Sensitive data handling       | Classification + redaction policies          |
| Inference audit               | ProviderRun immutable trail                  |
| Provider trust model          | Capability + residency + health + allow-list |
| Model security                | Version pin; disable; circuit-break on abuse |
| Rate limiting                 | Gateway + provider adapters                  |
| Data egress control           | Policy whether context may leave the estate  |

## Threats addressed (architecture level)

| Threat                         | Mitigation                                 |
| ------------------------------ | ------------------------------------------ |
| Prompt injection               | Data/instruction separation; output schema |
| Cross-tenant leakage           | Context assembly tenant gates              |
| Credential exfiltration via AI | Secret exclusion lists                     |
| Opaque Board decisions         | Mandatory explainability                   |
| Vendor lock-in                 | Provider contract; multi-provider          |
| Silent model drift             | Version stamps + evaluation audits         |

## Waves 1–2 interaction

SCM webhook secrets, automation credentials and evidence blobs are **never** passed wholesale to AI providers. Only approved signal summaries and references enter context.
