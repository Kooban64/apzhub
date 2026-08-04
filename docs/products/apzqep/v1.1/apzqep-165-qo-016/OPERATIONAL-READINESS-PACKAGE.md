# Operational Readiness Package

Immutable system of record for **operational readiness** only.

## Contents (references + descriptive contracts)

- Health / Readiness / Liveness / Startup / Shutdown / Degraded / Maintenance contracts
- Diagnostics snapshot
- Operational configuration references
- Operational endpoints (path hints)
- Version metadata
- Deployment metadata references
- Optional refs: Executive Experience, Evidence Integration, Decision Package
- Audit references

## Guards

| Flag                   | Value   |
| ---------------------- | ------- |
| `descriptive`          | `true`  |
| `prescriptive`         | `false` |
| `performsDeployments`  | `false` |
| `mutatesConfiguration` | `false` |
