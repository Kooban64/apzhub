# Deployment Guide — Test Execution 1.0.1-rc.1 (Patch)

## Preconditions

1. Owner accepts FREEZE-002.
2. Owner authorises RELEASE-002 (or equivalent Patch Production Release).
3. Candidate tree committed; remote divergence resolved without conflict guessing.
4. Availability remains **Limited** until separate GA decision.

## Sequence

1. Confirm package identity `@apzhub/qep-test-execution` matches released version after promotion.
2. Deploy web/gateway revision that includes bootstrap `createBaselineEvidenceAccessCheck()` wiring.
3. Smoke: authenticated associate evidence with valid URI; confirm forbidden path for denied policy if ACL override configured.
4. Confirm rollback plan to **1.0.0** is available.
5. Do **not** announce unrestricted GA.

## Migration

None required for L-02.
