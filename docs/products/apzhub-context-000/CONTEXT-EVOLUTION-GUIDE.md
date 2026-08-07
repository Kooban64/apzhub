# Context Evolution Guide

| Field     | Value                               |
| --------- | ----------------------------------- |
| Programme | APZHUB-CONTEXT-000                  |
| Status    | **COMPLETE** (await Owner Approval) |
| Timestamp | 20260806T131000Z                    |

## Purpose

Explain how new providers (and new focus types / consumers) join Enterprise Context **without changing the architecture**.

## Permanent spine

```text
Composition Contract  →  Provider Contract  →  Consumer Contract
         ↑                        ↑
   unchanged core          additive rows / versions
```

Do not open a new “Context architecture” programme for each provider.

## Adding a provider

1. Confirm the product is an approved RI / authorised capability with a clear SoR.
2. Add a provider section to [CONTEXT-PROVIDER-CONTRACT.md](./CONTEXT-PROVIDER-CONTRACT.md) (what it may contribute / must never expose).
3. Satisfy Quality Principles (attribution, failure behaviour).
4. Owner Auth for engineering to implement the contribution.
5. Consumers gain fragments without being rewritten for that provider’s engine.

## Adding a focus type

Example: Support ticket as focus (after Project v1).

1. Define focus type under Composition Contract expectations (work-centred key).
2. List which providers contribute for that focus.
3. Authorise implementation — same composition rules.

## Adding a consumer / presentation

Panel, API, mobile, notification, future AI:

1. Consumer Contract still applies.
2. Presentation must not redefine ownership or duplicate SoRs.
3. AI (when Auth’d) consumes **composed context**; it does not become Context.

## What must not happen during evolution

| Anti-pattern                                   | Refuse                                         |
| ---------------------------------------------- | ---------------------------------------------- |
| Copy SoR data into a Context database as truth | Violates constitutional principles             |
| Provider-specific consumer hardcoding          | Breaks consumer independence                   |
| New framework replacing this contract          | Contract evolves by amendment, not replacement |
| Engine-visible context                         | Technology independence                        |

## Amendment rule

Material changes to Composition / Provider / Consumer contracts require Owner Approval.  
Additive provider rows are the normal path.
