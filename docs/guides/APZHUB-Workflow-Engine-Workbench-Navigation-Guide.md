# Workflow Engine Workbench — Navigation Guide

**Milestone:** APZWORKFLOW-009

Activity Bar workspace `workflow-engine` (`order` 53, icon `circuit-board`). Sidebar children: overview, workflows, templates, projects, users, tags, capabilities, health, diagnostics, compatibility.

Manifest auto-discovery under `packages/workbench-framework/manifests/platform-workflow-engine*/`.

Permission-driven: items require `workflow.engine.read` (or section-specific health / diagnostics / capabilities). Server remains authoritative.

Does **not** collide with SoR Workflows at `/workspace/workflows`.
