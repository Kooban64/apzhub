# APZHUB Metrics Workbench Authorization-aware UI Guide

**Milestone:** APZMETRICS-004

1. Manifests declare `metrics.read` (and facet-specific permissions where applicable).
2. Shell PermissionService filters Activity Bar / sidebar before render.
3. Mutations still require server-side Production Authorization (`metricsPlatformOps`).
4. Presentation checks never replace server authorization.
