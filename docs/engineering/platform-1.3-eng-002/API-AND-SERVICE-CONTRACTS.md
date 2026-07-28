# API and Service Contracts

Gateway facets:

- `observe.alertStates.acknowledge|resolve|suppress`
- `observe.alertEvaluation.evaluateBatch|getDiagnostics|getHealth`

HTTP (additive):

- `POST /api/v1/observe/alert-states/{id}/acknowledge`
- `POST /api/v1/observe/alert-states/{id}/resolve`
- `POST /api/v1/observe/alert-states/{id}/suppress`
- `POST /api/v1/observe/alert-evaluation`
- `GET /api/v1/observe/alert-evaluation/diagnostics`
- `GET /api/v1/observe/alert-evaluation/health`

OpenAPI: `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml`
