# INTEGRATION-ARCHITECTURE — APZQEP-165-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-000   |
| Timestamp | 20260804T054651Z |

## Principle

Orchestration is a **coordinator**. Peer platforms remain authoritative. No redesign of Waves 1–4. Future capabilities integrate by registration.

## Coordinator contracts

| Peer                          | Direction                             | Orchestration uses                                             | Must not                            |
| ----------------------------- | ------------------------------------- | -------------------------------------------------------------- | ----------------------------------- |
| Platform Automation           | Bidirectional events + invoke         | Start/cancel runs; await completion; suite refs                | Own execution internals / providers |
| Platform SCM                  | Consume events + query context        | Normalised triggers; repo/PR/commit context                    | Own webhooks/providers              |
| Platform Quality Intelligence | Invoke + consume                      | Request evaluation; read scores/recs/confidence/explainability | Own scoring algorithms              |
| Evidence Platform             | Query / await                         | Completeness checks; evidence refs on decisions                | Store evidence blobs                |
| Reporting Platform            | Project out                           | Readiness / decision projections for reports                   | Become reporting SoR                |
| Notifications                 | Publish intents via Platform Services | Approval requests, failures, completions                       | Module-direct notify bypass         |
| Command Platform              | Inbound actions via Platform Services | Start / approve / inspect / cancel                             | Bypass authz                        |
| Knowledge Index (QKI)         | Project out                           | Searchable flow/decision projections                           | Authoritative SoR                   |
| Dashboard / Visualization     | Project out                           | Display run state, gates, approvals                            | Own GO / mutate workflow policy     |
| Future capabilities           | Register contracts                    | Same invoke/await pattern                                      | Hard-code into engine               |

## Request path (mandatory)

```text
Client / Trigger
  → API Gateway
  → Auth / Authz / Validation
  → Platform Service (orchestration)
  → @apzhub/platform-orchestration
  → Registered capability contract
  → (capability → connector → engine as already designed)
```

Modules never call connectors. Orchestration never skips capability platforms to call backends.

## Alignment with processing / outbox (S07–S10)

- Reuse existing outbox / async processing for long-running steps
- Orchestration adds **flow/step scheduling and retry policies** by composition
- Do **not** redesign S07–S10 under this programme

## Error translation

Capability failures surface as typed orchestration step failures. Raw backend errors never reach UX (010/026).
