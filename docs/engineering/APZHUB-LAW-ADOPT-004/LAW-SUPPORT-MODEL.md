# LAW-SUPPORT-MODEL

| Field     | Value                |
| --------- | -------------------- |
| Programme | APZHUB-LAW-ADOPT-004 |
| Timestamp | 20260803T135126Z     |

## Purpose

Define how APZ Law Platform is supported under the enterprise operational model — intake, classification, escalation — without building a ticket system in this programme.

## Support ownership

| Tier  | Role                           | Scope                                               |
| ----- | ------------------------------ | --------------------------------------------------- |
| L1    | Support Owner / helpdesk       | Intake, classification, user guidance, known issues |
| L2    | Product Operations Owner       | Incidents, config/ops mitigations, health reviews   |
| L3    | Platform / Security Operations | Shared infra, auth platform, security events        |
| Board | Product Board liaison          | Prioritisation, programme authorisation requests    |

## Intake

Every support item records: ID, Reporter, Timestamp, Summary, Classification, Severity (if incident), Linked KL/ENH/INC, Status.

## Classification (mandatory)

Use handbook classes: Bug · Operational Issue · Documentation Issue · Training Issue · Enhancement · Future Capability · Architecture Observation.

## Escalation model

| Condition                              | Escalate to                                                            |
| -------------------------------------- | ---------------------------------------------------------------------- |
| User cannot proceed; workaround exists | L2 ops note                                                            |
| Suspected production incident S1/S2    | [LAW-INCIDENT-MANAGEMENT.md](./LAW-INCIDENT-MANAGEMENT.md) immediately |
| Recurring pattern                      | Problem management                                                     |
| Product change requested               | Enhancement register — **no code**                                     |
| Security concern                       | Security Operations + incident path                                    |
| Requires engineering                   | Board / Owner Auth for remediation programme                           |

## SLAs (targets — not measured yet)

| Class                   | Response target                        | Status                                    |
| ----------------------- | -------------------------------------- | ----------------------------------------- |
| S1 incident             | Immediate / continuous until mitigated | Defined – Awaiting Production Measurement |
| S2                      | Same business day                      | Defined – Awaiting Production Measurement |
| S3/S4 / general support | Next business day                      | Defined – Awaiting Production Measurement |

## Explicit exclusions

No new support tooling. No CRM/ticketing implementation. No engineering from support tickets.
