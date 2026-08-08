/**
 * PostgreSQL LayoutStore — QX-PR-04.
 * Production Source of Record for Dashboard layouts and saved views.
 */
import {
  getDatabaseExecutor,
  qepDashboardLayout,
  qepDashboardSavedView,
  type DatabaseExecutor,
} from "@apzhub/config";
import type {
  DashboardLayout,
  LayoutStore,
  SavedDashboardView,
} from "@apzhub/platform-dashboard";
import { and, desc, eq } from "drizzle-orm";

function toLayout(row: typeof qepDashboardLayout.$inferSelect): DashboardLayout {
  return row.layoutJson as unknown as DashboardLayout;
}

function toView(row: typeof qepDashboardSavedView.$inferSelect): SavedDashboardView {
  return row.viewJson as unknown as SavedDashboardView;
}

export function createPostgresLayoutStore(db: DatabaseExecutor): LayoutStore {
  const exec = () => getDatabaseExecutor(db);

  return {
    async saveLayout(layout: DashboardLayout): Promise<DashboardLayout> {
      const values = {
        id: layout.layoutId,
        tenantId: layout.tenantId,
        userId: layout.userId,
        dashboardId: layout.dashboardId,
        layoutJson: layout as unknown as Record<string, unknown>,
        updatedAt: new Date(layout.updatedAt),
      };

      const existing = await exec()
        .select({
          id: qepDashboardLayout.id,
          revision: qepDashboardLayout.revision,
        })
        .from(qepDashboardLayout)
        .where(eq(qepDashboardLayout.id, layout.layoutId))
        .limit(1);

      if (existing[0]) {
        await exec()
          .update(qepDashboardLayout)
          .set({
            userId: values.userId,
            dashboardId: values.dashboardId,
            layoutJson: values.layoutJson,
            revision: existing[0].revision + 1,
            updatedAt: values.updatedAt,
          })
          .where(eq(qepDashboardLayout.id, layout.layoutId));
        return layout;
      }

      await exec()
        .insert(qepDashboardLayout)
        .values({
          ...values,
          revision: 1,
        });
      return layout;
    },

    async getLayout(layoutId: string): Promise<DashboardLayout | undefined> {
      const rows = await exec()
        .select()
        .from(qepDashboardLayout)
        .where(eq(qepDashboardLayout.id, layoutId))
        .limit(1);
      return rows[0] ? toLayout(rows[0]) : undefined;
    },

    async listLayouts(
      tenantId: string,
      userId?: string,
    ): Promise<readonly DashboardLayout[]> {
      const conditions = userId
        ? and(
            eq(qepDashboardLayout.tenantId, tenantId),
            eq(qepDashboardLayout.userId, userId),
          )
        : eq(qepDashboardLayout.tenantId, tenantId);
      const rows = await exec()
        .select()
        .from(qepDashboardLayout)
        .where(conditions)
        .orderBy(desc(qepDashboardLayout.updatedAt));
      return rows.map(toLayout);
    },

    async saveView(view: SavedDashboardView): Promise<SavedDashboardView> {
      const values = {
        id: view.viewId,
        tenantId: view.tenantId,
        userId: view.userId,
        dashboardId: view.dashboardId,
        pinned: view.pinned,
        favourite: view.favourite,
        viewJson: view as unknown as Record<string, unknown>,
        createdAt: new Date(view.createdAt),
        updatedAt: new Date(view.updatedAt),
      };

      const existing = await exec()
        .select({
          id: qepDashboardSavedView.id,
          revision: qepDashboardSavedView.revision,
        })
        .from(qepDashboardSavedView)
        .where(eq(qepDashboardSavedView.id, view.viewId))
        .limit(1);

      if (existing[0]) {
        await exec()
          .update(qepDashboardSavedView)
          .set({
            userId: values.userId,
            dashboardId: values.dashboardId,
            pinned: values.pinned,
            favourite: values.favourite,
            viewJson: values.viewJson,
            revision: existing[0].revision + 1,
            updatedAt: values.updatedAt,
          })
          .where(eq(qepDashboardSavedView.id, view.viewId));
        return view;
      }

      await exec()
        .insert(qepDashboardSavedView)
        .values({
          ...values,
          revision: 1,
        });
      return view;
    },

    async getView(viewId: string): Promise<SavedDashboardView | undefined> {
      const rows = await exec()
        .select()
        .from(qepDashboardSavedView)
        .where(eq(qepDashboardSavedView.id, viewId))
        .limit(1);
      return rows[0] ? toView(rows[0]) : undefined;
    },

    async listViews(
      tenantId: string,
      userId?: string,
    ): Promise<readonly SavedDashboardView[]> {
      const conditions = userId
        ? and(
            eq(qepDashboardSavedView.tenantId, tenantId),
            eq(qepDashboardSavedView.userId, userId),
          )
        : eq(qepDashboardSavedView.tenantId, tenantId);
      const rows = await exec()
        .select()
        .from(qepDashboardSavedView)
        .where(conditions)
        .orderBy(desc(qepDashboardSavedView.updatedAt));
      return rows.map(toView);
    },

    async listPinned(
      tenantId: string,
      userId: string,
    ): Promise<readonly SavedDashboardView[]> {
      const rows = await exec()
        .select()
        .from(qepDashboardSavedView)
        .where(
          and(
            eq(qepDashboardSavedView.tenantId, tenantId),
            eq(qepDashboardSavedView.userId, userId),
            eq(qepDashboardSavedView.pinned, true),
          ),
        )
        .orderBy(desc(qepDashboardSavedView.updatedAt));
      return rows.map(toView);
    },

    async listFavourites(
      tenantId: string,
      userId: string,
    ): Promise<readonly SavedDashboardView[]> {
      const rows = await exec()
        .select()
        .from(qepDashboardSavedView)
        .where(
          and(
            eq(qepDashboardSavedView.tenantId, tenantId),
            eq(qepDashboardSavedView.userId, userId),
            eq(qepDashboardSavedView.favourite, true),
          ),
        )
        .orderBy(desc(qepDashboardSavedView.updatedAt));
      return rows.map(toView);
    },
  };
}

/** Test helper — delete all dashboard rows for a tenant. */
export async function deleteDashboardDataForTenant(
  tenantId: string,
  db: DatabaseExecutor,
): Promise<void> {
  const exec = getDatabaseExecutor(db);
  await exec
    .delete(qepDashboardSavedView)
    .where(eq(qepDashboardSavedView.tenantId, tenantId));
  await exec
    .delete(qepDashboardLayout)
    .where(eq(qepDashboardLayout.tenantId, tenantId));
}
