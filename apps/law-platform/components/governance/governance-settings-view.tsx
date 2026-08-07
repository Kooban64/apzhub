"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import { lawHomePath } from "../../lib/governance/routes";
import {
  canAdminLawPractice,
  type LawPermissionSource,
} from "../../lib/law/permissions";
import { useLawPermissions } from "../../lib/law/use-law-permissions";
import { LAW_PLATFORM_NAME } from "../../lib/law-platform-constants";

import { GovernancePage } from "./governance-shell";

export function GovernanceSettingsView({
  permissions: permissionsOverride,
}: {
  readonly permissions?: LawPermissionSource;
} = {}) {
  const router = useRouter();
  const permissions = useLawPermissions(permissionsOverride);
  const isPracticeOperator = canAdminLawPractice(permissions);

  return (
    <GovernancePage
      title="Settings"
      description="Personalise your Governance Companion. Practice administration stays below the product boundary."
      breadcrumbs={[LAW_PLATFORM_NAME, "Settings"]}
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(lawHomePath())}
        >
          Home
        </Button>
      }
    >
      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="governance-settings"
      >
        <h2 className="text-sm font-semibold">Experience</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          APZ Law opens on governance questions and the governance catalogue. Theme and
          locale follow APZHUB preferences. Law never provides legal advice.
        </p>
      </section>

      {isPracticeOperator ? (
        <section
          className="rounded-lg border border-dashed border-[var(--color-border)] p-4"
          data-testid="governance-settings-practice"
        >
          <h2 className="text-sm font-semibold">Practice tools</h2>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Matters, clients, trust, billing, and firm administration are role-gated and
            secondary. Use the sidebar practice items when authorised.
          </p>
        </section>
      ) : null}
    </GovernancePage>
  );
}
