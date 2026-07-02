import type { NavigationModel } from "../navigation/platform-navigation-model";
import type { NavigationPresentationAdapter } from "./navigation-presentation-adapter";

export interface SidebarPresentationItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly route?: string;
  readonly workspace: string;
  readonly parent?: string;
}

export class SidebarPresentationAdapter implements NavigationPresentationAdapter<
  "sidebar",
  readonly SidebarPresentationItem[]
> {
  readonly target = "sidebar" as const;

  adapt(model: NavigationModel): readonly SidebarPresentationItem[] {
    return model.sidebar.map((item) => ({
      id: item.id,
      label: item.label,
      icon: item.icon,
      route: item.route,
      workspace: item.workspace,
      parent: item.parent,
    }));
  }
}

export function createSidebarPresentationAdapter(): SidebarPresentationAdapter {
  return new SidebarPresentationAdapter();
}

export const defaultSidebarPresentationAdapter = createSidebarPresentationAdapter();
