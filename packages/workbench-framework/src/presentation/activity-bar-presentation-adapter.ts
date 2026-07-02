import type { NavigationModel } from "../navigation/platform-navigation-model";
import type { NavigationPresentationAdapter } from "./navigation-presentation-adapter";

export interface ActivityBarPresentationItem {
  /** Stable navigation id from Navigation Model */
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly route?: string;
  readonly workspace: string;
  readonly active: boolean;
  readonly ariaLabel: string;
}

export class ActivityBarPresentationAdapter implements NavigationPresentationAdapter<
  "activity-bar",
  readonly ActivityBarPresentationItem[]
> {
  readonly target = "activity-bar" as const;

  adapt(model: NavigationModel): readonly ActivityBarPresentationItem[] {
    return model.activityBar.map((item) => ({
      id: item.id,
      label: item.label,
      icon: item.icon,
      route: item.route,
      workspace: item.workspace,
      active: item.workspace === model.activeWorkspaceId,
      ariaLabel: `${item.label} workspace`,
    }));
  }
}

export function createActivityBarPresentationAdapter(): ActivityBarPresentationAdapter {
  return new ActivityBarPresentationAdapter();
}

export const defaultActivityBarPresentationAdapter =
  createActivityBarPresentationAdapter();
