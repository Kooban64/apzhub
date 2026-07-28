# Version Recommendation — APZQEP-CERT-070A

| Field | Value |
| ----- | ----- |
| Package | `@apzhub/qep-test-plans` |
| Current | **0.2.0** |
| Recommended | **Remain 0.2.0** (label **WORKBENCH COMPONENT CERTIFIED** upon Owner Decision) |
| 1.0.0 | **Not recommended** |

## Rationale

1. **0.2.0** already denotes Domain + Infrastructure layers in the package; the Workbench is an additive presentation slice (`src/presentation/` + `apps/web` client/views) that introduces no new Domain/Infrastructure package surface.
2. SemVer **1.0.0** remains reserved for the first stable **capability** baseline — Test Plans Capability Certification, which requires Domain + Infrastructure + Workbench assessed together (pattern established by CERT-050D / CERT-040D).
3. Domain Component Certification retained **0.1.0**; Infrastructure Component Certification retained **0.2.0**; Workbench Component Certification should equally not imply capability completeness by promoting the version number.
4. Recorded limitations (L-01, L-02, P-01…P-04) further counsel against major promotion at this gate.

## Owner effect upon Acceptance of this recommendation

- Package remains **0.2.0**.
- May be labelled **Workbench Component CERTIFIED** in governance records.
- Capability Certification, Capability Freeze, and 1.0.0 remain unauthorised and require a further, separate Owner-authorised programme.
