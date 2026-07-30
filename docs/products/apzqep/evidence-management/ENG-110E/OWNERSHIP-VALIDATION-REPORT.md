# Ownership Validation Report — APZQEP-ENG-110E

Before domain invocation, resource operations require:

1. Matching tenant
2. Caller is owner/creator **or** non-revoked `effect: allow` grant for the operation
3. Or `qep.evidence.admin`

EvidenceReference structural/scheme validation runs before further evaluation.
