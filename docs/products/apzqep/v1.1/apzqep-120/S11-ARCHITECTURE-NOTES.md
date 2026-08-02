# APZQEP-120-S11 — Architecture Notes

## Read vs write

- **Write model:** Evidence (and future domains) — authoritative
- **Read model:** Quality Knowledge Index — eventually consistent projection
- **Consumers:** Search (S11), later UCP / QI / AI / dashboards

## Fan-out

`platform-processing` **0.1.1** adds `resolveAll` so Evidence (S10) and QKI (S11) processors share the same events without hard-coding in the engine.

## Future-ready entity kinds

`suite` · `run` · `execution` · `defect` · `requirement` · `document` · `audit` · `event` · `quality_intelligence` · `ai_context` — reserved in the model; Evidence is the only implemented builder in S11.
