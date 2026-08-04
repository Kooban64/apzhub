# APZQEP-165-QO-003 — Trigger Engine

| Field             | Value                                                  |
| ----------------- | ------------------------------------------------------ |
| Programme         | **APZQEP-165**                                         |
| Engineering Slice | **QO-003**                                             |
| Legacy Slice      | S03                                                    |
| Title             | Trigger Engine                                         |
| Status            | **COMPLETE**                                           |
| Package           | `@apzhub/platform-orchestration` **0.1.2**             |
| Architecture      | **FROZEN**                                             |
| Timestamp         | 20260804T070126Z                                       |
| Evidence          | `evidence/apzqep-165-qo-003/20260804T070126Z/`         |
| Next              | **QO-004** — Quality Flow Engine (separate Owner Auth) |

## Mandatory principles delivered

1. Provider-neutral trigger model
2. Normalized trigger contract only
3. No provider-specific logic in Trigger Engine
4. Trigger Engine routes — it does not execute
5. Selects Quality Flow / next stage metadata — does not own flow execution
6. Distinct Trigger ID, Correlation ID, Causation ID, Quality Flow ID

## Documents

| Doc                | Path                                               |
| ------------------ | -------------------------------------------------- |
| Normalized Trigger | [NORMALIZED-TRIGGER.md](./NORMALIZED-TRIGGER.md)   |
| Routing            | [ROUTING.md](./ROUTING.md)                         |
| Identities         | [IDENTITIES.md](./IDENTITIES.md)                   |
| Boundaries         | [BOUNDARIES.md](./BOUNDARIES.md)                   |
| Certification      | [CERTIFICATION.md](./CERTIFICATION.md)             |
| Completion         | [COMPLETION.md](./COMPLETION.md)                   |
| Owner Auth         | [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md) |
