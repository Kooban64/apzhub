# Release Notes — Evidence Management 1.0.0-rc.2

## Why rc.2

Supersedes **1.0.0-rc.1** (FREEZE-003 @ `ce220a5d`) after APZQEP-REM-002 Workbench route-sync remediation.

## Included since rc.1

- Shell fix: nested Evidence deep links (including provenance) no longer rewind to Home.
- Playwright deep-link stability coverage (direct / refresh / back-forward).

## Unchanged

- CERT-003 class **PRODUCTION_READY_WITH_LIMITATIONS** · **LIMITED_AVAILABILITY**
- Accepted limitations (ADR-0088 memory-only, observability deferred, events deferred, L-EM-01)
- TE **1.0.1** compatibility

## Not included

Durable storage · GA · event bus · Evidence-specific metrics
