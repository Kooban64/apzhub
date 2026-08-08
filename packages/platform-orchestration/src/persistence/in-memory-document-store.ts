import type {
  OrchestrationArtefactKind,
  OrchestrationDocument,
  OrchestrationDocumentStore,
  UpsertOrchestrationDocumentInput,
} from "./document-store";

function docId(kind: string, key: string): string {
  return `${kind}:${key}`;
}

/** Process-local document store — development/tests only. */
export class InMemoryOrchestrationDocumentStore implements OrchestrationDocumentStore {
  private readonly docs = new Map<string, OrchestrationDocument>();

  async upsert(
    input: UpsertOrchestrationDocumentInput,
  ): Promise<OrchestrationDocument> {
    const id = docId(input.artefactKind, input.artefactKey);
    const existing = this.docs.get(id);
    const now = new Date().toISOString();
    const actor = input.actorId?.trim() || "system";
    const next: OrchestrationDocument = {
      id,
      artefactKind: input.artefactKind,
      artefactKey: input.artefactKey,
      tenantId: input.tenantId,
      projectId: input.projectId,
      orchestrationId: input.orchestrationId ?? "orch_default",
      correlationId: input.correlationId,
      status: input.status,
      payload: input.payload,
      revision: (existing?.revision ?? 0) + 1,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      createdBy: existing?.createdBy ?? actor,
      updatedBy: actor,
    };
    this.docs.set(id, next);
    return next;
  }

  async get(
    artefactKind: OrchestrationArtefactKind,
    artefactKey: string,
  ): Promise<OrchestrationDocument | undefined> {
    return this.docs.get(docId(artefactKind, artefactKey));
  }

  async listByKind(
    artefactKind: OrchestrationArtefactKind,
    tenantId?: string,
  ): Promise<readonly OrchestrationDocument[]> {
    const all = [...this.docs.values()].filter((d) => d.artefactKind === artefactKind);
    return tenantId ? all.filter((d) => d.tenantId === tenantId) : all;
  }

  async delete(
    artefactKind: OrchestrationArtefactKind,
    artefactKey: string,
  ): Promise<void> {
    this.docs.delete(docId(artefactKind, artefactKey));
  }
}
