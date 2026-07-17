# Configuration Workbench Commands Guide

## Supported (typed-client backed)

- Refresh
- View Details (row selection)
- Validate / Approve / Publish / Deprecate / Archive / Restore / Transition
- Publish Version (where version selected)
- Copy ID
- Open API Metadata
- Validate metadata (Validation view)

## Not supported (must not appear)

- Resolve / Effective Value / Apply / Inject / Reload / Hot Reload
- Roll Out / Execute Rollback
- Evaluate Flag / Reveal Secret
- Export Environment / Generate ConfigMap

Server denial remains authoritative even when UI soft-gates manage commands via `canManage`.
