export class ShortcutRegistryValidationError extends Error {
  readonly field: "chord" | "commandId";

  constructor(message: string, field: "chord" | "commandId") {
    super(message);
    this.name = "ShortcutRegistryValidationError";
    this.field = field;
  }
}
