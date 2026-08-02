# Defect Workspace

Routes: `/workspace/qep/defects`, `/new`, `/{defectId}`.

Views: list, board, cards, detail (timeline, evidence panel, execution panel, relationships).

Cap C integration: “Raise defect” on fail/block steps → create form with session/step query params.

Module: `modules/qep-defects/module.yaml` (workbench-implemented).
