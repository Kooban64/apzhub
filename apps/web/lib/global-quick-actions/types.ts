export type QuickActionProductId =
  "projects" | "support" | "time" | "workflow" | "documents" | "knowledge" | "qep";

export type QuickActionDescriptor = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly productId: QuickActionProductId;
  readonly productLabel: string;
  readonly href: string;
  readonly permission: string;
};

export type QuickAction = QuickActionDescriptor & {
  readonly recentRank?: number;
};

export type GlobalQuickActionsResponse = {
  readonly capability: "global-quick-actions-v1";
  readonly actions: readonly QuickAction[];
  readonly recentActionIds: readonly string[];
};
