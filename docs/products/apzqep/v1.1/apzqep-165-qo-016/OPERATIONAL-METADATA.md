# Operational Metadata

Descriptive references only:

- Version / programme / slice / legacy slice
- Build / deployment / runtime / environment refs
- Feature flag refs
- Configuration refs (never mutated here)
- Operational capability refs

Also documents logical operational endpoint path hints (GET-only), e.g.:

- `/api/operational/health`
- `/api/operational/readiness`
- `/api/operational/liveness`
- `/api/operational/diagnostics`
- `/api/operational/version`
- `/api/operational/metadata`
- `/api/operational/readiness-package`

Path hints are not live HTTP route registration in this slice.
