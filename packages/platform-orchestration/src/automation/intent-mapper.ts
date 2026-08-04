/**
 * Provider-neutral intent mapping (QO-011).
 * Maps upstream activity labels / kinds to logical automation intents.
 * Never references automation product names.
 */

import type { AutomationIntentType } from "../contracts/automation-coordination";
import { AUTOMATION_INTENT_TYPES } from "../contracts/automation-coordination";

const ACTIVITY_TO_INTENT: Readonly<Record<string, AutomationIntentType>> = {
  automated_test_suite: "functional_automation",
  functional_automation: "functional_automation",
  api_verification: "api_automation",
  api_automation: "api_automation",
  performance_testing: "performance_automation",
  performance_automation: "performance_automation",
  accessibility_testing: "accessibility_automation",
  accessibility_automation: "accessibility_automation",
  visual_automation: "visual_automation",
  visual_testing: "visual_automation",
  security_testing: "security_automation",
  security_automation: "security_automation",
  smoke_testing: "smoke_verification",
  smoke_verification: "smoke_verification",
  regression_testing: "regression_verification",
  regression_verification: "regression_verification",
  future_registered_activity: "custom_registered_activity",
  custom_registered_activity: "custom_registered_activity",
};

export function isAutomationIntentType(value: string): value is AutomationIntentType {
  return (AUTOMATION_INTENT_TYPES as readonly string[]).includes(value);
}

/**
 * Extract logical intent types from outstanding item strings and optional extras.
 * Outstanding items may be prefixed (activity:foo, governance:bar) — only activity-like
 * tokens map to automation intents.
 */
export function mapOutstandingToIntents(
  outstandingItems: readonly string[],
  additional: readonly AutomationIntentType[] = [],
): readonly AutomationIntentType[] {
  const found = new Set<AutomationIntentType>();

  for (const raw of outstandingItems) {
    const token = normalizeToken(raw);
    const mapped = ACTIVITY_TO_INTENT[token];
    if (mapped) {
      found.add(mapped);
      continue;
    }
    if (isAutomationIntentType(token)) {
      found.add(token);
    }
  }

  for (const extra of additional) {
    found.add(extra);
  }

  return [...found];
}

/** Default intents when conclusion is GO/CONDITIONAL_GO but no activities listed. */
export function defaultIntentsForProfile(
  profileId?: string,
): readonly AutomationIntentType[] {
  switch (profileId) {
    case "developer_commit":
      return ["smoke_verification"];
    case "pull_request":
      return ["smoke_verification", "functional_automation"];
    case "nightly":
    case "regression":
      return ["regression_verification", "functional_automation"];
    case "release_candidate":
    case "production_release":
      return [
        "smoke_verification",
        "regression_verification",
        "functional_automation",
        "api_automation",
      ];
    case "emergency_fix":
      return ["smoke_verification", "regression_verification"];
    case "compliance_audit":
      return [
        "security_automation",
        "accessibility_automation",
        "regression_verification",
      ];
    default:
      return ["smoke_verification"];
  }
}

function normalizeToken(raw: string): string {
  let t = raw.trim().toLowerCase();
  for (const prefix of ["activity:", "intent:", "kind:", "quality_activity:"]) {
    if (t.startsWith(prefix)) {
      t = t.slice(prefix.length);
    }
  }
  return t.replace(/[-\s]+/g, "_");
}
