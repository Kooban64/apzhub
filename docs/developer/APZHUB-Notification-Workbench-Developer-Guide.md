# Notification Workbench Developer Guide (APZNOTIFY-004)

1. Extend UI only via `apps/web/components/notifications` + typed client facades.
2. Never import `@apzhub/platform-services`, `notification-core`, or `notification-persistence`.
3. Register navigation with manifests under `packages/workbench-framework/manifests/platform-notifications*`.
4. Audit: `pnpm audit:notification-workbench`.
5. Tests: `platform-notifications-view.test.tsx`, routes/boundary Vitest, Playwright `apznotify-004-*.spec.ts`.
