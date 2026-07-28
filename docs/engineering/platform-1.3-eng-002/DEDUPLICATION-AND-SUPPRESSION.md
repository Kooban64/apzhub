# Deduplication and Suppression

**Fingerprint:** `tenantId + definitionId + stable labels` → `afp_{hash}_{definitionId}`.

While active (firing/pending/silenced): update `occurrenceCount` + `lastFiredAt`; preserve `firstFiredAt` and acknowledgement.

**Suppression:** state `silenced` + lifecycle suppressed* fields; auditable; not healthy. Rule `suppression.silenced` forces silence on match.
