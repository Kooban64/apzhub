import type { DashboardLayout, SavedDashboardView } from "../contracts/dashboard";

/** Process-local layout / saved-view store — not production-durable. */
export class InMemoryLayoutStore {
  private readonly layouts = new Map<string, DashboardLayout>();
  private readonly views = new Map<string, SavedDashboardView>();

  saveLayout(layout: DashboardLayout): DashboardLayout {
    this.layouts.set(layout.layoutId, layout);
    return layout;
  }

  getLayout(layoutId: string): DashboardLayout | undefined {
    return this.layouts.get(layoutId);
  }

  listLayouts(tenantId: string, userId?: string): readonly DashboardLayout[] {
    return [...this.layouts.values()].filter(
      (layout) =>
        layout.tenantId === tenantId &&
        (userId === undefined || layout.userId === userId),
    );
  }

  saveView(view: SavedDashboardView): SavedDashboardView {
    this.views.set(view.viewId, view);
    return view;
  }

  getView(viewId: string): SavedDashboardView | undefined {
    return this.views.get(viewId);
  }

  listViews(tenantId: string, userId?: string): readonly SavedDashboardView[] {
    return [...this.views.values()].filter(
      (view) =>
        view.tenantId === tenantId && (userId === undefined || view.userId === userId),
    );
  }

  listPinned(tenantId: string, userId: string): readonly SavedDashboardView[] {
    return this.listViews(tenantId, userId).filter((view) => view.pinned);
  }

  listFavourites(tenantId: string, userId: string): readonly SavedDashboardView[] {
    return this.listViews(tenantId, userId).filter((view) => view.favourite);
  }
}
