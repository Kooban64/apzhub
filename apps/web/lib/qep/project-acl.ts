import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { getPlatformServiceGateway } from "@/lib/api/v1/gateway/bootstrap";

export type QepProjectMembershipResolver = (
  context: PlatformApiRequestContext,
  projectId: string,
) => Promise<boolean>;

const defaultResolver: QepProjectMembershipResolver = async (context, projectId) => {
  try {
    const gateway = await getPlatformServiceGateway();
    const project = await gateway.projects.getProject(
      context.serviceContext,
      projectId,
    );
    return project.tenantId === context.serviceContext.tenantId;
  } catch {
    return false;
  }
};

/**
 * Thin project ACL for Cap handlers. ProjectService remains authoritative:
 * a project must be visible in the authenticated tenant before a project-scoped
 * QEP operation proceeds. Resolution errors fail closed.
 */
export async function requireQepProjectMembership(
  context: PlatformApiRequestContext,
  projectId: string | undefined,
  options: {
    readonly required?: boolean;
    readonly resolver?: QepProjectMembershipResolver;
  } = {},
): Promise<void> {
  const required = options.required ?? process.env.NODE_ENV !== "test";
  if (!required || !projectId) return;

  let member = false;
  try {
    member = await (options.resolver ?? defaultResolver)(context, projectId);
  } catch {
    member = false;
  }
  if (!member) {
    throw new PlatformApiHttpError(403, {
      code: "PROJECT_MEMBERSHIP_REQUIRED",
      message: "Project membership is required for this QEP operation.",
    });
  }
}
