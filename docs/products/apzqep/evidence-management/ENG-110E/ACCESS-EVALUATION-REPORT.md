# Access Evaluation Report — APZQEP-ENG-110E

Every command/query operation is mapped to permissions and gated before orchestration.

Flow: authenticate context → PermissionPort → tenant isolation → ownership **or** allow-grant → allow; else deny.

`availableActions` intersects lifecycle eligibility with affirmative policy allow.
`checkEvidenceAccess` returns completed fail-closed decisions for principals.
