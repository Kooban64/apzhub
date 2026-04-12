import type { WorkspaceConfig, WorkspaceServiceId } from "@/lib/workspace/workspace-config";
import { isServiceAllowed } from "@/lib/workspace/workspace-config";
import type { GoogleLinkState } from "@/lib/profile/linked-accounts-contract";

export type { GoogleLinkState };

/**
 * Widget posture for mail/calendar-style panels (Phase 8).
 * - `available`: service does not require Google; panel is usable without linking.
 * - `enabled`: Google-linked (or non-Google service) — show normal widget shell.
 * - `connectable`: Google required but not linked — CTA to connect.
 * - `disconnected`: user explicitly disconnected (mock flag) — reconnect CTA, distinct copy.
 * - `error`: Google link error — tab disabled.
 */
export type WidgetState = "available" | "enabled" | "connectable" | "disconnected" | "error";

/** Capability-driven right panel tab (not just “service id in config”). */
export type RightPanelTabCapability = {
  capabilityId: WorkspaceServiceId;
  tabAllowed: boolean;
  widgetState: WidgetState;
  tabEnabled: boolean;
  disabledReason: string | null;
};

function needsGoogleLink(id: WorkspaceServiceId): boolean {
  return id === "calendar" || id === "mail";
}

export function buildRightPanelTabCapabilities(
  config: WorkspaceConfig,
  google: GoogleLinkState,
  mockDisconnected?: boolean,
): RightPanelTabCapability[] {
  return config.rightPanelTabs
    .filter((id) => isServiceAllowed(config, id))
    .map((capabilityId) => {
      const tabAllowed = true;

      if (google === "error") {
        return {
          capabilityId,
          tabAllowed,
          widgetState: "error",
          tabEnabled: false,
          disabledReason: "Google connection error. Fix the link before using this tab.",
        };
      }

      if (!needsGoogleLink(capabilityId)) {
        return {
          capabilityId,
          tabAllowed,
          widgetState: "available",
          tabEnabled: true,
          disabledReason: null,
        };
      }

      if (google === "linked") {
        return {
          capabilityId,
          tabAllowed,
          widgetState: "enabled",
          tabEnabled: true,
          disabledReason: null,
        };
      }

      if (mockDisconnected) {
        return {
          capabilityId,
          tabAllowed,
          widgetState: "disconnected",
          tabEnabled: true,
          disabledReason: null,
        };
      }

      return {
        capabilityId,
        tabAllowed,
        widgetState: "connectable",
        tabEnabled: true,
        disabledReason: null,
      };
    });
}
