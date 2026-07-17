# Configuration Workbench Security Guide

- UI is not the security boundary — HTTP + RequestPipeline + Production Authorization are
- Manifest permissions hide Activity Bar / sidebar items
- `canManage` soft-hides lifecycle commands; server still denies unauthorised calls
- Forbidden responses render Access denied and do not leave sensitive detail visible
- Values that may be secret-like display `VALUE HIDDEN — SECRET MANAGEMENT IS OUTSIDE PLATFORM CONFIGURATION`
- No reveal controls, no localStorage of configuration values, no offline cache
