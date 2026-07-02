/** Handler routing kind — maps to execution gateway in AF-006+. */
export type ActionHandlerKind = "workbench-bridge" | "service" | "event";

/** Where the action declaration originated. */
export type ActionSource = "builtin" | "manifest";

/** Optional context-menu visibility predicate (ADR-0025). */
export interface ActionContextPredicate {
  readonly surfaces?: readonly string[];
  readonly selectionKinds?: readonly ("none" | "single" | "multi")[];
  readonly contextTypes?: readonly string[];
}

/**
 * Declarative action metadata — manifest or built-in catalogue entry.
 * Public ADRs may refer to this shape as PlatformCommand until AF-003 naming sync.
 */
export interface ActionDescriptor {
  readonly id: string;
  readonly label: string;
  readonly handler: string;
  readonly handlerKind: ActionHandlerKind;
  readonly permission?: string;
  readonly shortcut?: string;
  readonly description?: string;
  readonly palette?: boolean;
  readonly icon?: string;
  readonly group?: string;
  readonly order?: number;
  /** Presentation-only flag hydrated from server — palette does not evaluate permissions. */
  readonly disabled?: boolean;
  readonly contextWhen?: ActionContextPredicate;
  readonly source: ActionSource;
  readonly capabilityId?: string;
  /** Platform release version (`builtin`) or originating capability version (`manifest`). */
  readonly version?: string;
}

/** ADR-0025 alignment alias — same type as ActionDescriptor. */
export type PlatformCommand = ActionDescriptor;
