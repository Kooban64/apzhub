# Operational notes — Enterprise Context MVP

| Field     | Value                                                      |
| --------- | ---------------------------------------------------------- |
| Programme | APZHUB-CONTEXT-001                                         |
| Surface   | Project Context Panel on `/workspace/projects/{projectId}` |
| API       | `GET /api/v1/context?focusType=project&focusId=…`          |

## Behaviour

- Composition is request-scoped. Nothing is persisted as Enterprise Context SoR.
- Providers: Workflow, Support, Documents, Law, Knowledge.
- Each fragment shows product label + optional source entity ref + link into owning product.
- Provider failure degrades that slice only (`partial: true`).

## Project linkage (MVP)

| Provider  | Linkage                                           |
| --------- | ------------------------------------------------- |
| Workflow  | Title/description/`formValues.projectId` match    |
| Support   | Tags / title match project id or identifier       |
| Documents | Title/tags match via document metadata find       |
| Law       | Project-relevant governance references            |
| Knowledge | Project-relevant organisational memory references |

## Observing success

**Phase: Product Learning.** Instrumentation: [../apzhub-context-learning-001/](../apzhub-context-learning-001/). No CONTEXT-002.

Pilot questions only:

1. Did the Context Panel reduce the number of screens you had to open?
2. Was any important information missing?
3. Was any information shown that wasn't useful?
4. Did the panel help you make a better decision or complete work faster?

Value signals (examples): “I didn’t have to open Support.” · “I noticed a governance issue early.” · “The procedure was already there.” · “I understood project state immediately.”

Do not expand consumers or providers until these show measurable benefit.
