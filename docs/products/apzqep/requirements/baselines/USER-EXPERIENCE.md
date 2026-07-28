# User Experience

The Workbench exposes Baselines under Requirements (`/workspace/qep/requirements/baselines`):
a filterable, paginated list (number, name, status badge, item count, integrity
status, dates); a create form explaining that draft→lock is irreversible; a
detail view with metadata, integrity status, a contents table linking to each
member's content-version detail, draft-only edit/add-item/remove-item, a
high-friction lock confirmation, an archive confirmation, and a verify-integrity
action; an add-version flow that requires finding the requirement and selecting
an exact version (no "latest" auto-selection); and a compare view showing
added/removed/unchanged membership with a version-changed callout for
re-versioned requirements. The Requirement detail page shows a "Baseline
History" panel of every baseline containing that requirement. All destructive or
irreversible actions render as a confirmation panel styled like the existing
`LifecycleTransitionDialog`, and all interactive surfaces expose `data-testid`
hooks for testing. Action visibility follows the DTO's `availableActions`, which
mirrors — but does not replace — server-side authorization.
