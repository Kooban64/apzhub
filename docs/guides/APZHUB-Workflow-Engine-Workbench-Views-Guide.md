# Workflow Engine Workbench — Views Guide

**Milestone:** APZWORKFLOW-009

## Overview

Stats: total / active / inactive workflows, templates, projects, users, tags. Health, compatibility, HTTP status. Prominent **READ-ONLY ENGINE**.

## Workflows

List + detail panel. Metadata: nodes/connections counts, tags, version hint. Project/owner shown as unavailable when not returned by the metadata API. Embedded Read-only Definition Viewer (counts + honest empty payload notes). No editing.

## Templates / Projects / Users / Tags

Catalogue lists with metadata. Usage/assignment counts when derivable; otherwise explicit “not returned by metadata API”.

## Capabilities / Health / Diagnostics / Compatibility

Read-only status panels from engine HTTP. Capability and health sections respect UI permission props (`canViewCapabilities`, `canViewHealth`, `canViewDiagnostics`) — server remains authoritative.
