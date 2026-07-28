# Search — APZQEP-ENG-050B

## Integration

Application service exposes `onSpecificationUpserted` after successful persist.

Gateway bootstrap wires `createQepSearchLifecycleOptions().onSpecificationUpserted`.

## Indexed fields (projection shape)

Identifier · Title · Owner · Status · Classification · Priority · Tags · Dates  
(Requirement / Verification references available from relationship DTOs for future adapter expansion.)

## Rules

Search projection contains **no** business logic. Adapter stub is present pending full `search-qep` specification document type registration.
