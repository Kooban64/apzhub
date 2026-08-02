# Reporting API

Base: `/api/v1/qep/enterprise-reporting`

| Path                            | Purpose                 |
| ------------------------------- | ----------------------- |
| GET `/dashboards`               | Catalogue               |
| GET `/dashboards/{id}`          | Derived dashboard view  |
| GET `/metrics`                  | Metrics bundle          |
| POST `/trends`                  | Trend series            |
| GET `/templates`                | Report templates        |
| POST `/generate`                | Generate derived report |
| GET/POST `/saved-reports`       | List/create             |
| GET/PATCH `/saved-reports/{id}` | Get/update              |
| POST `/saved-reports/{id}/run`  | Run saved               |
