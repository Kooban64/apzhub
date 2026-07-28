# Accessibility Evidence — ENG-020F Part 3

| Requirement | Implementation evidence |
| --- | --- |
| Keyboard navigation | Buttons/links/forms are native focusable; picker lists use buttons |
| Visible focus | Shared `@apzhub/ui` Button/Input focus styles |
| Landmarks | `aside`/`main` labels on detail grid; page headings via `QepPageShell` |
| Labels | Form controls use `<label>`; filters labelled |
| Validation | `aria-live="polite"` on error regions |
| Colour independence | Lifecycle via `QepStatusBadge` + text; rationale “provided/none” text |
| Tables | `QepTable` with caption |
| Dialogs | Confirm flows use explicit buttons with testids |
| Automated tests | Component tests assert action presence/absence; Playwright route smoke |
| Manual keyboard | Recorded in engineering evidence checklist (Owner verification recommended) |
