# APZCONFIG-005 — Workbench Certification

**Date:** 2026-07-16  
**Route:** `/workspace/configuration`

## Certified properties

- Manifest-driven Activity Bar + sidebar (`platform-configuration*`)
- `ConfigurationWorkspaceRouter` mounted from catch-all workspace shell
- Views consume `configuration-api` facades + React Query only
- Permission fields on manifests (`configuration.read` / `.manage` / `.version` / `.validation` / `.audit`)
- Capability banners for runtime resolution, feature flags, secrets, hot reload
- Safe value redaction notice; override metadata-only notice; immutable version notice
- Accessibility: labelled toolbar, table captions, keyboard row selection, status/alert roles

## Deferred / omitted (non-defects)

- Version comparison (insufficient safe API payload)
- Metadata export (secret-safety cannot be guaranteed)

## Verdict

**PASS** — `pnpm audit:configuration-workbench`
