# Configuration Workbench Views Guide

All views consume typed-client data only.

## Overview

Status cards for lifecycle distribution, namespaces, groups, and management-plane readiness. Prominent unavailable banners for runtime resolution, feature flags, secrets, and hot reload.

## Configurations

Paginated list with lifecycle filter, detail panel, safe value-hidden notice, audit summary, and lifecycle commands when `canManage` is true.

## Namespaces / Groups

Metadata list + detail. Namespaces are not OS or Kubernetes namespaces.

## Versions

Version list for the selected configuration. Immutable published versions show `IMMUTABLE PUBLISHED VERSION`. Version comparison deferred.

## Overrides

Override metadata with `OVERRIDE METADATA ONLY — EFFECTIVE VALUE IS NOT RESOLVED`. No browser-side effective-value calculation.

## Scopes / Hierarchy

Scope list plus read-only hierarchy levels (global → user). Governance visualisation only.

## Validation

Rules catalogue + metadata validation request. No custom validator execution.

## References / Audit / Diagnostics

Reference metadata, read-only audit timeline, and diagnostics with unavailable capability states presented as expected limitations (not defects).
