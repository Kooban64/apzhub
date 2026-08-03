# APZHUB Evidence Lifecycle

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZHUB-ENG-003   |
| Timestamp | 20260803T075550Z |

## Principle

Evidence-first governance: decisions cite timestamped artefacts. Claims without evidence are not Board-ready.

## Evidence classes

| Class         | Examples                               |
| ------------- | -------------------------------------- |
| Engineering   | Tests, migrations, health facets       |
| Certification | ES-002 packs, Board certs              |
| Audit         | Regression logs, security verification |
| Board         | Review, resolution, authority          |
| Operations    | Dashboard snapshots, incident records  |
| Completion    | Programme close evidence               |

## Mandatory practices

1. Timestamp UTC (`YYYYMMDDTHHMMSSZ`).
2. Store under `evidence/{programme-id}/{timestamp}/` (or product-equivalent).
3. Link evidence from completion / Board / audit docs.
4. Never alter historical evidence packs — supersede with new timestamps.
5. Docs-only / evidence-only commits when programmes prohibit engineering.

## Retention

Evidence supporting GA and certification remains durable portfolio record.
