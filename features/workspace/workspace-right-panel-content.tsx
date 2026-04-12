"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useSession } from "@/components/providers/session-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  buildRightPanelTabCapabilities,
  type RightPanelTabCapability,
} from "@/lib/workspace/right-panel-capabilities";
import { defaultWorkspaceConfig, type WorkspaceConfig, type WorkspaceServiceId } from "@/lib/workspace/workspace-config";
import { cn } from "@/lib/utils";

const LABELS: Record<WorkspaceServiceId, string> = {
  calendar: "Calendar",
  mail: "Mail",
  reminders: "Reminders",
  drive: "Drive",
  chat: "Chat",
  plane: "Plane",
  zammad: "Zammad",
  kimai: "Kimai",
  kiwi: "Kiwi",
  paperless: "Paperless",
  n8n: "n8n",
};

export function WorkspaceRightPanelContent({
  config = defaultWorkspaceConfig,
}: {
  config?: WorkspaceConfig;
}) {
  const { snapshot } = useSession();
  const google = snapshot.linkedAccounts.google;
  const mockDisconnected = snapshot.mockProfileFlags?.googleDisconnected === true;
  const caps = useMemo(
    () => buildRightPanelTabCapabilities(config, google, mockDisconnected),
    [config, google, mockDisconnected],
  );
  const [picked, setPicked] = useState<WorkspaceServiceId | null>(null);
  const active = useMemo(() => resolveActiveTab(picked, caps), [picked, caps]);

  const activeCap = caps.find((c) => c.capabilityId === active) ?? caps[0];

  if (caps.length === 0) {
    return (
      <EmptyState
        title="Context panel"
        description="No capabilities are enabled for this workspace view."
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div
        className="flex flex-wrap gap-1 border-b border-border pb-2"
        role="tablist"
        aria-label="Workspace context panel"
      >
        {caps.map((cap) => {
          const selected = cap.capabilityId === active;
          const tabId = `right-tab-${cap.capabilityId}`;
          return (
            <Button
              key={cap.capabilityId}
              id={tabId}
              type="button"
              size="xs"
              variant={selected ? "secondary" : "ghost"}
              className={cn("h-7 text-[0.65rem]", selected && "shadow-sm")}
              onClick={() => {
                if (cap.tabEnabled) {
                  setPicked(cap.capabilityId);
                }
              }}
              role="tab"
              aria-selected={selected}
              aria-disabled={!cap.tabEnabled}
              tabIndex={selected ? 0 : -1}
              title={cap.disabledReason ?? undefined}
              data-testid={`right-panel-tab-${cap.capabilityId}`}
            >
              {LABELS[cap.capabilityId]}
            </Button>
          );
        })}
      </div>
      <div
        className="min-h-0 flex-1 overflow-auto"
        role="tabpanel"
        id={`right-tabpanel-${active}`}
        aria-labelledby={`right-tab-${active}`}
      >
        {activeCap ? (
          <RightPanelSlotBody capability={activeCap} label={LABELS[activeCap.capabilityId]} />
        ) : null}
      </div>
    </div>
  );
}

function pickInitialActive(caps: RightPanelTabCapability[]): WorkspaceServiceId {
  const firstEnabled = caps.find((c) => c.tabEnabled);
  return firstEnabled?.capabilityId ?? caps[0]?.capabilityId ?? "calendar";
}

function resolveActiveTab(
  picked: WorkspaceServiceId | null,
  caps: RightPanelTabCapability[],
): WorkspaceServiceId {
  if (picked !== null) {
    const cap = caps.find((c) => c.capabilityId === picked);
    if (cap?.tabEnabled) {
      return picked;
    }
  }
  return pickInitialActive(caps);
}

function RightPanelSlotBody({ capability, label }: { capability: RightPanelTabCapability; label: string }) {
  if (!capability.tabEnabled) {
    return (
      <EmptyState
        title={`${label} unavailable`}
        description={capability.disabledReason ?? "This tab is not available."}
      />
    );
  }

  if (capability.widgetState === "connectable") {
    return (
      <div className="space-y-3" data-testid="right-panel-widget-connectable">
        <EmptyState
          title={`${label} needs Google`}
          description="Connect your Google account from Profile to enable this panel. Workspace stays usable without it."
        />
        <Link href="/profile#profile-google" className="text-sm font-medium text-primary underline">
          Open profile to connect
        </Link>
      </div>
    );
  }

  if (capability.widgetState === "disconnected") {
    return (
      <div className="space-y-3" data-testid="right-panel-widget-disconnected">
        <EmptyState
          title={`${label} disconnected`}
          description="You disconnected Google. Reconnect from Profile to restore mail and calendar widgets — no stale content is shown here."
        />
        <Link href="/profile#profile-google" className="text-sm font-medium text-primary underline">
          Reconnect Google
        </Link>
      </div>
    );
  }

  if (capability.widgetState === "available" && capability.capabilityId === "reminders") {
    return (
      <div data-testid="right-panel-widget-reminders">
        <EmptyState
          title={`${label}`}
          description="Reminders do not require Google in this mock. This slot stays capability-driven without implying live sync."
        />
      </div>
    );
  }

  if (capability.widgetState === "enabled" && (capability.capabilityId === "mail" || capability.capabilityId === "calendar")) {
    return (
      <div data-testid={`right-panel-widget-enabled-${capability.capabilityId}`}>
        <EmptyState
          title={`${label}`}
          description="Google is linked. Live mail/calendar clients stay out of scope — this placeholder confirms the panel is enabled."
        />
      </div>
    );
  }

  return (
    <EmptyState
      title={`${label}`}
      description="This context slot is enabled. No sample data is shown to avoid implying a live connection."
    />
  );
}
