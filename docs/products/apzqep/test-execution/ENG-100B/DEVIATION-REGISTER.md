# Deviation Register — APZQEP-ENG-100B

## Deviations

None that change Architecture or Engineering Specification meaning.

## Interpretation notes (non-deviations)

Recorded for Owner awareness; aligned with OES PART-02:

1. OutcomeDeriver precedence: failed > blocked > inconclusive > cancelled; all-pass-like → passed; all not_executed → inconclusive.
2. Supersession eligible from `accepted` \| `rejected`.
3. `ingestExternalResult` may seal/apply/complete within one Domain command for imported mode; idempotent replay returns unchanged aggregate.
4. ManifestSealer uses FNV-1a over canonical JSON (pure; no I/O).
