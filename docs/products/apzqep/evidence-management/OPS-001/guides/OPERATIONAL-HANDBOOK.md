# Operational Handbook — Evidence Management

## Surfaces

| Surface   | Path                      |
| --------- | ------------------------- |
| REST      | `/api/v1/qep/evidence`    |
| Workbench | `/workspace/qep/evidence` |

## Execution path

```text
Workbench / REST → Security & Policy → Application → Domain
  → Repository Contracts → Storage Port → Adapters → Infrastructure
```

## Data durability

**Ephemeral.** In-memory UnitOfWork + StoragePort. Process restart clears Evidence data.

## Security model

L-02 fail-closed. Only `outcome === "allowed"` grants. Security audit signals recorded best-effort to audit port.

## Health

Use platform `GET /api/health` for host health. Evidence-specific readiness is not yet exposed.

## Related programmes

- Engineering: ENG-110A–F (closed)
- Ops: OPS-001 (this programme)
- Storage: future Owner-authorised programme
- Certification: not started
