# APZQEP-165-QO-002 — Capability Registry

| Field             | Value                                             |
| ----------------- | ------------------------------------------------- |
| Programme         | **APZQEP-165**                                    |
| Engineering Slice | **QO-002**                                        |
| Legacy Slice      | S02                                               |
| Title             | Capability Registry                               |
| Status            | **COMPLETE**                                      |
| Package           | `@apzhub/platform-orchestration` **0.1.1**        |
| Architecture      | **FROZEN**                                        |
| Timestamp         | 20260804T064555Z                                  |
| Evidence          | `evidence/apzqep-165-qo-002/20260804T064555Z/`    |
| Next              | **QO-003** — Trigger Engine (separate Owner Auth) |

## Architectural rule (mandatory)

The Capability Registry is a **catalogue**, not an engine.

It answers discovery questions only. It never executes capabilities, never resolves runtime services, and never owns orchestration decisions. DI remains in `OrchestrationContainer` (kernel).

## Documents

| Doc           | Path                                               |
| ------------- | -------------------------------------------------- |
| Catalogue     | [CATALOGUE.md](./CATALOGUE.md)                     |
| Metadata      | [METADATA.md](./METADATA.md)                       |
| Boundaries    | [BOUNDARIES.md](./BOUNDARIES.md)                   |
| Certification | [CERTIFICATION.md](./CERTIFICATION.md)             |
| Completion    | [COMPLETION.md](./COMPLETION.md)                   |
| Owner Auth    | [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md) |
