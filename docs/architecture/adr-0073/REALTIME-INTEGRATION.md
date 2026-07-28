# Realtime Integration

- ADR-0072 retained · **SSE only** · REST authoritative for mutations
- Runtime durable writes may emit attention events consumed by existing SSE mappers
- SSE is **not** inside the claim/dispatch DB transaction
- Permission + tenant/org filtering retained
- No WebSockets · no new transport
