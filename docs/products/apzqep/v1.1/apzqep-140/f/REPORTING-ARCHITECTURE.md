# Reporting Architecture

```
Client → Gateway → Reporting Service → Metrics/Trend Engines
                              ↓
                    QualityFactsPort (Cap A–E / QKI read)
                              ↓
                    Dashboards / Reports (derived)
                              ↓
                    Saved report metadata (platform only)
```

Product rule: **Reporting is a projection, never a source of truth.**
