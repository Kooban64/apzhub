import type { DashboardAudience, DashboardDefinition } from "../contracts/dashboard";

export class DashboardRegistry {
  private readonly dashboards = new Map<string, DashboardDefinition>();

  register(definition: DashboardDefinition): void {
    if (this.dashboards.has(definition.dashboardId)) {
      throw new Error(`Dashboard already registered: ${definition.dashboardId}`);
    }
    this.dashboards.set(definition.dashboardId, Object.freeze({ ...definition }));
  }

  get(dashboardId: string): DashboardDefinition | undefined {
    return this.dashboards.get(dashboardId);
  }

  require(dashboardId: string): DashboardDefinition {
    const dashboard = this.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Unknown dashboard: ${dashboardId}`);
    }
    return dashboard;
  }

  list(productId?: string): readonly DashboardDefinition[] {
    const all = [...this.dashboards.values()];
    return productId ? all.filter((d) => d.productId === productId) : all;
  }

  listByAudience(audience: DashboardAudience): readonly DashboardDefinition[] {
    return this.list().filter((d) => d.audience === audience);
  }

  /**
   * Role-based selection — presentation mapping only.
   * Permissions remain authoritative on the server.
   */
  selectForRoles(roles: readonly string[]): readonly DashboardDefinition[] {
    if (roles.length === 0) {
      return this.list().filter((d) => d.lifecycle === "published");
    }
    return this.list().filter((d) => {
      if (d.lifecycle !== "published") {
        return false;
      }
      if (!d.defaultForRoles || d.defaultForRoles.length === 0) {
        return true;
      }
      return d.defaultForRoles.some((role) => roles.includes(role));
    });
  }
}
