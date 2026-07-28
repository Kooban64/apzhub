# Best Practices

> **Programme:** APZHUB-ENGINEERING-001  
> Derived from Analytics Platform, Workflow Platform, and commercial APZ product delivery.

---

## Planning before code

1. Commercial Planning and Platform Foundation are documentation-first — do not skip to Workbench.
2. File a single recommendation at each phase end; avoid ambiguous “mostly ready” language.
3. Capture Known Limitations early; update at Certification and Production Release.

---

## Boundary discipline

1. Never combine Module · Platform Service · Connector responsibilities.
2. HTTP handlers call `gateway.*` only.
3. Workbench clients call HTTP only.
4. Adapters translate errors; never leak provider branding or raw engine payloads to UI.
5. Prefer singular capability path tokens for new surfaces (`/api/v1/workflow`, `/workspace/workflow`) and document coexistence with legacy plural routes.

---

## Manifest first

1. `integration.yaml` / `service.yaml` / `module.yaml` / `event.yaml` / `component.yaml` before implementation.
2. Register via platform registries — never hardcode modules in the shell.
3. Keep manifests and sidebar children aligned with routes and permissions.

---

## SemVer and freezes

1. Treat Integration SDK freeze as hard until ADR + Owner Decision.
2. Bump OpenAPI version on every published API change.
3. Production Release is packaging; do not smuggle features into certification programmes.

---

## Evidence and indexes

1. Bootstrap from AI-MANIFEST every programme.
2. Update OWNER-ACCEPTANCE-REGISTER when filing Awaiting Acceptance.
3. Keep Completion and Acceptance reports paired.
4. Record quality gate results in release evidence folders for Production baselines.

---

## Naming and UX

1. User-facing names: platform product language (Projects, Workflow, Analytics) — not Plane, n8n, Metabase, etc.
2. Service names: `WorkflowService` / `AnalyticsService` — not engine-named services.
3. Permission-driven shell: hide what AuthZ denies; server remains authoritative.

---

## Stop conditions

1. Honour Owner STOP lists (forbidden next programmes).
2. On architecture doubt, stop and propose ADR rather than inventing a bypass.
3. Documentation-only programmes must not “helpfully” add packages.
