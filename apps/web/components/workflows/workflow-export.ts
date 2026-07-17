import type {
  WorkflowTemplateViewModel,
  WorkflowVersionViewModel,
  WorkflowViewModel,
} from "@/lib/workflows/workflow-types";

export type WorkflowExportPayload = {
  readonly exportedAt: string;
  readonly kind: "workflow-metadata";
  readonly workflow: WorkflowViewModel;
  readonly version?: WorkflowVersionViewModel | null;
  readonly templateId?: string;
};

export function buildWorkflowExportPayload(
  workflow: WorkflowViewModel,
  version?: WorkflowVersionViewModel | null,
): WorkflowExportPayload {
  return {
    exportedAt: new Date().toISOString(),
    kind: "workflow-metadata",
    workflow,
    version: version ?? null,
    templateId: workflow.templateId,
  };
}

export function exportWorkflowAsJson(payload: WorkflowExportPayload): string {
  return `${JSON.stringify(payload, null, 2)}\n`;
}

export function exportWorkflowAsYaml(payload: WorkflowExportPayload): string {
  // Minimal YAML for canonical metadata only (no full YAML library dependency).
  const lines: string[] = [
    `exportedAt: ${JSON.stringify(payload.exportedAt)}`,
    `kind: ${payload.kind}`,
    "workflow:",
    `  id: ${JSON.stringify(payload.workflow.id)}`,
    `  key: ${JSON.stringify(payload.workflow.key)}`,
    `  name: ${JSON.stringify(payload.workflow.name)}`,
    `  lifecycle: ${JSON.stringify(payload.workflow.lifecycle)}`,
    `  description: ${JSON.stringify(payload.workflow.description ?? "")}`,
    `  categoryId: ${JSON.stringify(payload.workflow.categoryId ?? "")}`,
    `  folderId: ${JSON.stringify(payload.workflow.folderId ?? "")}`,
    `  templateId: ${JSON.stringify(payload.workflow.templateId ?? "")}`,
    `  currentVersionId: ${JSON.stringify(payload.workflow.currentVersionId ?? "")}`,
    `  updatedAt: ${JSON.stringify(payload.workflow.updatedAt)}`,
  ];
  if (payload.version) {
    lines.push(
      "version:",
      `  id: ${JSON.stringify(payload.version.id)}`,
      `  versionNumber: ${payload.version.versionNumber}`,
      `  status: ${JSON.stringify(payload.version.status)}`,
      `  lifecycle: ${JSON.stringify(payload.version.lifecycle)}`,
      `  changeSummary: ${JSON.stringify(payload.version.changeSummary ?? "")}`,
    );
  }
  return `${lines.join("\n")}\n`;
}

export function exportWorkflowAsMarkdown(
  payload: WorkflowExportPayload,
): string {
  const w = payload.workflow;
  const lines = [
    `# Workflow metadata: ${w.name}`,
    "",
    `- **ID:** ${w.id}`,
    `- **Key:** ${w.key}`,
    `- **Lifecycle:** ${w.lifecycle}`,
    `- **Updated:** ${w.updatedAt}`,
    w.description ? `- **Description:** ${w.description}` : null,
    w.categoryId ? `- **Category:** ${w.categoryId}` : null,
    w.folderId ? `- **Folder:** ${w.folderId}` : null,
    w.templateId ? `- **Template:** ${w.templateId}` : null,
    "",
  ].filter((line): line is string => line !== null);

  if (payload.version) {
    lines.push(
      `## Version ${payload.version.versionNumber}`,
      "",
      `- **Version ID:** ${payload.version.id}`,
      `- **Status:** ${payload.version.status}`,
      `- **Lifecycle:** ${payload.version.lifecycle}`,
      payload.version.changeSummary
        ? `- **Change summary:** ${payload.version.changeSummary}`
        : null,
      "",
    );
  }

  lines.push(
    `_Exported at ${payload.exportedAt} — canonical metadata only; execution not included._`,
    "",
  );
  return lines.filter((line): line is string => line !== null).join("\n");
}

export function downloadTextFile(
  filename: string,
  content: string,
  mime: string,
): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportTemplateAsJson(template: WorkflowTemplateViewModel): string {
  return `${JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      kind: "workflow-template-metadata",
      template,
    },
    null,
    2,
  )}\n`;
}
