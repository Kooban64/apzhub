import type { DashboardLayout, SavedDashboardView } from "../contracts/dashboard";

/**
 * Layout / saved-view Source of Record port (QX-PR-04).
 * Production implementations must survive process restart.
 */
export interface LayoutStore {
  saveLayout(layout: DashboardLayout): Promise<DashboardLayout>;
  getLayout(layoutId: string): Promise<DashboardLayout | undefined>;
  listLayouts(tenantId: string, userId?: string): Promise<readonly DashboardLayout[]>;
  saveView(view: SavedDashboardView): Promise<SavedDashboardView>;
  getView(viewId: string): Promise<SavedDashboardView | undefined>;
  listViews(tenantId: string, userId?: string): Promise<readonly SavedDashboardView[]>;
  listPinned(tenantId: string, userId: string): Promise<readonly SavedDashboardView[]>;
  listFavourites(
    tenantId: string,
    userId: string,
  ): Promise<readonly SavedDashboardView[]>;
}

/** Process-local store — allowed in development/tests only. */
export class InMemoryLayoutStore implements LayoutStore {
  private readonly layouts = new Map<string, DashboardLayout>();
  private readonly views = new Map<string, SavedDashboardView>();

  async saveLayout(layout: DashboardLayout): Promise<DashboardLayout> {
    this.layouts.set(layout.layoutId, layout);
    return layout;
  }

  async getLayout(layoutId: string): Promise<DashboardLayout | undefined> {
    return this.layouts.get(layoutId);
  }

  async listLayouts(
    tenantId: string,
    userId?: string,
  ): Promise<readonly DashboardLayout[]> {
    return [...this.layouts.values()].filter(
      (layout) =>
        layout.tenantId === tenantId &&
        (userId === undefined || layout.userId === userId),
    );
  }

  async saveView(view: SavedDashboardView): Promise<SavedDashboardView> {
    this.views.set(view.viewId, view);
    return view;
  }

  async getView(viewId: string): Promise<SavedDashboardView | undefined> {
    return this.views.get(viewId);
  }

  async listViews(
    tenantId: string,
    userId?: string,
  ): Promise<readonly SavedDashboardView[]> {
    return [...this.views.values()].filter(
      (view) =>
        view.tenantId === tenantId && (userId === undefined || view.userId === userId),
    );
  }

  async listPinned(
    tenantId: string,
    userId: string,
  ): Promise<readonly SavedDashboardView[]> {
    const views = await this.listViews(tenantId, userId);
    return views.filter((view) => view.pinned);
  }

  async listFavourites(
    tenantId: string,
    userId: string,
  ): Promise<readonly SavedDashboardView[]> {
    const views = await this.listViews(tenantId, userId);
    return views.filter((view) => view.favourite);
  }
}
