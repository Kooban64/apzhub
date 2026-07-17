# APZWORKFLOW-005 — Workbench Certification

## Registration

- Parent manifest `platform-workflows` + nine children (overview, library, versions, templates, categories, folders, validation, audit, diagnostics)
- Activity Bar / Sidebar via Workbench Framework discovery
- Mount: `WorkflowsWorkspaceRouter` in `workbench-page.tsx` when `isWorkflowsRoute`

## Views certified (as delivered in APZWORKFLOW-004)

Overview · Workflows · Versions · Templates · Categories · Folders · Validation · Audit · Diagnostics

## Components

Status cards · library · details · Definition Viewer · read-only Definition Graph · version list/compare · templates · categories · folders · validation panel · Audit Timeline · diagnostics · metadata export · dependency panel

## Commands present

Refresh · Validate · Publish · Archive · Restore · Transition · Compare Versions · Copy ID · Open API Metadata · Export Metadata

## Commands absent (required)

Execute · Run · Schedule · Deploy · Retry · Cancel · Pause · Resume

## Boundaries

UI consumes typed client only; no gateway/platform-services/core/persistence; no browser persistence of definitions; Execution Status always **Workflow Execution Not Available**.

## Playwright

Mocked journey spec: `testing/playwright/e2e/apzworkflow-004-platform-workflows-workbench.spec.ts`. Live `webServer` **LIMITED** by pre-existing Testing slug conflict — not a Workflow defect.
