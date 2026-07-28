# Metabase Integration — Capability Assessment

> **Programme:** APZHUB-INTEGRATION-METABASE-001  
> **Package:** `@apzhub/integration-metabase` **0.1.0**

## SDK capabilities (declared)

| Capability       | Status                                                      |
| ---------------- | ----------------------------------------------------------- |
| `authentication` | Implemented                                                 |
| `health`         | Implemented                                                 |
| `diagnostics`    | Implemented                                                 |
| `analytics`      | Declared (provider registration; no Analytics Services yet) |

## Extended / core service capabilities

| Service ID            | Support   | Implemented     |
| --------------------- | --------- | --------------- |
| `health`              | supported | Yes             |
| `version`             | supported | Yes             |
| `compatibility`       | supported | Yes             |
| `readiness`           | supported | Yes             |
| `featureDetection`    | supported | Yes             |
| `capabilityDetection` | supported | Yes             |
| `collectionsMetadata` | supported | Yes (read-only) |
| `dashboardEmbed`      | planned   | No              |

## Provider registration

- Manifest: `integrations/metabase/integration.yaml`
- Factory: `createMetabaseAdapter` registers via Integration SDK capability registry
- Adapter: `listCapabilityRegistration()` exposes capability + service IDs
