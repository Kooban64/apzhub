# Approval Bundle

The immutable Approval Bundle is the authoritative approval record.

| Field                         | Description                                     |
| ----------------------------- | ----------------------------------------------- |
| Bundle ID                     | Stable identifier                               |
| Quality Flow Reference        | Opaque flow ref (never re-evaluated)            |
| Governance Decision Reference | Opaque QO-007 decision ref (never re-evaluated) |
| Required Authorities          | Snapshot from template at creation              |
| Authority Decisions           | Append-only decision records                    |
| Conditions / Exceptions       | Aggregated from decisions                       |
| Final Approval Status         | Derived from decisions + SoD rules              |
| Audit History                 | Append-only event trail                         |

## Opacity principle

QO-008 does **not** know what is being approved. It only knows the bundle, required authorities, submitted decisions, and resulting approval state.

## Request shape

An approval request is the creation payload for a bundle: template ID, governance decision ref, quality flow ref, and security contexts. After creation, only decision recording mutates the bundle (append-only).
