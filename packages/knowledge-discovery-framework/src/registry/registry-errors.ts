export class KnowledgeRegistryValidationError extends Error {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message);
    this.name = "KnowledgeRegistryValidationError";
  }
}

export class KnowledgeRegistryDuplicateError extends Error {
  constructor(readonly sourceId: string) {
    super(`Duplicate knowledge source id: ${sourceId}`);
    this.name = "KnowledgeRegistryDuplicateError";
  }
}

export class KnowledgeRegistryNotFoundError extends Error {
  constructor(readonly sourceId: string) {
    super(`Knowledge source not found: ${sourceId}`);
    this.name = "KnowledgeRegistryNotFoundError";
  }
}
