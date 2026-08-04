# SECURITY-ARCHITECTURE — APZQEP-165-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-000   |
| Timestamp | 20260804T054651Z |

## Zero Trust

Every orchestration request verifies identity, permission, integrity, intent, and context. Never trust UI state alone.

## Permission model (intents)

| Intent                  | Controls                                    |
| ----------------------- | ------------------------------------------- |
| Trigger / start flow    | Who may start which flows in which projects |
| Approve / reject        | Approval scope (project/env/release class)  |
| Waive gates             | Explicit waiver permission + audit          |
| Release decide          | GO/NO-GO authority                          |
| Manage policies / flows | Admin of orchestration definitions          |
| Register capabilities   | Platform/operator privilege                 |
| Emergency override      | Elevated + dual-control policy              |

Superadmin is a **special audited tier**, not a silent bypass of gates or approvals.

## Isolation

- Tenant / org isolation on all orchestration entities
- Project / workspace scoping on flows and approvals
- Capability invocation carries caller identity + delegated service identity where workers act
- Secrets never appear in flow definitions as plaintext; use secret refs (013)

## Audit integrity

Immutable audit for:

- Trigger acceptance / ignore
- Policy version used
- Capability invocations
- Gate results
- Approvals / rejections / delegations
- Waivers
- Release decisions
- Emergency overrides

Audit records are append-only; corrections are compensating records.

## Identity propagation

Correlation ID + actor identity + service identity propagate through capability calls. Workers use dedicated identities (013).

## Policy enforcement

Authz at Gateway/Platform Service **before** orchestration mutations. Capability platforms re-check their own permissions on invoke.
