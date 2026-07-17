# APZNOTIFY-005 — Workbench Certification

## Registration

- Parent manifest `platform-notifications` + children (overview, inbox→Notifications, templates, preferences, categories, channels, recipients, references, audit, diagnostics)
- Activity Bar / Sidebar via Workbench Framework discovery
- Mount: `NotificationsWorkspaceRouter` in `workbench-page.tsx` when `isNotificationsRoute`

## Views certified (as delivered in APZNOTIFY-004)

Overview · Notifications · Templates · Preferences · Categories · Channels · Recipients · References · Audit · Diagnostics

## Commands present

Refresh · View Details · Mark Read · Acknowledge · Dismiss · Archive · Restore · Transition · Copy ID · Open API Metadata

## Commands absent (required)

Send · Resend · Retry · Schedule · Deliver · Provider configure

## Boundaries

UI consumes typed client only; no gateway/platform-services/core/persistence; no browser persistence; banner always **DELIVERY PROVIDERS NOT AVAILABLE**.

## Playwright

Mocked journey spec: `testing/playwright/e2e/apznotify-004-platform-notifications-workbench.spec.ts`. Live `webServer` **LIMITED** by pre-existing Testing slug conflict — not a Notification defect.
