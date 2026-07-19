# Kimai Integration — Operations & Certification

> **Programme:** APZHUB-INTEGRATION-KIMAI-002  
> **Package:** `@apzhub/integration-kimai` **0.2.0**  
> **Previous:** KIMAI-001 foundation **0.1.0**

---

## Operational health levels

| Level       | Meaning                                             |
| ----------- | --------------------------------------------------- |
| HEALTHY     | Auth valid, API reachable, compatibility acceptable |
| DEGRADED    | Partial issues (e.g. not tested, warnings)          |
| LIMITED     | Compatibility constrained                           |
| UNAVAILABLE | Auth/API/circuit breaker failure                    |

## Compatibility matrix

- Declared CE range: Kimai **2.13.0** – **2.x** (Bearer token era)
- Uses Integration SDK `checkVersionCompatibility`
- Edition fixed to **community**

## Feature detection

Foundation probes:

- `GET /api/ping`
- `GET /api/version`

Domain CE probes (when configured):

- timesheets, activities, customers, projects, tags (see FEATURE-DETECTION certification)

Tags search/filter CE variance is **PARTIAL**.

## Readiness classification

Required checks: configuration, authentication, connectivity, capability registration, provider compatibility, circuit breaker, required capabilities, domain capability registration.

Optional: metrics, logging.

## Capability certification

**CERTIFIED_DOMAIN** (Awaiting Owner Acceptance):

- authentication, version, health, diagnostics, compatibility, readiness, feature_detection, capability_certification
- timesheets / time entries, activities, customers, projects (time reference), tags (partial)

## Explicitly not certified

Approvals, reporting UI, analytics, Workbench, APZ Time product UI, notifications.
