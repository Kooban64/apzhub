# Search Projection

| Field       | Value                                                                    |
| ----------- | ------------------------------------------------------------------------ |
| Entity type | `trace_link`                                                             |
| Adapter     | `traceLinkToSearchDraft` / `onTraceLinkUpserted` in `@apzhub/search-qep` |
| Wiring      | `apps/web/lib/search/wiring/qep-publication.ts`                          |

Indexed fields (metadata only): Trace ID, type, endpoint kinds/ids, lifecycle, scope, strength, confidence, origin, supersession status.

Search is a **projection**. Authoritative detail is always reloaded from Trace Link SoR after selection. Retired/superseded links are removed from the index on upsert.
