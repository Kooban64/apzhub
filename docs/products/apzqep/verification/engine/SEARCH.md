# Search Projection

| Field | Value |
| ----- | ----- |
| Entity type | `verification_record` |
| Adapter | `verificationToSearchDraft` / `onVerificationUpserted` in `@apzhub/search-qep` |
| Wiring | `apps/web/lib/search/wiring/qep-publication.ts` |

Indexed fields (metadata only): Verification status, outcome, subject kind/artefact id, owner (createdBy), rationale summary keywords.

Search is a **projection**. Authoritative detail is always reloaded from Verification SoR after selection. Subject artefact **content** is never indexed standalone.

Retired / superseded / cancelled Verifications are removed from the index (lifecycleState → archived / remove on upsert).

Navigation target in draft: `/workspace/qep/verification/verifications/{id}` (route reserved; Workbench UI **NOT AUTHORISED** under ENG-040B).
