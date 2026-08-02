# Known Limitations

1. Cap F reporting facts remain derived; only saved-report metadata and optional trend samples are durable SoR for Cap F.
2. Some Cap list filters (tags/query) apply in-process after SQL fetch.
3. Pre-151 in-memory process data was never durable — no automatic import.
4. RB-002 remains OPEN.
5. Package versions remain 0.1.0 — no promotion under APZQEP-151.
6. Cap aggregate JSONB payloads carry full domain documents alongside indexed columns.
