# APZHUB Platform Reporting — Package Guide

**Milestone:** APZREPORT-001

## `@apzhub/reporting-contracts` (0.1.0)

| Export | Purpose |
|--------|---------|
| `CanonicalReportDocument`, blocks, templates | Shared document model |
| `ReportParameters` | Pre-computed binding inputs |
| `PlatformReportingService` | Service contract |
| `REPORT_OUTPUT_FORMATS` | html, markdown, pdf, docx, json, csv |
| `PLATFORM_REPORT_PERMISSIONS` | Platform permission keys |
| `ReportingRequestContext` | Minimal context (no gateway coupling) |

**Dependencies:** none (cycle-free).

## `@apzhub/reporting-core` (0.1.0)

| Export | Purpose |
|--------|---------|
| `createPlatformReportingService` | Engine factory |
| `bindTemplateToDocument` / `validateTemplateBinding` | Template engine |
| `renderOutput` + format helpers | Output providers |
| `sha256Hex` | Checksums |
| Ports: `BuiltinTemplateCatalogue`, template/metadata repos | Product integration |

**Dependencies:** `@apzhub/reporting-contracts` only.

## Product packages

| Package | Role |
|---------|------|
| `@apzhub/testing-contracts` | TCMS `ReportType` + re-exports |
| `@apzhub/testing-services` | TCMS templates + persistence adapters |
| `@apzhub/platform-services/reporting` | Convenience re-export of core factory |

## Import guidance

```ts
// Preferred (all products)
import { createPlatformReportingService } from "@apzhub/reporting-core";
import type { PlatformReportingService } from "@apzhub/reporting-contracts";

// TCMS compatibility only
import { createReportingFrameworkServices } from "@apzhub/testing-services";
```
